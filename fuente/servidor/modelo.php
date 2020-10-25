<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//NOTA: Esta clase está siendo migrada desde Foxtrot 6. Hay mucho que debe revisarse en cuanto a eficiencia, código limpio, documentación, spanglish y seguridad/visibilidad.

defined('_inc') or exit;

/**
 * Valor nulo. Permite insertar un valor NULL en la base de datos, a diferencia de un valor NULL real, que es ignorado.
 */
class nulo {
}

/**
 * Clase base de los repositorios del modelo de datos.
 */
class modelo {
    /**
     * @var bd $bd
     * @var resultado $resultado
     */
    protected $bd;
    protected $resultado;

    protected $nombreModelo;
    protected $nombre;
    protected $tipoEntidad;
    protected $campos;
    
    protected $consultaColumnas=null;
    protected $consultaCondiciones=[];
    protected $consultaAgrupar=[];
    protected $consultaTeniendo=[];
    protected $consultaRelaciones=[];
    protected $consultaLimite=null;
    protected $consultaCantidad=null;
    protected $consultaOrden=[];
    protected $consultaValores=null;

    protected $sql=null;
    protected $parametros=null;
    protected $tipos=null;
    protected $alias='t1';

    protected $consultaProcesarRelaciones=true;
    protected $consultaProcesarRelaciones1n=true;
    protected $consultaOmitirRelacionesCampos=[];
    protected $consultaSeleccionarEliminados=false;
    protected $consultaIncluirOcultos=false;

    protected $consultaPreparada=false;
    protected $reutilizarConsultaPreparada=false;

    protected $ultimoId=null;

    /**
     * 
     */
    function __construct($bd=null) {
        $this->bd=$bd?$bd:foxtrot::obtenerInstanciaBd();
        
        $nombre=get_called_class();
        $this->nombreModelo=substr($nombre,strrpos($nombre,'\\')+1);
        if(!$this->nombre) $this->nombre=$this->nombreModelo;

        $this->cargarEstructura();
    }

    /**
     * Crea y devuelve una instancia de la entidad de este modelo.
     */
    public function fabricarEntidad($fila=null) {
        $obj=new $this->tipoEntidad;

        if($fila) {
            foreach($this->campos as $nombre=>$campo) {
                $aliasCampo='__'.$this->alias.'_'.$nombre;

                if($campo->tipo=='relacional') {
                    if($campo->relacion=='1:n') $obj->$nombre=[];
                } else {
                    $obj->$nombre=$fila->$aliasCampo;
                }
            }

            if($this->consultaProcesarRelaciones) {
                //Asignar valores existentes en la consulta
                foreach($this->consultaRelaciones as $relacion) {
                    $campo=$relacion->campo;
                    $obj->$campo=$relacion->modelo->fabricarEntidad($fila);
                    //Si no hubo coincidencias, mantener el campo nulo
                    if(!$obj->$campo->id) $obj->$campo=null;
                }
                //Procesar valores adicionales (recursividad, 1:n)
                $this->procesarRelaciones($obj,false,$this->consultaProcesarRelaciones1n);
            }

            $obj->procesarValores();
        }

        return $obj;
    }

    /**
     * Devuelve el nombre de la tabla.
     * @return string
     */
    public function obtenerNombreTabla() {
        return $this->nombre;
    }

    /**
     * Devuelve el nombre del modelo.
     * @return string
     */
    public function obtenerNombre() {
        return $this->nombreModelo;
    }

    /**
     * Devuelve el nombre de las entidades.
     * @return string
     */
    public function singular() {
        return substr($this->tipoEntidad,strrpos($this->tipoEntidad,'\\')+1);
    }

    /**
     * Crea y devuelve una instancia del modelo especificado.
     */
    public static function fabricarModelo($modelo,$bd=null) {       
        $modelo='\\aplicaciones\\'._apl.'\\modelo\\'.$modelo;
        return new $modelo($bd);
    }

    /**
     * Carga la configuración desde los metadatos de la clase de la entidad.
     */
    protected function cargarEstructura() {
        $this->campos=$this->tipoEntidad::obtenerCampos();
    }

    /**
     * Devuelve los campos de las entidades de este modelo.
     */
    public function obtenerCampos() {
        return $this->campos;
    }

    /**
     * Reinicia el repositorio.
     */
    public function reiniciar() {
        $this->consultaColumnas=null;
        $this->consultaCondiciones=[];
        $this->consultaAgrupar=[];
        $this->consultaTeniendo=[];
        $this->consultaRelaciones=[];
        $this->consultaLimite=null;
        $this->consultaCantidad=null;
        $this->consultaOrden=[];
        $this->consultaValores=null;

        $this->consultaPreparada=false;
        $this->reutilizarConsultaPreparada=false;

        $this->sql=null;
        $this->alias='t1';
        $this->consultaProcesarRelaciones=true;
        $this->consultaProcesarRelaciones1n=true;
        $this->consultaOmitirRelacionesCampos=[];
        $this->consultaSeleccionarEliminados=false;
        //$this->consultaIncluirOcultos=false;

        $this->ultimoId=null;

        return $this;
    }

    /**
     * Devuelve el código de la última consulta realizada.
     */
    public function obtenerUltimaConsulta() {
        return (object)[
            'sql'=>$this->sql,
            'sqlPublico'=>$this->mostrarSql(),
            'parametros'=>$this->parametros,
            'tipos'=>$this->tipos,
            'error'=>$this->bd->obtenerError(),
            'bd'=>$this->bd,
            'resultado'=>$this->resultado
        ];
    }

    /**
     * Devuelve la última consulta SQL ejecutada en formato para exportar.
     * @return string
     */
    protected function mostrarSql() {
        $sql=$this->bd->reemplazarPrefijo($this->sql);
        $resultado='';
        $parametro=0;

        //Buscar ?
        $enComillas=false;
        for($i=0;$i<strlen($sql);$i++) {
            $caracter=$sql[$i];
            if(!$enComillas) {
                if($caracter=='\'') {
                    $enComillas='\'';
                } elseif($caracter=='"') {
                    $enComillas='"';
                } elseif($caracter=='?') {
                    $tipo=$this->tipos[$parametro];
                    $valor=$this->parametros[$parametro];
                    $parametro++;
                    if($tipo=='i'||$tipo=='d') {
                        $resultado.=$valor;
                    } else {
                        $resultado.='"'.$this->bd->escape($valor).'"';
                    }
                    continue;
                }
            } elseif($caracter==$enComillas) {
                $enComillas=false;
            }
            $resultado.=$caracter;
        }

        return $resultado;
    }

    /**
     * Devuelve el ID de la entidad. Tras la inserción de una fila, será el último ID insertado.
     * @return int|null
     */
    public function obtenerId() {
        if($this->ultimoId) return $this->ultimoId;
        if($this->consultaValores) return $this->consultaValores->id;
        return null;
    }

    /**
     * Alias de obtenerId().
     * @return int|null
     */
    public function id() {
        return $this->obtenerId();
    }

    /**
     * Establece los campos a seleccionar.
     */
    public function seleccionar(...$campos) {
        $this->consultaColumnas=$campos;
        return $this;
    }
    
    /**
     * Establece el alias para la próxima consulta.
     */
    public function establecerAlias($alias) {
        $this->alias=$alias;
        return $this;
    }

    /**
     * Establece una relación con otro modelo, dado su nombre, clase o instancia. Pueden insertarse parámetros adicionales en la condición con el formato :nombre.
     */
    public function relacionar($campo,$tipo,$modelo,$alias,$condicion,$parametros=null) {
        if(is_string($modelo)) $modelo=self::fabricarModelo($modelo,$this->bd);

        if($alias) $modelo->establecerAlias($alias);

        $this->consultaRelaciones[$alias]=(object)[
            'tipo'=>$tipo,
            'modelo'=>$modelo,
            'condicion'=>$condicion,
            'parametros'=>$parametros,
            'campo'=>$campo
        ];
        return $this;
    }

    /**
     * Establece una relación 1:1 con otro modelo, dado su nombre, clase o instancia. Pueden insertarse parámetros adicionales en la condición con el formato :nombre.
     */
    public function relacionarUnoAUno($campo,$modelo,$alias,$condicion,$parametros=null) {
        return $this->relacionar($campo,'1:1',$modelo,$alias,$condicion,$parametros);
    }

    /**
     * Establece una relación 1:0 con otro modelo, dado su nombre, clase o instancia. Pueden insertarse parámetros adicionales en la condición con el formato :nombre.
     */
    public function relacionarUnoAUnoNulo($campo,$modelo,$alias,$condicion,$parametros=null) {
        return $this->relacionar($campo,'1:0',$modelo,$alias,$condicion,$parametros);
    }

    /**
     * Establece una relación 1:n con otro modelo, dado su nombre, clase o instancia. Pueden insertarse parámetros adicionales en la condición con el formato :nombre.
     */
    public function relacionarUnoAMuchos($campo,$modelo,$alias,$condicion,$parametros=null) {
        return $this->relacionar($campo,'1:n',$modelo,$alias,$condicion,$parametros);
    }

    /**
     * Omite los campos relacionales.
     * @var string $campos Si se especifica al menos un argumento, omitirá únicamente el procesamiento de estos campos. En caso contrario, se omitirán todos los campos relacionales.
     */
    public function omitirRelaciones(...$campos) {
        if(count($campos)) {
            foreach($campos as $campo) $this->consultaOmitirRelacionesCampos[]=$campo;
        } else {
            $this->consultaProcesarRelaciones=false;
        }
        return $this;
    }

    /**
     * Omite solo las relaciones 1:n.
     */
    public function omitirRelacionesUnoAMuchos() {
        $this->consultaProcesarRelaciones1n=false;
        return $this;
    }

    /**
     * Incluye los valores de campos ocultos en la próxima consulta.
     * @return \modelo
     */
    public function incluirOcultos() {
        $this->consultaIncluirOcultos=true;
        return $this;
    }

    /**
     * Excluye los valores de campos ocultos en la próxima consulta.
     * @return \modelo
     */
    public function excluirOcultos() {
        $this->consultaIncluirOcultos=false;
        return $this;
    }

    /**
     * Permite que se seleccionen registros eliminados en la próxima consulta.
     */
    public function seleccionarEliminados() {
        $this->consultaSeleccionarEliminados=true;
        return $this;
    }

    /**
     * Procesa los campos relacionados sobre la instancia especificada luego de haber realizado una consulta con las relaciones desactivadas, o cuando la entidad tenga
     * campos con @omitir.
     * @var \entidad $item Item a procesar.
     * @var bool $procesarOmitidos Procesar los campos con @omitir.
     * @var bool $procesar1n Procesar las relaciones 1:n.
     * @return \modelo
     */
    public function procesarRelaciones($item,$procesarOmitidos=true,$procesar1n=true) {
        //TODO Detectar si el item ya apareció en la ascendencia, lo que daría lugar a un bucle infinito
        //Por el momento se limita por nivel de recursividad
        if(count(debug_backtrace(0))>50) return $this; 

        //-Caminar el árbol de relaciones en busca de campos que no hayan sido relacionados (por ejemplo, relacionados con el mismo modelo)
        //-Generar los listados de relaciones 1:n
        foreach($this->campos as $nombre=>$campo) {
            if($campo->tipo=='relacional') {
                if(!$procesarOmitidos&&($campo->omitir||in_array($nombre,$this->consultaOmitirRelacionesCampos))) continue;

                if($campo->relacion=='1:n') {
                    if(!$procesar1n) continue;

                    $modelo=modelo::fabricarModelo($campo->modelo,$this->bd);
                    $modelo->donde([
                        $campo->columna=>$item->id
                    ]);
                    if($campo->orden) {
                        $orden=explode(' ',$campo->orden);
                        $modelo->ordenadoPor($orden[0],$orden[1]);
                    }
                    $item->$nombre=$modelo->obtenerListado();
                } else {
                    $columna=$campo->columna;
                    if($item->$columna&&!$item->$nombre) {
                        //Hay un valor en la columna pero no en el campo relacional
                        $modelo=modelo::fabricarModelo($campo->modelo,$this->bd);
                        $relacion=$modelo->obtenerItem($item->$columna);
                        if($relacion) {
                            $item->$nombre=$relacion;
                            $modelo->procesarRelaciones($relacion,$procesarOmitidos,$procesar1n);
                        }
                    } 
                }
            }
        }

        return $this;
    }

    /**
     * Agrega una condición.
     * @var string $condicion Condición como cadena SQL. Pueden insertarse parámetros con el formato @nombre.
     * @var object $parametros Array parámetro/valor.
     */
    /**
     * Agrega una condición.
     * @var object $condicion Array campo=>valor a utilizar como filtro.
     */
    /**
     * Agrega una condición.
     * @var object $condicion Instancia de la entidad cuyos campos se utilizarán como filtro.
     */
    public function donde($condicion,$parametros=null) {
        $this->consultaCondiciones[]=$this->generarCondicion($condicion,$parametros);
        return $this;
    }

    /**
     * Agrega una condición.
     * @var object $condicion Nombre del campo a filtrar.
     * @var string $operador Operador, como cadena ('<','<=','<>','>','>=','like').
     * @var mixed $valor Valor a evaluar.
     *//**
     * Agrega una condición.
     * @var object $condicion Array campo=>valor a utilizar como filtro.
     * @var string $operador Operador, como cadena ('<','<=','<>','>','>=','like').
     *//**
     * Agrega una condición.
     * @var object $condicion Instancia de la entidad cuyos campos se utilizarán como filtro.
     * @var string $operador Operador, como cadena ('<','<=','<>','>','>=','like').
     */
    public function dondeComparar($condicion,$operador,$valor=null) {
        $this->consultaCondiciones[]=$this->generarCondicion($condicion,$valor,'and',$operador);
        return $this;
    }

    /**
     * Agrega una condición OR.
     * @var string $condicion Condición como cadena SQL. Pueden insertarse parámetros con el formato @nombre.
     * @var object $parametros Array parámetro/valor.
     */
    /**
     * Agrega una condición OR.
     * @var object $condicion Array campo=>valor a utilizar como filtro.
     */
    /**
     * Agrega una condición OR.
     * @var object $condicion Instancia de la entidad cuyos campos se utilizarán como filtro.
     */
    public function oDonde($condicion,$parametros=null) {
        $this->consultaCondiciones[]=$this->generarCondicion($condicion,$parametros,'or');
        return $this;
    }

    /**
     * Agrega una condición.
     * @var object $condicion Nombre del campo a filtrar.
     * @var string $operador Operador, como cadena ('<','<=','<>','>','>=','like').
     * @var mixed $valor Valor a evaluar.
     *//**
     * Agrega una condición.
     * @var object $condicion Array campo=>valor a utilizar como filtro.
     * @var string $operador Operador, como cadena ('<','<=','<>','>','>=','like').
     *//**
     * Agrega una condición.
     * @var object $condicion Instancia de la entidad cuyos campos se utilizarán como filtro.
     * @var string $operador Operador, como cadena ('<','<=','<>','>','>=','like').
     */
    public function oDondeComparar($condicion,$operador,$valor=null) {
        $this->consultaCondiciones[]=$this->generarCondicion($condicion,$valor,'or',$operador);
        return $this;
    }

    /**
     * Agrega una condición negativa (los valores deben ser distintos al filtro).
     * @var object $condicion Array u objeto campo=>valor a utilizar como filtro.
     */
    /**
     * Agrega una condición negativa (los valores deben ser distintos a los de la entidad).
     * @var object $condicion Instancia de la entidad cuyos campos se utilizarán como filtro.
     */
    public function dondeNo($condicion,$valor=null) {
        $this->consultaCondiciones[]=$this->generarCondicion($condicion,$valor,'and','<>');
        return $this;
    }

    /**
     * Agrega una condición negativa (los valores deben ser distintos al filtro) OR.
     * @var object $condicion Array u objeto campo=>valor a utilizar como filtro.
     */
    /**
     * Agrega una condición negativa (los valores deben ser distintos a los de la entidad) OR.
     * @var object $condicion Instancia de la entidad cuyos campos se utilizarán como filtro.
     */
    public function oDondeNo($condicion,$valor=null) {
        $this->consultaCondiciones[]=$this->generarCondicion($condicion,$valor,'or','<>');
        return $this;
    }

    /**
     * Agrega una condición IN().
     * @var string $campo Campo.
     * @var array $valores Listado de valores posibles.
     */
    public function dondeEn($campo,$valores) {
        if(!is_array($valores)||!count($valores)) return $this;     
        $this->consultaCondiciones[]=$this->generarCondicion($campo,$valores,'and','in');
        return $this;
    }

    /**
     * Agrega una condición NOT IN() (negado).
     * @var string $campo Campo.
     * @var array $valores Listado de valores a excluir.
     */
    public function dondeNoEn($campo,$valores) {    
        if(!is_array($valores)||!count($valores)) return $this;    
        $this->consultaCondiciones[]=$this->generarCondicion($campo,$valores,'and','not in');
        return $this;
    }

    /**
     * Agrega una condición OR IN().
     * @var string $campo Campo.
     * @var array $valores Listado de valores posibles.
     */
    public function oDondeEn($campo,$valores) {  
        if(!is_array($valores)||!count($valores)) return $this;      
        $this->consultaCondiciones[]=$this->generarCondicion($campo,$valores,'or','in');
        return $this;
    }

    /**
     * Agrega una condición OR NOT IN() (negado).
     * @var string $campo Campo.
     * @var array $valores Listado de valores a excluir.
     */
    public function oDondeNoEn($campo,$valores) {  
        if(!is_array($valores)||!count($valores)) return $this;      
        $this->consultaCondiciones[]=$this->generarCondicion($campo,$valores,'or','not in');
        return $this;
    }

    /**
     * Agrega una condición LIKE.
     * @var string $campo Campo.
     * @var array $valor Valor a evaluar.
     */
    public function dondeComo($campo,$valor) {        
        $this->consultaCondiciones[]=$this->generarCondicion($campo,$valor,'and','like');
        return $this;
    }

    /**
     * Agrega una condición NOT LIKE (negado).
     * @var string $campo Campo.
     * @var array $valor Valor a evaluar.
     */
    public function dondeNoComo($campo,$valor) {        
        $this->consultaCondiciones[]=$this->generarCondicion($campo,$valor,'and','not like');
        return $this;
    }

    /**
     * Agrega una condición OR LIKE.
     * @var string $campo Campo.
     * @var array $valor Valor a evaluar.
     */
    public function oDondeComo($campo,$valor) {        
        $this->consultaCondiciones[]=$this->generarCondicion($campo,$valor,'or','like');
        return $this;
    }

    /**
     * Agrega una condición OR NOT LIKE (negado).
     * @var string $campo Campo.
     * @var array $valor Valor a evaluar.
     */
    public function oDondeNoComo($campo,$valor) {        
        $this->consultaCondiciones[]=$this->generarCondicion($campo,$valor,'or','not like');
        return $this;
    }

    /**
     * Establece el o los campos por los cuales se agruparán los
     */
    public function agrupadoPor(...$campos) {
        $this->consultaAgrupar=$campos;
        return $this;
    }

    /**
     * Establece la condición HAVING.
     * @var string $condicion Condición como cadena SQL. Pueden insertarse parámetros con el formato @nombre.
     * @var object $parametros Array parámetro/valor.
     */
    /**
     * Establece la condición HAVING.
     * @var object $condicion Array campo=>valor a utilizar como filtro.
     */
    /**
     * Establece la condición HAVING.
     * @var object $condicion Instancia de la entidad cuyos campos se utilizarán como filtro.
     */
    public function teniendo($condicion,$parametros=null) {
        $this->consultaTeniendo[]=$this->generarCondicion($condicion,$parametros);
        return $this;
    }

    /**
     * Genera un objeto representando intermanente una condición a partir de cualquera de los tres formatos que admiten donde() y teniendo().
     */
    protected function generarCondicion($condicion,$parametros,$union='and',$operador='=') {
        $union=strtoupper($union);
        $operador=strtoupper($operador);

        if(is_object($condicion)&&get_class($condicion)==$this->tipoEntidad) {
            //Convertir a un array campo=>valor
            //Ya conocemos los campos
            $entidad=$condicion;
            $condicion=[];
            foreach($this->campos as $campo=>$v) {
                $valor=$entidad->$campo;
                if($valor!==null) $condicion[$campo]=$valor;
            }
        }

        if($operador==='IN'||$operador=='NOT IN') {
            $condicion.=' '.strtoupper($operador).' (';
            //Generar condición, un ? por cada parámetro
            $condicion.=implode(',',str_split(str_repeat('?',count($parametros))));
            $condicion.=')';
        } elseif(is_object($condicion)||is_array($condicion)) {
            //Si se recibe un objeto/array, siempre será coincidencia exacta
            $sql=[];
            $parametros=[];
            foreach($condicion as $clave=>$valor) {
                if($valor===null) continue;
                
                $campo=null;
                if(array_key_exists($clave,$this->campos)) $campo=$this->campos->$clave;
                
                if($valor===true) {
                    $valor=1;
                } elseif($valor===false) {
                    $valor=0;
                } elseif($valor instanceof nulo) {
                    $valor=null;
                }

                if(strpos($clave,'.')===false) {
                    $nombre=$this->alias.'.`'.$clave.'`';
                } else {
                    $nombre=$clave;
                }

                if($valor===null) {
                    if($operador=='<>') {
                        $sql[]=$nombre.' IS NOT NULL';
                    } else {
                        $sql[]=$nombre.' IS NULL';
                    }
                } elseif($campo&&$campo->busqueda) {
                    $busqueda=$this->generarConsultaBusquedaFonetica($nombre,$valor);
                    $sql[]=$busqueda->sql;
                    foreach($busqueda->parametros as $param) $parametros[]=$param;
                } else {
                    $sql[]=$nombre.$operador.'?';
                    $parametros[]=$valor;
                }
            }
            $condicion=implode(' AND ',$sql);
        } elseif(is_string($condicion)) {
            if(preg_match('/^[a-z0-9_\.`]+$/i',$condicion)&&is_string($parametros)) {
                //Si solo se estableció un campo y un valor, construir condición
                if(strpos($condicion,'.')===false) $condicion=$this->alias.'.`'.$condicion.'`';
                $condicion.=' '.$operador.' ?';
                $parametros=[$parametros];
            } else {
                //Si se estableció una condición, potencialmente con parámetros, buscar y reemplazar variables, construyendo array de parámetros en el orden en que aparecen
                //TODO Esta forma de asignar parámetros en orden es muy específica de PDO, ¿debería estar en la clase bd?
                $parametrosEnOrden=[];
                while(preg_match('/([\s<>=]*)@([A-Za-z0-9_]+)/',$condicion,$coincidencia,PREG_OFFSET_CAPTURE)) {
                    $variable=$coincidencia[0][0];                
                    $posicion=$coincidencia[0][1];
                    $operador=$coincidencia[1][0];
                    $propiedad=$coincidencia[2][0];

                    $valor=$parametros[$propiedad];
                    $esNulo=$valor instanceof nulo;

                    //Considerar NULL
                    if($esNulo&&$operador=='=') {
                        $condicion=substr($condicion,0,$posicion).' IS NULL';
                    } elseif($esNulo&&$operador=='<>') {
                        $condicion=substr($condicion,0,$posicion).' IS NOT NULL';
                    } else {
                        //Reemplazar la variable por ?
                        $condicion=substr($condicion,0,$posicion+strlen($operador)).'?'.substr($condicion,$posicion+strlen($variable));
                        $parametrosEnOrden[]=$valor;
                    }
                }
                $parametros=$parametrosEnOrden;
            }
        }
        
        return (object)[
            'union'=>$union,
            'condicion'=>$condicion,
            'parametros'=>$parametros
        ];
    }

    /**
     * Establece el límite.
     */
    public function limite($limite,$cantidad) {
        $this->consultaLimite=$limite;
        $this->consultaCantidad=$cantidad;
        return $this;
    }

    /**
     * Establece la paginación.
     */
    public function paginacion($cantidad,$pagina=1) {
        if(!$pagina) $pagina=1;
        $this->consultaLimite=($pagina-1)*$cantidad;
        $this->consultaCantidad=$cantidad;
        return $this;
    }

    /**
     * Establece el ordenamiento. Puede invocarse múltiples veces para establecer múltiples columnas de ordenamiento.
     * @var string $campo Campo o expresión.
     * @var string $orden Orden ascendente o descendente. Omitir si se establece una expresión en $campo.
     */
    public function ordenadoPor($campo,$orden=null) {
        if($orden) $orden=strtoupper($orden);
        $this->consultaOrden[]=(object)[
            'campo'=>$campo,
            'orden'=>$orden
        ];
        return $this;
    }

    /**
     * Establece los valores a guardar. En una segunda llamada a este método con un objeto o array, se asignarán los valores a la entidad establecida previamente. Especificar
     * una entidad siempre sobreescribirá la entidad previamente asignada.
     * @var object|array|\entidad $objeto Entidad u objeto o array [propiedad=>valor].
     * @return \modelo
     */
    public function establecerValores($objeto) {
        if(!$this->consultaValores||$objeto instanceof entidad) {
            $this->consultaValores=(object)$objeto;
        } elseif(is_array($objeto)||is_object($objeto)) {
            foreach($objeto as $clave=>$valor) $this->consultaValores->$clave=$valor;
        }
        return $this;        
    }

    /**
     * Establece un valor a guardar.
     * @var string $propiedad Nombre de la propiedad.
     * @var mixed $valor Valor a asignar.
     * @return \modelo
     */
    public function establecerValor($propiedad,$valor) {
        return $this->establecerValores([$propiedad=>$valor]);
    }

    /**
     * Crea una nueva entidad, asignando los valores provistos mediante entidad::establecerValoresPublicos(), y la asigna a los valores para la próxima consulta.
     * @var object|array $valores Valores a asignar.
     * @return \modelo
     */
    public function establecerValoresPublicos($valores) {
        return $this->establecerValores(
            $this->fabricarEntidad()
                ->establecerValoresPublicos($valores)
        );
    }

    /**
     * Devuelve los valores establecidos para guardar, que pueden haber sido actualizados tras la última consulta (por ejemplo, los IDs tras una inserción.)
     */
    public function obtenerEntidad() {
        return $this->consultaValores;
    }

    /**
     * Prepara la consulta.
     */
    public function prepararConsulta($operacion='seleccionar') {
        $this->construirConsulta($operacion);
        $this->bd->preparar($this->sql);
        $this->consultaPreparada=true;
        return $this;
    }

    /**
     * Reutiliza la consulta preparada en la próxima consulta, reemplazando los parámetros, en lugar de crear una nueva.
     */
    public function reutilizarConsulta() {
        $this->reutilizarConsultaPreparada=true;
        return $this;
    }

    /**
     * Ejecuta la consulta, sin devolver ningún elemento.
     */
    public function ejecutarConsulta($operacion='seleccionar') {
        if($operacion=='insertar'||$operacion=='actualizar') $this->ejecutarConsultasRelacionadas();

        if(!$this->consultaPreparada||!$this->reutilizarConsultaPreparada) {
            $this->prepararConsulta($operacion);
        } else {
            //Reconstruir para tener los nuevos parámetros
            //TODO Definir cómo pueden ser reemplazados los parámetros. Por el momento, solo los valores a insertar/actualizar se pueden modificar entre consultas.
            $this->construirConsulta($operacion);
        }
        if(count($this->parametros)) $this->bd->asignar($this->parametros,implode('',$this->tipos));
        $this->resultado=$this->bd->ejecutar();

        $this->ultimoId=$this->bd->obtenerId();
        if($operacion=='insertar') $this->consultaValores->id=$this->ultimoId;

        if($operacion=='insertar'||$operacion=='actualizar') $this->ejecutarConsultasRelacionadasUnoAMuchos();

        return $this;
    }

    /**
     * Ejecuta las consultas de inserción o actualización en los campos relacionales.
     */
    public function ejecutarConsultasRelacionadas() {
        foreach($this->campos as $nombre=>$campo) {
            if($campo->tipo=='relacional'&&($campo->relacion!='1:1'||$campo->relacion!='1:0')) { //Las relaciones uno a muchos se procesarán en otra etapa
                //La entidad puede ser una instancia, un objeto anónimo o un array asociativo
                $entidad=$this->consultaValores->$nombre;
                if($entidad===null) continue;

                $nombreModelo=$campo->modelo;
                $columna=$campo->columna;

                if(!$this->consultaProcesarRelaciones||in_array($nombre,$this->consultaOmitirRelacionesCampos)) {
                    //Cuando se inserte o actualice con las relaciones desactivadas, solo debemos copiar el ID a la columna correspondiente
                    if(is_object($entidad)) {
                        $this->consultaValores->$columna=$entidad->id;
                    } elseif(is_array($entidad)) {
                        $this->consultaValores->$columna=$entidad['id'];
                    }
                    continue;
                }

                self::fabricarModelo($nombreModelo,$this->db)
                    ->establecerValores($entidad)
                    ->guardar();

                $idInsertado=$entidad->id;

                $this->consultaValores->$columna=$idInsertado;
            }
        }
        return $this;
    }

    /**
     * Ejecuta las consultas de inserción o actualización en los campos relacionales 1:n.
     */
    public function ejecutarConsultasRelacionadasUnoAMuchos() {
        foreach($this->campos as $nombre=>$campo) {
            if($campo->tipo=='relacional'&&$campo->relacion=='1:n') {
                $listado=$this->consultaValores->$nombre;
                if(!is_array($listado)) continue;

                //Cuando se inserte o actualice con las relaciones desactivadas, ignorar
                if(!$this->consultaProcesarRelaciones||in_array($nombre,$this->consultaOmitirRelacionesCampos)) continue;

                $nombreModelo=$campo->modelo;
                $modelo=self::fabricarModelo($nombreModelo,$this->db);
                $columna=$campo->columna;

                foreach($listado as $entidad) {
                    //La entidad puede ser una instancia, un objeto anónimo o un array asociativo
                    if($entidad===null) continue;

                    $entidad->$columna=$this->ultimoId;
                    
                    $modelo->reiniciar()                
                        ->establecerValores($entidad)
                        ->guardar();
                }
            }
        }
        return $this;
    }
    
    /**
     * Ejecuta la consulta devolviendo un único elemento.
     */
    public function obtenerUno() {
        $this->consultaCantidad=1;
        $this->ejecutarConsulta();
        if(!$this->resultado) return null;
        $fila=$this->resultado->siguiente();
        if(!$fila) return null;
        return $this->fabricarEntidad($fila);
    }

    /**
     * Devuelve un registro dado su ID.
     * @param object $id ID.
     * @return \entidad
     */
    public function obtenerItem($id) {
        return $this
            ->reiniciar()
            ->donde([
                'id'=>$id
            ])
            ->obtenerUno();
    }

    /**
     * Ejecuta la consulta y devuelve un array de elementos.
     * @param boolean $objetoEstandar Si es true, devolverá un listado de objetos anónimos (stdClass) en lugar de instancias de la entidad.
     * @param string ...$campos Campos a asignar a la entidad. Si se omite, se asignarán todos los campos disponibles en la consulta. Esto es útil cuando se desee
     * obtener un listado con menos campos que los que se han seleccionado con seleccionar().
     * @return array
     */
    public function obtenerListado($objetoEstandar=false,...$campos) {
        $this->ejecutarConsulta();
        if(!$this->resultado) return [];

        if($objetoEstandar&&!count($campos)) $campos=$this->campos;

        $resultado=[];
        while($fila=$this->resultado->siguiente()) {
            $asignar=(object)[];
            if($objetoEstandar) {
                foreach($campos as $campo) {
                    $clave='__'.$this->alias.'_'.$campo;
                    $asignar->$campo=$fila->$clave;
                }
                $resultado[]=$asignar;
            } else {
                if(count($campos)) {
                    foreach($campos as $campo) {
                        $campo='__'.$this->alias.'_'.$campo;
                        $asignar->$campo=$fila->$campo;
                    }
                } else {
                    $asignar=$fila;
                }
                $resultado[]=$this->fabricarEntidad($asignar);
            }
        }

        return $resultado;
    }

    /**
     * Ejecuta la consulta y devuelve un array asociativo [clave=>valor].
     * @param string $clave Campo a utilizar como clave del array.
     * @param string $valor Campo a utilizar como valor del array.
     * @return array
     *//**
     * Ejecuta la consulta y devuelve un array asociativo [clave=>valor].
     * @param string $clave Campo a utilizar como clave del array.
     * @param callable $valor Función que devuelve el valor dada la entidad.
     * @return array
     */
    public function obtenerListadoAsociativo($clave,$valor) {
        $items=$this->obtenerListado();
        $resultado=[];
        foreach($items as $item) {
            if(is_callable($valor)) {
                $valorElem=$valor($item);
            } else {
                $valorElem=$item->$valor;
            }
            $resultado[$item->$clave]=$valorElem;
        }
        return $resultado;
    }

    /**
     * Devuelve la cantidad de elementos encontrados o afectados por la última consulta.
     */
    public function obtenerCantidad() {
        return $this->bd->obtenerNumeroFilas();
    }

    /**
     * Calcula la cantidad de elementos totales que arrojaría la consulta (puede ser aproximado) sin considerar el límite.
     */
    public function estimarCantidad() {
        $columnas=$this->consultaColumnas;
        $limite=$this->consultaLimite;
        $cantidad=$this->consultaCantidad;
        $orden=$this->consultaOrden;

        $this->consultaColumnas=['COUNT(*) `cantidad`'];
        $this->consultaLimite=null;
        $this->consultaCantidad=null;
        $this->consultaOrden=[]; //No es necesario perder tiempo en ordenar

        $this->ejecutarConsulta();

        $resultado=$this->resultado->siguiente()->cantidad;

        //Restaurar parámetros
        $this->consultaColumnas=$columnas;
        $this->consultaLimite=$limite;
        $this->consultaCantidad=$cantidad;
        $this->consultaOrden=$orden;

        return $resultado;
    }

    /**
     * Elimina los elementos que coincidan con la consulta.
     */
    public function eliminar($e=1) {
        $procesarRelaciones=$this->consultaProcesarRelaciones;
        $relacionesCampos=$this->consultaOmitirRelacionesCampos;
        $valores=$this->consultaValores;
        $this->consultaProcesarRelaciones=false;
        $this->consultaOmitirRelacionesCampos=[];
        $this->consultaValores=null;

        $this->establecerValores(['e'=>$e])->actualizar();

        $this->consultaProcesarRelaciones=$procesarRelaciones;
        $this->consultaOmitirRelacionesCampos=$relacionesCampos;
        $this->consultaValores=$valores;

        return $this;
    }

    /**
     * Restaura los elementos que coincidan con la consulta.
     */
    public function restaurar() {
        return $this->eliminar(0);
    }

    /**
     * Guarda el elemento establecido con establecerValores(). El mismo será insertado si no cuenta con campo `id`, o actualizado en caso contrario.
     */
    public function guardar() {
        if($this->consultaValores->id) return $this->actualizar();
        return $this->insertar();
    }

    /**
     * Inserta el elemento establecido con establecerValores().
     */
    public function insertar() {
        $this->consultaValores->id=null;
        return $this->ejecutarConsulta('insertar');
    }

    /**
     * Alias de insertar().
     */
    public function crear() {
        return $this->insertar();
    }

    /**
     * Actualiza los elementos que coincidan con la consulta utilizando los campos del el elemento establecido con establecerValores(). Si no se ha establecido una
     * condición, utilizará la propiedad `id`.
     */
    public function actualizar() {
        return $this->ejecutarConsulta('actualizar');
    }    

    /**
     * Comienza una transacción.
     */
    public function comenzarTransaccion() {
        $this->bd->comenzarTransaccion();
        return $this;
    }

    /**
     * Finaliza la transacción.
     */
    public function finalizarTransaccion() {
        $this->bd->finalizarTransaccion();
        return $this;
    }

    /**
     * Descarta y revierte la transacción.
     */
    public function descartarTransaccion() {
        $this->bd->descartarTransaccion();
        return $this;
    }

    /**
     * Bloquea las tablas dadas las instancias de los modelos.
     */
    public function bloquear($modo,...$modelos) {
        if($modo=='lectura') $modo='READ'; else $modo='WRITE';
        $this->bd->bloquear($modo,$modelos);
        return $this;
    }

    /**
     * Desbloquea las tablas.
     */
    public function desbloquear() {
        $this->bd->desbloquear();
        return $this;
    }

    /**
     * 
     */
    public function obtenerError() {
        return $this->bd->obtenerError();
    }

    /**
     * Genera las relaciones automáticas a partir de los campos relacionales.
     */
    public function prepararRelaciones(&$alias,$recursivo,&$cadenaRelaciones) {
        //Detectar una relación cíclica (se relaciona con un modelo que ya fue relacionado previamente, derivando en un bucle infinito)
        $relacionadoPreviamente=in_array($this->nombreModelo,$cadenaRelaciones);
        $cadenaRelaciones[]=$this->nombreModelo;

        foreach($this->campos as $nombre=>$campo) {
            if($campo->tipo=='relacional'&&!$campo->omitir) {
                $obj=modelo::fabricarModelo($campo->modelo,$this->bd);
                
                $alias++;
                $obj->alias='t'.$alias;

                $condicion='';

                if($campo->relacion=='1:n') {
                    $condicion=$obj->alias.'.`'.$campo->columna.'`='.$this->alias.'.`id`';
                    //Desactivar el procesamiento del campo si se detecta una relación cíclica
                    if(in_array($campo->modelo,$cadenaRelaciones)) $this->omitirRelaciones($nombre);
                } else {
                    $condicion=$obj->alias.'.`id`='.$this->alias.'.`'.$campo->columna.'`';
                }

                $this->relacionar(
                    $nombre,
                    $campo->relacion,
                    $obj,
                    $obj->alias,
                    $condicion
                );

                //Avanzar recursivamente                
                if(!$relacionadoPreviamente&&$recursivo) {
                    //Si el modelo se relaciona con sí mismo, solo procesar una vez
                    $continuar=$campo->modelo!=$this->nombreModelo;
                    $obj->prepararRelaciones($alias,$continuar,$cadenaRelaciones);
                }
            }
        }

        return $this;
    }

    /**
     * Genera el listado de porciones SQL para selección de campos y tablas relacionadas.
     */
    public function construirCamposYRelaciones(&$campos,&$relaciones) {
        if($this->consultaProcesarRelaciones) {
            foreach($this->consultaRelaciones as $relacion) {
                if($relacion->tipo=='1:n') continue; //Las relaciones 1:n no se realizarán con join

                if(in_array($relacion->campo,$this->consultaOmitirRelacionesCampos)) continue;
                
                $join='JOIN';
                if($relacion->tipo=='1:0') $join='LEFT JOIN';

                $relaciones[]=$join.' #__'.$relacion->modelo->nombre.' '.$relacion->modelo->alias.' on '.$relacion->condicion;

                //Combinar recursivamente
                $relacion->modelo->construirCamposYRelaciones($campos,$relaciones);
            }
        }

        foreach($this->campos as $nombre=>$campo) {
            if($campo->tipo=='relacional'||$campo->busqueda||($campo->oculto&&!$this->consultaIncluirOcultos)) continue;

            $campos[]=$this->alias.'.`'.$nombre.'` `__'.$this->alias.'_'.$nombre.'`';
        }
        
        return $this;
    }

    /**
     * Construye la consulta SQL.
     */
    protected function construirConsulta($operacion='seleccionar') {
        if($operacion=='insertar') {
            return $this->construirConsultaInsercion();
        } elseif($operacion!='actualizar') {
            $operacion='seleccionar';
        }

        $alias=1;
        
        $sql='';
        $parametros=[];
        $tipos=[];

        $campos=[];
        $relaciones=[];

        if($operacion=='actualizar') {
            $sql='UPDATE ';
        } else {
            $sql='SELECT ';

            $array=[];
            $this->prepararRelaciones($alias,true,$array)
                ->construirCamposYRelaciones($campos,$relaciones);
            
            $sql.=implode(',',$this->consultaColumnas?$this->consultaColumnas:$campos);

            $sql.=' FROM ';
        }

        $sql.='#__'.$this->nombre.' '.$this->alias.' ';

        $sql.=implode(' ',$relaciones);

        if($operacion=='actualizar') {
            $sql.=' SET ';
            $sql.=$this->construirCamposInsercionActualizacion($parametros,$tipos);
        }

        if(count($this->consultaCondiciones)) {
            $sql.=' WHERE ';

            if(!$this->consultaSeleccionarEliminados) {
                $sql.=$this->alias.'.`e`=0 AND ';
            }

            $condiciones='';
            
            foreach($this->consultaCondiciones as $condicion) {
                if($condiciones!='') $condiciones.=' '.$condicion->union.' ';
                $condiciones.='( '.$condicion->condicion.' )';
                foreach($condicion->parametros as $parametro) {
                    $parametros[]=$parametro;
                    $tipos[]=$this->determinarTipo($parametro);
                }
            }

            $sql.=' ( '.$condiciones.' ) ';
        } elseif($operacion=='actualizar') {
            $sql.=' WHERE '.$this->alias.'.`id`=? ';
            $parametros[]=$this->consultaValores->id;
            $tipos[]='d';
        } elseif(!$this->consultaSeleccionarEliminados) {
            $sql.='WHERE '.$this->alias.'.`e`=0 ';
        }

        if($operacion=='seleccionar') {
            if($this->consultaAgrupar) {
                $sql.=' GROUP BY ';

                $campos=[];
                foreach($this->consultaAgrupar as $campo) $campos[]=$this->alias.'.`'.$campo.'`';
                $sql.=implode(',',$campos);
            }

            if(count($this->consultaTeniendo)) {
                $sql.=' HAVING ';

                $condiciones=[];
                
                foreach($this->consultaTeniendo as $condicion) {
                    $condiciones[]=$condicion->condicion;
                    foreach($condicion->parametros as $parametro) {
                        $parametros[]=$parametro;
                        $tipos[]=$this->determinarTipo($parametro);
                    }
                }

                $sql.=' ( '.implode(' ) AND ( ',$condiciones).' ) ';
            }

            if($this->consultaOrden) {
                $sql.=' ORDER BY ';

                $campos=[];
                foreach($this->consultaOrden as $orden) {
                    if($orden->orden) {
                        $campo=$orden->campo;
                        if(strpos($campo,'.')===false) $campo=$this->alias.'.`'.$orden->campo.'`';
                        $campos[]=$campo.' '.$orden->orden;
                    } else {
                        $campos[]=$orden->campo;
                    }
                }
                $sql.=implode(',',$campos);
            }
        }

        if($this->consultaLimite||$this->consultaCantidad) {
            $sql.=' LIMIT ';

            $sql.=$this->consultaLimite?$this->consultaLimite:'0';

            if($this->consultaCantidad) $sql.=','.$this->consultaCantidad;
        }
        
        $this->sql=$sql;
        $this->parametros=$parametros;
        $this->tipos=$tipos;
        return $this;
    }

    /**
     * Construye la consulta SQL para insertar una fila.
     */
    protected function construirConsultaInsercion() {   
        $parametros=[];
        $tipos=[];

        $sql='INSERT INTO #__'.$this->nombre.' SET ';

        $sql.=$this->construirCamposInsercionActualizacion($parametros,$tipos,false);
        
        $this->sql=$sql;
        $this->parametros=$parametros;
        $this->tipos=$tipos;
        return $this;
    }

    /**
     * Asigna los valores de las propiedades relacionales a partir de las relaciones 1:1 o 1:0 en consultaValores.
     */
    protected function asignarCamposRelacionales() {
        foreach($this->campos as $nombre=>$campo) {
            if($campo->tipo!='relacional'||($campo->relacion!='1:1'&&$campo->relacion!='1:0')) continue;
            $columna=$campo->columna;
            if(is_object($this->consultaValores->$nombre)) {
                //Asignado como entidad u objeto anónimo
                $this->consultaValores->$columna=$this->consultaValores->$nombre->id;
            } elseif(is_array($this->consultaValores->$nombre)) {
                //Asignado como array
                $this->consultaValores->$columna=$this->consultaValores->$nombre['id'];
            }
        }
    }

    /**
     * Construye la porción SQL que contiene los campos a insertar o actualizar.
     */
    protected function construirCamposInsercionActualizacion(&$parametros,&$tipos,$alias=true) {
        $campos=[];
        $camposAfectados=[];
        $valores=[];

        //Preparar campos relacionales para que se almacene el ID de las entidades relacionadas, cuando hayan sido asignados
        $this->asignarCamposRelacionales();

        foreach($this->campos as $nombre=>$campo) {
            if($nombre=='id'||$campo->tipo=='relacional'||$campo->busqueda) continue;
            
            $valor=null;
            if(is_array($this->consultaValores)) {
                $valor=$this->consultaValores[$nombre];
            } else {
                $valor=$this->consultaValores->$nombre;
            }
            if($valor===null) continue;

            if($valor===true) {
                $valor=1;
            } elseif($valor===false) {
                $valor=0;
            } elseif($valor instanceof nulo) {
                $valor=null;
            }

            if(!$campo->html&&preg_match('/^(cadena|texto)/',$campo->tipo)) $valor=htmlspecialchars($valor,ENT_COMPAT,'utf-8');

            $valores[$nombre]=$valor;

            if($valor===null) {
                $campos[]=($alias?$this->alias.'.':'').'`'.$nombre.'`=null';
            } else {
                $campos[]=($alias?$this->alias.'.':'').'`'.$nombre.'`=?';
                $parametros[]=$valor;
                $camposAfectados[]=$nombre;
                $tipos[]=$this->determinarTipo($valor);
            }
        }        

        //Actualizar caché de búsqueda fonética, si corresponde
        foreach($this->campos as $nombre=>$campo) {
            if(!$campo->busqueda) continue;

            $camposIncluidos=explode(',',$campo->busqueda);

            //Verificar que todos los campos estén en la consulta

            $actualizar=true;
            foreach($camposIncluidos as $campoIncluido) {
                if(!in_array($campoIncluido,$camposAfectados)) {
                    $actualizar=false;
                    break;
                }
            }
            if(!$actualizar) continue;

            //Construir valor y agregar

            $cadena='';
            foreach($camposIncluidos as $campoIncluido) {
                $valor=$valores[$campoIncluido];
                if(is_string($valor)) $cadena.=' '.$valor;
            }
            
            $campos[]=($alias?$this->alias.'.':'').'`'.$nombre.'`=?';
            $parametros[]=implode(' ',$this->prepararCadenaBusquedaFonetica($cadena));
            $tipos[]='s';
        }

        return implode(',',$campos);
    }

    /**
     * Determina (o estima) y establece el tipo de un valor dado, devolviendo 'i', 'd', 's' o 'b'.
     */
    protected function determinarTipo($valor) { //TODO Es muy específico de PDO, ¿debería estar en la clase bd?
        if(is_integer($valor)) return 'i';
        if(is_numeric($valor)||preg_match('/^[0-9]*\.[0-9]+$/',$valor)) return 'd';
        return 's';
        //TODO b
    }

    /**
     * Instalación de la base de datos. Devuelve el SQL de las consultas ejecutadas (método para sobreescribir).
     * @return string
     */
    public function instalar() {
        return '';
    }

    /**
     * Procesa una cadena para realizar una búsqueda fonética o almacenar en el caché de búsqueda fonética.
     * @param string $cadena Cadena.
     * @return array
     */
    public function prepararCadenaBusquedaFonetica($cadena) {
        $resultado=[];
        $partes=explode(' ',$cadena);
        foreach($partes as $parte) {
            $parte=trim(strip_tags(html_entity_decode($parte,ENT_COMPAT,'utf-8')));
            if(strlen($parte)<3) continue;
            $resultado[]=soundex($parte);
        }
        return $resultado;
    }

    /**
     * Devuelve la porción de código SQL para realizar una búsqueda fonética. Devuelve un objeto [sql,parametros].
     * @param string $campo Nombre del campo de búsqueda, listo para usar (incluyendo alias, apóstrofes, etc.).
     * @param string $cadena Cadena a buscar.
     * @return object
     */
    public function generarConsultaBusquedaFonetica($campo,$cadena) {
        $sql='';
        $parametros=[];

        $partes=$this->prepararCadenaBusquedaFonetica($cadena);
        foreach($partes as $parte) {
            if($sql!='') $sql.=' OR ';
            $sql.=$campo.' LIKE ?';
            $parametros[]='%'.$parte.'%';
        }

        return (object)[
            'sql'=>$sql,
            'parametros'=>$parametros
        ];
    }

    //TODO Ver otras utilidades posibles
}