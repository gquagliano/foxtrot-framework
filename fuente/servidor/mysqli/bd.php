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
 * Interfaz de bases de datos MySQL.
 */
class bd extends \datos\bd {
    /** @var \mysqli $e */
	protected $e;

    protected $resultado=null;

    /**
     * Fabrica y devuelve una instancia del constructor de consultas.
     * @return \mysqli\constructor
     */
    public function fabricarConstructor() {
        return new constructor;
    }

    /**
     * Abre la conexión a la base de datos.
     * @return \mysqli\bd
     */
    public function conectar() {
		$this->e=new \mysqli(
            $this->credenciales->servidor,
            $this->credenciales->usuario,
            $this->credenciales->contrasena,
            $this->credenciales->nombre,
            $this->credenciales->puerto
        );

		if($this->e->connect_errno) {
            $this->error=$this->e->connect_errno;
            $this->descripcionError=$this->e->connect_error;
            return $this;
        }

        $this->e->query('SET sql_mode=""');
        //$this->e->query('set names "utf8"');
        $this->e->set_charset('utf8');

        $zona=\util::obtenerMinutosZonaHoraria(\configuracion::$zonaHoraria);
        $horas=($zona>=0?'+':'-').\util::minutosAHoras($zona);
        $this->e->query("SET @@session.time_zone='".$horas."'");        
        
        return $this;
    }

    /**
     * Cierra la conexión a la base de datos.
     * @return \mysqli\bd
     */
    public function desconectar() {
        if($this->e) @$this->e->close();
        return $this;
	}

    /**
     * Abre una transacción.
     * @param $modo Modo (`bd::soloLectura` o `bd::lecturaEscritura`).
     * @return \mysqli\bd
     */
	public function comenzarTransaccion($modo) {
        $modo=[
            self::soloLectura=>MYSQLI_TRANS_START_READ_ONLY,
            self::lecturaEscritura=>MYSQLI_TRANS_START_READ_WRITE
        ][$modo];

        //$this->e->autocommit(false);
        $this->e->begin_transaction($modo);

		return $this;
	}

    /**
     * Finaliza la transacción.
     * @return \mysqli\bd
     */
	public function finalizarTransaccion() {
		$this->e->commit();
		//$this->e->autocommit(true);
		return $this;
	}

    /**
     * Revierte y descarta la transacción.
     * @return \mysqli\bd
     */
	public function descartarTransaccion() {
		$this->e->rollback();
		return $this;
	}

    /**
     * Bloquea las tablas.
     * @param string $modo Modo: 'bd::soloLectura' o 'bd::lecturaEscritura'.
     * @param array $tablas Tablas a bloquear. Cada elemento puede ser una cadena (nombre de la tabla) o un arreglo [tabla,alias].
     * @param null $alias No aplica.
     * @return \datos\bd
     *//**
     * Bloquea las tablas.
     * @param string $modo Modo: 'bd::soloLectura' o 'bd::lecturaEscritura'.
     * @param string $tablas Nombre de la tabla a bloquear (solo una).
     * @param string $alias Alias (solo uno).
     * @return \datos\bd
     */
	public function bloquear($modo,$tablas,$alias=null) {
        $modo=$modo==self::lecturaEscritura?' WRITE':' READ';
        
        if(is_string($tablas)) {
            if($alias) $tablas.=' AS '.$alias;
            $tablas.=$modo;
        } else {
            $listado=[];
		    foreach($tablas as $tabla) {
                if(is_array($tabla)) {
                    //[[tabla,alias],...]
                    $listado[]=$tabla[0].' as '.$tabla[1].$modo;
                } else {
                    //[tabla,tabla]
                    $listado[]=$tabla.$modo;
                }
            }
            $tablas=join(',',$listado);
        }

		$this->e->query('LOCK TABLES '.$tablas);

		return $this;
	}

    /**
     * Desbloquea las tablas.
     * @return \mysqli\bd
     */
	public function desbloquear() {
		$this->e->query('UNLOCK TABLES');
		return $this;
	}

	/**
	 * Ejecuta una consulta MySQL y devuelve una instancia de resultado. Pueden utilizarse parámetros con nombre precedidos por `@` y la cadena `#__` previo a un nombre
     * de tabla representando el prefijo.
	 * @param $q Consulta.
	 * @param $parametros Array asociativo de parámetros.
	 * @param $tipos Array asociativo de tipo (`i`, `d`, `s`, `b`) por parámetro. Opcional, si se omite, se autodetectarán los tipos.
     * @return \mysqli\resultado
	 */
	public function consulta($q,$parametros=null,$tipos=null) { 
        if(is_subclass_of($q,\datos\constructor::class)) {
            $consulta=$q->obtenerConsulta();
            $q=$consulta->sql;
            $parametros=$consulta->variables;
            $tipos=$consulta->tipos;
        }

		if($parametros) {
			return $this->preparar($q,$parametros,$tipos)
				->ejecutar();
		}

		$this->liberar();

		$query=$this->e->query($this->reemplazarVariables($q));

		$res=null;
		if(!$this->e->errno) $res=(new resultado)->establecer($query);

        $this->id=$this->e->insert_id;
        $this->filas=$this->e->affected_rows>=0?$this->e->affected_rows:$this->e->num_rows;
		$this->error=$this->e->errno;
		$this->descripcionError=$this->e->error;

		return $res;
	}

	/**
	 * Comienza una consulta preparada. Pueden utilizarse parámetros con nombre precedidos por `@` y la cadena `#__` previo a un nombre
     * de tabla representando el prefijo.
	 * @param $q Consulta.
	 * @param $parametros Array asociativo de parámetros.
	 * @param $tipos Array asociativo de tipo (`i`, `d`, `s`, `b`) por parámetro. Opcional, si se omite, se autodetectarán los tipos.
     * @return \mysqli\bd
	 */
	public function preparar($q,$parametros=null,$tipos=null) {
        if(is_subclass_of($q,\datos\constructor::class)) {
            $consulta=$q->obtenerConsulta();
            $q=$consulta->sql;
            $parametros=$consulta->variables;
            $tipos=$consulta->tipos;
        }

		$this->liberar();

        $this->resultado=new resultado;

        $asignarParametros=[];
        $asignarTipos='';
        $q=$this->reemplazarVariables($q,$parametros,$tipos,$asignarParametros,$asignarTipos);
        
		$stmt=$this->e->prepare($q);

        if(!$stmt) {
			$this->error=$this->e->errno;
			$this->descripcionError=$this->e->error;
			return $this;
		}
		
		if($stmt->errno) {
			$this->error=$stmt->errno;
			$this->descripcionError=$stmt->error;
			return $this;
		}

        $this->resultado->establecerStmt($stmt);

		if($asignarParametros) $this->asignar($asignarParametros,$asignarTipos);
		
		return $this;
	}

    /**
     * Reemplaza las variables `@foo` por `?` y los prefijos de tabla `#__`, rellenando `$parametros` y `$tiposParametros`.
     * @param string $consulta Consulta SQL.
     * @param array $variables Variables.
     * @param array $tipos Tipos para las variables.
     * @param array $parametros Salida de los parámetros en orden.
     * @param string $tiposParametros Cadena de tipos para `$parametros`.
     * @return string
     */
    protected function reemplazarVariables($consulta,$variables=null,$tipos=null,&$parametros=null,&$tiposParametros=null) {
        $nuevaConsulta='';
        $len=strlen($consulta);
        $comilla=null;
        $escape=0;
        $bufer='';

        for($i=0;$i<$len;$i++) {
            $c=$consulta[$i];
            
            if(!$comilla) {
                if($c=='\''||$c=='"') {
                    $comilla=$c;
                    $nuevaConsulta.=$this->reemplazarVariables_procesarBufer($bufer,$variables,$tipos,$parametros,$tiposParametros);
                    $nuevaConsulta.=$c;
                    $bufer='';
                } else {
                    $bufer.=$c;
                }
            } else {
                if($c=='\\') {
                    $escape++;
                } else {
                    $escape=0;
                    if($c==$comilla&&$escape%2==0) {
                        $comilla=null;
                    }                    
                }
                $nuevaConsulta.=$c;
            }
        }
        $nuevaConsulta.=$this->reemplazarVariables_procesarBufer($bufer,$variables,$tipos,$parametros,$tiposParametros);

        return $nuevaConsulta;
    }

    /**
     * Proceso intermedio de `reemplazarVariables()`.
     * @param string $bufer
     * @param array $variables
     * @param array $tipos
     * @param array $parametros
     * @param array $tiposParametros
     * @return string
     */
    protected function reemplazarVariables_procesarBufer($bufer,$variables,$tipos,&$parametros,&$tiposParametros) {
        if($bufer==='') return '';

        $bufer=str_replace('#__',$this->credenciales->prefijo,$bufer);

        if(!$variables) return $bufer;

        $desde=0;
        while(preg_match('/@([a-zA-Z0-9_]+)/',$bufer,$coincidencias,PREG_OFFSET_CAPTURE,$desde)) {
            $cadena=$coincidencias[0][0];
            $variable=$coincidencias[1][0];
            $posicion=$coincidencias[0][1];
            
            if(array_key_exists($variable,$variables)) {
                //Reemplazar @var por ?
                $reemplazo=substr($bufer,0,$posicion);
                $reemplazo.='?';
                $reemplazo.=substr($bufer,$posicion+strlen($cadena));
                $bufer=$reemplazo;

                //Agregar a los parámetros de salida
                $parametros[]=$variables[$variable];
                if($this->resultado) $this->resultado->variables[$variable]=count($parametros)-1;
                
                if($tipos&&array_key_exists($variable,$tipos)) {
                    $tiposParametros.=$tipos[$variable];
                } else {
                    $tiposParametros.=$this->estimarTipo($variables[$variable]);
                }
            } else {
                //Si la variable no está definida, avanzar $desde para buscar otra variable en la próxima iteración
                $desde+=$posicion+strlen($cadena);
            }
        }

        return $bufer;
    }

    /**
     * Establece el resultado de una consulta anterior (ej. una consulta preparada) para continuar con su ejecución.
     * @param \mysqli\resultado $resultado Resultado.
     * @return \mysqli\bd
     */
    public function establecer($resultado) {
        $this->resultado=$resultado;
        return $this;
    }

	/**
	 * Ejecuta una sentencia preparada y devuelve una instancia de resultado.
     * @return \mysqli\resultado
	 */
	public function ejecutar() {
		if(!$this->resultado) return null;

        $stmt=$this->resultado->obtenerStmt();
        if(!$stmt) return null;

        $stmt->execute();
		
		if($stmt->errno) {
			$this->error=$stmt->errno;
			$this->descripcionError=$stmt->error;
			return $this;
		}

		$this->id=$stmt->insert_id;
		$this->filas=$stmt->affected_rows>=0?$stmt->affected_rows:$stmt->num_rows;

        return $this->resultado;
	}

    /**
     * Estima el tipo para un valor dado.
     * @param mixed $valor Valor a evaluar.
     * @return string
     */
    protected function estimarTipo($valor) {
        if(is_integer($valor)) return 'i';
        if(is_numeric($valor)||preg_match('/^[0-9]*\.[0-9]+$/',$valor)) return 'd';
        //TODO blob
        return 's';
    }

	/**
	 * Asigna nuevos parámetros a una sentencia preparada.
	 * @param array $parametros Array de parámetros ordenados.
	 * @param string $tipos Cadena de tipos (`i`, `d`, `s`, `b`). Opcional, si se omite, se autodetectarán los tipos.
     * @return \mysqli\bd
	 */
	public function asignar($parametros,$tipos=null) {
        if(!$this->resultado||!count($parametros)) return $this;

        $stmt=$this->resultado->obtenerStmt();
        if(!$stmt) return $this;
        
		if(!$tipos) {
			$tipos='';
			foreach($parametros as $v) $tipos.=$this->estimarTipo($v);
		}

		$this->resultado->asignaciones=[];
		$arr=[$tipos];
        foreach($parametros as $clave=>$valor) {
            $this->resultado->asignaciones[$clave]=$valor;
            $arr[]=&$this->resultado->asignaciones[$clave];
        }

        call_user_func_array([$stmt,'bind_param'],$arr);

		return $this;
	}

    /**
     * Actualiza los valores de los parámetros para volver a ejecutar la consulta preparada.
	 * @param $parametros Array asociativo de parámetros.
     * @return \mysqli\bd
     */
    public function actualizarParametros($parametros) {
        if(!$this->resultado) return $this;

        foreach($parametros as $variable=>$valor) {
            if(!array_key_exists($variable,$this->resultado->variables)) continue;
            $indice=$this->resultado->variables[$variable];
            $this->resultado->asignaciones[$indice]=$valor;
        }

        return $this;
    }

	/**
	 * Destruye la sentencia preparada.
     * @return \mysqli\bd
	 */
	public function liberar() {
		if($this->resultado) {
            $this->resultado->liberar();
            $this->resultado=null;
        }
		return $this;
    }
    
    /**
     * Escapa los caracteres especiales de una cadena para usarla en una sentencia SQL, tomando en cuenta el conjunto de caracteres
     * actual de la conexión.
     * @param string $cadena
     * @return string
     */
    public function escape($cadena) {
        return $this->e->real_escape_string($cadena);
    }
}
