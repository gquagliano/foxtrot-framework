<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace aplicaciones\{nombreApl}\publico;

use {claseModelo} as {aliasModelo};

defined('_inc') or exit;

/**
 * Métodos públicos del controlador de vista. Autogenerado por el asistente de Foxtrot.
 */
class usuarios extends \controlador {
    public function obtenerListado($filtro) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        \foxtrot::obtenerAplicacion()->verificarLogin();

        $usuarios=new {aliasModelo};
        
        $listado=$usuarios->listarUsuarios($filtro->texto,$filtro->pagina);

        return $listado;
    }

    public function eliminar($id) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        \foxtrot::obtenerAplicacion()->verificarLogin();

        (new {aliasModelo})->eliminarUsuario($id);
    }

    public function guardar($datos,$id) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        \foxtrot::obtenerAplicacion()->verificarLogin();
        
        //Validar campos obligatorios
        $obligatorios=[{requeridos}];
        foreach($obligatorios as $obligatorio) if(!trim($datos->$obligatorio)) $this->cliente->error(1);

        if($datos->contrasena!=$datos->contrasena2) $this->cliente->error(2);        

        $datos->id=$id;

        $nuevoId=(new {aliasModelo})->crearOModificarUsuario($datos);

        return [
            'id'=>$nuevoId?$nuevoId:$id
        ];
    }

    public function obtenerItem($id) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        \foxtrot::obtenerAplicacion()->verificarLogin();
        
        return (new {aliasModelo})->obtenerUsuario($id);
    }
}