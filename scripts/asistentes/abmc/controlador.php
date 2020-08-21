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

    public function eliminar($id) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        \foxtrot::obtenerAplicacion()->verificarLogin();

        (new {aliasModelo})->eliminarItem($id);
    }

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

    public function obtenerItem($id) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        \foxtrot::obtenerAplicacion()->verificarLogin();
        
        return (new {aliasModelo})->obtenerItem($id);
    }
}