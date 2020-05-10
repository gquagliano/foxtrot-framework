<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de prueba para abrir los datos en el editor

$ruta='salida/';
$nombre=preg_replace('/[^a-z]/i','',$_POST['nombre']).'.json';

echo file_get_contents(__DIR__.'/'.$ruta.$nombre);