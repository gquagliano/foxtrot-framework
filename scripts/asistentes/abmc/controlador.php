<?php
/**
 * @author 
 * @version 1.0
 */

namespace aplicaciones\{nombreApl}\publico;

use {claseModelo} as {aliasModelo};

defined('_inc') or exit;

/**
 * Métodos públicos del controlador de vista. Autogenerado por el asistente de Foxtrot.
 */
class {controlador} extends \controlador {
    /**
     * Devuelve el listasdo de usuarios.
     * @param object $filtro Objeto con los parámetros del filtro (texto y pagina).
     * @return object
     */
    public function obtenerListado($filtro) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        \foxtrot::obtenerAplicacion()->verificarLogin();

        $modelo=new {aliasModelo};
        
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

        return $listado;
    }

    /**
     * Elimina un usuario.
     * @param int $id ID del usuario.
     */
    public function eliminar($id) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        \foxtrot::obtenerAplicacion()->verificarLogin();

        (new {aliasModelo})->eliminarItem($id);
    }

    /**
     * Guarda un usuario.
     * @param object $datos Objeto con los datos del usuario.
     * @param int $id ID del usuario, si se trata de actualización de un registro existente.
     */
    public function guardar($datos,$id) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        \foxtrot::obtenerAplicacion()->verificarLogin();
        
        //Validar campos obligatorios
        $obligatorios=[{requeridos}];
        foreach($obligatorios as $obligatorio) if(!trim($datos->$obligatorio)) $this->cliente->error(1);    

        $datos->id=$id;

        $nuevoId=(new {aliasModelo})->crearOModificarItem($datos);

        return [
            'id'=>$nuevoId?$nuevoId:$id
        ];
    }

    /**
     * Devuelve un usuario dado su ID.
     * @param int $id ID.
     */
    public function obtenerItem($id) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        \foxtrot::obtenerAplicacion()->verificarLogin();
        
        return (new {aliasModelo})->obtenerItem($id);
    }
}