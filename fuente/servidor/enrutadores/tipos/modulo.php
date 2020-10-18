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
        $modulo=$this->parametros->__u;

        if(preg_match('/[^a-z0-9_-]/i',$modulo)) return $this->error();
            
        $obj=\foxtrot::obtenerInstanciaModulo($modulo,true);
        if($obj===null) return $this->error();

        $metodo=$this->parametros->__m;
        $params=$this->enrutador->obtenerParametros();

        $this->ejecutarMetodo($obj,$metodo,$params);

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