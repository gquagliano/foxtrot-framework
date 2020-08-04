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
    protected $bd;

    protected $nombre;
    protected $tipoEntidad;
    protected $campos;
    
    protected $consultaColumnas=null;
    protected $consultaCondicion=null;
    protected $consultaCondicionParametros=null;
    protected $consultaAgrupar=null;
    protected $consultaTeniendo=null;
    protected $consultaTeniendoParametros=null;
    protected $consultaRelaciones=null;
    protected $consultaLimite=null;
    protected $consultaCantidad=null;
    protected $consultaPagina=null;
    protected $consultaCampoOrdenamiento=null;
    protected $consultaOrden=null;
    protected $consultaValores=null;

    protected $sql=null;
    protected $alias=1;

    function __construct() {
        $this->bd=foxtrot::obtenerInstanciaBd();
        
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
            foreach($this->campos as $campo=>$parametros) {
                $aliasCampo='__t'.$this->alias.'_'.$campo;

                if($parametros->tipo=='relacional') {
                    if($parametros->relacion=='1:n') {
                        $obj->$campo=[];
                        //TODO
                    }
                } else {
                    $obj->$campo=$fila->$aliasCampo;
                }
            }

            if(is_array($this->consultaRelaciones)) {
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
    public static function fabricarModelo($nombre) {        
        $cls='\\aplicaciones\\test\\modelo\\'.$nombre;
        return new $cls;
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

            if(preg_match_all('/@(tipo|modelo|relacion|condicion|indice)(.+?)(\n|\*\/)/',$comentario,$coincidencias)) {
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
        $this->consultaCondicion=null;
        $this->consultaCondicionParametros=null;
        $this->consultaAgrupar=null;
        $this->consultaTeniendo=null;
        $this->consultaTeniendoParametros=null;
        $this->consultaRelaciones=null;
        $this->consultaLimite=null;
        $this->consultaCantidad=null;
        $this->consultaPagina=null;
        $this->consultaCampoOrdenamiento=null;
        $this->consultaOrden=null;
        $this->consultaValores=null;
        $this->sql=null;
        $this->alias=1;
        return $this;
    }

    /**
     * Establece los campos a seleccionar.
     */
    public function seleccionar(...$campos) {
        $this->consultaColumnas=$campos;
        return $this;
    }

    /**
     * Establece la condición.
     * @var string $condicion Condición como cadena SQL. Pueden insertarse parámetros con el formato :nombre.
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
        $this->consultaCondicion=$condicion;
        $this->consultaCondicionParametros=$parametros;
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
     * @var string $condicion Condición como cadena SQL. Pueden insertarse parámetros con el formato :nombre.
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
        $this->consultaTeniendo=$condicion;
        $this->consultaTeniendoParametros=$parametros;
        return $this;
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
        $this->consultaCantidad=$cantidad;
        $this->consultaPagina=$pagina;
        return $this;
    }

    /**
     * Establece el ordenamiento. Puede invocarse múltiples veces para establecer múltiples columnas de ordenamiento.
     */
    public function ordenadoPor($columna,$orden='asc') {
        $this->consultaCampoOrdenamiento=$columna;
        $this->consultaOrden=$orden;
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
     * Ejecuta la consulta, sin devolver ningún elemento.
     */
    public function ejecutarConsulta() {
        $this->construirConsulta();
        $this->bd->consulta($this->sql);
    }
    
    /**
     * Ejecuta la consulta devolviendo un único elemento.
     */
    public function obtenerUno() {
        $this->consultaCantidad=1;
        $this->ejecutarConsulta();
        return $this->fabricarEntidad($this->bd->siguiente());
    }

    /**
     * Ejecuta la consulta y devuelve un array de elementos.
     */
    public function obtenerListado() {
        $this->ejecutarConsulta();

        $resultado=[];
        while($fila=$this->bd->siguiente()) {
            $resultado[]=$this->fabricarEntidad($fila);
        }

        return $resultado;
    }

    /**
     * Devuelve la cantidad de elementos encontrados. Puede utilizarse luego de ejecutarConsulta() u obtenerListado(), o bien antes de ellos para estimar la cantidad de elementos que arrojaría la consulta (puede ser aproximado).
     */
    public function obtenerCantidad() {

    }

    /**
     * Elimina los elementos que coincidan con la consulta.
     */
    public function eliminar() {

    }

    /**
     * Restaura los elementos que coincidan con la consulta.
     */
    public function restaurar() {

    }

    /**
     * Guarda el elemento establecido con establecerValores(). El mismo será insertado si no cuenta con campo `id`, o actualizado en caso contrario.
     */
    public function guardar() {

    }

    /**
     * Inserta el elemento establecido con establecerValores().
     */
    public function insertar() {

    }

    /**
     * Actualiza los elementos que coincidan con la consulta utilizando los campos del el elemento establecido con establecerValores().
     */
    public function actualizar() {

    }    

    /**
     * Comienza una transacción.
     */
    public function comenzarTransaccion() {
        return $this;
    }

    /**
     * Finaliza la transacción.
     */
    public function finalizarTransaccion() {
        return $this;
    }

    /**
     * Descarta y revierte la transacción.
     */
    public function descartarTransaccion() {
        return $this;
    }

    /**
     * Bloquea las tablas.
     */
    public function bloquear(...$tablas) {
        return $this;
    }

    /**
     * Desbloquea las tablas.
     */
    public function desbloquear() {

    }

    /**
     * Devuelve el listado de campos y modelos relacionados.
     */
    public function construirCamposYRelaciones(&$alias) {
        $campos=[];
        $relaciones=[];

        foreach($this->campos as $campo=>$parametros) {
            if($parametros->tipo=='relacional') {
                if($parametros->relacion!='1:n') { //Las relaciones 1:n no se realizarán con join
                    $alias++;

                    $join='left join';
                    if($parametros->relacion=='1:1') $join='join';

                    $obj=modelo::fabricarModelo($parametros->modelo);
                    $obj->alias=$alias;
                    
                    $relaciones[]=(object)[
                        'modelo'=>$obj,
                        'campo'=>$campo,
                        'sql'=>$join.' #__'.$parametros->modelo.' t'.$alias
                    ];

                    $resultado=$obj->construirCamposYRelaciones($alias);
                    $campos=array_merge($campos,$resultado->campos);
                    $relaciones=array_merge($relaciones,$resultado->relaciones);
                }
            } else {
                $campos[]='t'.$alias.'.`'.$campo.'` `__t'.$alias.'_'.$campo.'`';
            }
        }

        return (object)[
            'campos'=>$campos,
            'relaciones'=>$relaciones
        ];
    }

    /**
     * Construye la consulta SQL.
     */
    protected function construirConsulta() {
        $alias=1;
        
        $sql='select ';

        $resultado=$this->construirCamposYRelaciones($alias);
        $this->consultaRelaciones=$resultado->relaciones;

        $sql.=implode(',',$resultado->campos);

        $sql.=' from #__'.$this->nombre.' t1 ';

        $relaciones=[];
        foreach($resultado->relaciones as $relacion) $relaciones[]=$relacion->sql;
        $sql.=implode(' ',$relaciones);

        $this->sql=$sql;
        return $this;
    }
}