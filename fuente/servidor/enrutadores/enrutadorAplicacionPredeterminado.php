<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Enrutador de aplicaciones predeterminado, determina la aplicación a ejecutar en base a un listado de expresiones regulares de nombres de dominio.
 */
class enrutadorAplicacionPredeterminado extends enrutadorAplicacion {
    protected $dominios;

    /**
     * 
     */
    public function __construct($dominios) {
        $this->dominios=$dominios;
    }

    /**
     * 
     */
    public function determinarAplicacion() {
        $actual=$_SERVER['HTTP_HOST'];
        foreach($this->dominios as $dominio=>$aplicacion) {
            if(preg_match('/'.$dominio.'/i',$actual)) return $aplicacion;
        }
        return null;
    }
}