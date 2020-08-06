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

$opciones=getopt('a::');
if(!$opciones['a']) {
    fwrite(STDERR,'El parámetro -a es requerido.'.PHP_EOL.PHP_EOL);
    exit;
}

$aplicacion=preg_replace('/[^a-z0-9 _\.-]/i','',$opciones['a']);
define('_dirApl',_desarrollo.'aplicaciones/'.$aplicacion.'/');
if(!$aplicacion||!is_dir(_dirApl)) {
    fwrite(STDERR,'Aplicación inexistente.'.PHP_EOL.PHP_EOL);
    exit;
}

////Copiar framework

copiar(_desarrollo.'cliente/',$tipos,_produccion.'cliente/');
copiar(_desarrollo.'recursos/',$tipos,_produccion.'recursos/');
copiar(_desarrollo.'servidor/',$tipos,_produccion.'servidor/');

//Directorio temp (no copiar los archivos que contenga en desarrollo)
if(!is_dir(_produccion.'temp/')) mkdir(_produccion.'temp/');
if(!is_dir(_produccion.'temp/temp-privado/')) mkdir(_produccion.'temp/temp-privado/');
copy(_desarrollo.'temp/temp-privado/.htaccess',_produccion.'temp/temp-privado/.htaccess');
