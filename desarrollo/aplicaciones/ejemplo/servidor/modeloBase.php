<?php
/**
 * @author 
 * @version 1.0
 */

namespace aplicaciones\ejemplo;

defined('_inc') or exit;

/**
 * Métodos comunes para las entidades del modelo de datos. Autogenerado por el asistente de Foxtrot.
 */
class modeloBase extends \modelo {
    /**
     * Busca un registro a partir del objeto especificado.
     * @param object|array|string $filtro Filtro (objeto, arreglo asociativo o condición como cadena).
     * @param object|array $parametros (optional) Parámetros en caso de filtro como cadena.
     * @return \entidad
     */
    public function buscarItem($filtro,$parametros=[]) {
        $item=$this
            ->reiniciar()
            ->donde($filtro,$parametros)
            ->obtenerUno();
        return $item;
    }

    /**
     * Devuelve el listado de registros del repositorio.
     * @param object|array|string $filtro (opcional) Filtro (objeto, arreglo asociativo o condición como cadena).
     * @param object|array $parametros (opcional) Parámetros en caso de filtro como cadena.
     * @param int $cantidadPorPag (opcional) Cantidad de ítems por página.
     * @param int $pagina (opcional) Número de página.
     * @return object
     */
    public function listarItems($filtro=null,$parametros=[],$pagina=1,$cantidadPorPag=50) {
        if(!$pagina) $pagina=1;

        $this->reiniciar()
            ->paginacion($cantidadPorPag,$pagina);

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
     * @return \aplicaciones\ejemplo\modeloBase
     */
    public function eliminarItem($id) {
        return $this->reiniciar()
            ->donde([
                'id'=>$id
            ])
            ->eliminar();
    }

    /**
     * Devuelve un registro.
     * @param object|array $id ID.
     * @return \entidad
     */
    public function obtenerItem($id) {
        $usuario=$this
            ->reiniciar()
            ->donde([
                'id'=>$id
            ])
            ->obtenerUno();

        return $usuario;
    }

    /**
     * Crea o actualiza un registro.
     * @param object|array $campos Campos a asignar o actualizar. La operación de alta o modificación es determinada a partir de la propiedad o el elemento 'id'.
     * @return int
     */
    public function crearOModificarItem($campos) {
        $this->reiniciar()
            ->establecerValores($campos)
            ->guardar();
        
        return $this->ultimoId?
            $this->ultimoId:
            $this->obtenerEntidad()->id;
    }
}