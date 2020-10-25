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
            /** @var \solicitud\tipos\vista $tipo */
            $tipo=$this->recurso;

            $vista=\foxtrot::obtenerVista($tipo->obtenerVista());
            if($vista->tipo=='embebible') $tipo->establecerVista(\foxtrot::obtenerEnrutador()->obtenerNombreVistaPrincipal());
        }

        return $this;
    }
}