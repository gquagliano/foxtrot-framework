<?php
/**
 * @author 
 * @version 1.0
 */

namespace {espacio};

defined('_inc') or exit;

/**
 * Métodos comunes para las entidades del modelo de datos. Autogenerado por el asistente de Foxtrot.
 */
class modeloBase extends \modelo {
    /**
     * Busca un registro a partir del objeto especificado.
     * @param object|array|string $filtro Filtro (objeto, arreglo asociativo o condición como cadena).
     * @param object|array $parametros Parámetros en caso de filtro como cadena.
     * @param bool $incluirRelaciones Si es `true`, forzará las relaciones, incluso aquellas omitidas.
     * @return \entidad
     */
    public function buscarItem($filtro,$parametros=[],$incluirRelaciones=true) {
        $this->reiniciar();
        if($incluirRelaciones) $this->incluirRelaciones();
        $item=$this->donde($filtro,$parametros)
            ->obtenerUno();
        return $item;
    }

    /**
     * Devuelve el listado de registros del repositorio.
     * @param object|array|string $filtro Filtro (objeto, arreglo asociativo o condición como cadena).
     * @param object|array $parametros Parámetros en caso de filtro como cadena.
     * @param int $pagina Número de página. Establecer `null` para desactivar la paginación.
     * @param int $cantidadPorPag Cantidad de ítems por página.
     * @param bool $incluirRelaciones Si es `true`, forzará las relaciones, incluso aquellas omitidas.
     * @return object
     */
    public function listarItems($filtro=null,$parametros=[],$pagina=1,$cantidadPorPag=50,$incluirRelaciones=false) {
        if(!$pagina) $pagina=1;

        $this->reiniciar()
            ->establecerAlias('t');

        if($pagina) $this->paginacion($cantidadPorPag,$pagina);

        if($incluirRelaciones) $this->incluirRelaciones();

        if($filtro) $this->donde($filtro,$parametros);

        $cantidad=$this->estimarCantidad();

        return (object)[
            'cantidad'=>$cantidad,
            'paginas'=>ceil($cantidad/$cantidadPorPag),
            'filas'=>$this->obtenerListado()
        ];
    }

    /**
     * Elimina un registro.
     * @param int $id ID.
     * @return \aplicaciones\{nombreApl}\modeloBase
     */
    public function eliminarItem($id) {
        return $this->reiniciar()
            ->donde([
                'id'=>$id
            ])
            ->eliminar();
    }

    /**
     * Crea o actualiza un registro.
     * @param object|array $campos Campos a asignar o actualizar. La operación de alta o modificación es determinada a partir de la propiedad o el elemento 'id'.
     * @return int
     */
    public function crearOModificarItem($campos) {
        $this->reiniciar()
            ->incluirRelaciones()
            ->establecerValoresPublicos($campos);
        if($campos->id) $this->establecerValor('id',$campos->id);
        $this->guardar();
        
        return $this->ultimoId?
            $this->ultimoId:
            $this->obtenerEntidad()->id;
    }
}