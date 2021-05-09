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
 * Interfaz del gestor/iterador de resultados de consultas.
 */
class resultado {
    /**
     * Establece el objeto resultado con el que se va a trabajar.
	 * @param mixed $r
	 * @return \datos\resultado
     */
	public function establecer($r) {}

    /**
     * Realiza las tareas de cierre y limpieza del objeto de resultados.
	 * @return \datos\resultado
     */
	public function liberar() {}

    /**
     * Devuelve la fila actual como objeto y avanza el resultado.
	 * @return object|null
     */
	public function aObjeto() {	}

    /**
     * Devuelve la fila actual como arreglo asociativo y avanza el resultado.
	 * @return array|null
     */
	public function aArray() {}

    /**
     * Devuelve el valor de un campo de la fila actual.
	 * @return mixed
     */
	public function campo($nombre) {}

    /**
     * Mueve el puntero al número de fila especificado.
	 * @param int $numero Número de fila de destino.
	 * @return \datos\resultado
     */
	public function irA($numero) {}
	
	/**
	 * Remueve la última fila recuperada del set de resultados actual.
	 * @return \datos\resultado
	 */
	function remover() {}
    
    /**
     * Devuelve el número de filas en el resultado actual.
	 * @return int
     */
    public function obtenerNumeroFilas() {}
    
    /**
     * Devuelve el ID insertado.
	 * @return int
     */
    public function obtenerId() {}

    /**
     * Devuelve el primer resultado, moviendo el puntero (vuelve al comienzo y avanza la posición al segundo resultado).
	 * @return object|null
     */
	public function primero() {
		$this->irA(0);
		return $this->siguiente();
	}

    /**
     * Mueve el puntero al primer resultado (alias de `irA(0)`).
	 * @return \datos\resultado
     */
	public function rebobinar() {
		return $this->irA(0);
	}

    /**
     * Devuelve la fila actual como objeto y avanza el resultado (alias de `aObjeto()`.)
	 * @return \datos\resultado
     */
	function siguiente() {
		return $this->aObjeto();
	}
}