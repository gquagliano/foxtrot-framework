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
        return basename(static::class);
    }

    /**
     * Ejecuta la solicitud.
     * @return \solicitud
     */
    public function ejecutar() {
        return $this;
    }

    /**
     * Intenta ejecutar un método en el objeto especificado.
     * @var object $obj Instancia.
     * @var string $metodo Nombre del método.
     * @var array $parametros Parámetros.
     * @return \solicitud
     */
    protected function ejecutarMetodo($obj,$metodo,$params=[]) {
        if(preg_match('/[^a-z0-9_]/i',$metodo)||!$obj||!method_exists($obj,$metodo)) $this->enrutador->establecerError();
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