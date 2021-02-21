<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase de gestión de eventos.
 */
class eventos {
    protected static $instancias=[];

    /**
     * Permite suscribir una instancia de `\manejador`.
     * @param \manejador $objeto Instancia del manejador de eventos.
     */
    public static function suscribir($objeto) {
        self::$instancias[]=$objeto;
    }

    /**
     * Desuscribe una instancia de `\manejador`.
     * @param \manejador $objeto Instancia del manejador de eventos.
     */
    public static function desuscribir($objeto) {
        foreach(self::$instancias as $i=>$instancia) {
            if($objeto==$instancia) {
                unset(self::$instancias[$i]);
                return;
            }
        }
    }

    /**
     * 
     */
    public static function __callStatic($nombre,$argumentos) {
        foreach(self::$instancias as $instancia) {
            if(method_exists($instancia,$nombre)) {
                $retorno=call_user_func_array([$instancia,$nombre],$argumentos);
                if($retorno===true) return true;
            }
        }
        return false;
    }
}