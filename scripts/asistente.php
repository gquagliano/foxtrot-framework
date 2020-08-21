<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para implementar asistentes

define('_inc',1);

include(__DIR__.'/configuracion.php');
include(_desarrollo.'servidor/foxtrot.php');

define('_editor',__DIR__.'/../fuente/editor/');

$opciones=obtenerArgumentos();

$aplicacion=validarParametroAplicacion($opciones);

foxtrot::inicializar($opciones['a']);

if(!$opciones['s']) {
    fwrite(STDERR,'El parámetro -s es requerido.'.PHP_EOL.PHP_EOL);
    exit;
}

$asistentes=[
    'abmc'=>'abmc',
    'crear-modelo'=>'crearModelo',
    'crear-apl'=>'crearApl'
];

$nombre=$opciones['s'];
if(!array_key_exists($nombre,$asistentes)) {
    fwrite(STDERR,'El parámetro -s es inválido.'.PHP_EOL.PHP_EOL);
    exit;
}

$archivo=__DIR__.'/asistentes/'.$nombre.'.php';
$clase=$asistentes[$nombre];

include($archivo);
(new $clase($opciones['a']))
    ->ejecutar();

class asistente {
    protected $aplicacion;

    function __construct($apl) {
        $this->aplicacion=$apl;
    }

    public function ejecutar() {
    }

    protected function error($mensaje) {
        fwrite(STDERR,$mensaje.PHP_EOL.PHP_EOL);
        exit;
    }
}