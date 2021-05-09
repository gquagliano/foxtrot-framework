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
 * Interfaz de las relaciones del constructor de consultas.
 */
class relacion {
    const izquierda=1;
    const derecha=2;
    const interior=3;

    protected $tipo;
    protected $esquema;
    protected $alias;
    protected $condicion;

    /**
     * Establece los parámetros de la relación.
     * @param int $tipo Tipo de relación, `relacion::izquierda` (`LEFT JOIN`), `relacion::derecha` (`RIGHT JOIN`),
     * `relacion::interior` (`INNER JOIN`).
     * @param string $esquemaForaneo Nombre del esquema (tabla) foráneo.
     * @param string $alias Alias del esquema (tabla) foráneo.
     * @param \datos\condicion $condicion Condición (`ON ...`).
     * @return \datos\relacion
     */
    public function establecer($tipo,$esquemaForaneo,$alias,$condicion) {
        $this->tipo=$tipo;
        $this->esquema=$esquemaForaneo;
        $this->alias=$alias;
        $this->condicion=$condicion;
        return $this;
    }

    /**
     * Devuelve el código SQL de la relación.
     * @return string
     */
    public function obtenerSql() {}

    /**
     * Devuelve el tipo de relación.
     * @param int
     */
    public function obtenerTipo() {
        return $this->tipo;
    }

    /**
     * Devuelve el nombre del esquema (tabla) foráneo.
     * @return string
     */
    public function obtenerEsquema() {
        return $this->esquema;
    }

    /**
     * Devuelve el alias.
     * @return string
     */
    public function obtenerAlias() {
        return $this->alias;
    }

    /**
     * Devuelve la condición.
     * @return \datos\condicion
     */
    public function obtenerCondicion() {
        return $this->condicion;
    }
}