<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//¡Prototipo!

class enrutador {
    var $uri=null;
    var $params=null;

    var $error=false;
    var $controlador=null;
    var $metodo=null;
    var $parametros=null;

    public function establecerSolicitud($uri,$params) {
        $this->url=$uri;
        if(is_array($params)) $params=(object)$params;        
        $this->params=$params;
        $this->analizar();
        return $this;
    }

    public function analizar() {
        $this->controlador=$this->params->__c;
        $this->metodo=$this->params->__m;
        $this->parametros=json_decode($this->params->__p);
        //TODO Validar que exista, visibilidad
        return $this;
    }

    public function obtenerError() {
        return $this->error;
    }

    public function obtenerControlador() {
        return $this->controlador;
    }

    public function obtenerMetodo() {
        return $this->metodo;
    }

    public function obtenerParametros() {
        return is_array($this->parametros)?$this->parametros:[];
    }
}