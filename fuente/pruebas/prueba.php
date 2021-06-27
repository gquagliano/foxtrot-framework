<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Incluir Foxtrot sin ejecutar la aplicación
define('_inc',1);
include(__DIR__.'/../servidor/foxtrot.php');
foxtrot::inicializar(false);

error_reporting(E_ALL^E_NOTICE);
ini_set('display_erros',1);

header('Content-Type: text/plain; charset=utf-8');
        
//Configurar (no se cargó archivo config.php)
configuracion::establecer([
    'nombreDb'=>'pruebas-foxtrot',
    'usuarioDb'=>'root',
    'contrasenaDb'=>'toor'
]);

//Definir constantes (no fueron definidas al no cargarse una aplicación, pero son necesarias para poder importar el modelo)
//TODO Esto debe ser un mecanismo de la clase foxtrot
define('_espacioApl','');
define('_apl','');

/**
 * Clase base para las pruebas concretas.
 */
class prueba {
    /**
     * 
     */
    public static function inicializar() {
        return true;
    }

    /**
     * 
     */
    public static function finalizar() {
    }

    /**
     * 
     */
    public static function depuracion() {
        return null;
    }

    /**
     * Ejecuta las pruebas en una clase concreta.
     * @param string $clase Nombre de la clase de pruebas.
     * @param array $pruebas Pruebas a invocar.
     */
    public static function ejecutar($clase,$pruebas) {
        echo '== '.$clase.' =='.PHP_EOL.PHP_EOL;

        if(!call_user_func($clase.'::inicializar')) {
            echo 'Falló al inicializar'.PHP_EOL.PHP_EOL;
            self::imprimirDepuracion($clase);
            exit;
        }
        
        foreach($pruebas as $prueba) {
            echo $prueba.'... ';

            $res=call_user_func($clase.'::'.$prueba);

            echo $res===true?'Ok':'Falló';
            if($res!==true) echo ' (error '.$res.')';
            echo PHP_EOL.PHP_EOL;

            if($res!==true) {
                self::imprimirDepuracion($clase);
                break;
            }
        }
        
        call_user_func($clase.'::finalizar');
        
        echo 'Listo.';
    }

    /**
     * 
     */
    protected static function imprimirDepuracion($clase) {
        $depuracion=call_user_func($clase.'::depuracion');
        if(!$depuracion) return;

        foreach(explode("\n",$depuracion) as $linea)
            echo '>  '.rtrim($linea).PHP_EOL;
        echo PHP_EOL;
    }
    
    /**
     * Determina si dos valores coinciden, incluyendo comparación de objetos y arrays.
     * @param mixed $valor Valor a evaluar.
     * @param mixed $comparar Valor a comparar.
     * @return bool
     */
    protected static function coincide($valor,$comparar) {
        //En esta versión comparamos en forma indistinta arrays y objetos, y en forma no-estricta otros tipos

        if(is_array($valor)) $valor=(object)$valor;

        if(is_array($comparar)) $comparar=(object)$comparar;

        if(is_object($comparar)) {
            foreach($comparar as $p=>$v) {
                if($valor->$p!=$v)
                    return false;
            }
            return true;
        }

        return $valor===$comparar;
    }
}

