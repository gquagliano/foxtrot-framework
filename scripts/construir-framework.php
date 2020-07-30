<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para construir y compilar los archivos del framework y el editor

//TODO Deben exportarse todos los símbolos para poder utilizar --compilation_level ADVANCED con Closure

include(__DIR__.'/configuracion.php');

$opciones=getopt('d');
define('_depuracion',array_key_exists('d',$opciones));

////php, html, css y otros recursos

//Copiar
$tipos=['*.php','*.html','*.jpg','*.png'];
copiar(_fuente,$tipos,_desarrollo,false);
copiar(_fuente.'recursos/',$tipos,_desarrollo.'recursos/');
copiar(_fuente.'servidor/',$tipos,_desarrollo.'servidor/');
copiar(_fuente.'temp/',null,_desarrollo.'temp/');
copiar(_fuente.'editor/',$tipos,_desarrollo.'editor/');
copiar(_fuente.'editor/img/',null,_desarrollo.'editor/img/');
copiar(_fuente.'editor/operaciones/',null,_desarrollo.'editor/operaciones/');
copiar(_fuente.'editor/plantillas/',null,_desarrollo.'editor/plantillas/');

//Combinar todos los archivos css del framework (excepto el editor) y comprimir
$css='';
$archivos=[
    _fuente.'recursos/css/bootstrap.min.css',
    _fuente.'recursos/css/foxtrot.css'
];
$archivos=array_merge($archivos,buscarArchivos(_fuente.'recursos/componentes/css/','*.css'));
foreach($archivos as $arch) {
    //Excluir css de modo de edición
    if(preg_match('/\.edicion\.css$/',$arch)) continue;
    $css.=file_get_contents($arch);
}
$ruta=_desarrollo.'recursos/css/foxtrot.css';
file_put_contents($ruta,$css);
comprimirCss($ruta);

//Remover el directorio recursos/componentes/css (quedó vacío al combinar los css)
rmdir(_desarrollo.'recursos/componentes/css');

//Css del editor
$css='';
$archivos=[
    _fuente.'editor/editor.css'
];
$archivos=array_merge($archivos,buscarArchivos(_fuente.'recursos/componentes/css/','*.edicion.css'));
foreach($archivos as $arch) $css.=file_get_contents($arch);
$ruta=_desarrollo.'editor/editor.css';
file_put_contents($ruta,$css);
comprimirCss($ruta);

////Librerías de terceros (se compian tal cual)
//TOOD

////js cliente (framework + componentes)

//Compilar archivo combinado (excepto el editor)
$archivos=[
    _fuente.'cliente/util.js',
    _fuente.'cliente/dom.js',
    _fuente.'cliente/arrastra.js',
    _fuente.'cliente/editable.js',
    _fuente.'cliente/servidor.js',
    _fuente.'cliente/ajax.js',
    _fuente.'cliente/componente.js',
    _fuente.'cliente/controlador.js',
    _fuente.'cliente/ui.js',
    _fuente.'cliente/expresion.js',
    _fuente.'cliente/componentes/**.js' //TODO Debemos definir el orden de los componentes, ya que actualmente se representan en el editor en orden de inclusión, sobre lo cual aquí no tenemos control
];
compilarJs($archivos,_desarrollo.'cliente/foxtrot.js',_depuracion);

//Editor
compilarJs(_fuente.'editor/editor.js',_desarrollo.'editor/editor.js',_depuracion);