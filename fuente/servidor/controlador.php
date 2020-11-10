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
    /**
     * @var string $nombre Nombre del controlador.
     * @var \cliente $cliente Instancia de la interfaz con el cliente.
     * @var \controlador $privado Si es una clase pública, instancia de la versión privada del controlador.
     */
    protected $nombre;
    protected $cliente;
    protected $privado=null;

    /**
     * Constructor.
     */
    function __construct() {
        $clase=get_called_class();
        $nombre=substr($clase,strrpos($clase,'\\')+1);
        $this->nombre=$nombre;

        //Si es una clase pública, asignar instancia de la versión privada en $privado
        if(preg_match('/\\publico\\'.$nombre.'$/',$clase)) $this->privado=\foxtrot::obtenerInstanciaControlador($nombre);

        //Inicializar comunicación con el cliente
        if(!$this->cliente) $this->cliente=new cliente();
    }

    /**
     * Devuelve el nombre del controlador.
     * @return string
     */
    public function obtenerNombre() {
        return $this->nombre;
    }

    /**
     * Devuelve la interfaz con el cliente.
     * @return \cliente
     */
    public function obtenerCliente() {
        return $this->cliente;
    }

    /**
     * Devuelve la instancia de la versión privada del controlador.
     * @return \controlador
     */
    public function obtenerClasePrivada() {
        return $this->privado;
    }

    /**
     * Procesa y devuelve el código HTML de la vista.
     * @param string $html
     * @return string
     */
    public function html($html) {
        return $html;
    }
}