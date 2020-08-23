<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para construir y compilar los archivos de la aplicación

//TODO Deben exportarse todos los símbolos para poder utilizar --compilation_level ADVANCED con Closure

include(__DIR__.'/configuracion.php');

$opciones=getopt('a::i::dc::p::lj');

define('_depuracion',array_key_exists('d',$opciones));
validarParametroAplicacion($opciones);

if(!$opciones['i']) {
    fwrite(STDERR,'El parámetro -i es requerido.'.PHP_EOL.PHP_EOL);
    exit;
}

exec('php construir-apl.php -a='.escapeshellarg($opciones['a']).(_depuracion?' -d':'').($opciones['l']?' -l':'').($opciones['j']?' -j':''));

$inicio=preg_replace('/[^a-z0-9 _\.\/-]/i','',$opciones['i']).'.html';
if(!file_exists(_produccion._dirApl.'cliente/vistas/'.$inicio)) {
    fwrite(STDERR,'Vista inexistente.'.PHP_EOL.PHP_EOL);
    exit;
}

//Copiar todo excepto archivos PHP
$tipos=['*.html','*.jpg','*.png','*.gif','*.svg','*.js','*.css'];
copiar(_produccion,$tipos,_embeber);

//Remover directorios innecesarios
eliminarDir(_embeber.'temp/');
eliminarDir(_embeber.'servidor/');

//Intentar configurar index-cordova.html

$html=file_get_contents(_desarrollo.'index-cordova.html');

file_put_contents(_embeber.'index-cordova.html',preg_replace([
    '/_nombreApl=".+?"/',
    '/_vistaInicial=".+?"/',
],[
    '_nombreApl="'.$opciones['a'].'"',
    '_vistaInicial="'.$inicio.'"'
],$html));

if($opciones['c']) {
    $dir=$opciones['c'];
    if(substr($dir,-1)!='/'&&substr($dir,-1)!='\\') $dir.='/';

    //Limpiar directorio
    if(!$opciones['l']) {
        $archivos=buscarArchivos($dir,'*.*');
        foreach($archivos as $archivo) unlink($archivo);
    }

    copiar(_embeber,'*.*',$dir);
    
    chdir($dir);
    $pl=$opciones['p'];
    if(!$pl) $pl='android';
    exec('cordova prepare '.escapeshellarg($pl));
    exec('cordova run '.escapeshellarg($pl));
}