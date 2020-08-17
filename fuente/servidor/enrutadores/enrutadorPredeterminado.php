<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Enrutador de solicitudes predeterminado.
 */
class enrutadorPredetermiando extends enrutador {
    public function analizar() {
        //No hace falta validar estos parámetros, ya que foxtrot lo hará a continuación

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

        $p=strpos($this->url,'?');
        if($p!==false) $this->url=substr($this->url,0,$p);

        //Sin parámetros, intentar cargar archivos de la aplicación
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

        $this->controlador=$this->params->__c; //Si no se determinó __c, por defecto foxtrot buscará el método público de la aplicación
        $this->metodo=$this->params->__m;
        $this->parametros=json_decode($this->params->__p);

        if(!$this->controlador&&!$this->metodo&&!$this->vista&&!$this->pagina&&!$this->recurso) $this->error=true;

        return $this;
    }
}