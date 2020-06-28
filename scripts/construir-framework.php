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

////php, html, css y otros recursos

//Copiar
$tipos=['*.php','*.html','*.jpg','*.png'];
copiar(_fuente,$tipos,_desarrollo,false);
copiar(_fuente.'recursos/',$tipos,_desarrollo.'recursos/');
copiar(_fuente.'servidor/',$tipos,_desarrollo.'servidor/');
copiar(_fuente.'temp/',null,_desarrollo.'temp/');
copiar(_fuente.'editor/',$tipos,_desarrollo.'editor/');
copiar(_fuente.'editor/img/',null,_desarrollo.'editor/img/');

//Combinar todos los archivos css del framework (excepto el editor) y comprimir
$css='';
$archivos=[
    _fuente.'recursos/css/bootstrap.min.css',
    _fuente.'recursos/css/foxtrot.css'
];
$archivos=array_merge($archivos,buscarArchivos(_fuente.'recursos/componentes/css/','*.css'));
foreach($archivos as $arch) $css.=file_get_contents($arch);
$ruta=_desarrollo.'recursos/css/foxtrot.css';
file_put_contents($ruta,$css);
comprimirCss($ruta);

//Remover el directorio recursos/componentes/css (quedó vacío al combinar los css)
rmdir(_desarrollo.'recursos/componentes/css');

//Editor
$ruta=_desarrollo.'editor/editor.css';
copy(_fuente.'editor/editor.css',$ruta);
comprimirCss($ruta);

////Librerías de terceros (se compian tal cual)
//TOOD

////js cliente (framework + componentes)

//Compilar archivo combinado (excepto el editor)
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