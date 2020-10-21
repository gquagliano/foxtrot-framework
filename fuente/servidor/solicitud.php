<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase base de los tipos de solicitudes.
 */
class solicitud {
    protected $parametros;
    protected $url;
    protected $enrutador;

    /**
     * Constructor.
     * @var object $parametros Parámetros de la solicitud.
     */
    function __construct($enrutador,$url,$parametros) {
        $this->enrutador=$enrutador;
        $this->url=$url;
        $this->parametros=$parametros;
    }

    /**
     * Devuelve el nombre del tipo de solicitud.
     * @return string
     */
    public function obtenerTipo() {
        $partes=\util::separarRuta(static::class);
        return $partes->nombre;
    }

    /**
     * Ejecuta la solicitud.
     * @return \solicitud
     */
    public function ejecutar() {
        return $this;
    }

    /**
     * Intenta ejecutar el método en el objeto especificado.
     * @var object $obj Instancia.
     * @var string $metodo Nombre del método. Si es nulo, utilizará el parámetro __m de la solicitud.
     * @var array $parametros Parámetros. Si es nulo, utilizará los parámetros de la instancia.
     * @return \solicitud
     */
    protected function ejecutarMetodo($obj,$metodo=null,$params=null) {
        if($metodo===null) $metodo=\foxtrot::prepararNombreMetodo($this->parametros->__m);
        if($params===null) $params=$this->enrutador->obtenerParametros();

        if(!$metodo||!$obj||!method_exists($obj,$metodo)) $this->enrutador->establecerError();
        if(!is_array($params)) $params=[];

        $res=call_user_func_array([$obj,$metodo],$params);

        header('Content-Type: text/plain; charset=utf-8',true);
        \cliente::responder($res);

        return $this;
    }

    /**
     * Establece que la solicitud es errónea.
     * @return \solicitud
     */
    protected function error() {
        $this->enrutador->establecerError();
        return $this;
    }

    /**
     * Determina si los parámetros dados a una solicitud de este tipo.
     * @var string $url URL
     * @var object $parametros Parámetros de la solicitud.
     * @return bool
     */
    public static function es($url,$parametros) {
        return false;
    }
}