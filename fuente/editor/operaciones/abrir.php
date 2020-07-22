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

$ruta=__DIR__.'/../../'.$_POST['ruta'];
$nombre=basename($ruta);
$rutaJson=$ruta.'.json';
$rutaJs=$ruta.'.js';

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
            'ver'=>1,
            'componentes'=>[],
            'vista'=>[
                'nombre'=>$nombre,
                'propiedades'=>(object)[]
            ]
        ],
        'html'=>'',
        'css'=>''
    ]);
    exit;
}

echo file_get_contents($rutaJson);