<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase base de los módulos.
 */
class modulo {
    protected $cliente;

    function __construct() {
        if(!$this->cliente) $this->cliente=new cliente();
    }

    public function obtenerCliente() {
        return $this->cliente;
    }
}