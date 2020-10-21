<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace solicitud\tipos;

defined('_inc') or exit;

/**
 * Tipo de solicitud concreta que representa el acceso a un método de la clase pública de un módulo.
 */
class modulo extends \solicitud {    
    /**
     * Ejecuta la solicitud.
     * @return \solicitud
     */
    public function ejecutar() {
        $modulo=\util::limpiarValor($this->parametros->__u);

        $obj=\foxtrot::obtenerInstanciaModulo($modulo,true);
        if($obj===null) return $this->error();

        $this->ejecutarMetodo($obj);

        return $this;
    }

    /**
     * Determina si los parámetros dados a una solicitud de este tipo.
     * @var string $url URL
     * @var object $parametros Parámetros de la solicitud.
     * @return bool
     */
    public static function es($url,$parametros) {
        return isset($parametros->__u)&&isset($parametros->__m);
    }
}