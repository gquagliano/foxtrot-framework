<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase base de los asistentes.
 */
class asistente {
    protected $aplicacion;

    /**
     * Constructor.
     * @var string $apl Nombre de la aplicación.
     */
    function __construct($apl) {
        $this->aplicacion=$apl;
    }

    /**
     * Devuelve los parámetros del asistente. Debe devolver un objeto con las propiedades [nombre,visible=>bool].
     * @return object
     */
    public static function obtenerParametros() {
    }

    /**
     * Devuelve el formulario de configuración del asistente.
     * @return string
     */
    public function obtenerFormulario() {
    }

    /**
     * Ejecuta el asistente.
     * @var object $parametros Parámetros recibidos desde el formulario.
     */
    public function ejecutar($parametros) {
    }
}

/**
 * Clase de gestión de los asistentes.
 */
class asistentes {
    protected static $asistentes=[];

    public static function inicializar() {
        $archivos=glob(__DIR__.'/*.php');
        foreach($archivos as $archivo) {
            $nombre=basename($archivo);
            if($nombre=='asistente.php') continue;

            include_once($archivo);

            //Convertir nombre de clase removiendo los guiones, ejemplo: crear-aplicacion.php -> crearAplicacion
            $partes=explode('-',substr($nombre,0,strrpos($nombre,'.')));
            foreach($partes as $i=>$v) if($i>0) $partes[$i]=ucfirst($v);
            $clase=implode('',$partes);

            $obj=$clase::obtenerParametros();
            $obj->clase=$clase;

            self::$asistentes=$obj;
        }
    }

    public static function obtenerAsistentes() {
        return self::$asistentes;
    }
}