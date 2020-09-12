<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Funciones útiles y comunes para los scripts de compilación
//Este es un script de PRUEBA (eventualmente se combinará con el resto del código del IDE)

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

function validarParametroAplicacion($opciones,$existente=true) {
    if(!$opciones['a']) {
        fwrite(STDERR,'El parámetro -a es requerido.'.PHP_EOL.PHP_EOL);
        exit;
    }

    $aplicacion=preg_replace('/[^a-z0-9 _\.-]/i','',$opciones['a']);

    define('_dirApl','aplicaciones/'.$aplicacion.'/');

    if(!$aplicacion||!is_dir(_desarrollo._dirApl)) $aplicacion=false;

    if(!$aplicacion&&$existente) {
        fwrite(STDERR,'Aplicación inexistente.'.PHP_EOL.PHP_EOL);
        exit;
    }

    return $aplicacion;
}

$archivosCssCombinados=[];

function procesarVista($ruta) {
    global $archivosCssCombinados;

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
                $archivo=preg_replace('#^aplicacion/#',_dirApl,$archivo);

                if(file_exists(_desarrollo.$archivo)) $css.=file_get_contents(_desarrollo.$archivo);
            }

            //Buscar una ruta libre
            $i=0;
            $salida=_produccion._dirApl.'recursos/css/aplicacion.css';
            while(file_exists($salida)) {
                $i++;
                $salida=_produccion._dirApl.'recursos/css/aplicacion-'.$i.'.css';
            }

            //Cuardar y comprimir
            file_put_contents($salida,$css);
            comprimirCss($salida);

            $archivosCssCombinados[$nombres]=$salida;
        }

        $nombre=basename($salida);
        $href=$cordova?_dirApl.'recursos/css/'.$nombre:'aplicacion/recursos/css/'.$nombre;
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

function obtenerArgumentos() {
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
}