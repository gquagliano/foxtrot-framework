<?php
/**
 * @author 
 * @version 1.0
 */

namespace aplicaciones\ejemplo\publico;

use \aplicaciones\ejemplo\modelo\usuarios as modeloUsuarios;

defined('_inc') or exit;

/**
 * Métodos públicos del controlador de vista.
 */
class usuarios extends \controlador {
    /**
     * Devuelve el listasdo de usuarios.
     * @param object $filtro Objeto con los parámetros del filtro (texto y pagina).
     * @return object
     */
    public function obtenerListado($filtro) {
        \foxtrot::obtenerAplicacion()->verificarLogin();

        $modelo=new modeloUsuarios;
        
        $donde=null;
        $parametros=null;
        if($filtro) {
            $donde='`id`=@filtro or `nombre` like @filtroParcial';
            $parametros=[
                'filtro'=>$filtro->texto,
                'filtroParcial'=>'%'.$filtro->texto.'%'
            ];
        }
        $listado=$modelo->listarItems($donde,$parametros,$filtro->pagina);

        //Remover datos privados
        foreach($listado->filas as $fila) {
            unset($fila->contrasena);
        }

        return $listado;
    }

    /**
     * Elimina un usuario.
     * @param int $id ID del usuario.
     */
    public function eliminar($id) {
        \foxtrot::obtenerAplicacion()->verificarLogin();

        (new modeloUsuarios)->eliminarItem($id);
    }

    /**
     * Guarda un usuario.
     * @param object $datos Objeto con los datos del usuario.
     * @param int $id ID del usuario, si se trata de actualización de un registro existente.
     */
    public function guardar($datos,$id) {
        \foxtrot::obtenerAplicacion()->verificarLogin();
        
        //Validar campos obligatorios
        $obligatorios=['nombre','nivel','usuario','email'];
        if(!$id) $obligatorios[]='contrasena';
        foreach($obligatorios as $obligatorio) if(!trim($datos->$obligatorio)) $this->cliente->error(1);   

        if($datos->contrasena!=$datos->contrasena2) $this->cliente->error(2);

        if($datos->contrasena) {
            //Si se ingresó una contraseña, encriptar
            $datos->contrasena=modeloUsuarios::obtenerContrasena($datos->contrasena);
        } else {
            //En caso contrario, remover propiedad para que no se reemplace por una contraseña en blanco
            unset($datos->contrasena);
        }

        $datos->id=$id;

        $nuevoId=(new modeloUsuarios)->crearOModificarItem($datos);

        return [
            'id'=>$nuevoId?$nuevoId:$id
        ];
    }

    /**
     * Devuelve un usuario dado su ID.
     * @param int $id ID.
     */
    public function obtenerItem($id) {
        \foxtrot::obtenerAplicacion()->verificarLogin();
        
        $usuario=(new modeloUsuarios)->obtenerItem($id);
        
        //Remover datos privados
        $usuario->contrasena=null;

        return $usuario;
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