<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//¡Prototipo!

namespace app\test\publico;

/**
 * Métodos públicos del controlador de vista.
 */
class test {
    /**
     * Método que al ser invocado desde el frontend (backend.metodo()) devuelve "Hola" directamente al callback.
     */
    public function metodo() {
        return 'Hola';
    }

    /**
     * Método que al ser invocado desde el frontend (backend.suma(x,y)) invoca metodoJs en el controlador con x+y como parámetro.
     */
    public function suma($a,$b) {
        \frontend::metodoJs($a+$b);
    }
}