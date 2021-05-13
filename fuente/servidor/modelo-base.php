<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

use datos\bd;
use datos\condicion;
use datos\constructor;
use datos\relacion;

defined('_inc') or exit;

/**
 * Clase base de `\modelo`. Separamos la funcionalidad de la siguiente forma simplemente para una mejor organización y claridad del código:
 * `modeloBase`     Clase con las propiedades y métodos más generales del modelo de datos.
 * `modelo`         Clase que extienden las clases concretas del modelo de la aplicación con los métodos útiles que implementan los métodos
 *                  generales de `modeloBase` en formas específicas, como `donde()`, `dondeNo()`, etc.
 */
class modeloBase {
    //En la entidad concreta se establecen estas propiedades como estáticas
    protected static $tipoEntidad;
    protected static $tabla;

    //En la instancia se trabaja con estas propiedades
    protected $_tipoEntidad;
    protected $_tabla;

    protected $bd;
    protected $nombre;
    protected $constructor;
    protected $consultaConstruida=false;
    protected $campos;
    protected $alias='t1';
    protected $contadorAlias=1;
    protected $relaciones=[];
    protected $resultado=null;
    protected $ultimoId=null;
    protected $cantidadFilas=0;
    protected $valores=null;
    protected $contrasena=null;

    protected $configProcesarRelaciones=true;
    protected $configForzarRelaciones=[];
    protected $configReutilizarConsulta=null;
    protected $configObtenerOcultos=false;
    protected $configProcesarRelaciones1N=true;
    protected $configSeleccionarEliminados=false;
    protected $configEliminarRelacionados=false;

    //Redefinimos algunas constantes para evitar el uso de cadenas pero a la vez evitar acoplar el código del cliente y la descendencia
    //de esta clase al constructor. Ya que dentro de esta clase sabemos que dependemos del constructor, directamente asignamos
    //los mismos valores para ahorrar validaciones en el futuro.
    const seleccionar=constructor::operacionSeleccionar;
    const actualizar=constructor::operacionActualizar;
    const crear=constructor::operacionInsertar;
    const eliminar=constructor::operacionEliminar; //No se usa ya que todas las bajas son lógicas (actualizar e=1)
    const contar=constructor::operacionContar; //Solo para uso interno
    const y=condicion::operadorY;
    const o=condicion::operadorO;
    const ox=condicion::operadorOX;
    const como=condicion::operadorComo;
    const noComo=condicion::operadorNoComo;
    const en=condicion::operadorEn;
    const noEn=condicion::operadorNoEn;
    const relacion1N='1:n'; //No es un tipo estándar del constructor
    const relacion11=relacion::interior;
    const relacion10=relacion::izquierda;
    const soloLectura=bd::soloLectura;
    const lecturaEscritura=bd::lecturaEscritura;
    const donde=condicion::donde;
    const teniendo=condicion::teniendo;

    /**
     * Constructor.
     * @param \datos\bd $bd Instancia de la base de datos a utilizar. Opcional; si se omite, se utilizará la instancia global.
     * @param string $nombre Nombre del modelo de datos. Parámetro de uso interno (normalmente debe omitirse).
     * @param string $tipoEntidad Nombre completo del tipo de las entidades. Parámetro de uso interno (normalmente debe omitirse).
     */
    function __construct($bd=null,$nombre=null,$tipoEntidad=null) {
        if($nombre) {
            $this->nombre=$nombre;
            $this->_tabla=$nombre;
        } else {
            $clase=foxtrot::obtenerDatosClase($this,'modelo');
            $this->nombre=$clase->ruta.$clase->nombre;        
            $this->_tabla=static::$tabla?
                static::$tabla:
                $clase->nombre;
        }

        $this->_tipoEntidad=$tipoEntidad?
            $tipoEntidad:
            static::$tipoEntidad;

        $this->bd=$bd?
            $bd:
            foxtrot::obtenerBd();

        $this->constructor=$this->bd->fabricarConstructor();

        $this->campos=$this->_tipoEntidad::obtenerCampos();
    }

    /**
     * Devuelve una nueva instancia de las entidades de este modelo.
     * @return \entidadBase
     */
    public function fabricarEntidad() {
        return new $this->_tipoEntidad;
    }
    
    /**
     * Fabrica el modelo de datos correspondiente a un campo relacional.
     * @param object $campo Parámetros del campo a evaluar.
     * @return \modeloBase
     */
    protected function fabricarModeloCampo($campo) {
        if($campo->entidad) return \foxtrot::fabricarModeloPorEntidad($campo->entidad);
        if($campo->modelo) return \foxtrot::fabricarModelo($campo->modelo);
        return null;
    }

    ////Acceso a propiedades

    /**
     * Devuelve el nombre de la tabla o esquema.
     * @return string
     */
    public function obtenerTabla() {
        return $this->_tabla;
    }

    /**
     * Devuelve el nombre del modelo.
     * @return string
     */
    public function obtenerNombre() {
        return $this->nombre;
    }

    /**
     * Devuelve los campos de las entidades.
     * @return object
     */
    public function obtenerCampos() {
        return $this->campos;
    }

    /**
     * Devuelve el alias.
     * @return string
     */
    public function obtenerAlias() {
        return $this->alias;
    }

    /**
     * Establece el alias.
     * @return \modeloBase
     */
    public function establecerAlias($alias) {
        $this->alias=$alias;
        return $this;
    }

    /**
     * Devuelve la cantidad de filas seleccionadas o afectadas en la última consulta.
     * @return int|null
     */
    public function obtenerCantidad() {
        return $this->cantidadFilas;
    }

    /**
     * Devuelve el ID del último registro insertado.
     * @return int|null
     */
    public function obtenerId() {
        return $this->ultimoId;
    }

    ////Configuración

    /**
     * Reinicia la instancia para construir una nueva consulta.
     * @return \modeloBase
     */
    public function reiniciar() {
        $this->constructor=$this->bd->fabricarConstructor();
        $this->consultaConstruida=false;
        $this->configProcesarRelaciones=true;
        $this->configProcesarRelaciones1N=true;
        $this->configForzarRelaciones=[];
        $this->configReutilizarConsulta=null;
        $this->configObtenerOcultos=false;
        $this->configSeleccionarEliminados=false;
        $this->configEliminarRelacionados=false;
        $this->ultimoId=null;
        $this->cantidadFilas=0;
        $this->valores=null;
        return $this;
    }

    /**
     * Establece que se deben asignar los campos ocultos.
     * @param bool $activar Activar o desactivar este parámetro.
     * @return \modeloBase
     */
    public function obtenerOcultos($activar=true) {
        $this->configObtenerOcultos=$activar;
        return $this;
    }

    /**
     * Establece que se deben omitir todos los campos relacionales.
     * @param bool $omitir Activar o desactivar este comportamiento.
     * @return \modeloBase
     */
    public function omitirRelaciones($omitir=true) {
        $this->configProcesarRelaciones=!$omitir;
        return $this;
    }

    /**
     * Establece que se deben omitir los campos relacionales tipo `1:n`.
     * @param bool $omitir Activar o desactivar este comportamiento.
     * @return \modeloBase
     */
    public function omitirRelaciones1N($omitir=true) {
        $this->configProcesarRelaciones1N=!$omitir;
        return $this;
    }

    /**
     * Establece que se deben incluir en la selección los registros con baja lógica.
     * @param bool $activar Activar o desactivar este parámetro.
     * @return \modeloBase
     */
    public function seleccionarEliminados($activar=true) {
        $this->configSeleccionarEliminados=$activar;
        return $this;
    }

    /**
     * Establece que se debe forzar el procesamiento de determinados campos relacionales, aunque las relaciones estén desactivadas. Este
     * parámetro afecta únicamente las consultas de selección.
     * @param string ...$campos Nombres de los campos.
     * @return \modeloBase
     */
    public function forzarRelaciones(...$campos) {
        $this->configForzarRelaciones=$campos;
        return $this;
    }

    /**
     * Establece que se deben eliminar los registros de las tablas foráneas cuando las relaciones se eliminen.
     * @param bool $activar Activar o desactivar este parámetro.
     * @return \modeloBase
     */
    public function eliminarRelacionados($activar=true) {
        $this->configEliminarRelacionados=$activar;
        return $this;
    }

    /**
     * Devuelve la entidad actual.
     * @return \entidadBase
     */
    public function obtenerEntidad() {
        return $this->valores;
    }

    ////Configuración de consultas    

    /**
     * Abre un grupo de condiciones o paréntesis.
     * @param int $union Unión con la condición anterior, `modeloBase::y` (`AND`), `modeloBase::o` (`OR`), `modeloBase::ox` (`XOR`).
     * @return \modeloBase
     */
    public function abrirGrupo($union=self::y) {
        $condicion=$this->constructor->fabricarCondicion()
            ->abreParentesis($union);

        $this->constructor->agregarCondicion($condicion);

        return $this;
    }

    /**
     * Cierra un grupo de condiciones o paréntesis.
     * @return \modeloBase
     */
    public function cerrarGrupo() {
        $condicion=$this->constructor->fabricarCondicion()
            ->cierraParentesis();

        $this->constructor->agregarCondicion($condicion);

        return $this;
    }    

    /**
     * Establece los campos a seleccionar.
     * @param string ...$campos Nombres de los campos.
     * @return \modeloBase
     */
    public function seleccionar(...$campos) {
        foreach($campos as $campo)
            $this->constructor->seleccionarCampo($this->alias,$campo,'__'.$this->alias.'_'.$campo);
        return $this;
    }

    /**
     * Establece el límite.
     * @param int $origen Origen o registro inicial, comenzando desde `0`.
     * @param int $cantidad Cantidad.
     * @return \modeloBase
     */
    public function limite($origen,$cantidad) {
        $this->constructor->establecerLimite($origen,$cantidad);
        return $this;
    }

    /**
     * Establece el ordenamiento.
     * @param string $campo Nombre del campo. Si se omite el alias, se asume campo de este modelo.
     * @param string|null $sentido Sentido (`'asc'` o `'desc'`).
     * @return \modeloBase
     */
    public function ordenar($campo,$sentido=null) {
        if(array_key_exists($campo,$this->campos)) $campo=$this->alias.'.'.$campo;

        $this->constructor->establecerOrden($campo,$sentido);

        return $this;
    }

    /**
     * Establece el agrupamiento (`GROUP BY`).
     * @param string $campo Nombre del campo. Si se omite el alias, se asume campo de este modelo.
     * @return \modeloBase
     */
    public function agrupar($campo) {
        if(array_key_exists($campo,$this->campos)) $campo=$this->alias.'.'.$campo;

        $this->constructor->establecerAgrupamiento($campo);

        return $this;
    }

    /**
     * Establece los valores para la operación de inserción o actualización. Solo se considerarán aquellas propiedades cuyo valor no sea
     * `null` (además de ser válidas).
     * @param object|array|\entidadBase $valores Valores como objeto, array asociativo o instancia de una entidad. Cuando se especifique una
     * instancia de la entidad, *siempre* se reemplazarán los valores previos (independientemente del valor de `$reemplazar`).
     * @param bool $reemplazar Si es `false`, actualizará los valores asignados previamente.
     * @return \modeloBase
     */
    public function establecerValores($valores,$reemplazar=false) {
        if(is_object($valores)&&is_subclass_of($valores,entidad::class)) {
            $this->valores=$valores;
            return $this;
        }

        if(is_array($valores)) $valores=(object)$valores;

        if(!$this->valores||$reemplazar) $this->valores=$this->fabricarEntidad();

        foreach($this->campos as $nombre=>$campo) {
            if(isset($valores->$nombre)) $this->valores->$nombre=$valores->$nombre;
        }

        return $this;
    }

    /**
     * Establece los valores para la operación de inserción o actualización. Solo se considerarán aquellas propiedades *públicas* (es decir,
     * que presenten `@publico` y cuyo valor no sea `null` (además de ser válidas). Este método debe utilizarse cuando se reciban valores
     * desde el cliente.
     * @param object|array|\entidadBase $valores Valores como objeto, array asociativo o instancia de una entidad.
     * @param bool $reemplazar Si es `false`, actualizará los valores asignados previamente.
     * @return \modeloBase
     */
    public function establecerValoresPublicos($valores,$reemplazar=false) {
        if(is_object($valores)&&is_subclass_of($valores,entidad::class))
            $valores=$valores->obtenerObjeto();

        if(is_array($valores)) $valores=(object)$valores;

        if(!$this->valores||is_subclass_of($valores,entidad::class)||$reemplazar)
            $this->valores=$this->fabricarEntidad();

        foreach($this->campos as $nombre=>$campo) {
            if(isset($valores->$nombre)) $this->valores->$nombre=$valores->$nombre;
        }

        return $this;
    }

    ////Acciones

    /**
     * Ejecuta la consulta y devuelve un listado de resultados. Nótese que si la consulta falla o no hay coincidencias, devolverá siempre
     * un array vacío.
     * @param bool $comoObjetoEstandar Si es `true`, devolverá objetos estándar en lugar de instancias de la entidad.
     * @return array
     */
    public function obtenerListado($comoObjetoEstandar=false) {
        $this->construirConsulta(self::seleccionar);

        $resultado=$this->ejecutarConsulta();
        if(!$resultado) return [];

        //Primero debemos consumir todo el resultado a fin de poder hacer consultas secundarias al procesar relaciones
        $filas=[];
        while($fila=$resultado->siguiente())
            $filas[]=$fila;

        $listado=[];
        foreach($filas as $fila) {
            $item=$this->filaAObjeto($fila,$comoObjetoEstandar);
            if($item) $listado[]=$item;
        }

        return $listado;
    }

    /**
     * Ejecuta la consulta y devuelve un único registro, o `null`.
     * @param bool $comoObjetoEstandar Si es `true`, devolverá un objeto estándar en lugar de una instancia de la entidad.
     * @return object|\entidadBase
     */
    public function obtenerUno($comoObjetoEstandar=false) {
        $this->constructor->establecerLimite(null,1);

        $this->construirConsulta(self::seleccionar);

        $resultado=$this->ejecutarConsulta();
        if(!$resultado) return null;

        $item=$resultado->siguiente();
        if(!$item) return null;

        return $this->filaAObjeto($item,$comoObjetoEstandar);
    }

    /**
     * Busque y devuelve el registro de ID `$id`, o `null`. Nótese que la búsqueda se combinará con otras condiciones preexistentes.
     * @param int $id ID a buscar.
     * @param bool $comoObjetoEstandar Si es `true`, devolverá un objeto estándar en lugar de una instancia de la entidad.
     * @return object|\entidadBase
     */
    public function obtenerItem($id,$comoObjetoEstandar=false) {
        $this->agregarCondicion('id','=',$id);

        $this->construirConsulta(self::seleccionar);

        $resultado=$this->ejecutarConsulta();
        if(!$resultado) return null;

        $item=$resultado->siguiente();
        if(!$item) return null;

        return $this->filaAObjeto($item,$comoObjetoEstandar);
    }

    /**
     * Ejecuta la consulta y devuelve el resultado crudo.
     * @return \datos\resultado
     */
    public function obtenerResultado() {
        $this->construirConsulta(self::seleccionar);
        return $this->ejecutarConsulta();
    }

    /**
     * Prepara la consulta.
     * @param int $operacion Operación a realizar (`modeloBase::seleccionar`, `modeloBase::actualizar`, `modeloBase::crear`,
     * `modeloBase::eliminar`, `modeloBase::contar`).
     * @return \modeloBase
     */
    public function preparar($operacion=self::seleccionar) {
        $this->construirConsulta($operacion);
        $this->bd->preparar($this->constructor);
        return $this;
    }

    /**
     * Establece que se va a reutilizar la consulta preparada con nuevos parámetros.
     * @param array|object|\entidadBase $parametros Nuevos valores a asignar.
     * @return \modeloBase
     */
    public function reutilizar($parametros) {
        $this->configReutilizarConsulta=$parametros;
        return $this;
    }

    /**
     * Realiza el bloqueo de tablas.
     * @param int $modo Modo (`modeloBase::soloLectura`, `modeloBase::lecturaEscritura`).
     * @param string ...$tablas Nombre de las tablas a bloquear. Opcional, si se omite, se realizará el bloqueo de la tabla de esta modelo
     * y de los modelos relacionados *hasta el momento*. Nótese que el bloqueo se ejecutará inmediatamente (no al realizar la consulta).
     * @return \modeloBase
     */
    public function bloquear($modo,...$tablas) {
        if(!count($tablas)) $tablas=$this->relaciones;

        //Convertir objetos [tabla,alias] o [modelo,alias] en arrays [tabla,alias]
        $bloquear=[];
        foreach($tablas as $tabla) {
            if($tabla->modelo) {
                $tabla=$tabla->modelo->obtenerTabla();
                $alias=$tabla->modelo->obtenerAlias();
            } else {
                $tabla=$tabla->$tabla;
                $alias=$tabla->alias;
            }
            
            $bloquear[]=[$tabla,$alias];
        }

        $this->bd->bloquear($modo,$tablas);
        
        return $this;        
    }

    /**
     * Desbloquea las tablas. Nótese que se desbloquearán inmediatamente (no luego de realizada la consulta).
     * @return \modeloBase
     */
    public function desbloquear() {
        $this->bd->desbloquear();
        return $this;
    }

    /**
     * Comienza una transacción. Nótese que la transacción comenzará inmediatamente (no al realizar la consulta).
     * @param int $modo Modo (`modeloBase::soloLectura`, `modeloBase::lecturaEscritura`).
     * @return \modeloBase
     */
    public function comenzarTransaccion($modo) {
        $this->bd->comenzarTransaccion($modo);
        return $this;
	}

    /**
     * Finaliza la transacción (*commit*). Nótese que la transacción finalizará inmediatamente (no luego de realizar la consulta).
     * @return \modeloBase
     */
	public function finalizarTransaccion() {
        $this->bd->finalizarTransaccion();
        return $this;
	}

    /**
     * Descarta la transacción (*rollback*). Nótese que la transacción finalizará inmediatamente (no luego de realizar la consulta).
     * @return \modeloBase
     */
	public function descartarTransaccion() {
        $this->bd->descartarTransaccion();
        return $this;
	}

    /**
     * Estima y devuelve la cantidad de registros que devolvería una consulta con la configuración actual.
     * @return int
     */
    public function estimarCantidad() {
        $this->construirConsulta(self::contar);

        $resultado=$this->ejecutarConsulta();
        if(!$resultado) return 0;

        $item=$resultado->siguiente();
        if(!$item) return 0;

        if($item->__cantidad) return $item->__cantidad;

        return $this->cantidadFilas;
    }

    /**
     * Actualiza el o los registros con los valores actualmente asignados.
     * @param int $id ID a actualizar. Opcional, si se omite, se utilizará el valor del campo `id`.
     * @return \modeloBase
     */
    public function actualizar($id=null) {
        if(!$this->valores) return $this;

        if($id) $this->valores->id=$id;
        $this->preprocesarRelacionesActualizacionInsercion(self::actualizar);
        $this->valores->prepararValores(self::actualizar);
        
        $this->construirConsulta(self::actualizar);
        
        $this->ejecutarConsulta();

        $this->procesarRelacionesActualizacionInsercion(self::actualizar);
        
        return $this;
    }

    /**
     * Crea el registro con los valores actualemnte asignados.
     * @return \modeloBase
     */
    public function crear() {
        if(!$this->valores) return $this;

        $this->valores->id=null;
        $this->preprocesarRelacionesActualizacionInsercion(self::actualizar);
        $this->valores->prepararValores(self::crear);
        
        $this->construirConsulta(self::crear);
        
        $this->ejecutarConsulta();

        $this->valores->id=$this->ultimoId;

        $this->procesarRelacionesActualizacionInsercion(self::crear);
        
        return $this;
    }
    
    /**
     * Elimina un registro.
     * @param int $id ID. Nótese que se combinará con cualquier condición preexistente.
     * @return \modeloBase
     */
    public function eliminar($id=null) {
        $this->establecerValores([
            'id'=>$id,
            'e'=>1
        ],true);
        $this->actualizar();
        return $this;
    }

    /**
     * Recupera (restaura) un registro eliminado.
     * @param int $id ID. Nótese que se combinará con cualquier condición preexistente.
     * @return \modeloBase
     */
    public function recuperar($id=null) {
        $this->establecerValores([
            'id'=>$id,
            'e'=>0
        ],true);
        $this->actualizar();
        return $this;
    }

    ////Gestión y construcción de consultas

    /**
     * Devuelve los detalles de la última consulta ejecutada.
     * @return object
     */
    public function obtenerUltimaConsulta() {
        return (object)[
            'consulta'=>$this->constructor->obtenerConsulta(),
            'error'=>$this->bd->obtenerError(),
            'numError'=>$this->bd->obtenerNumeroError(),
            'id'=>$this->ultimoId,
            'cantidad'=>$this->cantidadFilas
        ];
    }

    /**
     * Devuelve el tipo correspondiente a un campo de la entidad.
     * @param object $campo Parámetros del campo a evaluar.
     * @return int
     */
    protected function obtenerTipo($campo) {
        if(is_string($campo)) $campo=$this->campos->$campo;
        if($campo->tipo=='entero'||$campo->tipo=='entero sin signo'||$campo->tipo=='logico') return constructor::tipoEntero;
        if($campo->tipo=='decimal'||$campo->tipo=='decimal sin signo') return constructor::tipoDecimal;
        return constructor::tipoTexto;
    }

    /**
     * Agrega una condición.
     * @param string $campo Campo.
     * @param mixed $operador Operador de comparación (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modeloBase::como`, `modeloBase::noComo`).
     * @param mixed $valor Valor a comparar.
     * @param int $union Unión con la condición anterior, `modeloBase::y` (`AND`), `modeloBase::o` (`OR`), `modeloBase::ox` (`XOR`).
     * @param int $tipoCondicion Tipo de condición, `modeloBase::donde` (`WHERE`) o `modeloBase::teniendo` (`HAVING`).
     * @return \modeloBase
     */
    public function agregarCondicion($campo,$operador,$valor,$union=self::y,$tipoCondicion=self::donde) {
        if(!$operador) $operador='=';
        if(!is_integer($union)) $union=self::y;
        $alias=$this->alias;
        $parametrosCampo=null;
        $tipoValor=null;

        //Verificar si es un campo de un modelo foráneo (alias.campo)
        $p=strpos($campo,'.');
        if($p!==false) {            
            $alias=substr($campo,0,$p);
            $campo=substr($campo,$p+1);
        }        
        if($alias!=$this->alias) {
            foreach($this->relaciones as $relacion) {
                if($relacion->modelo->obtenerAlias()==$alias) {
                    $campos=$relacion->modelo->obtenerCampos();
                    if(property_exists($this->campos,$campo)) {
                        $parametrosCampo=$campos->$campo;
                        break;
                    }
                }
            }
        } elseif(property_exists($this->campos,$campo)) {
            $parametrosCampo=$this->campos->$campo;
        }
        
        if($parametrosCampo) {
            //Casos especiales: @contrasena y @busqueda
            if($alias==$this->alias) {
                if($parametrosCampo->contrasena&&$operador=='=') {
                    //No es una condición SQL; se validará luego de la consulta mediante password_verify()
                    $this->contrasena=(object)[
                        'campo'=>$campo,
                        'valor'=>$valor
                    ];
                    return $this;
                } elseif($parametrosCampo->busqueda) {
                    //Reemplazar la condición por la condición de búsqueda
                    return $this->agregarCondicionBusqueda($alias,$campo,$valor,$union);
                }
            }

            $tipoValor=$this->obtenerTipo($parametrosCampo);
        }

        $condicion=$this->constructor->fabricarCondicion()
            ->valor($union,$alias,$campo,$operador,$valor,$tipoValor)
            ->establecerTipo($tipoCondicion);

        $this->constructor->agregarCondicion($condicion);

        return $this;
    }

    /**
     * Agrega una condición para un campo de búsqueda (`@busqueda`).
     * @param string $alias Alias.
     * @param string $campo Nombre del campo.
     * @param string $valor Valor a buscar.
     * @param int $union Unión con la condición anterior, `modeloBase::y` (`AND`), `modeloBase::o` (`OR`), `modeloBase::ox` (`XOR`).
     * @param int $tipoCondicion Tipo de condición, `modeloBase::donde` (`WHERE`) o `modeloBase::teniendo` (`HAVING`).
     * @return \modeloBase
     */
    public function agregarCondicionBusqueda($alias,$campo,$valor,$union,$tipoCondicion=self::donde) {
        //Por el momento el algoritmo de búsqueda consiste en simplemente comparar palabra por palabra el valor almacenado como caché en la columna
        //TODO Búsqueda fonética

        $this->abrirGrupo($union);

        $palabras=explode(' ',$valor);
        foreach($palabras as $palabra) {
            $palabra=trim($palabra);
            if(strlen($palabra)<=3||preg_match('/^\d+$/',$palabra)) continue;
            
            $condicion=$this->constructor->fabricarCondicion()
                ->valor(condicion::operadorO,$alias,$campo,condicion::operadorComo,'%'.$palabra.'%',constructor::tipoTexto)
                ->establecerTipo($tipoCondicion);
    
            $this->constructor->agregarCondicion($condicion);
        }

        $this->cerrarGrupo();
    
        return $this;
    }

    /**
     * Agrega una condición como un fragmento de código SQL.
     * @param string $sql Código SQL.
     * @param array $parametros Parámetros utilizados en la sentencia, como `['nombre'=>valor]`.
     * @param array $tipos Tipos de los valores, como `['nombre'=>tipo]` (ver constantes `constructor::tipo`).  Opcional; si
     * se omite, se estimarán los tipos automáticamente.
     * @param int $union Unión con la condición anterior, `modeloBase::y` (`AND`), `modeloBase::o` (`OR`), `modeloBase::ox` (`XOR`).
     * @param int $tipoCondicion Tipo de condición, `modeloBase::donde` (`WHERE`) o `modeloBase::teniendo` (`HAVING`).
     * @return \modeloBase
     */
    public function agregarCondicionSql($sql,$parametros=null,$tipos=null,$union=self::y,$tipo=condicion::donde) {
        $condicion=$this->constructor->fabricarCondicion()
            ->sql($union,$sql,$parametros,$tipos)
            ->establecerTipo($tipo);

        $this->constructor->agregarCondicion($condicion);

        return $this;
    }

    /**
     * Agrega una relación con un modelo foráneo.
     * @param int $tipo Tipo de relación, `relacion::izquierda` (`LEFT JOIN`), `relacion::derecha` (`RIGHT JOIN`),
     * `relacion::interior` (`INNER JOIN`).
     * @param \modeloBase $modelo Instancia del modelo.
     * @param string $alias Alias.
     * @param string $campo Nombre del campo local.
     * @param string $campoForaneo Nombre del campo foráneo.
     * @return \modeloBase
     */
    public function agregarRelacion($tipo,$modelo,$alias,$campo,$campoForaneo) {
        $condicion=$this->constructor->fabricarCondicion()
            ->campo(null,$this->alias,$campo,'=',$alias,$campoForaneo);

        $relacion=$this->constructor->fabricarRelacion()
            ->establecer($tipo,$modelo->obtenerTabla(),$alias,$condicion);

        $this->constructor->agregarRelacion($relacion);

        $this->agregarTodosLosCampos($modelo,$alias);

        return $this;
    }

    /**
     * Agrega una relación cuya condición (`ON ...`) es un fragmento de código SQL.
     * @param int $tipo Tipo de relación, `relacion::izquierda` (`LEFT JOIN`), `relacion::derecha` (`RIGHT JOIN`),
     * `relacion::interior` (`INNER JOIN`).
     * @param \modeloBase $modelo Instancia del modelo.
     * @param string $alias Alias.
     * @param string $condicion Código SQL de la condición.
     * @param array $parametros Parámetros utilizados en la sentencia, como `['nombre'=>valor]`.
     * @param array $tipos Tipos de los valores, como `['nombre'=>tipo]` (ver constantes `constructor::tipo`).  Opcional; si
     * se omite, se estimarán los tipos automáticamente.
     * @return \modeloBase
     */
    public function agregarRelacionSql($tipo,$modelo,$alias,$condicion,$parametros=null,$tipos=null) {
        $condicion=$this->constructor->fabricarCondicion()
            ->sql(null,$condicion,$parametros,$tipos);

        $relacion=$this->constructor->fabricarRelacion()
            ->establecer($tipo,$modelo->obtenerTabla(),$alias,$condicion);

        $this->constructor->agregarRelacion($relacion);

        $this->agregarTodosLosCampos($modelo,$alias);

        return $this;
    }

    /**
     * Ejecuta la sentencia construída.
     * @return \datos\resultado
     */
    protected function ejecutarConsulta() {
        if($this->configReutilizarConsulta&&$this->resultado) {
            $this->resultado=$this->bd
                ->establecer($this->resultado)
                ->actualizarParametros($this->configReutilizarConsulta)
                ->ejecutar();
        } else {
            $this->resultado=$this->bd
                ->consulta($this->constructor);
        }

        if($this->resultado) {
            $this->ultimoId=$this->resultado->obtenerId();
            $this->cantidadFilas=$this->resultado->obtenerNumeroFilas();
        }

        return $this->resultado;
    }

    /**
     * Agrega todos los campos a la próxima operación de selección.
     * @param \modeloBase $modelo Modelo del cual extraer el listado de campos. Opcional; si se omite, se asume el modelo actual.
     * @param string $alias Alias del modelo. Opcional; si se omite, se obtendrá de `$modelo`.
     * @return \modeloBase
     */
    public function agregarTodosLosCampos($modelo=null,$alias=null) {
        if(!$modelo) $modelo=$this;
        if(!$alias) $alias=$modelo->obtenerAlias();

        foreach($modelo->obtenerCampos() as $campo) {
            if($campo->relacional||($campo->oculto&&!$this->configObtenerOcultos)) continue;
            $this->constructor->seleccionarCampo($alias,$campo->nombre,'__'.$alias.'_'.$campo->nombre);
        }

        return $this;
    }

    /**
     * Prepara el constructor para una operación de selección estándar.
     * @return \modeloBase
     */
    protected function prepararSeleccionPredeterminada() {
        //Por defecto seleccionar todos los campos
        if(!count($this->constructor->obtenerCampos()))
            $this->agregarTodosLosCampos();

        if(!$this->configSeleccionarEliminados) $this->agregarCondicion('e','=','0');

        return $this;
    }

    /**
     * Procesa una fila o registro de resultados.
     * @param object $fila Fila.
     * @param bool $comoObjetoEstandar Si es `false`, devolverá una instancia de la entidad.
     * @param \modeloBase $modelo Modelo del cual extraer el listado de campos. Opcional; si se omite, se asume el modelo actual.
     * @param bool $procesarRelaciones Solo si es `true` se procesarán los campos relacionales.
     * @return object|\entidadBase
     */
    protected function filaAObjeto($fila,$comoObjetoEstandar=false,$modelo=null,$procesarRelaciones=true) {
        if(!$modelo) $modelo=$this;

        $objeto=$modelo->fabricarEntidad();
        $alias=$modelo->obtenerAlias();
        $campos=$modelo->obtenerCampos();
        
        foreach($campos as $campo) {
            $nombre=$campo->nombre;
            $propiedad='__'.$alias.'_'.$nombre;

            if($campo->relacional&&$campo->relacion=='1:n') {
                $objeto->$nombre=[];
            } else {
                $objeto->$nombre=null;
            }

            $valor=$fila->$propiedad;
            if(!$valor) continue;

            //Omitir valores de campos de contraseña y búsqueda
            if($campo->contrasena) {
                if($this->contrasena&&$this->contrasena->campo==$nombre&&
                    !password_verify($this->contrasena->valor,$valor)) {
                        $this->cantidadFilas--;
                        return null;
                }
                continue;
            }                
            if($campo->busqueda) continue;

            $objeto->$nombre=$valor;
        }

        if($procesarRelaciones) {
            foreach($this->relaciones as $relacion) {
                $campo=$relacion->campo;
                $objeto->$campo=$this->filaAObjeto($fila,$comoObjetoEstandar,$relacion->modelo,false);
            }

            $this->procesarRelacionesSeleccion($objeto,$comoObjetoEstandar);
        }

        if($comoObjetoEstandar) $objeto=$objeto->obtenerObjeto();

        return $objeto;
    }

    /**
     * Procesa los campos relacionales tras una operación de selección.
     * @param object|\entidadBase Objeto con los valores del registro o instancia de la entidad.
     * @param bool $comoObjetoEstandar Si es `false`, devolverá una instancia de la entidad.
     * @return object|\entidadBase
     */
    public function procesarRelacionesSeleccion(&$objeto,$comoObjetoEstandar=false) {
        if(!$this->configProcesarRelaciones||!$this->configProcesarRelaciones1N) return $this;

        foreach($this->campos as $campo) {
            if(!$campo->relacional||$campo->relacion!='1:n') continue;
            
            $modelo=$this->fabricarModeloCampo($campo);

            //Configurar modelo foráneo para que no se procesen las relaciones recursivamente y respete
            //la configuración de esta instancia
            $modelo->omitirRelaciones();
            if($this->configObtenerOcultos) $modelo->obtenerOcultos();
            if($this->configSeleccionarEliminados) $modelo->seleccionarEliminados();

            if($campo->orden) $modelo->ordenar($campo->orden);
            
            $nombre=$campo->nombre;
            $objeto->$nombre=$modelo
                ->donde([$campo->campo=>$objeto->id])
                ->obtenerListado($comoObjetoEstandar);
        }

        return $this;
    }

    /**
     * Finaliza la configuración y construye la consulta. Nótese que por el momento *ignora `modeloBase::eliminar`* (todas las bajas
     * son bajas lógicas, que son en realidad actualizaciones del campo `e`).
     * @param int $operacion Operación (`modeloBase::seleccionar`, etc.).
     * @return \modeloBase
     */
    protected function construirConsulta($operacion) {
        $this->ultimoId=null;
        $this->cantidadFilas=0;

        $this->constructor->establecerEsquema($this->_tabla,$this->alias);

        if(($operacion==self::seleccionar||$operacion==self::contar)&&!$this->consultaConstruida) {
            $this->prepararSeleccionPredeterminada();
            $this->agregarRelaciones();
        }

        if(($operacion==self::crear||$operacion==self::actualizar)&&!$this->consultaConstruida) {
            if($operacion==self::crear) {
                $this->valores->id=null;
                $this->valores->e=0;
            } elseif(!count($this->constructor->obtenerCondiciones())&&$this->valores->id) {
                $this->agregarCondicion('id','=',$this->valores->id);
            }

            $this->agregarValores();
        }

        $this->constructor->construirConsulta($operacion);
        
        $this->consultaConstruida=true;

        return $this;
    }

    /**
     * Agrega todas las relaciones correspondientes a los campos relacionales de la entidad.
     * @return \modeloBase
     */
    protected function agregarRelaciones() {
        //Por defecto, todas las relaciones se realizan, a menos que:
        //- Se invoque modelo::omitirRelaciones()
        //- El campo relacional presente @omitir (o @simple en el caso de operaciones de inserción/actualización)
        //- Si el campo relacional presenta @siempre, o es invocado modelo::forzarRelaciones(campo), la realación se
        //  procesará de todos modos

        foreach($this->campos as $campo) {
            if(!$campo->relacional||$campo->relacion=='1:n') continue;

            $siempre=$campo->siempre||in_array($campo->nombre,$this->configForzarRelaciones);
            $omitir=!$this->configProcesarRelaciones||$campo->omitir||($campo->oculto&&!$this->configObtenerOcultos);

            if($omitir&&!$siempre) continue;

            $modelo=$this->fabricarModeloCampo($campo);

            if($campo->alias) {
                $alias=$campo->alias;
            } else {
                $alias=++$this->contadorAlias;
                $alias='t'.$alias;
            }
            $modelo->establecerAlias($alias);

            if($campo->relacion=='1:1') {
                $tipo=self::relacion11;
            } elseif($campo->relacion=='1:0') {
                $tipo=self::relacion10;
            } else {
                $tipo=self::relacion1N;
            }
            
            $this->agregarRelacion($tipo,$modelo,$alias,$campo->campo,'id');

            $this->relaciones[]=(object)[
                'modelo'=>$modelo,
                'campo'=>$campo->nombre
            ];
        }

        return $this;
    }

    /**
     * Agrega todos los valores correspondientes a la entidad asignada.
     * @return \modeloBase
     */
    protected function agregarValores() {
        if(!$this->valores) return $this;

        //Construir un cache de todos los campos relacionados a un campo de búsqueda
        $busqueda=[];
        foreach($this->campos as $campo) {
            if(!$campo->busqueda) continue;
            $campos=explode(',',$campo->busqueda);
            foreach($campos as $c)
                $busqueda[trim($c)]=$campo->nombre;
        }

        $actualizarBusqueda=[];

        foreach($this->campos as $campo) {
            //Ignorar campos especiales
            if($campo->relacional||$campo->busqueda||$campo->nombre=='id') continue;

            $nombre=$campo->nombre;
            if(!property_exists($this->valores,$nombre)||$this->valores->$nombre===null) continue;

            $valor=$this->valores->$nombre;
            
            //Caso especial: Contraseña
            if($campo->contrasena) $valor=password_hash($valor,PASSWORD_DEFAULT);

            //Caso especial: Si el campo es parte de otro campo de búsqueda, se debe reconstruir el caché
            if(array_key_exists($nombre,$busqueda)) {
                $campoBusqueda=$busqueda[$nombre];
                if(!in_array($campoBusqueda,$actualizarBusqueda)) $actualizarBusqueda[]=$campoBusqueda;
            }

            $tipo=$this->obtenerTipo($campo);

            $this->constructor->asignarCampo($nombre,$valor,$tipo);
        }

        //Agregar los campos de búsqueda cuyos orígenes hayan cambiado
        foreach($actualizarBusqueda as $nombre) {
            $campo=$this->campos->$nombre;
            $campos=explode(',',$campo->busqueda);
            $valores='';

            foreach($campos as $campo2) {
                $campo2=trim($campo2);
                if(property_exists($this->valores,$campo2)&&is_string($this->valores->$campo2))
                    $valores.=($valores?' ':'').$this->valores->$campo2;
            }

            $valor=$this->construirValorBusqueda($valores);
            $this->constructor->asignarCampo($nombre,$valor,constructor::tipoTexto);
        }

        return $this;
    }

    /**
     * Construye el valor final a almacenar en una columna de búsqueda.
     * @param string $cadena Cadena a procesar.
     * @return string
     */
    protected function construirValorBusqueda($cadena) {
        //TODO Búsqueda fonética (soundex / metaphone)
        $palabras=explode(' ',$cadena);
        $valor=[];
        foreach($palabras as $palabra) {
            if(strlen($palabra)<=3||is_numeric($palabra)) continue;
            $valor[]=trim(mb_strtoupper($palabra));
        }
        return implode(' ',$valor);
    }

    /**
     * Procesa los campos relacionales previo a ejecutar la consulta.
     * @param int $operacion Operación que se realizará en la consulta (`modeloBase::seleccionar`, etc.).
     * @return \modeloBase
     */
    protected function preprocesarRelacionesActualizacionInsercion($operacion) {
        //Previo a actualizar o crear un registro:
        //- Las relaciones 1:0 y 1:1 se deben crear (si no existen) o actualizar
        //- Si el campo presenta @simple, siempre será ignorado
        //- Si el valor del campo @campo es nulo, si tiene un objeto asignado debe procesarse, si no, se ignora.
        //- Los distintos elementos de las relaciones 1:N también se crean (si no existen) o actualizan
        //- Si el campo presenta @eliminar o está activo eliminarRelacionados y cambió el valor del campo, se eliminará el registro foráneo

        if(!$this->configProcesarRelaciones) return $this;

        //Al actualizar, necesitamos los valores actuales
        $valoresPrevios=null;
        if($operacion==self::actualizar)
            $valoresPrevios=$this->valores->fabricarModelo()->obtenerItem($this->valores->id);

        foreach($this->campos as $nombre=>$campo) {
            if(!$campo->relacional||$campo->simple||($campo->relacion!='1:1'&&$campo->relacion!='1:0')) continue;

            $nombreCampoValor=$campo->campo;
            $valor=$this->valores->$nombreCampoValor;
            $objeto=$this->valores->$nombre;
            if(is_array($objeto)) $objeto=(object)$objeto;

            if($valor===null&&!is_object($objeto)) continue;
            
            $modelo=$this->fabricarModeloCampo($campo);

            $id=is_object($objeto)&&$objeto->id!==null?
                $objeto->id:
                $valor;

            $idPrevio=$valoresPrevios?
                $valoresPrevios->$nombreCampoValor:
                null;

            if($idPrevio!==null&&$id!=$idPrevio&&($this->configEliminarRelacionados||$campo->eliminar)) {
                //Eliminar

                $modelo->eliminar($idPrevio);

                if($id===0||$id==='0') {
                    //Si id es 0, se elimina toda relación; en caso contrario se reemplazará por una relación nueva
                    $id=null;
                    $objeto=null;
                    $this->valores->$nombre=null;
                    $this->valores->$nombreCampoValor=null;
                }
            }

            if($id&&is_object($objeto)) {
                //Registro existente, actualizar

                $objeto->id=$id;
                $modelo
                    ->reiniciar()
                    ->omitirRelaciones()
                    ->establecerValores($objeto)
                    ->actualizar();
                
                $this->valores->$nombre=$id;

                continue;
            }

            if($id===null&&is_object($objeto)) {
                //Registro inexistente, crear

                $modelo
                    ->reiniciar()
                    ->omitirRelaciones()
                    ->establecerValores($objeto)
                    ->crear();
                
                $this->valores->$nombre=$modelo->obtenerEntidad();
                $this->valores->$nombreCampoValor=$modelo->obtenerId();
            }
        }

        return $this;
    }

    /**
     * Procesa los campos relacionales postarior a la ejecución de la consulta.
     * @param int $operacion Operación que se realizó (`modeloBase::seleccionar`, etc.).
     * @return \modeloBase
     */
    protected function procesarRelacionesActualizacionInsercion($operacion) {
        //Al actualizar o crear un registro:
        //- Si el campo presenta @simple, siempre será ignorado
        //- En relaciones 1:n, si el valor es nulo, cualquier otro valor se toma como array (si presenta un valor que no es array, se asume [])
        //- Los distintos elementos de las relaciones 1:n se crean (si no existen) o actualizan
        //Al actualizar un registro:
        //- Si el campo presenta @eliminar o está activo eliminarRelacionados, los elementos que se hayan removido de las
        //  relaciones 1:n también se eliminan en la tabla foránea

        if(!$this->configProcesarRelaciones||!$this->configProcesarRelaciones1N) return $this;

        foreach($this->campos as $nombre=>$campo) {
            if(!$campo->relacional||$campo->simple||$campo->relacion!='1:n') continue;

            $modelo=$this->fabricarModeloCampo($campo);

            $crearActualizar=[];
            $preservar=[];
            
            $nombreCampo=$campo->campo;
            $listado=$this->valores->$nombre;
            if($listado===null) continue;
            if(!is_array($listado)) $listado=[];

            foreach($listado as $item) {
                if(!is_object($item)&&!is_array($item)) continue;
                if(is_array($item)) $item=(object)$item;

                if($item->id) $preservar[]=$item->id;
                $crearActualizar[]=$item;
            }

            if($this->configEliminarRelacionados||$campo->eliminar) {
                //Eliminar todo lo que no esté en $preservar

                $modelo
                    ->omitirRelaciones()
                    ->establecerAlias('m')
                    ->donde($nombreCampo,$this->valores->id)
                    ->yDonde('id',condicion::operadorNoEn,$preservar)
                    ->eliminar();
            }

            foreach($crearActualizar as $item) {
                $item->$nombreCampo=$this->valores->id;

                $modelo
                    ->reiniciar()
                    ->omitirRelaciones()
                    ->establecerValores($item)
                    ->guardar();
            }
        }

        return $this;
    }
}
