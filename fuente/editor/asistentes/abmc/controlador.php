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
     * Devuelve el listado de {plural}.
     * @param object $filtro Objeto con los parámetros del filtro.
     * @return object
     */
    public function obtenerListado($filtro) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        //\foxtrot::obtenerAplicacion()->verificarLogin();

        $modelo=new {aliasModelo};
        $modelo->establecerAlias('{plural}');
        
        $donde=null;
        $parametros=null;

        if($filtro->texto) {
            $donde='{plural}.`id`=@filtro{sqlFiltros}';
            $parametros=[
                'filtro'=>$filtro->texto,
                'filtroParcial'=>'%'.$filtro->texto.'%'
            ];
        }
<!superior-multinivel

        $modelo->donde('{plural}.`{relacion}`=@{relacion}',['{relacion}'=>$filtro->{relacion}]);
!>

        $listado=$modelo->listarItems($donde,$parametros,$filtro->pagina);
<!superior-multinivel

        $listado->titulo='{plural} '.implode(' › ',$this->obtenerRuta($filtro->{relacion}));
!>

        return $listado;
    }
<!multinivel

    /**
     * Genera la ruta desde el primer nivel hasta el nivel actual.
     * @param int $id ID del elemento padre.
     * @return array
     */
    protected function obtenerRuta($id) {
        //TODO Implementar
        return [];
    }
!>

    /**
     * Elimina un {singular}.
     * @param int $id ID del {singular}.
     */
    public function eliminar($id) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        //\foxtrot::obtenerAplicacion()->verificarLogin();

        (new {aliasModelo})->eliminarItem($id);
    }

    /**
     * Guarda un {singular}.
     * @param object $datos Objeto con los datos del {singular}.
     * @param int $id ID del {singular}, si se trata de actualización de un registro existente.
     */
    public function guardar($datos,$id) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        //\foxtrot::obtenerAplicacion()->verificarLogin();
        
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
     * Devuelve un {singular} dado su ID.
     * @param int $id ID.
     */
    public function obtenerItem($id) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        //\foxtrot::obtenerAplicacion()->verificarLogin();
        
        return (new {aliasModelo})->obtenerItem($id);
    }
}