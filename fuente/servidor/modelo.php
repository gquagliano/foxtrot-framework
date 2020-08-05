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
 * Clase base de los repositorios del modelo de datos.
 */
class modelo {
    /**
     * @var bd $bd
     * @var resultado $resultado
     */
    protected $bd;
    protected $resultado;

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

    protected $consultaPreparada=false;
    protected $reutilizarConsultaPreparada=false;

    protected $ultimoId=null;

    function __construct($bd=null) {
        $this->bd=$bd?$bd:foxtrot::obtenerInstanciaBd();
        
        $nombre=get_called_class();
        $this->nombre=substr($nombre,strrpos($nombre,'\\')+1);

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
                    if($campo->relacion=='1:n'&&$this->consultaProcesarRelaciones&&$this->consultaProcesarRelaciones1n) {
                        $obj->$campo=[];
                        //TODO
                    }
                } else {
                    $obj->$nombre=$fila->$aliasCampo;
                }
            }

            if($this->consultaProcesarRelaciones) {
                foreach($this->consultaRelaciones as $relacion) {
                    $campo=$relacion->campo;
                    $obj->$campo=$relacion->modelo->fabricarEntidad($fila);
                }
            }
        }

        return $obj;
    }

    /**
     * Crea y devuelve una instancia del modelo especificado.
     */
    public static function fabricarModelo($modelo,$bd=null) {       
        if(!class_exists($modelo)) $modelo='\\aplicaciones\\test\\modelo\\'.$modelo;
        return new $modelo($bd);
    }

    /**
     * Carga la configuración desde los metadatos de la clase de la entidad.
     */
    protected function cargarEstructura() {
        //Posibles valores de las etiquetas en los comentarios de las propiedades:
        //@tipo (texto|cadena(longitud)|entero(longitud)|decimal(longitud)|booleano|relacional)
        //@relacion (1:1|1:0|1:n)
        //@indice ([sin valor, índice normal]|unico)

        $this->campos=(object)[
            'id'=>(object)[]
        ];

        $propiedades=get_class_vars($this->tipoEntidad);
        foreach($propiedades as $propiedad=>$v) {
            $comentario=(new ReflectionProperty($this->tipoEntidad,$propiedad))->getDocComment();

            if(preg_match_all('/@(tipo|modelo|relacion|columna|indice)(.+?)(\n|\*\/)/',$comentario,$coincidencias)) {
                $this->campos->$propiedad=(object)[];

                foreach($coincidencias[1] as $i=>$etiqueta) {
                    $etiqueta=trim($etiqueta);
                    $valor=trim($coincidencias[2][$i]);
                    if(!$valor) $valor=true;

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
     */
    public function omitirRelaciones() {
        $this->consultaProcesarRelaciones=false;
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
     * Procesa los campos relacionados sobre la instancia especificada luego de haber realizado una consulta con las relaciones desactivadas.
     */
    public function procesarRelaciones($obj,...$campos) {

        return $this;
    }

    /**
     * Establece la condición.
     * @var string $condicion Condición como cadena SQL. Pueden insertarse parámetros con el formato @nombre.
     * @var object $parametros Array parámetro/valor.
     */
    /**
     * Establece la condición.
     * @var object $condicion Array campo=>valor a utilizar como filtro.
     */
    /**
     * Establece la condición.
     * @var object $condicion Instancia de la entidad cuyos campos se utilizarán como filtro.
     */
    public function donde($condicion,$parametros=null) {
        $this->consultaCondiciones[]=$this->generarCondicion($condicion,$parametros);
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
    protected function generarCondicion($condicion,$parametros) {
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

                $sql[]=$this->alias.'.`'.$clave.'`=?';
                
                if($valor===true) {
                    $valor=1;
                } elseif($valor===false) {
                    $valor=0;
                }
                $parametros[]=$valor;
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
        $this->consultaValores=$objeto;
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
        $this->bd->asignar($this->parametros,implode('',$this->tipos));
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

                if(!$this->consultaProcesarRelaciones) {
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
        $fila=$this->resultado->siguiente();
        if(!$fila) return null;
        return $this->fabricarEntidad($fila);
    }

    /**
     * Ejecuta la consulta y devuelve un array de elementos.
     */
    public function obtenerListado() {
        $this->ejecutarConsulta();

        $resultado=[];
        while($fila=$this->resultado->siguiente()) {
            $resultado[]=$this->fabricarEntidad($fila);
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
        $this->consultaProcesarRelaciones=false;

        $this->establecerValores(['e'=>$e])->actualizar();

        $this->consultaProcesarRelaciones=$procesarRelaciones;

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
        return $this->ejecutarConsulta('insertar');
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
    public function prepararRelaciones(&$alias) {
        foreach($this->campos as $nombre=>$campo) {
            if($campo->tipo=='relacional') {
                $obj=modelo::fabricarModelo($campo->modelo,$this->bd);
                
                $alias++;
                $obj->alias='t'.$alias;

                $condicion='';

                if($campo->relacion=='1:n') {
                    $condicion=$obj->alias.'.`'.$campo->columna.'`='.$this->alias.'.`id`';
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
                $obj->prepararRelaciones($alias);
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
                
                $join='join';
                if($relacion->tipo=='1:0') $join='left join';

                $relaciones[]=$join.' #__'.$relacion->modelo->nombre.' '.$relacion->modelo->alias.' on '.$relacion->condicion;

                //Combinar recursivamente
                $relacion->modelo->construirCamposYRelaciones($campos,$relaciones);
            }
        }

        foreach($this->campos as $nombre=>$campo) {
            if($campo->tipo=='relacional') continue;

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

            $this->prepararRelaciones($alias)
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

            $condiciones=[];
            $parametros=[];
            
            foreach($this->consultaCondiciones as $condicion) {
                $condiciones[]=$condicion->condicion;
                foreach($condicion->parametros as $parametro) {
                    $parametros[]=$parametro;
                    $tipos[]=$this->determinarTipo($parametro);
                }
            }

            $sql.=' ( '.implode(' ) and ( ',$condiciones).' ) ';
        } elseif($operacion=='actualizar') {
            $sql.=' where '.$this->alias.'.`id`=? ';
            $parametros[]=$this->consultaValores->id;
            $tipos[]='d';
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
                $parametros=[];
                
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

        foreach($this->campos as $nombre=>$campo) {
            if($nombre=='id') continue;
            if($campo->tipo!='relacional') {
                $valor=null;
                if(is_array($this->consultaValores)) {
                    $valor=$this->consultaValores[$nombre];
                } else {
                    $valor=$this->consultaValores->$nombre;
                }
                if($valor===null) continue;

                $campos[]=($alias?$this->alias.'.':'').'`'.$nombre.'`=?';
                $parametros[]=$valor;
                $tipos[]=$this->determinarTipo($valor);
            }
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

    //TODO Métodos útiles para búsqueda fonética - Ver otras utilidades posibles
}