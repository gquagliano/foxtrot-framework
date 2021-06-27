<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace modelo;

class comentario extends \entidad {
    protected static $nombreModelo='comentarios';

    /**
     * @tipo entero
     * @publico
     */
    public $id_item;
    
    /**
     * @tipo texto
     * @publico
     */
    public $texto;
}