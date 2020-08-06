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
class cliente {
    protected $controlador;

    function __construct($controlador) {
        $this->controlador=$controlador;
    }

    /**
     * Envía una respuesta como texto plano al cliente.
     */
    public static function responder($data) {
        echo json_encode([
            'r'=>$data
        ]);
        \foxtrot::detener();
    }

    public static function invocar($controlador,$metodo,$args=null) {
        echo json_encode([
            'c'=>$controlador,
            'm'=>$metodo,
            'p'=>$args
        ]);
        \foxtrot::detener();
    }

    public static function irA($ruta) {
        echo json_encode([
            'n'=>$ruta
        ]);
        \foxtrot::detener();
    }

    public function __call($nombre,$args) {
        cliente::invocar($this->controlador,$nombre,$args);
    }
}