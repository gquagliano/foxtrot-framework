<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace solicitud\tipos;

defined('_inc') or exit;

include_once(__DIR__.'/controlador.php');

/**
 * Tipo de solicitud concreta que representa el acceso a un método de un controlador mediante la ruta `/controlador/metodo`.
 */
class controladorApi extends controlador {
    /**
     * Determina si los parámetros dados a una solicitud de este tipo.
     * @var string $url URL
     * @var object $parametros Parámetros de la solicitud.
     * @return bool
     */
    public static function es($url,$parametros) {
        return preg_match('#([a-z0-9_/-]+)/([a-z0-9_-]+)/?#',$url);
    }

    /**
     * Devuelve el nombre del controlador solicitado.
     * @return string
     */
    public function obtenerControlador() {
        if(!$this->controlador) {
            preg_match('#([a-z0-9_/-]+)/([a-z0-9_-]+)/?#',$this->url,$coincidencia);
            $this->controlador=$coincidencia[1];
        }
        
        return $this->controlador;
    }

    /**
     * Devuelve el nombre del método solicitado.
     * @return string
     */
    public function obtenerMetodo() {
        if(!$this->metodo) {
            preg_match('#([a-z0-9_/-]+)/([a-z0-9_-]+)/?#',$this->url,$coincidencia);
            $this->metodo=$coincidencia[2];
        }
        
        return $this->metodo;
    }
}