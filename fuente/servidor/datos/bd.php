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
 * Interfaz para las clases del origen de datos.
 */
class bd {    
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
    
    protected $credenciales=null;
    
    /**
     * @var soloLectura Transacción o bloqueo de solo lectura.
     * @var lecturaEscritura Transacción o bloqueo para lectura y escritura.
     */
    const soloLectura=1;
    const lecturaEscritura=2;

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
     * Fabrica y devuelve una instancia del constructor de consultas.
     * @return \datos\constructor
     */
    public function fabricarConstructor() {}

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
     * @return \datos\bd
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
     * @return \datos\bd
     */
    public function conectar() {}

    /**
     * Cierra la conexión a la base de datos.
     * @return \datos\bd
     */
    public function desconectar() {}

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
     * @param $modo Modo (`bd::soloLectura` o `bd::lecturaEscritura`).
     * @return \datos\bd
     */
	public function comenzarTransaccion($modo) {}

    /**
     * Finaliza la transacción.
     * @return \datos\bd
     */
	public function finalizarTransaccion() {}

    /**
     * Revierte y descarta la transacción.
     * @return \datos\bd
     */
	public function descartarTransaccion() {}

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
	public function bloquear($modo,$tablas,$alias=null) {}

    /**
     * Desbloquea las tablas.
     * @return \datos\bd
     */
	public function desbloquear() {}

	/**
	 * Ejecuta una consulta MySQL y devuelve una instancia de resultado. Pueden utilizarse parámetros con nombre precedidos por `@` y la cadena `#__` previo a un nombre
     * de tabla representando el prefijo.
	 * @param $q Consulta.
	 * @param $parametros Array asociativo de parámetros.
	 * @param $tipos Array asociativo de tipo (`i`, `d`, `s`, `b`) por parámetro. Opcional, si se omite, se autodetectarán los tipos.
     * @return \datos\resultado
	 */
	public function consulta($q,$parametros=null,$tipos=null) {}

	/**
	 * Comienza una consulta preparada. Pueden utilizarse parámetros con nombre precedidos por `@` y la cadena `#__` previo a un nombre
     * de tabla representando el prefijo.
	 * @param $q Consulta.
	 * @param $parametros Array asociativo de parámetros.
	 * @param $tipos Array asociativo de tipo (`i`, `d`, `s`, `b`) por parámetro. Opcional, si se omite, se autodetectarán los tipos.
     * @return \datos\bd
	 */
	public function preparar($q,$parametros=null,$tipos=null) {}

    /**
     * Actualiza los valores de los parámetros para volver a ejecutar la consulta preparada.
	 * @param $parametros Array asociativo de parámetros.
     * @return \datos\bd
     */
    public function actualizarParametros($parametros) {}

    /**
     * Establece el resultado de una consulta anterior para continuar con su ejecución (ej. tras utilizar una consulta preparada).
     * @param \datos\resultado $resultado Resultado.
     * @return \datos\bd
     */
    public function establecer($resultado) {}

	/**
	 * Ejecuta una sentencia preparada y devuelve una instancia de resultado.
     * @return \datos\resultado
	 */
	public function ejecutar() {}

	/**
	 * Asigna nuevos parámetros a una sentencia preparada.
	 * @param array $parametros Array de parámetros ordenados.
	 * @param string $tipos Cadena de tipos (`i`, `d`, `s`, `b`). Opcional, si se omite, se autodetectarán los tipos.
     * @return \datos\bd
	 */
	public function asignar($parametros,$tipos=null) {}

	/**
	 * Destruye la sentencia preparada.
     * @return \datos\bd
	 */
	public function liberar() {}
    
    /**
     * Escapa los caracteres especiales de una cadena para usarla en una sentencia SQL, tomando en cuenta el conjunto de caracteres actual de la conexión.
     * @param string $cadena
     * @return string
     */
    public function escapar($cadena) {}
}
