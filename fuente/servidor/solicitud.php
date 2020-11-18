<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase de gestión de la solicitud.
 */
class solicitud {
    protected static $parametros=null;
    protected static $archivos=null;
    protected static $cookies=null;
    protected static $cuerpo=null;
    protected static $metodo=null;
    protected static $encabezados=null;

    /**
     * Inicializa la clase.
     */
    public static function incializar() {
        self::procesarParametros();
        //TODO Implementar esta clase en todos los lugares donde se utilicen las variables globales y luego:
        //unset($_REQUEST,$_GET,$_POST,$_FILES,$_COOKIE);
    }

    /**
     * Procesa y almacena los parámetros de la solicitud.
     */
    protected static function procesarParametros() {
        self::$parametros=(object)[];
        self::$archivos=(object)[];
        self::$cookies=(object)[];
        self::$cuerpo=(object)[];
        self::$encabezados=(object)[];
        self::$metodo=null;

        if(\foxtrot::esCli()) {
            self::procesarArgv();
        } else {
            self::$metodo=$_SERVER['REQUEST_METHOD'];

            self::obtenerTodo(self::$parametros,array_keys($_GET),INPUT_GET);
            self::obtenerTodo(self::$cuerpo,array_keys($_POST),INPUT_POST);
            self::obtenerTodo(self::$cookies,array_keys($_COOKIE),INPUT_COOKIE);
            
            self::$archivos=$_FILES;

            $encabezados=getallheaders();
            foreach($encabezados as $clave=>$valor) {
                //TODO ¿Otras validaciones?
                $clave=self::obtenerNombre($clave);
                $valor=filter_var($valor,FILTER_UNSAFE_RAW);
                self::$encabezados->$clave=$valor;
            }
        }
    }
    
    /**
     * Obtiene todos los parámetros disponibles en la solicitud.
     * @var object &$destino
     * @var array $nombres
     * @var int $tipo
     */
    protected static function obtenerTodo(&$destino,$nombres,$tipo) {
        foreach($nombres as $nombre) {
            //TODO ¿Otras validaciones?
            $valor=filter_input($tipo,$nombre,FILTER_UNSAFE_RAW);
            if($valor!==false&&$valor!==null) {
                $nombre=self::obtenerNombre($nombre);
                $destino->$nombre=$valor;
            }
        }
    }

    /**
     * Procesa los argumentos de la línea de comandos.
     */
    protected static function procesarArgv() {
        global $argv;
        
        //El problema con getopt() es que cualquier parámetro que no esté especificado en getopt() interferirá con los que sí lo están. Por ejemplo getopt('a:')
        //producirá una salida incorrecta para `-a=parametro -b=parametro`, tomando todas las letras `a` de `-b` como instancias de `-a`. A continuación extraemos
        //sólo los parámetros que están precedidos por `-`

        array_shift($argv); //remover el primer elemento, que es el nombre del script

        foreach($argv as $arg) {
            if(substr($arg,0,1)=='-') {
                $arg=substr($arg,1);
                $valor=true;
                $igual=strpos($arg,'=');
                if($igual>0) {
                    $valor=substr($arg,$igual+1);
                    $arg=substr($arg,0,$igual);
                }
                $arg=self::obtenerNombre($arg);
                self::$parametros->$arg=$valor;
            }
        }
    }

    /**
     * Devuelve un nombre de parámetro sanitizado y sin guiones (nombre-param -> nombreParam).
     * @var string $nombre
     * @return string
     */
    protected static function obtenerNombre($nombre) {
        return \util::convertirGuiones(\util::limpiarValor($nombre));
    }

    /**
     * Establece un encabezado en la respuesta HTTP.
     * @var string $clave Clave.
     * @var string $valor Valor a establecer.
     * @var int $respuesta Código de respuesta.
     */
    public static function establecerEncabezado($clave,$valor,$respuesta=null) {
        if(\foxtrot::esCli()) return;
        header($clave.': '.$valor,true,$respuesta);
    }

    //// Acceso a propiedades
    
    /**
     * Devuelve los parámetros de la URI actual (`GET`). En el caso de estar ejecutándose desde la línea de comandos, devolverá los argumentos con nombre. Nota: Los nombres
     * con guiones serás convertidos con al formato nombre-param -> nombreParam.
     * @return object
     */
    public static function obtenerParametros() {
        return self::$parametros;
    }
    
    /**
     * Agrega parámetros a la solicitud.
     * @var array $parametros Parámetros a agregar.
     */
    public static function establecerParametros($parametros) {
        foreach($parametros as $c=>$v) self::$parametros->$c=$v;
    }
    
    /**
     * Remueve parámetros de la solicitud.
     * @var string ...$parametros Listado de nombres de parámetro a remover.
     */
    public static function removerParametros(...$parametros) {
        foreach($parametros as $p) unset(self::$parametros->$p);
    }

    /**
     * Devuelve los parámetros del cuerpo de la solicitud actual. En el caso de estar ejecutándose desde la línea de comandos, devolverá null. Nota: Los nombres
     * con guiones serás convertidos con al formato nombre-param -> nombreParam.
     * @return object
     */
    public static function obtenerCuerpo() {
        return self::$cuerpo;
    }
    
    /**
     * Agrega parámetros al cuerpo de la solicitud.
     * @var array $parametros Parámetros a agregar.
     */
    public static function establecerCuerpo($parametros) {
        foreach($parametros as $c=>$v) self::$cuerpo->$c=$v;
    }
    
    /**
     * Remueve parámetros del cuerpo de la solicitud.
     * @var string ...$parametros Listado de nombres de parámetro a remover.
     */
    public static function removerCuerpo(...$parametros) {
        foreach($parametros as $p) unset(self::$cuerpo->$p);
    }

    /**
     * Devuelve los archivos adjuntos en la solicitud actual. En el caso de estar ejecutándose desde la línea de comandos, devolverá null.
     * @return object
     */
    public static function obtenerArchivos() {
        return self::$archivos;
    }

    /**
     * Devuelve las cookies de la solicitud actual. En el caso de estar ejecutándose desde la línea de comandos, devolverá null. Nota: Los nombres
     * con guiones serás convertidos con al formato nombre-param -> nombreParam.
     * @return object
     */
    public static function obtenerCookies() {
        return self::$cookies;
    }

    /**
     * Agrega una cookie.
     * @var string $nombre
     * @var string $valor
     * @var int $expira
     * @var string $ruta
     * @var string $dominio
     */
    public static function establecerCookie($nombre,$valor,$expira=null,$ruta=null,$dominio=null) {
        setcookie($nombre,$valor,$expira,$ruta,$dominio,true);
        self::$cookies->$nombre=$valor;
    }

    /**
     * Remueve una cookie.
     * @var string ...$nombres Listado de nombres de cookie a remover.
     */
    public static function removerCookie(...$nombres) {
        foreach($nombres as $n) {
            unset(self::$cookies->$n);
        }
    }
    
    /**
     * Devuelve el método de la solicitud actual. En el caso de estar ejecutándose desde la línea de comandos, devolverá null.
     * @return string
     */
    public static function obtenerMétodo() {
        return self::$metodo;
    }    

    /**
     * Devuelve los encabezados HTTP de la solicitud actual. En el caso de estar ejecutándose desde la línea de comandos, devolverá null. Nota: Las claves
     * con guiones serás convertidas con al formato nombre-param -> nombreParam (ejemplo: Content-Type -> contentType).
     * @return object
     */
    public static function obtenerEncabezados() {
        return self::$encabezados;
    }
}