<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase base de los enrutadores.
 */
class enrutador {
    protected $uri=null;
    protected $params=null;
    protected $pagina=null;
    protected $vista=null;
    protected $error=false;
    protected $controlador=null;
    protected $metodo=null;
    protected $parametros=null;
    protected $recurso=null;

    public function establecerSolicitud($uri,$params) {
        $this->url=$uri;
        if(is_array($params)) $params=(object)$params;        
        $this->params=$params;
        $this->analizar();
        return $this;
    }

    public function analizar() {
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

    public function obtenerVista() {
        return $this->vista;
    }

    public function obtenerPagina() {
        return $this->pagina;
    }

    public function obtenerRecurso() {
        return $this->recurso;
    }
}