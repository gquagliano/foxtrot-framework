<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//¡Prototipo!

header('Content-Type: text/plain; charset=utf-8',true);

include(__DIR__.'/funciones.php');
include(__DIR__.'/frontend.php');
include(__DIR__.'/enrutador.php');

$app='test';
$archivoEnrutador='enrutador-predeterminado';
$claseEnrutador='enrutadorPredeterminado';

include(__DIR__.'/../apps/'.$app.'/backend/'.$archivoEnrutador.'.php');

$cls='\\app\\'.$app.'\\enrutadores\\'.$claseEnrutador;
$enrutador=new $cls;

$enrutador->establecerSolicitud($_SERVER['REQUEST_URI'],$_REQUEST);

if($enrutador->obtenerError()) exit;

$ctl=$enrutador->obtenerControlador();
$metodo=$enrutador->obtenerMetodo();
$params=$enrutador->obtenerParametros();

include(__DIR__.'/../apps/'.$app.'/backend/'.$ctl.'.pub.php');
$cls='\\app\\'.$app.'\\publico\\'.$ctl;
$obj=new $cls;

$res=call_user_func_array([$obj,$metodo],$params);

if($res!==null) frontend::responder($res);