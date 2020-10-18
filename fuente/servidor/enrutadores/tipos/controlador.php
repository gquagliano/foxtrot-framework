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
        $controlador=$this->parametros->__c;

        //Los controladores que presenten /, se buscan en el subdirectorio
        //Esto debería ser seguro ya que no se admiten caracteres que puedan hacer que salga del directorio controladores
        if(preg_match('/[^a-z0-9_\/-]/i',$controlador))  return $this->error();

        $ruta=_controladoresServidorAplicacion.$controlador.'.pub.php';
        if(!file_exists($ruta)) return $this->error();

        include_once($ruta);

        $espacio=\foxtrot::prepararNombreEspacio($controlador);
        $nombre=\foxtrot::prepararNombreClase($controlador);
        $clase='\\aplicaciones\\'._apl.$espacio.'\\publico\\'.$nombre;

        $obj=new $clase;

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
        return isset($parametros->__c)&&isset($parametros->__m);
    }
}