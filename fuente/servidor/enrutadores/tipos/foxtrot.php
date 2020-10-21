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
 * Tipo de solicitud concreta que representa una solicitud a una función interna de Foxtrot.
 */
class foxtrot extends \solicitud {
    /**
     * Ejecuta la solicitud.
     * @return \solicitud
     */
    public function ejecutar() {
        //Acceso HTTP a funciones internas de Foxtrot

        //Por el momento queda harcodeado ya que es muy limitado y, además, necesitamos tener control preciso de esta funcionalidad. Eventualmente puede implementarse
        //algún mecanismo para abstraerlo adecuadamente.

        header('Content-Type: text/plain; charset=utf-8',true);

        $operacion=\util::limpiarValor($this->parametros->__f);

        if($operacion==='sesion') {
            \sesion::responderSolicitud();
        } elseif($operacion==='obtenerVista') {
            \foxtrot::devolverVista($this->enrutador->obtenerParametros()[0]);
        } elseif($operacion==='noop') {
            echo 'ok';
            \foxtrot::detener();
        } else {
            $this->error();
        }

        return $this;
    }

    /**
     * Determina si los parámetros dados a una solicitud de este tipo.
     * @var string $url URL
     * @var object $parametros Parámetros de la solicitud.
     * @return bool
     */
    public static function es($url,$parametros) {
        $valoresPosibles=['sesion','obtenerVista','noop'];
        $valor=\util::limpiarValor($parametros->__f);
        return $valor&&in_array($valor,$valoresPosibles);
    }
}