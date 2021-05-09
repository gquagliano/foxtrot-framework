<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace datos;

defined('_inc') or exit;

/**
 * Interfaz de los constructores de consultas.
 */
class constructor {
    const operacionSeleccionar=1;
    const operacionInsertar=2;
    const operacionEliminar=3;
    const operacionActualizar=4;
    const operacionContar=5;

    const tipoTexto=5;
    const tipoEntero=6;
    const tipoDecimal=7;
    const tipoBinario=8;

    protected $campos=[];
    protected $esquema;
    protected $alias;
    protected $condiciones=[];
    protected $relaciones=[];
    protected $limiteOrigen=null;
    protected $limiteCantidad=null;
    protected $ordenCampo=null;
    protected $ordenSentido=null;
    protected $agrupar=null;

    protected $consulta=null;

    /**
     * Devuelve la instancia de una nueva condición.
     * @return \datos\condicion
     */
    public function fabricarCondicion() {}

    /**
     * Devuelve la instancia de una nueva relación.
     * @return \datos\relacion
     */
    public function fabricarRelacion() {}

    /**
     * Construye la consulta a partir de la configuración actual.
     * @param int $operacion Operación a realizar (ver constantes `constructor::operacion...`).
     * @return \datos\constructor
     */
    public function construirConsulta($operacion) {}

    /**
     * Devuelve los campos a seleccionar, insertar o actualizar.
     * @return array
     */
    public function obtenerCampos() {
        return $this->campos;
    }

    /**
     * Devuelve los parámetros de la consulta construida.
     * @return object
     */
    public function obtenerConsulta() {
        return $this->consulta;
    }

    /**
     * Agrega un campo a seleccionar.
     * @param string $aliasEsquema Alias del esquema.
     * @param string $nombre Nombre del campo.
     * @param string $aliasCampo Alias del campo.
     * @return \datos\constructor
     */
    public function seleccionarCampo($aliasEsquema,$nombre,$aliasCampo=null) {
        $this->campos[]=(object)[
            'esquema'=>$aliasEsquema,
            'nombre'=>$nombre,
            'alias'=>$aliasCampo
        ];
        return $this;
    }

    /**
     * Agrega un fragmento SQL en la selección.
     * @param string $sql Código SQL.
     * @return \datos\constructor
     */
    public function seleccionarSql($sql) {
        $this->campos[]=$sql;
        //TODO Variables
        return $this;
    }

    /**
     * Establece la asignación de un campo para consultas de inserción o actualización.
     * @param string $nombre Nombre del campo.
     * @param mixed $valor Valor.
     * @param int $tipo Tipo del valor (ver constantes `constructor::tipo....`). Opcional; si se omite, se estimará el tipo automáticamente.
     * @return \datos\constructor
     */
    public function asignarCampo($nombre,$valor,$tipo=null) {
        $this->campos[]=(object)[
            'nombre'=>$nombre,
            'valor'=>$valor,
            'tipo'=>$tipo
        ];
        return $this;
    }

    /**
     * Establece el esquema (tabla).
     * @param string $nombre Nombre.
     * @param string $alias Alias.
     * @return \datos\constructor
     */
    public function establecerEsquema($nombre,$alias=null) {
        $this->esquema=$nombre;
        $this->alias=$alias;
        return $this;
    }

    /**
     * Agrega una condición.
     * @param \datos\condicion $condicion Condición.
     * @return \datos\constructor
     */
    public function agregarCondicion($condicion) {
        $this->condiciones[]=$condicion;
        return $this;
    }

    /**
     * Agrega una relación.
     * @param \datos\relacion $relacion Relación.
     * @return \datos\constructor
     */
    public function agregarRelacion($relacion) {
        $this->relaciones[]=$relacion;
        return $this;
    }

    /**
     * Devuelve las relaciones.
     * @return array
     */
    public function obtenerRelaciones() {
        return $this->relaciones;
    }

    /**
     * Devuelve las condiciones.
     * @return array
     */
    public function obtenerCondiciones() {
        return $this->condiciones;
    }

    /**
     * Establece el límite.
     * @param int|null $origen Orígen o registro inicial, comenzando de `0`. Si es `null`, se mantendrá cualquier valor previamente asignado.
     * @param int|null $cantidad Cantidad de registros. Si es `null`, se mantendrá cualquier valor previamente asignado.
     * @return \datos\constructor
     */
    public function establecerLimite($origen,$cantidad=null) {
        if($origen!==null) $this->limiteOrigen=$origen;
        if($cantidad!==null) $this->limiteCantidad=$cantidad;
        return $this;
    }

    /**
     * Establece el ordenamiento de la selección.
     * @param string $campo Nombre del campo.
     * @param string $sentido Sentido (`'asc'` o `'desc'`).
     * @return \datos\constructor
     */
    public function establecerOrden($campo,$sentido) {
        $this->ordenCampo=$campo;
        $this->ordenSentido=$sentido;
        return $this;
    }

    /**
     * Establece el agrupamiento (`GROUP BY`).
     * @param string $campo Nombre del campo.
     * @return \datos\constructor
     */
    public function establecerAgrupamiento($campo) {
        $this->agrupar=$campo;
        return $this;
    }
}