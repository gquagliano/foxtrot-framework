<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace modelo;

class extra extends \entidad {
    protected static $nombreModelo='extras';

    /**
     * @tipo entero
     * @publico
     */
    public $id_item;
    
    /**
     * @tipo cadena(100)
     * @publico
     */
    public $valor_extra;
}