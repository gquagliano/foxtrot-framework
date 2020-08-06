<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace aplicaciones\ejemplo\publico;
use aplicaciones\ejemplo\modelo\usuarios;

defined('_inc') or exit;

/**
 * Métodos públicos del controlador de vista.
 */
class inicio extends \controlador {
    public function ingresar($usuario,$contrasena) {
        $usuarios=new usuarios;

        $resultado=$usuarios->buscarUsuario($usuario);

        if(!$resultado||!usuarios::validarContrasena($resultado,$contrasena)) return false;

        \sesion::establecerUsuario(
            //Datos privados
            $resultado,
            //Datos públicos
            (object)['usuario'=>$usuario]
        );

        return true;
    }
}