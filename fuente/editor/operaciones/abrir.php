<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para abrir los datos en el editor

include(__DIR__.'/funciones.php');

prepararVariables();

if(!file_exists($rutaJs)) {
    //Controlador un nuevo con el mismo nombre que la vista (en el futuro esto debería ser opcional ya que no es necesario que toda vista tenga un controlador de igual nombre)
    crearControlador();
}

if(!file_exists($rutaHtml)) {
    //Vista nueva
    crearVista();
}

if($modo=='embebible') {
    $url='operaciones/marco.php?apl='.$nombreApl.'&vista='.$nombreVista;
} else {
    $url=foxtrot::obtenerEnrutador()->obtenerUrlVista($nombreVista);
}

echo json_encode([
    'url'=>$url
]);