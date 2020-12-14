<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

define('_inc',1);

include(__DIR__.'/servidor/foxtrot.php');
foxtrot::inicializar(false);
foxtrot::cargarAplicacion();

//Intentar configurar index-cordova.html

$html=file_get_contents(__DIR__.'/index-cordova.html');

echo preg_replace([
    '/_nombreApl=".*?"/',
    '/_vistaInicial=".*?"/',
],[
    '_nombreApl="'.foxtrot::obtenerNombreAplicacion().'"',
    '_vistaInicial="'.$_GET['vista'].'.html"'
],$html);