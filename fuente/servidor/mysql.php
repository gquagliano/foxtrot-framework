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
 * Interfaz de bases de datos MySQL.
 */
class db {
    /**
     * @var $l \mysqli
     */
    protected $l;
    protected $result;
    protected $prepared=null;

    protected $credentials;

    protected $open=false;
    protected $ac;

    protected $id;
    protected $numRows;
    protected $error;
    protected $errorDesc;

    protected $table;

    protected $index;

    protected $columns;

    function __construct($connect,$autocommit,$h,$u,$p,$n,$pre,$po) {
        $this->autocommit($autocommit);
        
        $this->credentials=array($h,$u,$p,$n,$po,$pre);

        if($connect) $this->conectar();
    }

    function setLink($l) {
        $this->open=true;
        $this->l=$l;
        return $this;
    }

    function getLink() {
        return $this->l;
    }
    
    function __destruct() {
        $this->desconectar();
    }

    function conectar() {
        if(!$this->open) {
            $this->l=new \mysqli($this->credentials[0],$this->credentials[1],$this->credentials[2],$this->credentials[3],$this->credentials[4]);
            if(!$this->l->connect_error) {
                $this->consulta("SET NAMES 'utf8'");
                $this->consulta("SET sql_mode=''");
                $horas=floor(\configuracion::$zonaHorariaMinutos/60);
                $minutos=str_pad(round(abs(\configuracion::$zonaHorariaMinutos)-abs($horas*60)),2,'0',STR_PAD_LEFT);
                $this->consulta("SET @@session.time_zone='".$horas.':'.$minutos."'");
                $this->open=true;
                $this->prepared=null;
                $this->autocommit($this->ac);
            }
        }
        
        return $this;
    }

    function ping() {
        try {
            $this->l->ping();
        } catch(Exception $x) {
            $this->conectar();
        }
    }

    function desconectar() {
        if($this->open) {
            $this->l->close();
            $this->open=false;
        }
        
        return $this;
    }

    function id() {
        return $this->id;
    }

    function numeroFilas() {
        return $this->numRows;
    }

    function error() {
        return $this->error;
    }
    
    function descripcionError() {
        return $this->errorDesc;
    }

    function siguiente() {
        if($this->prepared!=null) {
            if($this->prepared->fetch()){
                $result=new \stdClass;
                foreach($this->columns as $k => $v) {
                    //detectar tipos numericos
                    if(is_numeric($v)) $v+=0;
                    $result->$k=$v;
                }
                return $result;
            }else{
                return false;
            }
        }

        if(!is_object($this->result)) return false;
        $this->index++;
        return $this->result->fetch_object();
    }

    function siguienteAsociativo() {
        if($this->prepared!=null) {
            if($this->prepared->fetch()){
                $result=array();
                foreach($this->columns as $k => $v) {
                    //detectar tipos numericos
                    if(is_numeric($v)) $v+=0;
                    $result[$k]=$v;
                }
                return $result;
            }else{
                return false;
            }
        }

        if(!is_object($this->result)) return false;
        $this->index++;
        return $this->result->fetch_assoc();
    }

    function siguienteArray() {
        if($this->prepared!=null) {
            if($this->prepared->fetch()){
                $result=array();
                foreach($this->columns as $k => $v) {
                    //detectar tipos numericos
                    if(is_numeric($v)) $v+=0;
                    $result[]=$v;
                }
                return $result;
            }else{
                return false;
            }
        }

        if(!is_object($this->result)) return false;
        $this->index++;
        return $this->result->fetch_array();
    }
    
    function primero() {
        $this->irA(0);
        return $this;
    }
    
    function ultimo() {
        $this->irA($this->numeroFilas()-1);
        return $this;
    }
    
    function irA($i) {
        if($this->prepared!=null) {
            $this->prepared->data_seek($i);
            return $this;
        }

        if(is_object($this->result)) $this->result->data_seek($i);
        $this->index=$i;
        return $this;
    }
    
    function escapar($q) {
        if(is_array($q)) {
            foreach($q as $k=>$v) $q[$k]=$this->escapar($v);
            return $q;
        } else {
            return $this->l->escape_string($q);
        }
    }

    function comenzarTransaccion() {
        //$this->l->begin_transaction();
        $this->autocommit(false);
        return $this;
    }

    function autocommit($a) {
        $this->ac=$a;
        if($this->open) $this->l->autocommit($a);
        return $this;
    }

    function finalizarTransaccion() {
        return $this->l->commit();
    }

    function descartarTransaccion() {
        return $this->l->rollback();
    }	

    function consulta($q=null) {
        $q = preg_replace("/#__(?=([^\"']*[\"'][^\"']*[\"'])*[^\"']*$)/sim", $this->prefix, $q);

        if($q) {
            $this->result=$this->l->query($q);
            $this->prepared=null;
        } elseif($this->prepared!=null) {
            $this->prepared->execute();
            $this->prepared->store_result();
            $md=$this->prepared->result_metadata();
            if($md) {
                $params=array();
                $this->columns=array();
                while($field=$md->fetch_field()) $params[]=&$this->columns[$field->name];
                call_user_func_array(array($this->prepared,'bind_result'),$params);
            }
        } else {
            return null;
        }

        $this->errorDesc=$this->l->error;
        if($this->errorDesc) {
            $this->error=true;
        } else {
            $this->error=false;
        }
        $this->id=$this->l->insert_id;
        if($this->l->affected_rows) {
            $this->numRows=$this->l->affected_rows;
        } else {
            $this->numRows=$this->result->num_rows;
        }
        
        $this->primero();

        return $this;
    }

    //prepare(sql) = sin parámetros / los parámetros serán añadidos posteriormente
    //prepare(sql,types,vars...)
    //Types: s = string, i = integer, d = double,  b = blob
    function preparar() {
        $a=func_get_args();
        $q=array_shift($a);			
        $q = preg_replace("/#__(?=([^\"']*[\"'][^\"']*[\"'])*[^\"']*$)/sim", $this->prefix, $q);
        //mysqli_report(MYSQLI_REPORT_ALL);
        $this->prepared=$this->l->prepare($q);
        if(!$this->prepared) {
            $this->error=true;
            $this->errorDesc=$this->l->error;
        } elseif(count($a)) {
            $this->asociarParametros($a[0],$a[1]);
        }
        return $this;
    }
    
    function asociarParametros() {
        $a=func_get_args();
        if(count($a)>1&&(!is_array($a[1])||count($a[1]))) {
            $p=array($a[0]);
            if(is_array($a[1])) {
                for($i=0;$i<count($a[1]);$i++) $p[]=&$a[1][$i];
            } else {
                for($i=1;$i<count($a);$i++) $p[]=&$a[$i];
            }
            call_user_func_array(array($this->prepared,'bind_param'),$p);
        }
        return $this;
    }
    
    function aArray() {
        $res=array();
        while($r=$this->siguiente()) {
            $res[]=$r;
        }
        return $res;
    }
    
    function aArrayAsociativo() {
        $res=array();
        while($r=$this->siguienteAsociativo()) {
            $res[]=$r;
        }
        return $res;
    }
    
    /**
     * Bloquea las tablas.
     */
    function bloquear() {
        $args=func_get_args();
        if(is_string($args[count($args)-1])) {
            $mode=array_pop($args);
            $models=$args;
        } else {
            $mode='write';
            $models=$args;
        }
        $tables=array();
        foreach($models as $ent) {
            $tables[]='#__'.$ent;
        }
        $this->consulta('lock tables '.implode(',',$tables).' '.$mode);
    }

    function desbloquear() {
        $this->consulta('unlock tables');
    }
}
