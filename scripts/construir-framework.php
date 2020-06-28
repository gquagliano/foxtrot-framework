<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para construir y compilar los archivos del framework y el editor

//TODO Deben exportarse todos los símbolos para poder utilizar --compilation_level ADVANCED con Closure

chdir(__DIR__);

define('_closure','java -jar closure-compiler-v20200517.jar');
define('_fuente',__DIR__.'/../fuente/');
define('_desarrollo',__DIR__.'/../desarrollo/');

include(__DIR__.'/funciones.php');

////php, html, css y otros recursos (se copian tal cual)

//Copiar
$tipos=['*.php','*.css','*.html','*.jpg','*.png'];
copiar(_fuente,$tipos,_desarrollo,false);
copiar(_fuente.'recursos/',$tipos,_desarrollo.'recursos/');
copiar(_fuente.'servidor/',$tipos,_desarrollo.'servidor/');
copiar(_fuente.'temp/',null,_desarrollo.'temp/');
copiar(_fuente.'editor/',$tipos,_desarrollo.'editor/');
copiar(_fuente.'editor/img/',null,_desarrollo.'editor/img/');

//Comprimir css
//No podemos buscar directamente en /desarrollo/ ya que debemos evitar tocar los css de la aplicación
buscarArchivos(_desarrollo.'recursos/','*.css','comprimirCss');
buscarArchivos(_desarrollo.'editor/','*.css','comprimirCss');

////Librerías de terceros (se compian tal cual)
//TOOD

////js cliente (framework + componentes)

//Compilar archivo combinado
$archivos=[
    'util.js',
    'dom.js',
    'arrastra.js',
    'editable.js',
    'servidor.js',
    'ajax.js',
    'componente.js',
    'controlador.js',
    'ui.js',
    'expresion.js',
    'componentes/**.js'
];
$arg='';
foreach($archivos as $arch) $arg.=' "'.escapeshellarg(_fuente.'cliente/'.$arch).'"';
exec(_closure.' --js_output_file "'.escapeshellarg(_desarrollo.'cliente/foxtrot.js').'" '.$arg);

//Editor
exec(_closure.' --js_output_file "'.escapeshellarg(_desarrollo.'editor/editor.js').'" --js "'.escapeshellarg(_fuente.'editor/editor.js').'"');