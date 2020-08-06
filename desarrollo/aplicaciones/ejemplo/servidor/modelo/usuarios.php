<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace aplicaciones\ejemplo\modelo;

defined('_inc') or exit;

/**
 * Entidad del modelo de datos.
 */
class usuarios extends \modelo {
    protected $tipoEntidad=usuario::class;
    
    public function buscarUsuario($nombre) {
        $usuario=$this
            ->reiniciar()
            ->donde([
                'usuario'=>mb_strtolower($nombre)
            ])
            ->obtenerUno();
        return $usuario;
    }

    public function listarUsuarios() {
        return $this
            ->reiniciar()
            ->paginacion(10,1)
            ->obtenerListado();
    }

    public static function validarContrasena($usuario,$contrasena) {
        return password_verify($contrasena,$usuario->contrasena);
    }

    public static function obtenerContrasena($contrasena) {
        return password_hash($contrasena,PASSWORD_DEFAULT);
    }
}