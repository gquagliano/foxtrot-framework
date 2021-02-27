<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 defined('_inc') or exit;

/**
 * Interfaz de bases de datos MySQL.
 */
class bd {
    /** @var \mysqli $e */
	protected $e;
    protected $stmt=null;
    
    protected $credenciales=null;

	/**
	 * Información de la última consulta.
	 * @var $id Último ID insertado.
	 * @var $filas Número de filas afectadas o encontradas.
	 * @var $error Error (bool).
	 * @var $descripcionError Descripción del último error.
	 */
	protected $id=null;
	protected $filas=0;
	protected $error=0;
    protected $descripcionError=null;
        
    /**
     * @var soloLectura Inicia la transacción como `START TRANSACTION READ ONLY`.
     * @var lecturaEscritura Inicia la transacción como `START TRANSACTION READ WRITE`.
     * @var instantaneaConsistente Inicia la transacción como `START TRANSACTION WITH CONSISTENT SNAPSHOT`.
     */
    const soloLectura=MYSQLI_TRANS_START_READ_ONLY;
    const lecturaEscritura=MYSQLI_TRANS_START_READ_WRITE;
    const instantaneaConsistente=MYSQLI_TRANS_START_WITH_CONSISTENT_SNAPSHOT;

    /**
     * Constructor. Los parámetros omitidos o nulos serán recuperados desde \configuracion.
     * @param bool $conectar Conectar inmediatamente.
     * @param string $servidor Dirección del servidor.
     * @param string $usuario Nombre de usuario.
     * @param string $contrasena Contraseña.
     * @param string $nombre Nombre de la base de datos.
     * @param string $prefijo Prefijo de las tablas (el prefijo `#__` en los nombres de tablas será reemplazado automáticamente por este valor).
     * @param int $puerto Puerto del servidor.
     */
	function __construct($conectar=false,$servidor=null,$usuario=null,$contrasena=null,$nombre=null,$prefijo=null,$puerto=3306) {
        $this->establecerCredenciales($servidor,$usuario,$contrasena,$nombre,$prefijo,$puerto);
        if($conectar) $this->conectar();
	}

    /**
     * Destructor.
     */
	function __destruct() {
        $this->desconectar();
    }

    /**
     * Devuelve el último ID insertado.
     * @return int
     */
    public function obtenerId() {
        return $this->id;
    }

    /**
     * Devuelve el número de filas afectadas por la última consulta, ya sea una selección (cantidad de filas seleccionadas) como una actualización (cantidad de filas afectadas.)
     * @return int
     */
    public function obtenerNumeroFilas() {
        return $this->filas;
    }

    /**
     * Devuelve la descripción del último error.
     * @return string
     */
    public function obtenerError() {
        return $this->descripcionError;
    }

    /**
     * Devuelve el número o código del último error.
     * @return int
     */
    public function obtenerNumeroError() {
        return $this->error;
    }

    /**
     * Establece las credenciales. Los parámetros omitidos o nulos serán recuperados desde \configuracion. No afectará la conexión actualmente establecida.
     * @param string $servidor Dirección del servidor.
     * @param string $usuario Nombre de usuario.
     * @param string $contrasena Contraseña.
     * @param string $nombre Nombre de la base de datos.
     * @param string $prefijo Prefijo de las tablas (el prefijo `#__` en los nombres de tablas será reemplazado automáticamente por este valor).
     * @param int $puerto Puerto del servidor.
     * @return \bd
     */
    public function establecerCredenciales($servidor=null,$usuario=null,$contrasena=null,$nombre=null,$prefijo=null,$puerto=3306) {
        if(!$servidor) $servidor=\configuracion::$servidorBd;
        if(!$usuario) $usuario=\configuracion::$usuarioBd;
        if(!$contrasena) $contrasena=\configuracion::$contrasenaBd;
        if(!$nombre) $nombre=\configuracion::$nombreBd;
        if(!$prefijo) $prefijo=\configuracion::$prefijoBd;
        if(!$puerto) $puerto=\configuracion::$puertoBd;

        $this->credenciales=(object)[
            'servidor'=>$servidor,
            'usuario'=>$usuario,
            'contrasena'=>$contrasena,
            'nombre'=>$nombre,
            'prefijo'=>$prefijo,
            'puerto'=>$puerto
        ];

        return $this;
    }

    /**
     * Abre la conexión a la base de datos.
     * @return \bd
     */
    public function conectar() {
		$this->e=new mysqli(
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

        $this->e->query('set sql_mode=""');
        //$this->e->query('set names "utf8"');
        $this->e->set_charset('utf8');

        $zona=\util::obtenerMinutosZonaHoraria(\configuracion::$zonaHorariaMinutos);
        $horas=($zona>=0?'+':'-').\util::minutosAHoras($zona);
        $this->e->query("set @@session.time_zone='".$horas."'");        
        
        return $this;
    }

    /**
     * Cierra la conexión a la base de datos.
     * @return \bd
     */
    public function desconectar() {
        if($this->e) @$this->e->close();
        //if($this->stmt) @$this->stmt->close();
        return $this;
	}

    /**
     * Reemplaza el prefijo `#__` antes de los nombres de tabla por el prefijo real de las mismas.
     * @param string $q Consulta.
     * @return string
     */
	public function reemplazarPrefijo($q) {
		return preg_replace("/#__(?=([^\"']*[\"'][^\"']*[\"'])*[^\"']*$)/sim",$this->credenciales->prefijo,$q);
	}

    /**
     * Abre una transacción.
     * @param $modo Modo (`soloLectura`, `lecturaEscritura` o `instantaneaConsistente`).
     * @return \bd
     */
	public function comenzarTransaccion($modo=null) {
        //$this->e->autocommit(false);
        $this->e->begin_transaction($modo);
		return $this;
	}

    /**
     * Finaliza la transacción.
     * @return \bd
     */
	public function finalizarTransaccion() {
		$this->e->commit();
		//$this->e->autocommit(true);
		return $this;
	}

    /**
     * Revierte y descarta la transacción.
     * @return \bd
     */
	public function descartarTransaccion() {
		$this->e->rollback();
		return $this;
	}

    /**
     * Bloquea las tablas.
     * @param string $modo Modo: 'lectura' o 'escritura'.
     * @param array $tablas Tablas a bloquear. Cada elemento puede ser una cadena (nombre de la tabla) o un arreglo [tabla,alias].
     * @param null $alias No aplica.
     * @return \bd
     *//**
     * Bloquea las tablas.
     * @param string $modo Modo: 'lectura' o 'escritura'.
     * @param string $tablas Nombre de la tabla a bloquear (solo una).
     * @param string $alias Alias (solo uno).
     * @return \bd
     */
	public function bloquear($modo,$tablas,$alias=null) {
        $modo=$modo=='escritura'?' write':' read';
        
        if(is_string($tablas)) {
            if($alias) $tablas.=' as `'.$alias.'`';
            $tablas.=$modo;
        } else {
            $listado=[];
		    foreach($tablas as $tabla) {
                if(is_array($tabla)) {
                    //[[tabla,alias]]
                    $listado[]=$tabla[0].' as `'.$tabla[1].'`'.$modo;
                } else {
                    //[tabla,tabla]
                    $listado[]=$tabla.$modo;
                }
            }
            $tablas=join(',',$listado);
        }

		$this->e->query('lock tables '.$tablas);

		return $this;
	}

    /**
     * Desbloquea las tablas.
     * @return \bd
     */
	public function desbloquear() {
		$this->e->query('unlock tables');
		return $this;
	}

	/**
	 * Ejecuta una consulta MySQL y devuelve una instancia de resultado. La cadena `#__` previo a un nombre de tabla se reemplazará
	 * por el prefijo.
	 * @param $q Consulta.
	 * @param $parametros Array de parámetros. Opcional, si se incluye, se preparará y ejecutará la sentencia preparada en una sola operación.
	 * @param $tipos String de tipos en caso de usar parámetros (i, d, s, b). Opcional, si se omite, se autodetectarán los tipos.
     * @return \resultado
	 */
	public function consulta($q,$parametros=null,$tipos=null) {
		if($parametros) {
			return $this->preparar($q,$parametros,$tipos)
				->ejecutar();
		}

		$this->liberar();

		$query=$this->e->query($this->reemplazarPrefijo($q));

		$res=null;
		if(!$this->e->errno) $res=(new resultado)->establecer($query);

        $this->id=$this->e->insert_id;
        if($res) {
            $this->filas=$res->obtenerNumeroFilas();
        } else {
            $this->filas=$this->e->affected_rows>0?$this->e->affected_rows:$this->e->num_rows;
        }
		$this->error=$this->e->errno;
		$this->descripcionError=$this->e->error;

		return $res;
	}

	/**
	 * Comienza una consulta preparada. La cadena `#__` previo a un nombre de tabla se reemplazará
	 * por el prefijo.
	 * @param $q Consulta.
	 * @param $parametros Array de parámetros.
	 * @param $tipos String de tipos (i, d, s, b). Opcional, si se omite, se autodetectarán los tipos.
     * @return \bd
	 */
	public function preparar($q,$parametros=null,$tipos=null) {
		$this->liberar();

		$this->stmt=$this->e->prepare($this->reemplazarPrefijo($q));
		
		if(!$this->stmt||$this->stmt->error) {
			$this->error=$this->stmt->errno;
			$this->descripcionError=$this->stmt->error;
			return $this;
		}

		if($parametros) $this->asignar($parametros,$tipos);

		return $this;
	}

	/**
	 * Ejecuta una sentencia preparada y devuelve una instancia de resultado.
     * @return \resultado
	 */
	public function ejecutar() {
		if(!$this->stmt) return null;

		$this->stmt->execute();

		$this->id=$this->stmt->insert_id;
		$this->filas=$this->stmt->affected_rows>0?$this->stmt->affected_rows:$this->stmt->num_rows;
		
		if($this->stmt->error) {
			$this->error=$this->stmt->errno;
			$this->descripcionError=$this->stmt->error;
			return $this;
		}

		$res=(new resultado)
            ->establecerStmt($this->stmt);
            
        if($res) $this->filas=$res->obtenerNumeroFilas();

        return $res;
	}

	/**
	 * Asigna nuevos parámetros a una sentencia preparada.
	 * @param $parametros Array de parámetros.
	 * @param $tipos String de tipos (i, d, s, b). Opcional, si se omite, se autodetectarán los tipos.
     * @return \bd
	 */
	public function asignar($parametros,$tipos=null) {
        if(!count($parametros)||!$this->stmt) return $this;
        
		if(!$tipos) {
			$tipos='';
			foreach($parametros as $v) {
				if(is_integer($v)) {
					$tipos.='i';
				} elseif(is_numeric($v)||preg_match('/^[0-9]*\.[0-9]+$/',$v)) {
					$tipos.='d';
				} else {
					$tipos.='s';
				}
				//TODO blob
			}
		}
		
		$arr=[$tipos];
        for($i=0;$i<count($parametros);$i++) $arr[]=&$parametros[$i];
        
        call_user_func_array([$this->stmt,'bind_param'],$arr);

		return $this;
	}

	/**
	 * Destruye la sentencia preparada.
     * @return \bd
	 */
	public function liberar() {
		if($this->stmt) {
			//debe cerrarse desde resultado, de lo contrario no podrán leerse las filas tras otra consulta intermedia
			//$this->stmt->close();
			$this->stmt=null;
		}
		return $this;
    }
    
    /**
     * Escapa los caracteres especiales de una cadena para usarla en una sentencia SQL, tomando en cuenta el conjunto de caracteres actual de la conexión.
     * @param string $cadena
     * @return string
     */
    public function escape($cadena) {
        return $this->e->real_escape_string($cadena);
    }
}
