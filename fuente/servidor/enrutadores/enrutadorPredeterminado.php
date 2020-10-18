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
    /**
     * Analiza la URL provista, estableciendo las propiedades del entutador.
     * @return \enrutador
     */
    public function analizar() {
        //Analisis básico
        parent::analizar();        
        
        //En caso de vistas embebibles, cargar la principal
        if($this->recurso&&$this->recurso->obtenerTipo()=='vista') {
            $vista=\foxtrot::obtenerVista($this->recurso->obtenerNombreVista());
            if($vista->tipo=='embebible') $this->recurso->establecerVista(\foxtrot::aplicacion()->determinarVistaPrincipal());
        }

        return $this;
    }
}