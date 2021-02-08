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
     * @var bool $publica Indica si es la versión pública del controlador.
     * @var \controlador $privado Si es una clase pública, instancia de la versión privada del controlador.
     * @var \aplicacion $aplicacion Instancia de la clase privada de la aplicación.
     */
    protected $nombre;
    protected $cliente;
    protected $publica=false;
    protected $privado=null;
    protected $aplicacion;

    /**
     * Constructor.
     */
    function __construct() {
        //Extraer ruta al archivo
        $ruta=(new ReflectionClass($this))->getFileName();
        $ruta=substr(realpath($ruta),strlen(realpath(_controladoresServidorAplicacion)));
        $partes=\util::separarRuta($ruta);
        
        $ruta=trim($partes->ruta,'/');
        if($ruta) $ruta.='/';
        $this->publica=preg_match('/\.pub\.php$/',$partes->nombre)?true:false;
        $nombre=preg_replace('/(\.pub)?\.php$/','',$partes->nombre);
                
        $nombre=$ruta.$nombre;

		//Si es una clase pública, asignar instancia de la versión privada en $privado
    	if($this->publica) $this->privado=\foxtrot::obtenerInstanciaControlador($nombre);

        //Inicializar comunicación con el cliente
        if(!$this->cliente) $this->cliente=new cliente();

        $this->aplicacion=\foxtrot::obtenerAplicacion();
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