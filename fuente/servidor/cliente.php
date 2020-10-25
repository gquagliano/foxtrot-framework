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
    protected $esAplicacion=false;

    /**
     * 
     */
    function __construct($controlador=null) {
        $this->controlador=$controlador;
    }

    /**
     * Establece que la instancia del cliente es para comunicación, por defecto, con el controlador de aplicación.
     * @returns cliente
     */
    public function establecerAplicacion() {
        $this->esAplicacion=true;
        return $this;
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

    /**
     * 
     */
    public static function invocar($controlador,$metodo,$args=null) {
        echo json_encode([
            'c'=>$controlador,
            'm'=>$metodo,
            'p'=>$args
        ]);
        \foxtrot::detener();
    }

    /**
     * Invoca un método en el controlador JS de la aplicación.
     * @param string $metodo Nombre del método.
     * @param mixed $args=null Argumentos.
     */
    public static function invocarAplicacion($metodo,$args=null) {
        echo json_encode([
            'a'=>$metodo,
            'p'=>$args
        ]);
        \foxtrot::detener();
    }

    /**
     * 
     */
    public static function irA($ruta) {
        echo json_encode([
            'n'=>$ruta
        ]);
        \foxtrot::detener();
    }

    /**
     * Redirige los llamados a métodos hacia el cliente.
     * @param string nombre - Nombre del método.
     * @param array $args - Argumentos.
     */
    public function __call($nombre,$args) {
        if($this->esAplicacion) {
            cliente::invocarAplicacion($nombre,$args);
        } else {
            cliente::invocar($this->controlador,$nombre,$args);
        }
    }
}