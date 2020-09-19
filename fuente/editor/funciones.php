<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Funciones útiles para el gestor de aplicaciones y los asistentes

//TODO Muchas de estas funciones son de PRUEBA y se deben reemplazar por implementaciones más adecuadas y mejor escritas. Además, se deben documentar.

//TODO Remover funciones en desuso

define('_inc',1);

include(__DIR__.'/../servidor/foxtrot.php');

function prepararVariables() {
    global $nombreApl,$nombreVista,$esPhp,$plantilla,$aplicacion,
        $rutaApl,$rutaHtml,$rutaCss,$rutaJson,$rutaJsonApl,$rutaVista,
        $modo,$cliente,$rutaRecursos,$urlRecursos,$rutaJs,$urlCss;

    $nombreApl=$_REQUEST['aplicacion'];
    $nombreVista=$_REQUEST['vista'];

    foxtrot::inicializar($nombreApl);

    $modo=$_REQUEST['modo'];
    if(!$modo) $modo='independiente';

    $cliente=$_REQUEST['cliente'];
    if(!$cliente) $cliente='web';

    $rutaApl=__DIR__.'/../../desarrollo/aplicaciones/'.$nombreApl.'/';
    $rutaJsonApl=$rutaApl.'aplicacion.json';

    $aplicacion=json_decode(file_get_contents($rutaJsonApl));

    //Si la viista existe, modo y cliente deben tomarse del JSON
    if($aplicacion->vistas->$nombreVista) {
        $modo=$aplicacion->vistas->$nombreVista->tipo;
        $cliente=$aplicacion->vistas->$nombreVista->cliente;
    }
    
    $esPhp=$cliente=='web';

    $rutaVista=$rutaApl.'cliente/vistas/'.$nombreVista;
    $rutaHtml=$rutaVista.'.'.($esPhp?'php':'html');
    $rutaCss=$rutaVista.'.css';
    $rutaJson=$rutaVista.'.json';
    $rutaRecursos=$rutaApl.'recursos/';
    $urlRecursos='aplicaciones/'.$nombreApl.'/recursos/';
    $urlCss='aplicacion/cliente/vistas/'.$nombreVista.'.css';
    $rutaJs=$rutaApl.'cliente/controladores/'.$nombreVista.'.js';

    $plantilla='independiente.'.($esPhp?'php':'html');
    if($modo=='embebible') {
        $plantilla=$modo.'.'.($esPhp?'php':'html');
    } elseif($cliente=='cordova'||$cliente=='escritorio') {
        $plantilla=$cliente.'.html';
    }
}

function crearVista() {
    global $nombreApl,$nombreVista,$plantilla,$aplicacion,$rutaHtml,$rutaCss,$rutaJson,$rutaJsonApl,$modo,$cliente,$rutaVista;

    if(!is_dir(dirname($rutaVista))) mkdir(dirname($rutaVista),0755,true);
    
    //Crear CSS
    file_put_contents($rutaCss,''); 

    //Crear JSON
    $json=json_encode([
        'version'=>1,
        'componentes'=>[
            ['componente'=>'vista']
        ],
        'nombre'=>$nombreVista
    ]);
    //Solo si la vista es embebible, el JSON se guarda por separado
    if($modo=='embebible') file_put_contents($rutaJson,$json);

    //Crear HTML
    $codigo=file_get_contents(__DIR__.'/plantillas/'.$plantilla);

    $codigo=str_replace_array([
        '{editor_nombreAplicacion}'=>$nombreApl,
        '{editor_nombreVista}'=>$nombreVista,
        '{editor_tema}'=>'tema-'.$aplicacion->tema,
        '{editor_urlBase}'=>foxtrot::obtenerUrl()
    ],$codigo);
    
    //Reemplazar variable jsonFoxtrot (igual que al guardar)
    $codigo=reemplazarVarJson($codigo,$json);

    file_put_contents($rutaHtml,$codigo); 

    //Agregar la vista al JSON de la aplicación
    $aplicacion->vistas->$nombreVista=[
        'tipo'=>$modo,
        'cliente'=>$cliente
    ];
    file_put_contents($rutaJsonApl,json_encode($aplicacion));
}

function crearControlador() {    
    global $nombreVista,$rutaJs;

    if(!is_dir(dirname($rutaJs))) mkdir(dirname($rutaJs),0755,true);

    $codigo=file_get_contents(__DIR__.'/plantillas/controlador.js');

    $codigo=str_replace([
        '{editor_nombre}'
    ],[
        $nombreVista
    ],$codigo);

    file_put_contents($rutaJs,$codigo);
}

function reemplazarVarJson($codigo,$json) {
    $json=str_replace_array([
        '\\'=>'\\\\\\',
        '\''=>'\\\''
    ],$json);
    return preg_replace('/var jsonFoxtrot\s*?=\s*?\'(.+?)\'\s*?;/s','var jsonFoxtrot=\''.$json.'\';',$codigo);
}

function reemplazarTagBase($codigo) {
    global $esPhp;
    if(!$esPhp) return $codigo;
    return preg_replace('/<base .*?href=("|\').+?(\1).*?>/s','<base href="<?=\foxtrot::obtenerUrl()?>">',$codigo);
}

function limpiarHtml($html) {
    //Remover tags generados temporalmente por el editor y que no son removidos en el cliente durante la operación de guardado
    $html=preg_replace('/<script.+?data-autogenerado.*?><\/script>/m','',$html);
    $html=preg_replace('/<link.+?data-autogenerado.*?>/m','',$html);
    return $html;
}

function copiar($ruta,$filtro,$destino,$rec=true) {
    if(is_array($filtro)) {
        foreach($filtro as $f) copiar($ruta,$f,$destino,$rec);
        return;
    }

    if(!$filtro) $filtro='{,.}*';
    
    if(!file_exists($destino)) mkdir($destino,0755,true);

    $arr=glob($ruta.$filtro,GLOB_BRACE);

    if($rec) $arr=array_merge($arr,glob($ruta.'*',GLOB_ONLYDIR));

    foreach($arr as $archivo) {
        $archivo=basename($archivo);
        if($archivo=='.'||$archivo=='..') continue;
        if(is_dir($ruta.$archivo)) {
            if($rec) copiar($ruta.$archivo.'/',$filtro,$destino.$archivo.'/',true);
        } else {
            copy($ruta.$archivo,$destino.$archivo);
        }
    }
}

function buscarArchivos($ruta,$filtro,$funcion=null) {
    $res=[];

    $arr=glob($ruta.$filtro,GLOB_BRACE);
    $arr=array_merge($arr,glob($ruta.'*',GLOB_ONLYDIR));
    foreach($arr as $archivo) {
        $archivo=basename($archivo);
        if($archivo=='.'||$archivo=='..') continue;
        if(is_dir($ruta.$archivo)) {
            $res=array_merge($res,buscarArchivos($ruta.$archivo.'/',$filtro,$funcion));
        } else {
            $res[]=$ruta.$archivo;
            if($funcion) call_user_func($funcion,$ruta.$archivo);
        }
    }

    return $res;
}

function comprimirCss($archivo) {
    $css=file_get_contents($archivo);

    //Compresión rápida (solo limpieza de contenido innecesario)
    $css=preg_replace('#/\*.*?\*/#sm','',$css);    
    //$css=preg_replace('#url\s*?\(\s*?(\'|")(.+?)\1\)#msi','url($2)',$css);
    $css=str_replace(["\r","\n"],'',$css);
    $css=preg_replace('/[\s]*([,>:;\}\{])[\s]+/m','$1',$css);
    $css=preg_replace('/\)[\s]+;/m',');',$css); //Evita remover el espacio cuando se encuentra en el selector, ejemplo :not(test) .test
    $css=preg_replace('/[\s]+\{/m','{',$css);
    $css=str_replace(';}','}',$css);

    //Subir los @import al comienzo del archivo
    if(preg_match_all('/(@import url\(.+?\);)/i',$css,$coincidencias)) {
        foreach($coincidencias[0] as $coincidencia) {
            $css=str_replace($coincidencia,'',$css);
            $css=$coincidencia.$css;
        }
    }

    file_put_contents($archivo,$css);
}

function compilarJs($archivos,$destino,$omitirClosure=false) {
    //Agregaremos el hash del archivo original en el encabezado del archivo compilado a fin de poder omitirlo si el mismo no ha cambiado
    //En caso de tratarse de múltiples archivos, el hash será sobre la concatenación de todos ellos
    if(!is_array($archivos)) $archivos=[$archivos];
    $codigo='';   
    $arg='';
    foreach($archivos as $item) {
        //Soporte para comodines (ejemplo **.js)
        $rutas=glob($item);
        foreach($rutas as $ruta) {
            $arg.=' "'.$ruta.'"'; 
            $codigo.=file_get_contents($ruta);   
        }
    }
    $hash=md5($codigo);

    if($omitirClosure) {
        file_put_contents($destino,$codigo);
    } else {
        if(file_exists($destino)&&trim(fgets(fopen($destino,'r')))=='//'.$hash) return;
        exec(_closure.' --js_output_file "'.escapeshellarg($destino).'" '.$arg);
        file_put_contents($destino,'//'.$hash.PHP_EOL.file_get_contents($destino));
    }
}

$archivosCssCombinados=[];

function procesarVista($ruta) {
    global $archivosCssCombinados;

    $rutaAplicacion='aplicaciones/'.gestor::obtenerNombreAplicacion().'/';

    $html=file_get_contents($ruta);

    $cordova=preg_match('/\{.*?cordova.*?:.*?true.*?\}/i',$html)==1;

    //Combinar archivos CSS
    if(preg_match_all('#(/\*combinar( tema)?\*/"|[ \t]*?<link .+?href=")(.+?)(",/\*combinar( tema)?\*/|".*? combinar.*>).*?[\r\n]*#m',$html,$coincidencias)) {
        $nombres=implode(',',$coincidencias[3]);
        if(array_key_exists($nombres,$archivosCssCombinados)) {
            $salida=$archivosCssCombinados[$nombres];
        } else {
            $css='';
            foreach($coincidencias[3] as $archivo) {
                //TODO Esto depende del enrutador... Por el momento queda harcodeado
                $archivo=preg_replace('#^aplicacion/#',$rutaAplicacion,$archivo);

                if(file_exists(_desarrollo.$archivo)) $css.=file_get_contents(_desarrollo.$archivo);
            }

            //Buscar una ruta libre
            $i=0;
            $salida=_produccion.$rutaAplicacion.'recursos/css/aplicacion.css';
            while(file_exists($salida)) {
                $i++;
                $salida=_produccion.$rutaAplicacion.'recursos/css/aplicacion-'.$i.'.css';
            }

            //Cuardar y comprimir
            file_put_contents($salida,$css);
            comprimirCss($salida);

            $archivosCssCombinados[$nombres]=$salida;
        }

        $nombre=basename($salida);
        $href=$cordova?$rutaAplicacion.'recursos/css/'.$nombre:'aplicacion/recursos/css/'.$nombre;
        $tag=$cordova?'"'.$href.'",'.PHP_EOL:'    <link rel="stylesheet" href="'.$href.'">'.PHP_EOL;
        
        //Agregar nuevo tag reemplazando la primer coincidencia
        $html=str_replace($coincidencias[0][0],$tag,$html);
        
        //Y remover el resto
        foreach($coincidencias[0] as $coincidencia) $html=str_replace($coincidencia,'',$html);
    }

    //Remover controlador
    $html=preg_replace('#[ \t]*?<script .+? controlador.*?>.*?</script>.*?[\r\n]*#m','',$html);

    if($cordova) {
        //Remover controlador
        $html=preg_replace('#/\*controlador\*/.+?/\*controlador\*/.*?[\r\n]*#','',$html);
    }

    file_put_contents($ruta,comprimirHtml($html));
}

function comprimirHtml($html) {
    return $html;
    //Compresión básica
    $html=preg_replace([
        '/\>[^\S ]+/s',
        '/[^\S ]+\</s',
        '/(\s)+/s',
        '/<!--(.|\s)*?-->/'
    ],[
        '>',
        '<',
        '\\1',
        ''
    ],$html);
    return $html;
}

function eliminarDir($ruta) {
    if(is_dir($ruta)) {
        if(substr($ruta,-1)!=DIRECTORY_SEPARATOR) $ruta.=DIRECTORY_SEPARATOR;
        $archivos=glob($ruta.'*');
        foreach($archivos as $archivo) eliminarDir($archivo);
        rmdir($ruta);
    } elseif(file_exists($ruta)) {
        unlink($ruta);
    }
}

/*function obtenerArgumentos() {
    global $argv;

    //El problema con getopt() es que los parámetros que no estén especificados se mezclan con los que sí lo están
    //Por ejemplo getopt('a:') producirá una salida incorrecta para `-a=parametro -b=parametro`, tomando todas las letras `a` de `-b` como instancias de `-a`
    //A continuación extraemos sólo los parámetros que están precedidos por `-`

    array_shift($argv); //el primer elemento es el nombre del script

    $parametros=[];
    foreach($argv as $arg) {
        if(substr($arg,0,1)=='-') {
            $arg=substr($arg,1);
            $igual=strpos($arg,'=');
            if($igual>0) {
                $parametros[substr($arg,0,$igual)]=substr($arg,$igual+1);
            } else {
                $parametros[$arg]=true;
            }
        } else {
            $parametros[$arg]=true;
        }
    }    
    return $parametros;
}*/

/* Restaurar un json a partir de las vistas existentes:
$json=['vistas'=>[]];
function recorrer($d='') {
    global $json;
    $archivos=glob('../aplicaciones/test/cliente/vistas/'.$d.'*');
    foreach($archivos as $archivo) {
        if(is_dir($archivo)) {
            recorrer($d.basename($archivo).'/');
        } else {
            $pi=pathinfo($archivo);
            $nombre=$pi['filename'];
            $extension=$pi['extension'];        
            if(!array_key_exists($d.$nombre,$json['vistas'])) $json['vistas'][$d.$nombre]=['tipo'=>'independiente','cliente'=>'web'];
        }
    }
}
recorrer();
file_put_contents('../aplicaciones/test/aplicacion.json',json_encode($json));*/