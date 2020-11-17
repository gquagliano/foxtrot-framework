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

defined('_inc') or exit;

define('_raizGlobal',realpath(__DIR__.'/..').'/'); //_raiz (definido por foxtrot.php) apunta al directorio 
define('_fuente',_raizGlobal.'fuente/');
define('_produccion',_raizGlobal.'produccion/');
define('_desarrollo',_raizGlobal.'desarrollo/');
define('_embeber',_raizGlobal.'embeber/');

include(__DIR__.'/../construir/funciones.php');

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

    $rutaApl=_raiz.'/aplicaciones/'.$nombreApl.'/';
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

    //Romper en múltiples líneas si es muy largo
    $resto=$json;
    $json='';
    while(strlen($resto)>5000) {
        $json.=substr($resto,0,5000).'\\'.PHP_EOL;
        $resto=substr($resto,5000);
    }
    if($resto) $json.=$resto;

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

$archivosCssCombinados=[];
$archivosCssCombinadosCordova=[];

function procesarVista($ruta,$vista,$version) {
    global $archivosCssCombinados,$archivosCssCombinadosCordova;

    $rutaAplicacion='aplicaciones/'.gestor::obtenerNombreAplicacion().'/';
    $rutaCssCombinado=_produccion.$rutaAplicacion.'recursos/css/aplicacion.css';
    $rutaCssCombinadoCordova=_produccion.$rutaAplicacion.'recursos/css/cordova.css';

    $html=file_get_contents($ruta);

    $cordova=preg_match('/\{.*?cordova.*?:.*?true.*?\}/i',$html)==1;

    //Combinar archivos CSS de Foxtrot en el tema
    //Se asume que todas las vistas tienen tema (por eso existe el tema en-blanco)

    //Buscar tema
    preg_match('#<link .+?href="(.+?)".*? tema=?.*?>#m',$html,$coincidencias);
    $tema=basename($coincidencias[1]);
    $rutaCssFoxtrot=_produccion.'recursos/css/'.$tema;

    //Combinar todo lo que tenga combinar="foxtrot" en el tema
    if(preg_match_all('#<link .+?href="(.+?)".*? combinar="foxtrot".*?>#m',$html,$coincidencias)) {
        if(!file_exists($rutaCssFoxtrot)) {
            $css='';
            $nombres=$coincidencias[1];
            foreach($nombres as $nombre) {
                $css.=file_get_contents(_desarrollo.$nombre);
            }
            file_put_contents($rutaCssFoxtrot,$css);
            comprimirCss($rutaCssFoxtrot);
        }

        //Reemplazar primer coincidencia y remover las demás

        //Agregar versión, solo en web
        if($version&&$vista->cliente=='web') $tema=preg_replace('/\.css$/','-'.$version.'.css',$tema);

        $tag='<link rel="stylesheet" href="recursos/css/'.$tema.'">'.PHP_EOL;
        $html=str_replace($coincidencias[0][0],$tag,$html);
        foreach($coincidencias[0] as $coincidencia) $html=str_replace($coincidencia,'',$html);
    }

    $destino=$cordova?$rutaCssCombinadoCordova:$rutaCssCombinado;

    //Combinar archivos CSS con combinar="aplicacion" o /*combinar*/ en aplicacion.css
    if(preg_match_all('#(<link .*?href="(.+?)" .*?combinar="aplicacion".*?>|/\*combinar( tema)?\*/"(.+?)",?)#m',$html,$coincidencias)) {
        //Agregar los archivos que aún no estén en aplicacion.css
        foreach($coincidencias[0] as $i=>$v) {
            if($cordova) {
                $archivo=$coincidencias[4][$i];
                if(in_array($archivo,$archivosCssCombinadosCordova)) continue;
                $archivosCssCombinadosCordova[]=$archivo;
            } else {                
                $archivo=$coincidencias[2][$i];
                if(in_array($archivo,$archivosCssCombinados)) continue;
                $archivosCssCombinados[]=$archivo;
            }

            //TODO Esto depende del enrutador... Por el momento queda harcodeado
            $archivo=preg_replace('#^aplicacion/#',$rutaAplicacion,$archivo);

            if(file_exists(_desarrollo.$archivo)) file_put_contents($destino,file_get_contents(_desarrollo.$archivo),FILE_APPEND);
        }

        //Comprimir todo
        comprimirCss($destino);

        $nombre=basename($destino);

        //Agregar versión, solo en web
        if($version&&$vista->cliente=='web') $nombre=preg_replace('/\.css$/','-'.$version.'.css',$nombre);

        $href=$cordova?$rutaAplicacion.'recursos/css/'.$nombre:'aplicacion/recursos/css/'.$nombre;
        $tag=$cordova?'"'.$href.'",'.PHP_EOL:'    <link rel="stylesheet" href="'.$href.'">'.PHP_EOL;
        
        //Agregar nuevo tag reemplazando la primer coincidencia y remover el resto
        $html=str_replace($coincidencias[0][0],$tag,$html);
        foreach($coincidencias[0] as $coincidencia) $html=str_replace($coincidencia,'',$html);
    }
    
    //Remover controlador
    $html=preg_replace('#[ \t]*?<script .+? controlador.*?>.*?</script>.*?[\r\n]*#m','',$html);
    if($cordova) $html=preg_replace('#/\*controlador\*/".+?",?[\r\n]*#','',$html);

    //Agregar versión a los JS también, solo en web
    if($version&&$vista->cliente=='web'&&preg_match_all('#<script .*?src="(.+?)".*?>#',$html,$coincidencias)) {
        $tag=$coincidencias[0];
        $tagNuevo=preg_replace('/\.js"/','-'.$version.'.js"',$tag);
        $html=str_replace($tag,$tagNuevo,$html);
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

function eliminarDirectoriosVacios($ruta) {
    $vacio=true;
    foreach(glob($ruta.'{,.}*',GLOB_BRACE) as $archivo) {
        if(basename($archivo)=='.'||basename($archivo)=='..') continue;
        if(!is_dir($archivo)) {
            $vacio=false;
            break;
        }
        if(!eliminarDirectoriosVacios($archivo.'/')) {
            $vacio=false;
        }
    }
    if($vacio) rmdir($ruta);
    return $vacio;
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