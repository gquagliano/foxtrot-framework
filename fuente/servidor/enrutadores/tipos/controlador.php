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
 * Tipo de solicitud concreta que representa el acceso a un método de un controlador. Parámetros POST: `__c` y `__m`. Parámetros CLI: `-controlador` y `-metodo`.
 */
class controlador extends \tipoSolicitud {   
    protected $controlador=null;
    protected $metodo=null;

    /**
     * Ejecuta la solicitud.
     * @return \tipoSolicitud\tipos\controlador
     */
    public function ejecutar() {
        $controlador=$this->obtenerControlador();

        $partes=\foxtrot::prepararNombreClase($controlador);

        //Los controladores que presenten /, se buscan en el subdirectorio
        $ruta=_controladoresServidorAplicacion.$controlador.'.pub.php';
        if(!file_exists($ruta)) return $this->error();

        include_once($ruta);

        $clase='\\aplicaciones\\'._apl.$partes->espacio.'\\publico\\'.$partes->nombre;
        if(!class_exists($clase)) return $this->error();

        $obj=new $clase;

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
        return (!\foxtrot::esCli()&&isset($parametros->__c)&&isset($parametros->__m))||
            (isset($parametros->controlador)&&isset($parametros->metodo));
    }

    /**
     * Devuelve el nombre del controlador solicitado.
     * @return string
     */
    public function obtenerControlador() {
        if(!$this->controlador) 
            $this->controlador=\util::limpiarValor(\foxtrot::esCli()?$this->parametros->controlador:$this->parametros->__c,true);
        
        return $this->controlador;
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
     * Establece el controlador. Nota: Este valor no será sanitizado, no debe pasarse un valor obtenido desde el cliente.
     * @var string $nombre Nombre del controlador.
     * @return \tipoSolicitud\tipos\controlador
     */
    public function establecerControlador($nombre) {
        $this->controlador=$nombre;
        return $this;
    }

    /**
     * Establece el método. Nota: Este valor no será sanitizado, no debe pasarse un valor obtenido desde el cliente.
     * @var string $nombre Nombre del método.
     * @return \tipoSolicitud\tipos\controlador
     */
    public function establecerMetodo($nombre) {
        $this->metodo=$nombre;
        return $this;
    }
}