<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase base de las aplicaciones. 
 */
class aplicacion extends controlador {
    /**
     * Constructor.
     */
    function __construct() {
        //Extraer ruta al archivo
        $ruta=(new ReflectionClass($this))->getFileName();
        $this->publica=preg_match('/\.pub\.php$/',$ruta);
        
        //Inicializar comunicación con el cliente
        $this->cliente=new cliente();
        $this->cliente->establecerAplicacion();

        //Referencia a la clase pública (\controlador no habrá podido cargar la clase)
        if($this->publica) $this->privado=\foxtrot::aplicacion();
    }

    /**
     * Método invocado cuando la inicialización del framework y la aplicación está completa.
     */
    public function listo() {
    }
}