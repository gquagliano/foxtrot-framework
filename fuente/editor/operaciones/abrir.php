<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para abrir los datos en el editor

define('_inc',1);

include(__DIR__.'/../../servidor/foxtrot.php');
foxtrot::inicializar();

header('Content-Type: text/plain; charset=utf-8',true);

$vista=__DIR__.'/../../'.$_POST['ruta'];
$nombre=basename($vista);
$ruta=dirname($vista).'/';

$rutaJson=$vista.'.json';
//$rutaJs=$ruta.'.js';
$rutaCss=$vista.'.css';
$rutaJsonApl=$ruta.'../../aplicacion.json';
$rutaRec=$ruta.'../../recursos/';

//if(!file_exists($rutaJs)) {
//    //Controlador nuevo
//    file_put_contents($rutaJs,'/**
// * Controlador de la vista '.$nombre.'.
// */
//ui.registrarControlador("'.$nombre.'",function() {
//});
//');
//}

if(!file_exists($rutaJson)) {
    //Archivo nuevo
    $obj=(object)[
        'json'=>[
            'version'=>1,
            'componentes'=>[],
            'nombre'=>$nombre,
            'propiedades'=>(object)[]
        ],
        'html'=>'<div id="foxtrot-cuerpo"></div>',
        'css'=>''
    ];
} else {
    $obj=json_decode(file_get_contents($rutaJson));
    
    //Agregar el CSS
    $obj->css=file_get_contents($rutaCss);
}

//Agregar propiedades de la aplicación
$aplicacion=json_decode(file_get_contents($rutaJsonApl));
$obj->aplicacion=[
    'css'=>'../aplicaciones/test/recursos/css/estilos.css',
    'tema'=>'../recursos/css/tema-'.$aplicacion->tema.'.css'
];

echo json_encode($obj);