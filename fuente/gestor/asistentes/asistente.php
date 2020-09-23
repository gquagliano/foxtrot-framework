<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

set_time_limit(3600);

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
     * Devuelve los parámetros del asistente. Debe devolver un objeto con las propiedades [titulo,visible=>bool].
     * @return object
     */
    public static function obtenerParametros() {
    }

    /**
     * Imprime el formulario de configuración del asistente.
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

    /**
     * Precarga los asistentes.
     */
    public static function inicializar() {
        $archivos=glob(__DIR__.'/*.php');
        foreach($archivos as $archivo) {
            $nombre=basename($archivo);
            if($nombre=='asistente.php') continue;

            include_once($archivo);

            $nombre=substr($nombre,0,strrpos($nombre,'.'));
            $clase=self::nombreClase($nombre);
            
            $obj=$clase::obtenerParametros();
            $obj->clase=$clase;
            $obj->nombre=$nombre;
            if($obj->visible!==false) $obj->visible=true;

            self::$asistentes[]=$obj;
        }
    }

    /**
     * Devuelve el listado de asistentes.
     * @return array
     */
    public static function obtenerAsistentes() {
        return self::$asistentes;
    }

    /**
     * Crea y devuelve la instancia de un asistente.
     * @return asistente
     */
    public static function obtenerAsistente($nombre) {
        $clase=self::nombreClase($nombre);
        return new $clase(gestor::obtenerNombreAplicacion());
    }
    
    /**
     * Convertir nombre de clase removiendo los guiones, ejemplo: crear-aplicacion.php -> crearAplicacion
     * @var string $nombre
     * @return string
     */
    private static function nombreClase($nombre) {
        $partes=explode('-',$nombre);
        foreach($partes as $i=>$v) if($i>0) $partes[$i]=ucfirst($v);
        $clase=implode('',$partes);
        return $clase;
    }
}