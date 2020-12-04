<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Gestión de la sesión.
 */
class sesion {
    //TODO JWT

    const sv='login_';
    const su=self::sv.'usuario';
    const sp=self::sv.'usuarioPub';
    protected static $usuario=null;
    protected static $datosPublicos=null;

    /**
     * Inicializa la sesión.
     */
	public static function inicializar() {
		//session_cache_limiter('private');
		session_cache_expire(60);
		session_start();
	}
	
    /**
     * Establece la sesión.
     * @param mixed $usuario Datos de la sesión.
     * @param mixed $datosPublicos Datos públicos de la sesión (el cliente podrá solicitarlos en forma directa al framework). Si es `null`, se preservará el valor actual
     * (utilizar `establecerDatosPublicos(null)` para reestablecer su valor).
     */
	public static function establecerUsuario($usuario,$datosPublicos=null) {
        self::$usuario=$usuario;
        $_SESSION[self::su]=$usuario;
        if($datosPublicos!==null) self::establecerDatosPublicos($datosPublicos);
    }

    /**
     * Establece los datos públicos de la sesión (el cliente podrá solicitarlos en forma directa al framework).
     * @param mixed $datosPublicos Datos públicos de la sesión.
     */
    public static function establecerDatosPublicos($datos) {
        self::$datosPublicos=$datos;
        $_SESSION[self::sp]=$datos;
    }
    
    /**
     * Actualiza los datos de usuario, reemplazando sólo las propiedades (o elementos si es un array) presentes en `$datos`.
     * @param array|object $datos Datos a asignar.
     */
    public static function actualizarUsuario($datos) {        
        if(!is_array(self::$usuario)&&!is_object(self::$usuario)) {
            self::establecerUsuario($datos);
            return;
        }
        self::actualizarObj(self::$usuario,$datos);
        $_SESSION[self::su]=self::$usuario;
    }
    
    /**
     * Actualiza los datos públicos de la sesión, reemplazando sólo las propiedades (o elementos si es un array) presentes en `$datos`.
     * @param array|object $datos Datos a asignar.
     */
    public static function actualizarDatosPublicos($datos) {
        if(!is_array(self::$datosPublicos)&&!is_object(self::$datosPublicos)) {
            self::establecerDatosPublicos($datos);
            return;
        }
        self::actualizarObj(self::$datosPublicos,$datos);
        $_SESSION[self::sp]=self::$datosPublicos;
    }

    /**
     * Actualiza el objeto o array dado.
     * @param array|object $obj
     * @param array|object $datos
     */
    private static function actualizarObj(&$obj,$datos) {
        if(is_array($datos)) $datos=(object)$datos;
        $esArray=is_array($obj);
        $esObj=is_object($obj);
        foreach($datos as $p=>$v) {
            if($esArray) {
                $obj[$p]=$v;
            } elseif($esObj) {
                $obj->$p=$v;
            }
        }
    }

    /**
     * Establece un elemento en la sesión.
     * @param string $clave Clave.
     * @param mixed $valor Valor.
     */
    public static function establecer($clave,$valor) {
        if($clave==self::su||$clave==self::sp) return;
        $_SESSION[$clave]=$valor;
    }

    /**
     * Devuelve el valor de un elemento de la sesión, o `null`.
     * @param string $clave Clave.
     * @return mixed
     */
    public static function obtener($clave) {
        //if(!array_key_exists($clave,$_SESSION)) return null;
        return $_SESSION[$clave];
    }

    /**
     * Termina la sesión.
     */
	public static function cerrarSesion() {
        self::$usuario=null;
        self::$datosPublicos=null;
		unset($_SESSION[self::su],$_SESSION[self::sp]);
	}

    /**
     * Devuelve los datos del usuario.
     * @return mixed
     */
	public static function obtenerUsuario() {
        self::verificarUsuario();
		return self::$usuario;
	}

    /**
     * Devuelve los datos del usuario.
     * @return mixed
     */
	public static function obtenerDatosPublicos() {
        self::verificarUsuario();
		return self::$datosPublicos;
	}

    /**
     * Verifica si hay una sesión iniciada con datos establecidos.
     * @return bool
     */
	public static function verificarUsuario() {
        self::$usuario=$_SESSION[self::su];
        self::$datosPublicos=$_SESSION[self::sp];
        return self::$usuario?true:false;
    }
    
    /**
     * Responde a la solicitud HTTP por los datos de usuario (`__f`=`sesion`).
     * @return mixed
     */
    public static function responderSolicitud() {
        cliente::responder(self::$datosPublicos);
    }
}
