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
    protected $foxtrot=null;
    protected $redireccionar=null;
    protected $codigoRedireccion=null;

    public function establecerSolicitud($uri,$params) {
        $this->url=$uri;
        if(is_array($params)) $params=(object)$params;        
        $this->params=$params;
        $this->analizar();
        return $this;
    }

    public function obtenerUrlVista($vista) {
        return foxtrot::obtenerUrl().$vista.'/';
    }

    public function obtenerUrlRecursosAplicacion() {
        return foxtrot::obtenerUrl().'aplicacion/recursos/';
    }

    public function obtenerUrlEstilosVista($nombre) {
        return foxtrot::obtenerUrl().'aplicacion/cliente/vistas/'.$nombre.'.css';
    }

    public function obtenerUrlControlador($nombre) {
        return foxtrot::obtenerUrl().'aplicacion/cliente/controladores/'.$nombre.'.js';
    }

    /**
     * Analiza la URL provista, estableciendo las propiedades del entutador.
     * @return \enrutador
     */
    public function analizar() {
        //Analizaremos los parámetros internos de Foxtrot y acceso a archivos públicos. La clase concreta debería completar el análisis, o puede sobreescribir
        //por completo este método.

        //No hace falta validar estos parámetros, ya que Foxtrot lo hará a continuación

        //Parámetros
        $this->parametros=json_decode($this->params->__p);

        //Remover los parámetros GET de la URL
        $p=strpos($this->url,'?');
        if($p!==false) $this->url=substr($this->url,0,$p);

        //Página de error
        if(preg_match('#^error/#i',$this->url)) {
            $this->pagina='error';
            return $this;
        }
        
        //Acceso a funciones internas de Foxtrot
        if($this->params->__f) {
            $this->foxtrot=$this->params->__f;
            return $this;
        }

        //Acceso a controladores
        $this->controlador=$this->params->__c;
        $this->metodo=$this->params->__m;

        if(!$this->params->__c&&!$this->params->__m) {
            if($this->url=='') {
                $this->vista='inicio';
            } elseif(preg_match('#^aplicacion/(.+)#',$this->url,$coincidencias)) {
                $this->recurso=$coincidencias[1];
            } elseif(preg_match('#^([A-Za-z0-9_/-]+)#',$this->url)) {
                $this->vista=trim($this->url,'/');
            }
            if($this->vista||$this->recurso) return $this;
        }

        return $this;
    }

    /**
     * Determina si el último análisis resultó en una solicitud válida.
     * @return bool
     */
    protected function solicitudValida() {
        return !$this->error&&($this->pagina||$this->vista||$this->controlador||$this->metodo||$this->recurso||$this->foxtrot||$this->redireccionar);
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

    public function obtenerFoxtrot() {
        return $this->foxtrot;
    }

    public function obtenerRedireccionamiento() {
        if(!$this->redireccionar) return null;
        return (object)[
            'ruta'=>$this->redireccionar,
            'codigo'=>$this->codigoRedireccion
        ];
    }
}