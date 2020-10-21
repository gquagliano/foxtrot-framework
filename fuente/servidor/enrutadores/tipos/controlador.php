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
 * Tipo de solicitud concreta que representa el acceso a un método de un controlador.
 */
class controlador extends \solicitud {    
    /**
     * Ejecuta la solicitud.
     * @return \solicitud
     */
    public function ejecutar() {
        $controlador=\util::limpiarValor($this->parametros->__c,true);

        $partes=\foxtrot::prepararNombreClase($controlador);

        //Los controladores que presenten /, se buscan en el subdirectorio
        $ruta=_controladoresServidorAplicacion.$controlador.'.pub.php';
        if(!file_exists($ruta)) return $this->error();

        include_once($ruta);

        $clase='\\aplicaciones\\'._apl.$partes->espacio.'\\publico\\'.$partes->nombre;
        if(!class_exists($clase)) return $this->error();

        $obj=new $clase;

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
        return isset($parametros->__c)&&isset($parametros->__m);
    }
}