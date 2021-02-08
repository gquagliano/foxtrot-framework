<?php
/**
 * @author 
 * @version 1.0
 */

namespace {espacio};

use {claseModelo} as modelo;

defined('_inc') or exit;

/**
 * Métodos públicos del controlador de vista. Autogenerado por el asistente de Foxtrot.
 */
class {nombre} extends \controlador {
    /**
     * Devuelve el listado de {plural}.
     * @param object $filtro Objeto con los parámetros del filtro.
     * @return object
     */
    public function obtenerListado($filtro) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        //$this->aplicacion->verificarLogin();

        $modelo=(new modelo)
            ->establecerAlias('t');

        if($filtro->texto) {
            $modelo->donde('t.`id`=@filtro{sqlFiltros}',[
                'filtro'=>$filtro->texto,
                'filtroParcial'=>'%'.$filtro->texto.'%'
            ]);
        }
<!superior-multinivel

        $modelo->donde('{plural}.`{relacion}`=@{relacion}',['{relacion}'=>$filtro->{relacion}]);
!>

        if(!$filtro->pagina) $filtro->pagina=1;
        $modelo->paginacion(50,$filtro->pagina);

        $cantidad=$modelo->estimarCantidad();

        $listado=$modelo->obtenerListado(true);        
<!superior-multinivel

        $titulo='{plural} '.implode(' › ',$this->obtenerRuta($filtro->{relacion}));
!>

        return [
            'cantidad'=>$cantidad,
            'filas'=>$listado,
            'paginas'=>ceil($cantidad/50),
            'titulo'=>$titulo
        ];
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
        //$this->aplicacion->verificarLogin();

        (new modelo)
            ->donde(['id'=>$id])
            ->eliminar();
    }

    /**
     * Guarda un {singular}.
     * @param object $datos Objeto con los datos del {singular}.
     * @param int $id ID del {singular}, si se trata de actualización de un registro existente.
     */
    public function guardar($datos,$id) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        //$this->aplicacion->verificarLogin();
        
        //Validar campos obligatorios
        $obligatorios=[{requeridos}];
        foreach($obligatorios as $obligatorio) if(!trim($datos->$obligatorio)) $this->cliente->error(1);    

        $datos->id=$id;

        $nuevoId=(new modelo)
            ->establecerValores($datos)
            ->guardar()
            ->obtenerId();

        return [
            'id'=>$nuevoId
        ];
    }

    /**
     * Devuelve un {singular} dado su ID.
     * @param int $id ID.
     */
    public function obtenerItem($id) {
        //TODO Implementar el método verificarLogin() que evite que este método sea invocado por un usuario no autorizado.
        //$this->aplicacion->verificarLogin();
        
        $item=(new modelo)
            ->donde(['id'=>$id])
            ->obtenerUno();
        if($item) return $item->obtenerObjeto(true);
    }
}