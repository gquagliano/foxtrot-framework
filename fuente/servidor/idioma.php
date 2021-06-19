<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase de gestión del idioma.
 */
class idioma {
    /**
     * Establece el idioma actual.
     * @param string $idioma Nombre del idioma.
     */
    public static function establecerIdioma($idioma) {
        include_once(_idiomas.$idioma.'.php');
        //TODO
    }

    /**
     * Traduce una cadena.
     * @param string $cadena Cadena a traducir.
     * @return string
     */
    public static function traducir($cadena) {
        //TODO
        return $cadena;
    }
}

/**
 * Traduce una cadena. Alias de `idioma::traducir()`.
 * @param string $cadena Cadena a traducir.
 * @return string
 */
function __($cadena) {
    return idioma::traducir($cadena);
}