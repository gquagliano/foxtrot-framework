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
    protected static $responderCrudo=false;

    /**
     * Constructor.
     * @param string $controlador Nombre del controlador.
     */
    function __construct($controlador=null) {
        $this->controlador=$controlador;
    }

    /**
     * Activa o desactiva en envío de la respuesta sin procesar, en formato JSON. Cuando esta opción está desactivada, la respuesta se enviará de acuerdo al protocolo
     * de comunicación con el cliente de Foxtrot.
     * @param bool $activar Activar o desactivar la opción.
     */
    public static function establecerResponderCrudo($activar=true) {
        self::$responderCrudo=$activar;
    }

    /**
     * Establece que la instancia del cliente es para comunicación, por defecto, con el controlador de aplicación.
     * @return \cliente
     */
    public function establecerAplicacion() {
        $this->esAplicacion=true;
        return $this;
    }

    /**
     * Envía una respuesta como texto plano al cliente.
     * @param mixed $data Datos a devolver.
     */
    public static function responder($data) {
        if(!\foxtrot::esCli()) {
            //Web
            if(self::$responderCrudo) {
                //Crudo (raw)
                echo json_encode($data);
            } else {
                //Cliente de Foxtrot
                echo json_encode([
                    'r'=>$data
                ]);
            }
        } else {
            //Línea de comandos
            if(is_array($data)||is_object($data)) {
                print_r($data);
            } else {
                echo $data;
            }
        }
        \foxtrot::detener();
    }

    /**
     * Invoca un método del lado del cliente (solo como respuesta a solicitudes desde el cliente de Foxtrot).
     * @param string $controlador Nombre del controlador (cliente).
     * @param string $metodo Nombre del método.
     * @param array|object $args Argumentos.
     */
    public static function invocar($controlador,$metodo,$args=null) {
        if(!\foxtrot::esCli()) echo json_encode([
                'c'=>$controlador,
                'm'=>$metodo,
                'p'=>$args
            ]);
        \foxtrot::detener();
    }

    /**
     * Invoca un método en el controlador JS de la aplicación (solo como respuesta a solicitudes desde el cliente de Foxtrot).
     * @param string $metodo Nombre del método.
     * @param mixed $args=null Argumentos.
     */
    public static function invocarAplicacion($metodo,$args=null) {
        if(!\foxtrot::esCli()) echo json_encode([
                'a'=>$metodo,
                'p'=>$args
            ]);
        \foxtrot::detener();
    }

    /**
     * Realiza un redireccionamiento del lado del cliente (solo como respuesta a solicitudes desde el cliente de Foxtrot).
     * @param string $ruta Ruta o URL de destino.
     */
    public static function irA($ruta) {
        if(!\foxtrot::esCli()) echo json_encode([
                'n'=>$ruta
            ]);
        \foxtrot::detener();
    }

    /**
     * Inicia la descarga de la URL especificada en el cliente.
     * @param string $url URL a descargar.
     */
    public static function descargar($url) {
        if(!\foxtrot::esCli()) echo json_encode([
            'd'=>$url
        ]);
        \foxtrot::detener();
    }

    /**
     * Redirige los llamados a métodos no definidos hacia el cliente.
     * @param string $nombre Nombre del método.
     * @param array $args Argumentos.
     */
    public function __call($nombre,$args) {
        if($this->esAplicacion) {
            cliente::invocarAplicacion($nombre,$args);
        } else {
            cliente::invocar($this->controlador,$nombre,$args);
        }
    }
}