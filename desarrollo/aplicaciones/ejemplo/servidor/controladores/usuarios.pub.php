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
        $usuarios=new modeloUsuarios;
        
        $filas=$usuarios->listarUsuarios($filtro->texto);

        //Remover datos privados
        foreach($filas as $fila) {
            unset($fila->contrasena);
        }

        return $filas;
    }

    public function eliminar($id) {
        (new modeloUsuarios)->eliminarUsuario($id);
    }

    public function guardar($datos,$id) {
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
        return (new modeloUsuarios)->obtenerUsuario($id);
    }
}