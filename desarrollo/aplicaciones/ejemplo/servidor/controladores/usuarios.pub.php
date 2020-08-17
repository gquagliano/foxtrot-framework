<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace aplicaciones\ejemplo\publico;

use \aplicaciones\ejemplo\modelo\usuarios as modeloUsuarios;

defined('_inc') or exit;

/**
 * Métodos públicos del controlador de vista.
 */
class usuarios extends \controlador {
    public function obtenerListado($filtro) {
        \foxtrot::obtenerAplicacion()->verificarLogin();

        $usuarios=new modeloUsuarios;
        
        $listado=$usuarios->listarUsuarios($filtro->texto);

        //Remover datos privados
        foreach($listado->filas as $fila) {
            unset($fila->contrasena);
        }

        return $listado;
    }

    public function eliminar($id) {
        \foxtrot::obtenerAplicacion()->verificarLogin();

        (new modeloUsuarios)->eliminarUsuario($id);
    }

    public function guardar($datos,$id) {
        \foxtrot::obtenerAplicacion()->verificarLogin();
        
        //Validar campos obligatorios
        $obligatorios=['nombre','nivel','usuario'];
        if(!$id) $obligatorios[]='contrasena';
        foreach($obligatorios as $obligatorio) if(!trim($datos->$obligatorio)) $this->cliente->error(1);

        if($datos->contrasena!=$datos->contrasena2) $this->cliente->error(2);        

        $datos->id=$id;

        $nuevoId=(new modeloUsuarios)->crearOModificarUsuario($datos);

        return [
            'id'=>$nuevoId?$nuevoId:$id
        ];
    }

    public function obtenerItem($id) {
        \foxtrot::obtenerAplicacion()->verificarLogin();
        
        return (new modeloUsuarios)->obtenerUsuario($id);
    }

    /*
    Pruebas al ORM

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