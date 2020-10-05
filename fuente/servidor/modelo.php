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
        //Posibles valores de las etiquetas en los comentarios de las propiedades:
        //@tipo (texto|cadena(longitud)|entero(longitud)|decimal(longitud)|logico|relacional|fecha)
        //@relacion (1:1|1:0|1:n)
        //@indice
        //@indice unico
        //@modelo *
        //@relacion *
        //@columna *
        //@predeterminado *
        //@requerido
        //@tamano
        //@etiqueta *
        //@omitir
        //@oculto
        //@busqueda campos

        $this->campos=(object)[
            'id'=>(object)[],
            'e'=>(object)[]
        ];

        $propiedades=get_class_vars($this->tipoEntidad);
        foreach($propiedades as $propiedad=>$v) {
            $comentario=(new ReflectionProperty($this->tipoEntidad,$propiedad))->getDocComment();
            if(preg_match_all("/@(tipo|relacion|indice|modelo|relacion|columna|predeterminado|requerido|tamano|etiqueta|omitir|oculto|busqueda)( (.+?))?(\r|\n|\*\/)/s",$comentario,$coincidencias)) {
                $this->campos->$propiedad=(object)[];
                foreach($coincidencias[1] as $i=>$etiqueta) {
                    $etiqueta=trim($etiqueta);
                    $valor=trim($coincidencias[2][$i]);
                    if($valor=='') $valor=true;

                    $this->campos->$propiedad->$etiqueta=$valor;
                }
            }
        }
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
            'parametros'=>$this->parametros,
            'tipos'=>$this->tipos,
            'error'=>$this->bd->obtenerError(),
            'bd'=>$this->bd,
            'resultado'=>$this->resultado
        ];
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
     * @var string $campo Si se especifica, omitirá únicamente el procesamiento de este campo. En caso contrario, se omitirán todos los campos relacionales.
     */
    public function omitirRelaciones($campo=null) {
        if($campo) {
            $this->consultaOmitirRelacionesCampos[]=$campo;
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
                    $item->$nombre=$modelo->donde([
                            $campo->columna=>$item->id
                        ])
                        ->obtenerListado();
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
     * Agrega una condición mediante un operador de desigualdad.
     * @var string $condicion Condición como cadena SQL. Pueden insertarse parámetros con el formato @nombre.
     * @var string $operador Operador, como cadena ('<','<=','<>','>','>=','like').
     * @var object $parametros Array parámetro/valor.
     */
    /**
     * Agrega una condición.
     * @var object $condicion Array campo=>valor a utilizar como filtro.
     * @var string $operador Operador, como cadena ('<','<=','<>','>','>=','like').
     */
    /**
     * Agrega una condición.
     * @var object $condicion Instancia de la entidad cuyos campos se utilizarán como filtro.
     * @var string $operador Operador, como cadena ('<','<=','<>','>','>=','like').
     */
    public function dondeComparar($condicion,$operador,$parametros=null) {
        $this->consultaCondiciones[]=$this->generarCondicion($condicion,$parametros,'and',$operador);
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
     * Agrega una condición OR mediante un operador de desigualdad.
     * @var string $condicion Condición como cadena SQL. Pueden insertarse parámetros con el formato @nombre.
     * @var string $operador Operador, como cadena ('<','<=','<>','>','>=','like').
     * @var object $parametros Array parámetro/valor.
     */
    /**
     * Agrega una condición OR.
     * @var object $condicion Array campo=>valor a utilizar como filtro.
     * @var string $operador Operador, como cadena ('<','<=','<>','>','>=','like').
     */
    /**
     * Agrega una condición OR.
     * @var object $condicion Instancia de la entidad cuyos campos se utilizarán como filtro.
     * @var string $operador Operador, como cadena ('<','<=','<>','>','>=','like').
     */
    public function oDondeComparar($condicion,$operador,$parametros=null) {
        $this->consultaCondiciones[]=$this->generarCondicion($condicion,$parametros,'or',$operador);
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

        if(is_object($condicion)||is_array($condicion)) {
            //Si se recibe un objeto/array, siempre será coincidencia exacta
            $sql=[];
            $parametros=[];
            foreach($condicion as $clave=>$valor) {
                if($valor===null||!array_key_exists($clave,$this->campos)) continue;

                $campo=$this->campos->$clave;
                
                if($valor===true) {
                    $valor=1;
                } elseif($valor===false) {
                    $valor=0;
                } elseif($valor instanceof nulo) {
                    $valor=null;
                }

                $nombre=$this->alias.'.`'.$clave.'`';

                if($valor===null) {
                    $sql[]=$nombre.' is null';
                } elseif($campo->busqueda) {
                    $busqueda=$this->generarConsultaBusquedaFonetica($nombre,$valor);
                    $sql[]=$busqueda->sql;
                    foreach($busqueda->parametros as $param) $parametros[]=$param;
                } else {
                    $sql[]=$nombre.$operador.'?';
                    $parametros[]=$valor;
                }
            }
            $condicion=implode(' and ',$sql);
        } elseif(is_string($condicion)) {
            //Reemplazar variables, construyendo array de parámetros en el orden en que aparecen
            //TODO Esta forma de asignar parámetros en orden es muy específica de PDO, ¿debería estar en la clase bd?
            $parametrosEnOrden=[];
            while(preg_match('/@([A-Za-z0-9_]+)/',$condicion,$coincidencia,PREG_OFFSET_CAPTURE)) {
                $variable=$coincidencia[0][0];
                $posicion=$coincidencia[0][1];
                $propiedad=$coincidencia[1][0];

                $condicion=substr($condicion,0,$posicion).'?'.substr($condicion,$posicion+strlen($variable));
                $parametrosEnOrden[]=$parametros[$propiedad];
            }
            $parametros=$parametrosEnOrden;
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
     */
    public function ordenadoPor($campo,$orden='asc') {
        $this->consultaOrden[]=[
            'campo'=>$campo,
            'orden'=>$orden
        ];
        return $this;
    }

    /**
     * Establece los valores a guardar.
     */
    public function establecerValores($objeto) {
        $this->consultaValores=(object)$objeto;
        return $this;        
    }

    /**
     * Devuelve los valores establecidos para guardar, que pueden haber sido actualizados tras la última consulta (por ejemplo, los IDs tras una inserción.)
     */
    public function obtenerEntidad() {
        return $this->consultavalores;
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

        return $this;
    }

    /**
     * Ejecuta las consultas de inserción o actualización en los campos relacionales.
     */
    public function ejecutarConsultasRelacionadas() {
        foreach($this->campos as $nombre=>$campo) {
            if($campo->tipo=='relacional'&&$campo->relacion!='1:n') { //Las relaciones uno a muchos no están soportadas
                $entidad=$this->consultaValores->$nombre;
                $columna=$campo->columna;

                if($entidad===null) continue;

                if(!$this->consultaProcesarRelaciones||in_array($nombre,$this->consultaOmitirRelacionesCampos)) {
                    //Cuando se inserte o actualice con las relaciones desactivadas, solo debemos copiar el ID a la columna correspondiente
                    if(is_object($entidad)) $this->consultaValores->$columna=$entidad->id;
                    continue;
                }

                $modelo=$entidad->fabricarModelo($this->db);

                $modelo->establecerValores($entidad)
                    ->guardar();

                $idInsertado=$entidad->id;

                $this->consultaValores->$columna=$idInsertado;
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

        $this->consultaColumnas=['count(*) `cantidad`'];
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
        $this->consultaProcesarRelaciones=false;
        $this->consultaOmitirRelacionesCampos=[];

        $this->establecerValores(['e'=>$e])->actualizar();

        $this->consultaProcesarRelaciones=$procesarRelaciones;
        $this->consultaOmitirRelacionesCampos=$relacionesCampos;

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
     * Actualiza los elementos que coincidan con la consulta utilizando los campos del el elemento establecido con establecerValores().
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
        if($modo=='lectura') $modo='read'; else $modo='write';
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
                
                $join='join';
                if($relacion->tipo=='1:0') $join='left join';

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
            $sql='update ';
        } else {
            $sql='select ';

            $array=[];
            $this->prepararRelaciones($alias,true,$array)
                ->construirCamposYRelaciones($campos,$relaciones);
            
            $sql.=implode(',',$this->consultaColumnas?$this->consultaColumnas:$campos);

            $sql.=' from ';
        }

        $sql.='#__'.$this->nombre.' '.$this->alias.' ';

        $sql.=implode(' ',$relaciones);

        if($operacion=='actualizar') {
            $sql.=' set ';
            $sql.=$this->construirCamposInsercionActualizacion($parametros,$tipos);
        }

        if(count($this->consultaCondiciones)) {
            $sql.=' where ';

            if(!$this->consultaSeleccionarEliminados) {
                $sql.=$this->alias.'.`e`=0 and ';
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
            $sql.=' where '.$this->alias.'.`id`=? ';
            $parametros[]=$this->consultaValores->id;
            $tipos[]='d';
        } elseif(!$this->consultaSeleccionarEliminados) {
            $sql.='where '.$this->alias.'.`e`=0 ';
        }

        if($operacion=='seleccionar') {
            if($this->consultaAgrupar) {
                $sql.=' group by ';

                $campos=[];
                foreach($this->consultaAgrupar as $campo) $campos[]=$this->alias.'.`'.$campo.'`';
                $sql.=implode(',',$campos);
            }

            if(count($this->consultaTeniendo)) {
                $sql.=' having ';

                $condiciones=[];
                
                foreach($this->consultaTeniendo as $condicion) {
                    $condiciones[]=$condicion->condicion;
                    foreach($condicion->parametros as $parametro) {
                        $parametros[]=$parametro;
                        $tipos[]=$this->determinarTipo($parametro);
                    }
                }

                $sql.=' ( '.implode(' ) and ( ',$condiciones).' ) ';
            }

            if($this->consultaOrden) {
                $sql.=' order by ';

                $campos=[];
                foreach($this->consultaOrden as $orden) {
                    $campos[]=$this->alias.'.`'.$orden->campo.'` '.$orden->orden;
                }
                $sql.=implode(',',$campos);
            }
        }

        if($this->consultaLimite||$this->consultaCantidad) {
            $sql.=' limit ';

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

        $sql='insert into #__'.$this->nombre.' set ';

        $sql.=$this->construirCamposInsercionActualizacion($parametros,$tipos,false);
        
        $this->sql=$sql;
        $this->parametros=$parametros;
        $this->tipos=$tipos;
        return $this;
    }

    /**
     * Construye la porción SQL que contiene los campos a insertar o actualizar.
     */
    protected function construirCamposInsercionActualizacion(&$parametros,&$tipos,$alias=true) {
        $campos=[];
        $camposAfectados=[];
        $valores=[];

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
     * Instalación de la base de datos (método para sobreescribir).
     */
    public function instalar() {
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
            $parte=trim($parte);
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
            if($sql!='') $sql.=' or ';
            $sql.=$campo.' like ?';
            $parametros[]='%'.$parte.'%';
        }

        return (object)[
            'sql'=>$sql,
            'parametros'=>$parametros
        ];
    }

    //TODO Ver otras utilidades posibles
}