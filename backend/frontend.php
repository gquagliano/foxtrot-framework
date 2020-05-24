<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Gestor de comunicación servidor->cliente.
 */
class frontend {
    /**
     * Envía una respuesta como texto plano al frontend.
     */
    public static function responder($data) {
        echo json_encode([
            'r'=>$data
        ]);
    }

    public static function __callStatic($nombre,$args) {
        echo json_encode([
            'm'=>$nombre,
            'p'=>$args
        ]);
    }
}