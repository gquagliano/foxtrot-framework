<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Prototipo de comunicación servidor->cliente.
 */
class frontend {
    public static function __callStatic($nombre,$args) {
        var_dump($nombre,$args);
    }
}