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
     * @param mixed $datosPublicos Datos públicos de la sesión (el cliente podrá solicitarlos en forma directa al framework).
     */
	public static function establecerUsuario($usuario,$datosPublicos=null) {
        self::$usuario=$usuario;
        self::$datosPublicos=$datosPublicos;
        $_SESSION[self::sv.'usuario']=$usuario;
        $_SESSION[self::sv.'usuarioPub']=$datosPublicos;
	}

    /**
     * Termina la sesión.
     */
	public static function cerrarSesion() {
        self::$usuario=null;
        self::$datosPublicos=null;
		unset($_SESSION[self::sv.'usuario'],$_SESSION[self::sv.'usuarioPub']);
	}

    /**
     * Devuelve los datos del usuario.
     * @return mixed
     */
	public static function obtenerUsuario() {
		return self::$usuario;
	}

    /**
     * Devuelve los datos del usuario.
     * @return mixed
     */
	public static function obtenerDatosPublicos() {
		return self::$datosPublicos;
	}

    /**
     * Verifica si hay una sesión iniciada con datos establecidos.
     * @return bool
     */
	public static function verificarUsuario() {
        self::$usuario=$_SESSION[self::sv.'usuario'];
        self::$datosPublicos=$_SESSION[self::sv.'usuarioPub'];
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
