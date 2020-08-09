<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//NOTA: Esta clase está siendo migrada desde Foxtrot 6. Hay mucho que debe revisarse en cuanto a eficiencia, código limpio, documentación, spanglish y seguridad/visibilidad.

defined('_inc') or exit;

/**
 * Clase base de los repositorios del modelo de datos.
 */
class entidad {
    protected $tipoModelo;

    public $id;
    public $e;

    /**
     * Fabrica y devuelve una instancia del modelo o repositorio de este tipo de entidades.
     * @return \modelo
     */
    public function fabricarModelo($bd=null) {
        return new $this->tipoModelo($bd);
    }

    /**
     * Devuelve un objeto estándar con los valores de la instancia.
     * @return object
     */
    public function obtenerObjeto() {
        return (object)get_object_vars($this);
    }
}