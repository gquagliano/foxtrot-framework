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

	protected $indice=0;
	protected $filasIgnoradas=[];

    /**
     * 
     */
	function __destruct() {
		//if(!$this->r) return;
		//if($this->stmt) $this->r->free_result(); else $this->r->free();
	}

    /**
     * Establece el objeto resultado con el que se va a trabajar.
	 * @param mysqli_result $r
	 * @return resultado
     */
	public function establecer($r) {
		$this->stmt=null;
		$this->r=$r;

		$this->filas=$r->num_rows;

		return $this;
	}

    /**
     * Establece el objeto STMT con el que se va a trabajar.
	 * @param mysqli_stmt $r
	 * @return resultado
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
	 * @return object|null
     */
	public function aObjeto() {		
		if(!$this->r) return null;
		
		$obj=null;

		while(1) {
			if(!$this->stmt) {
				$obj=$this->r->fetch_object();
				if(!$obj) return null;
			} else {
				if(!$this->r->fetch()) return null;
				$obj=(object)[];
				foreach($this->columnas as $c=>$v) $obj->$c=$v;
			}

			$this->indice++;

			if(!in_array($this->indice-1,$this->filasIgnoradas)) break;
		}

		return $obj;
	}

    /**
     * Devuelve la fila actual como arreglo asociativo y avanza el resultado.
	 * @return array|null
     */
	public function aArray() {
		$obj=$this->aObjeto();
		if(!$obj) return null;
		return (array)$obj;
	}

    /**
     * Devuelve el valor de un campo de la fila actual.
	 * @return mixed
     */
	public function campo($nombre) {
		$arr=$this->aArray();
		if(!$arr) return null;
		return $arr[$nombre];
	}

    /**
     * Mueve el puntero al número de fila especificado.
	 * @param int $numero Número de fila de destino.
	 * @return resultado
     */
	public function irA($numero) {
		$this->indice=$numero;
		$this->r->data_seek($numero);
		return $this;
	}

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
	 * @return resultado
     */
	public function rebobinar() {
		return $this->irA(0);
	}

    /**
     * Devuelve la fila actual como objeto y avanza el resultado (alias de `aObjeto()`.)
	 * @return resultado
     */
	function siguiente() {
		return $this->aObjeto();
	}
	
	/**
	 * Remueve la última fila recuperada del set de resultados actual.
	 * @return resultado
	 */
	function remover() {
		//En realidad utilizamos una bandera para ignorar la fila la próxima vez que se solicite
		$this->filasIgnoradas[]=$this->indice-1;
		return $this;
	}
    
    /**
     * Devuelve el número de filas en el resultado actual.
	 * @return int
     */
    public function obtenerNumeroFilas() {
        if(!$this->r) return 0;
        return $this->r->num_rows;
    }
}