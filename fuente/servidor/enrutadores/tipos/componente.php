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
 * Tipo de solicitud concreta que representa el acceso a un método de un componente.
 */
class componente extends \solicitud {    
    /**
     * Ejecuta la solicitud.
     * @return \solicitud
     */
    public function ejecutar() {
        $componente=\util::limpiarValor($this->parametros->__o);

        $ruta=_componentes.$componente.'.pub.php';
        if(!file_exists($ruta)) return $this->error();

        $partes=\foxtrot::prepararNombreClase($componente);

        include_once($ruta);
        $cls='\\componentes\\publico'.$partes->espacio.'\\'.$partes->nombre;
        $obj=new $cls;

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
        return isset($parametros->__o)&&isset($parametros->__m);
    }
}