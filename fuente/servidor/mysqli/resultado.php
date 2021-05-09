<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.1
 */

namespace mysqli;

defined('_inc') or exit;

/**
 * Gestor/iterador de resultados de consultas a la base de datos.
 */
class resultado extends \datos\resultado {
	protected $r=null;
	protected $stmt=false;
	protected $columnas=[];
	protected $indice=0;
	protected $filasIgnoradas=[];

    /**
     * @var array $variables Almacena el índice dentro de `$asignaciones` donde está almacenado el valor de cada variable.
     * @var array $asignaciones Valores asignados a la consulta preparada.
     */
	public $asignaciones=[];
	public $variables=[];

    /**
     * Establece el objeto resultado con el que se va a trabajar.
	 * @param \mysqli_result $r
	 * @return \mysqli\resultado
     */
	public function establecer($r) {
		$this->stmt=false;
		$this->r=$r;

		return $this;
	}

    /**
     * Establece la sentencia con la que se va a trabajar.
	 * @param \mysqli_stmt $r
	 * @return \mysqli\resultado
     */
	public function establecerStmt($r) {
		$this->stmt=true;
		$this->r=$r;

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
     * Destruye el resultado o la sentencia preparada.
	 * @return \datos\resultado
     */
	public function liberar() {
		if($this->stmt) @$this->r->close();
		$this->r=null;
		return $this;
	}

	/**
	 * Devuelve la sentencia actual.
	 * @return \mysqli_stmt
	 */
	public function obtenerStmt() {
		return $this->r;
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
	 * @return \mysqli\resultado
     */
	public function irA($numero) {
		$this->indice=$numero;
		$this->r->data_seek($numero);
		return $this;
	}
	
	/**
	 * Remueve la última fila recuperada del set de resultados actual.
	 * @return \mysqli\resultado
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
		if($this->stmt) $this->r->store_result();
		if($this->r->affected_rows>=0) return $this->r->affected_rows;
        return $this->r->num_rows;
    }
    
    /**
     * Devuelve el ID insertado.
	 * @return int
     */
    public function obtenerId() {
		if(!$this->r) return null;
		if($this->stmt) $this->r->store_result();
		return $this->r->insert_id;
	}
}