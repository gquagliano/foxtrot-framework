<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace mysqli;

defined('_inc') or exit;

/**
 * Constructor de consultas MySQL.
 */
class constructor extends \datos\constructor {
    protected static $temporal=1;

    protected $parametros=[];

    protected $indentacion;

    /**
     * Devuelve la instancia de una nueva condición.
     * @return \mysqli\condicion
     */
    public function fabricarCondicion() {
        return new condicion;
    }

    /**
     * Devuelve la instancia de una nueva relación.
     * @return \mysqli\relacion
     */
    public function fabricarRelacion() {
        return new relacion;
    }

    /**
     * Construye y devuelve el fragmento de la consulta SQL a partir de `WHERE ...`.
     * @param int $operacion
     * @param array $variables
     * @param array $tipos
     * @return string
     */
    protected function construirConsultaCondiciones($operacion,&$variables,&$tipos) {
        $sql='';
        
        $sql.=$this->construirCondiciones($operacion,condicion::donde,$variables,$tipos);

        if($this->agrupar) $sql.=' '.PHP_EOL.'GROUP BY '.$this->agrupar;

        $sql.=$this->construirCondiciones($operacion,condicion::teniendo,$variables,$tipos);

        if($this->ordenCampo) {
            $sql.=' '.PHP_EOL.'ORDER BY '.$this->ordenCampo;
            if($this->ordenSentido) $sql.=' '.$this->ordenSentido;
        }

        if($operacion!=self::operacionContar&&($this->limiteOrigen!==null||$this->limiteCantidad!==null)) {
            $sql.=' '.PHP_EOL.'LIMIT ';
            $sql.=$this->limiteOrigen!==null?$this->limiteOrigen:'0';
            if($this->limiteCantidad!==null) $sql.=','.$this->limiteCantidad;
        }

        return $sql;
    }

    /**
     * Construye el fragmento SQL correspondiente a la selección `SELECT ... FROM ...`.
     * @param int $operacion
     * @param array $variables
     * @param array $tipos
     * @return string
     */
    protected function construirConsultaSeleccion($operacion,&$variables,&$tipos) {
        $sql='SELECT ';

        $sql.=$this->construirCamposSeleccion($operacion);

        $sql.=' '.PHP_EOL.'FROM #__'.$this->esquema.($this->alias?' '.$this->alias:'');

        foreach($this->relaciones as $relacion) {
            $res=$relacion->obtenerSql();
            if(!$res) continue;

            $sql.=' '.PHP_EOL.$res->sql;

            if($res->variables) {
                $variables=array_merge($variables,$res->variables);
                $tipos=array_merge($tipos,$res->tipos);
            }
        }

        $sql.=$this->construirConsultaCondiciones($operacion,$variables,$tipos);

        return $sql;
    }

    /**
     * Construye una consulta de actualización (`UPDATE`) o inserción (`INSERT INTO`).
     * @param int $operacion
     * @param array $variables
     * @param array $tipos
     * @return string
     */
    protected function construirConsultaActualizacionInsercion($operacion,&$variables,&$tipos) {
        if($operacion==self::operacionActualizar) {
            $sql='UPDATE ';
        } elseif($operacion==self::operacionInsertar) {
            $sql='INSERT INTO ';
        }
        
        $sql.='#__'.$this->esquema.' SET ';

        $sql.=$this->construirCamposActualizacionInsercion($operacion,$variables,$tipos);

        if($operacion==self::operacionActualizar)
            $sql.=$this->construirConsultaCondiciones($operacion,$variables,$tipos);

        return $sql;
    }

    /**
     * Construye la consulta a partir de la configuración actual.
     * @param int $operacion Operación a realizar (ver constantes `constructor::operacion...`).
     * @return \datos\constructor
     */
    public function construirConsulta($operacion) {
        $sql='';
        $variables=[];
        $tipos=[];
        $this->indentacion=1;

        if($operacion==self::operacionSeleccionar||$operacion==self::operacionContar) {
            $sql=$this->construirConsultaSeleccion($operacion,$variables,$tipos);
        } elseif($operacion==self::operacionInsertar||$operacion==self::operacionActualizar) {
            $sql=$this->construirConsultaActualizacionInsercion($operacion,$variables,$tipos);
        } elseif($operacion==self::operacionEliminar) {
            //TODO Por el momento no se usa (solo bajas lógicas)
        }

        $sql.=';';

        $this->consulta=(object)[
            'sql'=>$sql,
            'variables'=>$variables,
            'tipos'=>$tipos
        ];

        return $this;
    }

    /**
     * Construye el fragmento SQL correspondiente al listado de campos a seleccionar.
     * @param int $operacion
     * @return string
     */
    protected function construirCamposSeleccion($operacion) {
        if($operacion==self::operacionContar&&!$this->agrupar) 
            return 'COUNT(*) __cantidad';

        $campos='';

        foreach($this->campos as $i=>$campo) {
            if($i>0) $campos.=',';

            //Formateo
            if($i&&$i%6==0) $campos.=' '.PHP_EOL.'    ';

            if(is_string($campo)) {
                $campos.=$campo;
            } else {
                $nombre='';
                if(strpos($campo->nombre,'.')===false) $nombre.=($campo->esquema?$campo->esquema:$this->alias).'.';
                $nombre.=$campo->nombre;

                $campos.=$nombre.($campo->alias?' '.$campo->alias:'');
            }

            $i++;
        }

        return $campos;
    }

    /**
     * Construye el fragmento de la consulta SQL correspondiente a los campos a asignar.
     * @param int $operacion
     * @param array $variables
     * @param array $tipos
     * @return string
     */
    protected function construirCamposActualizacionInsercion($operacion,&$variables,&$tipos) {
        $campos='';
        $i=0;
        foreach($this->campos as $campo) {
            if($campo->valor===null) continue;
            
            if($campos!=='') $campos.=',';
            
            //Formateo
            if($i&&$i%6==0) $campos.=' '.PHP_EOL.'    ';
            
            $campos.=$campo->nombre.'=';

            //TODO Soporte para funciones y otros tipos de datos

            if($campo->valor instanceof \nulo) {
                $campos.='NULL';
            } else {
                $variable=self::obtenerVariableTemporal();
                $campos.='@'.$variable;

                $variables[$variable]=$campo->valor;
                $tipos[$variable]=$this->traducirTipo($campo->tipo,$campo->valor);
            }

            $i++;
        }

        return $campos;
    }

    /**
     * Construye el código SQL correspondiente a las condiciones `WHERE` o `HAVING`.
     * @param int $operacion
     * @param int $tipo
     * @param array $variables
     * @param array $tipos
     * @return string
     */
    protected function construirCondiciones($operacion,$tipo,&$variables,&$tipos) {
        $sql='';

        $alias=$operacion==self::operacionSeleccionar||$operacion==self::operacionContar;
        
        if(count($this->condiciones)) {
            $i=0;
            $ultima=null;
            foreach($this->condiciones as $condicion) {
                if($condicion->obtenerTipo()!=$tipo) continue;
                
                $res=$condicion->obtenerSql($ultima,$alias);
                if(!$res) continue;

                if($i==0) {
                    if($tipo==condicion::donde) {
                        $sql.=' '.PHP_EOL.'WHERE';
                    } elseif($tipo==condicion::teniendo) {
                        $sql.=' '.PHP_EOL.'HAVING';
                    }
                }
                
                $sql.=' '.PHP_EOL;

                //Formateo
                if($condicion->obtenerParentesis()==')') $this->indentacion--;
                $sql.=str_repeat('    ',$this->indentacion);
                $sql.=$res->sql;
                
                //Formateo
                if($condicion->obtenerParentesis()=='(') $this->indentacion++;
                
                if($res->variables) {
                    $variables=array_merge($variables,$res->variables);
                    $tipos=array_merge($tipos,$res->tipos);
                }

                $i++;
                $ultima=$condicion;
            }
        }

        return $sql;
    }

    /**
     * Dado un tipo de datos (ver constantes `constructor::tipo...`), devuelve la representación para MySQL (`s`, `i`, `d` o `b`). Si el tipo
     * no es válido o es `null`, se estimará en base al contenido de `$valor`.
     * @param int $tipo Tipo.
     * @param mixed $valor Valor.
     * @return string
     */
    public static function traducirTipo($tipo,$valor) {
        $tipos=[
            self::tipoTexto=>'s',
            self::tipoEntero=>'i',
            self::tipoDecimal=>'d',
            self::tipoBinario=>'b',
        ];
        if(array_key_exists($tipo,$tipos)) return $tipos[$tipo];
        if(is_integer($valor)) return 'i';
        if(is_numeric($valor)||preg_match('/^[0-9]*\.[0-9]+$/',$valor)) return 'd';
        return 's';
    }

    /**
     * Genera y devuelve un nombre único para una variable temporal.
     * @return string
     */
    public static function obtenerVariableTemporal() {
        return '__temp_'.(++self::$temporal);
    }
}