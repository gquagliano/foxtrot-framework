<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Intentar configurar index-cordova.html
$html=file_get_contents(__DIR__.'/index-cordova.html');
echo preg_replace([
    '/_nombreApl=".*?"/',
    '/_vistaInicial=".*?"/',
    '/_simular=(true|false)/'
],[
    '_nombreApl="'.$_REQUEST['aplicacion'].'"',
    '_vistaInicial="'.$_GET['vista'].'.html"',
    '_simular=true'
],$html);