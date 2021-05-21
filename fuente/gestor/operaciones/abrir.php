<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para abrir los datos en el editor

define('_inc',1);

include(__DIR__.'/../funciones.php');
include(_raizGlobal.'desarrollo/servidor/foxtrot.php');

header('Content-Type: text/plain; charset=utf-8',true);

prepararVariables();

if(!file_exists($rutaJs)) {
    //Controlador un nuevo con el mismo nombre que la vista (en el futuro esto debería ser opcional ya que no es necesario que toda
    //vista tenga un controlador de igual nombre)
    crearControlador();
}

if(!file_exists($rutaHtml)) {
    //Vista nueva
    crearVista();
}

if($modo=='embebible') {
    $url='operaciones/marco-embebible.php?aplicacion='.$nombreApl.'&vista='.$nombreVista;
} elseif($cliente=='cordova') {
	$url='operaciones/marco-cordova.php?aplicacion='.$nombreApl.'&vista='.$nombreVista;
} else {
	$url='operaciones/marco.php?aplicacion='.$nombreApl.'&vista='.$nombreVista;
}

echo json_encode([
    'url'=>$url
]);