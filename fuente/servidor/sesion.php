<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

class sesion {
	const sv='login_';
    protected static $usuario=null;
    protected static $datosPublicos=null;

	public static function inicializar() {
		//session_cache_limiter('private');
		session_cache_expire(60);
		session_start();

		self::verificarUsuario();
	}
	
	public static function establecerUsuario($usuario,$datosPublicos) {
        self::$usuario=$usuario;
        self::$datosPublicos=$datosPublicos;
        $_SESSION[self::sv.'usuario']=$usuario;
        $_SESSION[self::sv.'usuarioPub']=$datosPublicos;
	}

	public static function cerrarSesion() {
        self::$usuario=null;
        self::$datosPublicos=null;
		unset($_SESSION[self::sv.'usuario'],$_SESSION[self::sv.'usuarioPub']);
	}

	public static function obtenerUsuario() {
		return self::$usuario;
	}

	public static function obtenerDatosPublicos() {
		return self::$datosPublicos;
	}

	public static function verificarUsuario() {
        self::$usuario=$_SESSION[self::sv.'usuario'];
        self::$datosPublicos=$_SESSION[self::sv.'usuarioPub'];
        return self::$datosPublicos?true:false;
    }
    
    public static function responderSolicitud() {
        cliente::responder(self::$datosPublicos);
    }
}
