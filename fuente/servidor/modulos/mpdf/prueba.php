<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de prueba de la librería, independiente de Foxtrot. Ejecutar mediante navegador en /fuente/servidor/modulos/mpdf/prueba.php (en /desarrollo/ no funcionará).

define('_inc',1);
error_reporting(E_ALL);
class modulo {}

include(__DIR__.'/mpdf.php');

(new \modulos\mpdf)
    ->crear()
    ->establecerFondo(__DIR__.'/bg.jpg')
    ->marcaDeAgua('Prueba')
    ->escribirHtml('<h1>¡Hóla!</h1>')
    ->enviar();