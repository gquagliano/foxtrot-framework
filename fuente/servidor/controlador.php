<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase base de los controladores.
 */
class controlador {
    protected $nombre;
    protected $cliente;

    function __construct() {
        $clase=get_called_class();
        $nombre=substr($clase,strrpos($clase,'\\')+1);
        $this->nombre=$nombre;

        //Inicializar comunicación con el cliente
        if(!$this->cliente) $this->cliente=new cliente();
    }

    public function obtenerNombre() {
        return $this->nombre;
    }

    public function obtenerCliente() {
        return $this->cliente;
    }

    public function html($html) {
        return $html;
    }
}