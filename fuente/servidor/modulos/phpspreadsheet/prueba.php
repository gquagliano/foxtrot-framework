<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de prueba de la librería, independiente de Foxtrot; ejecutar por línea de comandos (php prueba.php)

use modulos\phpspreadsheet;

define('_inc',1);
error_reporting(E_ALL);
class modulo {}

include(__DIR__.'/phpspreadsheet.php');

$nombre=__DIR__.'/prueba.xlsx';

$xls=(new phpspreadsheet)->crear();

$xls->escribirFila(1,['Celda 1','Celda 2','Celda 3']);
$xls->escribirFila(2,['Celda 4','Celda 5','Celda 6']);
$xls->escribirCelda('A3','Prueba 1');
$xls->escribirCelda(1,4,'Prueba 2');

$xls->guardarXlsx($nombre);

$xls=(new phpspreadsheet)->abrir($nombre);

print_r($xls->obtenerArray());
print_r($xls->obtenerHojas());
print_r($xls->leerFila(1));
print_r($xls->leerCelda('B2'));
print_r($xls->leerCelda(2,1));
print_r($xls->obtenerCoordenada(3,1));
print_r($xls->obtenerColumna(3));
print_r($xls->obtenerIndice('C'));