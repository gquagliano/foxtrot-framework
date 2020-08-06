<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace aplicaciones\ejemplo\modelo;

defined('_inc') or exit;

/**
 * Entidad del modelo de datos.
 */
class usuario extends \entidad {
    protected $tipoModelo=usuarios::class;

    //id y e (campo de baja lógica) son automáticos, no requieren propiedad ni comentario

    /**
     * @tipo cadena(50)
     * @indice
     */
    public $usuario;

    /** @tipo cadena(255) */
    public $contrasena;

    public $propiedadQueNoEsCampo;

    //Ejemplo de campo relacional idtest (almacena el objeto foráneo en test):

    /**
     * @tipo relacional
     * @modelo tests
     * @relacion 1:0
     * @columna idtest
     */
    //public $test;

    /**
     * @tipo entero
     */
    //public $idtest;
}