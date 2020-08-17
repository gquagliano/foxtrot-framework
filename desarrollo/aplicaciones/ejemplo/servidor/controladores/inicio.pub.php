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

    /*
    Ejemplos de uso del ORM:

    Paginación
    $usuarios=(new usuarios)->paginacion(1,1);

    Contar filas
    var_dump($usuarios->estimarCantidad());

    Consulta con parámetros
    var_dump($usuarios->establecerAlias('u')->donde('u.usuario=@test',['test'=>'geq'])->obtenerListado());

    Inserción con tabla relacionada
    $usuario=new usuario;
    $usuario->usuario='abcdef';
    $usuario->test=new test;
    $usuario->test->test='adios123';
    $usuarios->establecerValores($usuario)->guardar();

    Actualización con tabla relacionada
    $usuario=$usuarios->establecerAlias('u')->donde('u.id=@id',['id'=>3])->obtenerUno();
    $usuario->contrasena='x999';
    $usuario->test->test='pepe9999';
    $usuarios->establecerValores($usuario)->guardar();

    Eliminar
    $usuarios->donde(['id'=>2])->eliminar();
    */
}