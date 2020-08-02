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

$ruta=__DIR__.'/../../'.$_POST['ruta'];
$nombre=basename($ruta);
$rutaJson=$ruta.'.json';
$rutaJs=dirname($ruta).'/../controladores/'.$nombre.'.js';
$rutaHtml=$ruta.'.html';
if(!file_exists($rutaHtml)) $rutaHtml=$ruta.'.php';
$rutaCss=$ruta.'.css';

if(!file_exists($rutaJs)) {
    //Controlador nuevo
    $codigo=file_get_contents(__DIR__.'/../plantillas/controlador.js');
    $codigo=str_replace_array([
        '{editor_nombre}'=>$nombre
    ],$codigo);
    file_put_contents($rutaJs,$codigo);
}

if(!file_exists($rutaJson)) {
    //Archivo nuevo
    echo json_encode([
        'json'=>[
            'version'=>1,
            'componentes'=>[],
            'nombre'=>$nombre
        ],
        'html'=>'<div id="foxtrot-cuerpo"></div>',
        'css'=>''
    ]);
    exit;
}

$json=json_decode(file_get_contents($rutaJson));

//El archivo JSON contiene el cuerpo y el JSON de componentes, debemos sumar el CSS
$json->css=file_get_contents($rutaCss);

echo json_encode($json);