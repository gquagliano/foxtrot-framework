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
    /**
     * Valida los datos de usuario y valida la sesión.
     * @param object $campos Objeto con los valores del formulario.
     */
    public function iniciarSesion($campos) {
        //Configurar credenciales en config.php y remover comentario para activar Recaptcha
        //if(!\foxtrot::obtenerInstanciaModulo('recaptcha')->verificar($campos->recaptcha))
        //    $this->cliente->errorRecaptcha();

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