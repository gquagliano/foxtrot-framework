<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace aplicaciones\ejemplo\publico;

use \aplicaciones\ejemplo\modelo\usuario;
use \aplicaciones\ejemplo\modelo\usuarios;

defined('_inc') or exit;

/**
 * Métodos públicos del controlador de vista.
 */
class inicio extends \controlador {
    public function iniciarSesion($campos) {
        $usuarios=new usuarios;

        $usuario=$usuarios->buscarUsuario($campos->u);

        if(!$usuario||!usuarios::validarContrasena($usuario,$campos->c)) return false;

        $publico=$usuario->obtenerObjeto();
        $publico->contrasena=null;
        unset($publico->tipoModelo);

        \sesion::establecerUsuario(
            $usuario,
            $publico
        );

        $destino='principal';
        if($usuario->nivel==usuarios::nivelOperador) $destino='principal-operador';
        if($usuario->nivel==usuarios::nivelExterno) $destino='principal-externo';
        return $destino;
    }
}