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
 * Tipo de solicitud concreta que representa el acceso a un método de un componente. Parámetros POST: `__o` y `__m`. Parámetros CLI: `-componente` y `-metodo`.
 */
class componente extends \tipoSolicitud {
    protected $componente=null;
    protected $metodo=null;

    /**
     * Ejecuta la solicitud.
     * @return \tipoSolicitud\tipos\componente
     */
    public function ejecutar() {
        $componente=$this->obtenerComponente();

        $ruta=_componentes.$componente.'.pub.php';
        if(!file_exists($ruta)) return $this->error();

        include_once($ruta);
        $cls=\foxtrot::prepararNombreClase('\\componentes\\publico\\'.$componente,true);
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
        return (!\foxtrot::esCli()&&isset($parametros->__o)&&isset($parametros->__m))||
            (isset($parametros->componente)&&isset($parametros->metodo));
    }

    /**
     * Devuelve el nombre del componente solicitado.
     * @return string
     */
    public function obtenerComponente() {
        if(!$this->componente) 
            $this->componente=\util::limpiarValor(\foxtrot::esCli()?$this->parametros->componente:$this->parametros->__o);
            
        return $this->componente;
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
     * Establece el nombre del componente. Nota: Este valor no será sanitizado, no debe pasarse un valor obtenido desde el cliente.
     * @var string $nombre Nombre del componente.
     * @return \tipoSolicitud\tipos\componente
     */
    public function establecerComponente($nombre) {
        $this->componente=$nombre;
        return $this;
    }

    /**
     * Establece el nombre del método. Nota: Este valor no será sanitizado, no debe pasarse un valor obtenido desde el cliente.
     * @var string $nombre Nombre del método.
     * @return \tipoSolicitud\tipos\componente
     */
    public function establecerMetodo($nombre) {
        $this->metodo=$nombre;
        return $this;
    }
}