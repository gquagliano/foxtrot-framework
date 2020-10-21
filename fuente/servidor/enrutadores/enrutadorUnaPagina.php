<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Enrutador de solicitudes predeterminado para aplicaciones de una sola página.
 */
class enrutadorUnaPagina extends enrutador {
    /**
     * @var $vistaInicio Vista inicial.
     */
    protected $vistaInicio;

    /**
     * Establece el nombre de la vista de inicio. Este método puede ser invocado en el constructor del controlador de la aplicación, el cual es instanciado previo al análisis.
     * @return \enrutador
     */
    public function establecerVistaInicio($nombre) {
        $this->vistaInicio=$nombre;
        return $this;
    }

    /**
     * Analiza la URL provista, estableciendo las propiedades del entutador.
     * @return \enrutador
     */
    public function analizar() {
        //Analisis básico
        parent::analizar();
        
        if($this->error) return $this;

        //Para toda vista cargar en realidad la vista de inicio
        if($this->recurso->obtenerTipo()=='vista') {
            /** @var \solicitud\tipos\vista $tipo */
            $tipo=$this->recurso;
            $tipo->establecerVista($this->vistaInicio);
        }
        
        return $this;
    }
}