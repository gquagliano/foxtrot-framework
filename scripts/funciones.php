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

    if(!file_exists($destino)) mkdir($destino);

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

    $arr=glob($ruta.$filtro);
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
    $css=preg_replace('/[\s]*([\),>:;\}\{])[\s]+/m','$1',$css);
    $css=preg_replace('/[\s]+\{/m','{',$css);
    $css=str_replace(';}','}',$css);

    file_put_contents($archivo,$css);
}

function compilarJs($archivos,$destino) {
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

    if(file_exists($destino)&&trim(fgets(fopen($destino,'r')))=='//'.$hash) return;

    exec(_closure.' --js_output_file "'.escapeshellarg($destino).'" '.$arg);

    file_put_contents($destino,'//'.$hash.PHP_EOL.file_get_contents($destino));
}