<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace solicitud\tipos;

defined('_inc') or exit;

/**
 * Tipo de solicitud concreta que representa el acceso a un método de la clase pública de un módulo. Parámetros POST: `__u` y `__m`. Parámetros CLI: `-modulo` y `-metodo`.
 */
class modulo extends \tipoSolicitud {    
    protected $modulo=null;
    protected $metodo=null;

    /**
     * Ejecuta la solicitud.
     * @return \tipoSolicitud\tipos\modulo
     */
    public function ejecutar() {
        $modulo=$this->obtenerModulo();

        $obj=\foxtrot::fabricarModulo($modulo,true);
        if($obj===null) return $this->error();

        $this->ejecutarMetodo($obj,$this->obtenerMetodo());

        return $this;
    }

    /**
     * Determina si los parámetros dados a una solicitud de este tipo.
     * @var string $url URL
     * @var object $parametros Parámetros de la solicitud.
     * @return bool
     */
    public static function es($url,$parametros) {
        return (!\foxtrot::esCli()&&isset($parametros->__u)&&isset($parametros->__m))||
            (isset($parametros->modulo)&&isset($parametros->metodo));
    }

    /**
     * Devuelve el nombre del módulo solicitado.
     * @return string
     */
    public function obtenerModulo() {
        if(!$this->modulo)
            $this->modulo=\util::limpiarValor(\foxtrot::esCli()?$this->parametros->modulo:$this->parametros->__u);

        return $this->modulo;
    }

    /**
     * Devuelve el nombre del método solicitado.
     * @return string
     */
    public function obtenerMetodo() {
        if(!$this->metodo)
            $this->metodo=\util::limpiarValor(\foxtrot::esCli()?$this->parametros->metodo:$this->parametros->__m);

        return $this->metodo;
    }

    /**
     * Establece el nombre del módulo. Nota: Este valor no será sanitizado, no debe pasarse un valor obtenido desde el cliente.
     * @var string $nombre Nombre del módulo.
     * @return \tipoSolicitud\tipos\modulo
     */
    public function establecerModulo($nombre) {
        $this->modulo=$nombre;
        return $this;
    }

    /**
     * Establece el nombre del método. Nota: Este valor no será sanitizado, no debe pasarse un valor obtenido desde el cliente.
     * @var string $nombre Nombre del método.
     * @return \tipoSolicitud\tipos\modulo
     */
    public function establecerMetodo($nombre) {
        $this->metodo=$nombre;
        return $this;
    }
}