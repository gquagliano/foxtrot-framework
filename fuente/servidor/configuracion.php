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
    public static $urlError=null;
    public static $enrutador=null;
    public static $rutaBase='/';
    public static $zonaHoraria='America/Argentina/Buenos_Aires';
    public static $zonaHorariaMinutos=-180;
    public static $servidorBd='127.0.0.1';
    public static $puertoBd=3306;
    public static $usuarioBd;
    public static $contrasenaBd;
    public static $nombreBd;
    public static $prefijoBd='';
    public static $servidorSmtp='';
    public static $autenticacionSmtp=true;
    public static $puertoSmtp=25;
    public static $usuarioSmtp='';
    public static $contrasenaSmtp='';

    protected static $otrosParametros=[];

    public static function cargar() {
        include(_raiz.'config.php');
    }

    public static function cargarConfigAplicacion() {
        $ruta=_raizAplicacion.'config.php';
        if(file_exists($ruta)) include($ruta);
    }

    public static function establecer($obj) {
        foreach($obj as $c=>$v) {
            //Es posible que se establezcan propiedades que no existen
            if(!property_exists(self::class,$c)) {
                self::$otrosParametros[$c]=$v;
            } else {
                self::$$c=$v;
            }
        }
    }

    /**
     * Devuelve el valor de un parámetro.
     * @var string $nombre Nombre del parámetro.
     * @return mixed
     */
    public static function obtener($nombre) {
        //Es posible que se soliciten propiedades que no existen y que hayan sido creadas con establecer()
        if(!property_exists(self::class,$nombre)) {
            if(!array_key_exists($nombre,self::$otrosParametros)) return null;
            return self::$otrosParametros[$nombre];
        }
        return self::$$nombre;
    }
}