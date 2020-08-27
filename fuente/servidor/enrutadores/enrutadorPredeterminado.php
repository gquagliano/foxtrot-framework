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

        if(!$this->solicitudValida()) $this->error=true;

        return $this;
    }
}