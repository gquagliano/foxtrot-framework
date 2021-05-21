<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para mostrar vistas independientes en el marco del editor

define('_inc',1);

include(__DIR__.'/../funciones.php');
include(_raizGlobal.'desarrollo/servidor/foxtrot.php');

prepararVariables();

include($rutaHtml);
