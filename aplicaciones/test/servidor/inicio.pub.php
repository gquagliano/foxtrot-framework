<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace aplicaciones\test\publico;

defined('_inc') or exit;

/**
 * Métodos públicos del controlador de vista.
 */
class inicio extends \controlador {
    /**
     * Método que al ser invocado desde el cliente (servidor.metodo()) devuelve "Hola" directamente al callback.
     */
    public function metodo() {
        return 'Hola';
    }

    /**
     * Método que al ser invocado desde el cliente (servidor.suma(x,y)) invoca metodoJs en el controlador con x+y como parámetro.
     */
    public function suma($a,$b) {
        \cliente::metodoJs($a+$b);
    }
}