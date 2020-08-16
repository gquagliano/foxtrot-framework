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

$opciones=getopt('a:s:m:r:oac');

$aplicacion=validarParametroAplicacion($opciones);

foxtrot::inicializar($opciones['a']);

if(!$opciones['s']) {
    fwrite(STDERR,'El parámetro -s es requerido.'.PHP_EOL.PHP_EOL);
    exit;
}

$nombre=preg_replace('/[^a-z-]/','',$opciones['s']);
$archivo=__DIR__.'/asistentes/'.$nombre.'.php';

if(!file_exists($archivo)) {
    fwrite(STDERR,'El parámetro -s es inválido.'.PHP_EOL.PHP_EOL);
    exit;
}

include($archivo);
(new $nombre($opciones['a']))
    ->ejecutar();

class asistente {
    protected $aplicacion;

    function __construct($apl) {
        $this->aplicacion=$apl;
    }

    public function ejecutar() {
    }
}