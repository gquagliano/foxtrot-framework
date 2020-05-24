<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Gestor de la configuración del sistema.
 */
class configuracion {
    public static $url=null;
    public static $rutaEror='error/';
    public static $enrutador=null;
    public static $rutaBase='/';

    public static function cargar() {
        include(_raiz.'config.php');
    }

    public static function cargarConfigAplicacion() {
        $ruta=_raizAplicacion.'config.php';
        if(file_exists($ruta)) include($ruta);
    }

    public static function establecer($obj) {
        foreach($obj as $c=>$v) self::$$c=$v;
    }
}