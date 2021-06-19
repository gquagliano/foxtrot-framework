<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 2.0
 */

defined('_inc') or exit;

/**
 * Clase base de los repositorios del modelo de datos.
 */
class entidad extends entidadBase {

    ////Eventos
    
    /**
     * Realiza post-procesamiento de los valores tras ser asignados. Si se sobreescribe, *debe* invocarse `parent::procesarValores()`.
     * @param int $operacion Operación que se realizará (`modelo::crear`, `modelo::seleccionar`, `modelo::eliminar`).
     * @return \entidad
     */
    public function procesarValores($operacion) {
        return $this;
    }

    /**
     * Realiza pre-procesamiento de los valores antes de una operación de alta o actualización. Si se sobreescribe, *debe* invocarse 
     * `parent::prepararValores($operacion)`.
     * @param int $operacion Operación que se realizará (`modelo::crear`, `modelo::actualizar`).
     * @return \entidad
     */
    public function prepararValores($operacion) {
        if($operacion==modelo::crear) $this->fecha_alta=time();
        if($operacion==modelo::crear||$operacion==modelo::actualizar||$operacion==modelo::eliminar) $this->fecha_actualizacion=time();
        if($operacion==modelo::eliminar) $this->fecha_baja=time();
        return $this;
    }
}