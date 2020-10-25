<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Gestor/iterador de resultados de consultas a la base de datos.
 */
class resultado {
	protected $r=null;
	protected $stmt=false;
	protected $columnas=[];

	var $filas=0;

    /**
     * 
     */
	function __destruct() {
		//if(!$this->r) return;
		//if($this->stmt) $this->r->free_result(); else $this->r->free();
	}

    /**
     * Establece el objeto resultado con el que se va a trabajar.
     */
	public function establecer($r) {
		$this->stmt=null;
		$this->r=$r;

		$this->filas=$r->num_rows;

		return $this;
	}

    /**
     * Establece el objeto STMT con el que se va a trabajar.
     */
	public function establecerStmt($r) {
		$this->stmt=true;
		$this->r=$r;

		$this->filas=$r->num_rows;

		$this->r->store_result();
		$md=$this->r->result_metadata();
		if($md) {
			$params=[];
			$this->columnas=[];
			while($field=$md->fetch_field()) $params[]=&$this->columnas[$field->name];
			call_user_func_array([$this->r,'bind_result'],$params);
		}

		return $this;
	}

    /**
     * Devuelve la fila actual como objeto y avanza el resultado.
     */
	public function aObjeto() {
		if(!$this->r) return null;

		if(!$this->stmt) return $this->r->fetch_object();
		
		if(!$this->r->fetch()) return null;

		$obj=(object)[];
		foreach($this->columnas as $c=>$v) $obj->$c=$v;
		return $obj;
	}

    /**
     * Devuelve la fila actual como arreglo asociativo y avanza el resultado.
     */
	public function aArray() {
		if(!$this->r) return null;

		if(!$this->stmt) return $this->r->fetch_assoc();

		if(!$this->r->fetch()) return null;
		return $this->columnas;
	}

    /**
     * Devuelve el valor de un campo de la fila actual.
     */
	public function campo($nombre) {
		return $this->aArray()[$nombre];
	}

    /**
     * Mueve el puntero al número de fila especificado.
     */
	public function irA($numero) {
		$this->r->data_seek($numero);
		return $this;
	}

    /**
     * Mueve el puntero al primer resultado.
     */
	public function primero() {
		return $this->irA(0);
	}

    /**
     * Devuelve la fila actual como objeto y avanza el resultado (alias de aObjeto().)
     */
	function siguiente() {
		return $this->aObjeto();
    }
    
    /**
     * Devuelve el número de filas en el resultado actual.
     */
    public function obtenerNumeroFilas() {
        if(!$this->r) return 0;
        return $this->r->num_rows;
    }
}