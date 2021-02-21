<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase base para un manejador de eventos, a ser utilizada en la clase del gestor de eventos.
 */
class manejador {
    protected $aplicacion;

    function __construct() {
        $this->aplicacion=foxtrot::aplicacion();
    }
}