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
 * Tipo de solicitud concreta que representa el acceso a un método de un componente.
 */
class componente extends \solicitud {
    protected $componente=null;
    protected $metodo=null;

    /**
     * Ejecuta la solicitud.
     * @return \solicitud\tipos\componente
     */
    public function ejecutar() {
        $componente=$this->obtenerComponente();

        $ruta=_componentes.$componente.'.pub.php';
        if(!file_exists($ruta)) return $this->error();

        $partes=\foxtrot::prepararNombreClase($componente);

        include_once($ruta);
        $cls='\\componentes\\publico'.$partes->espacio.'\\'.$partes->nombre;
        $obj=new $cls;

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
        return isset($parametros->__o)&&isset($parametros->__m);
    }

    /**
     * Devuelve el nombre del componente solicitado.
     * @return string
     */
    public function obtenerComponente() {
        if(!$this->componente) $this->componente=\util::limpiarValor($this->parametros->__o);
        return $this->componente;
    }

    /**
     * Devuelve el nombre del método solicitado.
     * @return string
     */
    public function obtenerMetodo() {
        if(!$this->metodo) $this->metodo=\util::limpiarValor($this->parametros->__m);
        return $this->metodo;
    }

    /**
     * Establece el nombre del componente. Nota: Este valor no será sanitizado, no debe pasarse un valor obtenido desde el cliente.
     * @var string $nombre Nombre del componente.
     * @return \solicitud\tipos\componente
     */
    public function establecerComponente($nombre) {
        $this->componente=$nombre;
        return $this;
    }

    /**
     * Establece el nombre del método. Nota: Este valor no será sanitizado, no debe pasarse un valor obtenido desde el cliente.
     * @var string $nombre Nombre del método.
     * @return \solicitud\tipos\componente
     */
    public function establecerMetodo($nombre) {
        $this->metodo=$nombre;
        return $this;
    }
}