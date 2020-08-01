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
 * Clase base de las entidades del modelo de datos.
 */
class modelo {
    //TODO campos que se codifiquen solos con una funcion mysql o un callback / que pueda configurarse la acción si es nulo o vacio (por ejemplo, campo password, no guardar si es '')

    var $modelName;

    //Usamos el prefijo __e_ ya que los campos del registro se corresponderán con propiedades de la entidad
    //y debemos evitar que un nombre de campo coincida con una propiedad de la clase.
    protected $__e_db;
    protected $__e_owndb;
    protected $__e_entityName;
    protected $__e_table;
    protected $__e_fields;
    protected $__e_fieldTypes;

    protected $__e_select;
    protected $__e_joins;
    protected $__e_where;
    protected $__e_where_vars;
    protected $__e_process_joins;
    protected $__e_order;
    protected $__e_groupby;
    protected $__e_having;
    protected $__e_having_vars;
    protected $__e_toprepare;
    protected $__e_toprepare_types;
    protected $__e_limit;
    protected $__e_alias;
    protected $__e_autocommit;
    protected $__e_transact;
    protected $__e_reuseprepared;
    protected $__e_prepared;
    protected $__set_expr;

    protected $__e_error;
    protected $__e_errordesc;
    protected $__e_sql=null;

    //Campos predefinidos (los demás serán creados en base a la definición JSON de la entidad)
    var $e;
    var $id;

    function __construct($db=null) {
        $this->__e_fields=array();
        $this->__e_fieldTypes=array();

        $n=get_class($this);
        $this->__e_entityName=substr($n,strrpos($n,'\\')+1);

        $structure=json_decode(file_get_contents(_modeloAplicacion.$this->__e_entityName.'.json'));

        //Las propiedades title y keys están para la construcción de la tabla y los asistentes del IDE
        $this->__e_table=$structure->tabla;

        $types=array('number'=>'d','text'=>'s'); //i, b?

        foreach($structure->campos as $field) {
            //TODO relación de entidades
            $this->__e_fields[]=$field->name;
            if($field->type) $this->__e_fieldTypes[$field->name]=$types[$field->type];
        }

        //$this->__e_fields[]='id';
        //$this->__e_fields[]='e';

        //if(!$db) {
        //    $this->__e_owndb=true;
        //    $this->__e_db=new db;
        //    $this->open();
        //} else {
            $this->__e_owndb=false;
            $this->__e_db=$db;
        //}

        $this->reset();
    }

    function __destruct() {
        if($this->__e_owndb) $this->close();
    }

    function getDBLink() {
        return $this->__e_db;
    }

    function getEntityName() {
        return $this->__e_entityName;
    }

    function getTableName() {
        return $this->__e_table;
    }

    function getAlias() {
        return $this->__e_alias;
    }

    function open() {
        $this->__e_db->connect();
        return $this;
    }

    function close() {
        if($this->__e_db) $this->__e_db->close();
        return $this;
    }

    function beginTransaction() {
        $this->__e_db->beginTransaction();
        $this->__e_transact=true;
        return $this;
    }

    function commit() {
        $this->__e_db->commit();
        $this->__e_transact=false;
        return $this;
    }

    function setAutocommit($v=true) {
        $this->__e_autocommit=$v;
        $this->__e_db->autocommit($v);
        return $this;
    }

    function rollback() {
        $this->__e_db->rollback();
        $this->__e_transact=false;
        return $this;
    }

    function getFieldType($n) {
        return array_key_exists($n,$this->__e_fieldTypes)?$this->__e_fieldTypes[$n]:null;
    }

    function reset() {
        $this->__e_select=null;
        $this->__e_joins=null;
        $this->__e_where=null;
        $this->__e_where_vars=array();
        $this->__e_process_joins=false;
        $this->__e_order=null;
        $this->__e_groupby=null;
        $this->__e_having=null;
        $this->__e_having_vars=null;
        $this->__e_limit=null;
        $this->__e_alias='';
        $this->__e_autocommit=true;
        $this->__e_transact=false;
        $this->__e_error=false;
        $this->__e_errordesc='';
        $this->__e_reuseprepared=false;
        $this->__e_prepared=false;
        $this->__set_expr=[];

        $this->resetFields();

        return $this;
    }

    function resetFields() {
        foreach($this->__e_fields as $c) $this->$c=null;
        return $this;
    }

    function set($k,$v=null) {
        if(is_object($k)) {
            foreach($this->__e_fields as $c) {
                if(property_exists($k,$c)) $this->$c=$k->$c;
            }
        } elseif(is_array($k)) {
            foreach($this->__e_fields as $c) {
                if(array_key_exists($c,$k)) $this->$c=$k[$c];
            }
        } else {
            $this->$k=$v;
        }
        return $this;
    }

    function setExpr($v) {
        $this->__set_expr[]=$v;
        return $this;
    }

    function uset($k) {
        $this->$k=null;
        return $this;
    }

    function error() {
        return $this->__e_error;
    }

    function errorDescr() {
        return $this->__e_errordesc;
    }

    function errorDescription() {
        return $this->errorDescr();
    }

    function setProcessJoins($p=true) {
        $this->__e_process_joins=$p;
        return $this;
    }

    function select($c) {
        $this->__e_select=$c;
        return $this;
    }

    function innerJoin($t,$al,$c,$v=null) {
        return $this->addJoin('inner',$t,$al,$c,$v);
    }

    function join($t,$al,$c,$v=null) {
        return $this->addJoin('',$t,$al,$c,$v);
    }

    function leftJoin($t,$al,$c,$v=null) {
        return $this->addJoin('left',$t,$al,$c,$v);
    }

    function rightJoin($t,$al,$c,$v=null) {
        return $this->addJoin('right',$t,$al,$c,$v);
    }

    function outerJoin($t,$al,$c,$v=null) {
        return $this->addJoin('outer',$t,$al,$c,$v);
    }

    function fullOuterJoin($t,$al,$c,$v=null) {
        return $this->addJoin('full outer',$t,$al,$c,$v);
    }

    function addJoin($jt,$t,$al,$c,$v=null) {
        $this->__e_joins[]=array($jt,$t,$al,$c,$v);
        return $this;
    }

    function where() {
        $a=func_get_args();
        $c=array_shift($a);
        if($this->__e_where) $this->__e_where.=' and ';
        $this->__e_where.=' ('.$c.') ';

        if(count($a)) {
            if(count($a)==1&&is_array($a[0])) {
                $this->__e_where_vars=array_merge($this->__e_where_vars,$a[0]);
            } else {
                $this->__e_where_vars=array_merge($this->__e_where_vars,$a);
            }
        }

        return $this;
    }

    /**
     * Asistente para agregar un parámetro IN() / NOT IN() a las condiciones.
     */
    function in($field,$values,$not=false) {			
        $a=[];
        foreach($values as $x) $a[]='?';
        call_user_func_array([$this,'where'],array_merge([$field.' '.($not?'not':'').' in ('.implode(',',$a).')'],$values));
        return $this;
    }

    function notIn($field,$values) {
        return $this->in($field,$values,true);
    }

    /**
     * Agrega una condición con sus variables. A diferencia de where(), no autodetecta el tipo de variables, sino que deben
     * listarse como segundo parámetro.
     */
    function whereType() {
        $a=func_get_args();
        $c=array_shift($a);
        $t=array_shift($a);

        if($this->__e_where) $this->__e_where.=' and ';
        $this->__e_where.=' ('.$c.') ';

        if(count($a)) {
            //Convertir cada elemento de $a en un array [variable,tipo]
            foreach($a as $i=>$v) $a[$i]=array($v,$t[$i]);
            $this->__e_where_vars=array_merge($this->__e_where_vars,$a);				
        }

        return $this;
    }

    function orderBy($c,$o=null) {
        $this->__e_order=$c.($o?' '.$o:'');
        return $this;
    }

    function groupBy($g) {
        $this->__e_groupby=$g;
        return $this;
    }

    function having() {
        $a=func_get_args();
        $c=array_shift($a);
        $this->__e_having=$c;
        if(count($a)) $this->__e_having_vars=$a;
        return $this;
    }

    function limit($d,$c=null) {
        if($d===null) {
            $this->__e_limit=null;
        } else {
            if($c) {
                $this->__e_limit=$d.','.$c;
            } else {
                $this->__e_limit=$d;
            }
        }
        return $this;
    }

    function page($p,$c) {
        $p=intval($p);
        $this->limit(($p-1)*$c,$c);
        return $this;
    }

    protected function newSentence() {
        $this->__e_toprepare=array();
        $this->__e_toprepare_types='';
    }

    function lastSql() {
        return $this->__e_sql;
    }

    protected function prepare($sql) {
        $this->__e_sql='"'.$sql.'"'.(count($this->__e_toprepare)?' '.implode('; ',$this->__e_toprepare).' as '.$this->__e_toprepare_types:'');

        if($this->__e_prepared&&$this->__e_reuseprepared) {
            $this->__e_db->bindParams($this->__e_toprepare_types,$this->__e_toprepare);
        } else {
            $this->__e_db->prepare($sql,$this->__e_toprepare_types,$this->__e_toprepare);
        }

        $this->__e_error=$this->__e_db->error();
        $this->__e_errordesc=$this->__e_db->errorDescription();
        $this->__e_reuseprepared=false; //reuse() solo es por una query
        $this->__e_prepared=true;
    }

    function reuse() {
        $this->__e_reuseprepared=true;
        $this->resetFields();
        return $this;
    }

    //Types: s = string, i = integer, d = double,  b = blob
    protected function addVar($v,$t=null) {
        if($t==null) {
            if(is_integer($v)||preg_match('/^[0-9]+$/',$v)) {
                $t='i';
            } elseif($this->is_double($v)) { //Le damos una validación especial para que puedan usar , o .
                $t='d';
                $v=doubleval(str_replace(',','.',$v));
            } else {
                $t='s';
            }
        }

        //$this->__e_toprepare=array_merge($this->__e_toprepare,$v);
        $this->__e_toprepare[]=$v;
        $this->__e_toprepare_types.=$t;
    }

    protected function is_double($v) {
        if(is_double($v)) return true;
        if(preg_match('/^[0-9\,]+$/',$v)&&substr_count($v,',')==1) return true;
        if(preg_match('/^[0-9\.]+$/',$v)&&substr_count($v,'.')==1) return true;
        return false;
    }

    protected function buildConds() {
        $sql='';
        if($this->__e_where) {
            $sql=' where ';
            if($this->e===null) {
                $sql.=' '.($this->__e_alias?$this->__e_alias.'.':'').'e=0 and ';
            } else {
                $sql.=' '.($this->__e_alias?$this->__e_alias.'.':'').'e=? and ';
                $this->addVar($this->e);
            }
            $sql.=' ('.$this->__e_where.')';
            foreach($this->__e_where_vars as $v) {
                if(is_array($v)) {
                    $this->addVar($v[0],$v[1]);
                } else {
                    $this->addVar($v);
                }
            }
        } else {
            $s=array();
            foreach($this->__e_fields as $c) {
                if($this->$c!==null) {
                    $s[]=($this->__e_alias?$this->__e_alias.'.':'').$c.'=?';
                    $this->addVar($this->$c);
                }
            }
            if($this->e===null) $s[]=($this->__e_alias?$this->__e_alias.'.':'').'e=0';
            if(count($s)) $sql=' where '.implode(' and ',$s);
        }
        return $sql;
    }

    function setAlias($a) {
        $this->__e_alias=$a;
        return $this;
    }

    protected function buildSelect() {
        $this->newSentence();

        $sql='select '.($this->__e_select?$this->__e_select:'*').' from #__'.$this->__e_table.' '.$this->__e_alias;

        if($this->__e_joins) {
            foreach($this->__e_joins as $j) {
                $sql.=' '.$j[0].' join #__'.$j[1].' '.$j[2].' on '.$j[3];
                if($j[4]) $this->addVar($j[4]);
            }
        }

        $sql.=$this->buildConds();

        if($this->__e_groupby) $sql.=' group by '.$this->__e_groupby;

        if($this->__e_having) {
            $sql.=' having '.$this->__e_having;
            foreach($this->__e_having_vars as $v) $this->addVar($v);
        }

        if($this->__e_order) $sql.=' order by '.$this->__e_order;

        if($this->__e_limit) $sql.=' limit '.$this->__e_limit;

        $this->prepare($sql);
    }

    function getOne() {
        $this->limit(1);
        $this->buildSelect();
        $q=$this->__e_db->query();
        
        if(!$q) throw new \Exception($this->errorDescription().' ejecutando la consulta: '.$this->lastSql());

        $row=$q->next();

        return $row;
    }

    function aggregateFunc($func,$col,$distinct=false) {
        $origSelect=$this->__e_select;
        $origLimit=$this->__e_limit;
        $origOrd=$this->__e_order;

        $this->select($func.'('.($distinct?'distinct '.$col:$col).') m')->limit(null)->orderBy(null);
        $q=$this->get();
        
        if(!$q) throw new \Exception($this->errorDescription().' ejecutando la consulta: '.$this->lastSql());

        $res=$q->next();

        $this->__e_select=$origSelect;
        $this->__e_limit=$origLimit;
        $this->__e_order=$origOrd;

        $v=$res->m;

        return $v;
    }

    function count($distinct=false,$distinctCol='id') {
        return $this->aggregateFunc('count',$distinct?$distinctCol:'*',$distinct);
    }

    function countDistinct($col) {
        return $this->count(true,$col);
    }

    function sum($col,$distinct=false) {
        return $this->aggregateFunc('sum',$col,$distinct);
    }

    function sumDistinct($col) {
        return $this->sum($col,true);
    }

    function get() {
        $this->buildSelect();
        return $this->__e_db->query();
    }

    function getArray() {
        $res=$this->get();
        
        if(!$res) throw new \Exception($this->errorDescription().' ejecutando la consulta: '.$this->lastSql());

        $o=array();
        while($row=$res->next()) $o[]=$row;

        return $o;
    }

    function save() {
        if($this->id) {
            return $this->update();
        } else {
            return $this->create();
        }
    }

    //Permite realizar un insert aunque esté seteado id (inserta nuevo registro con ese id en lugar de realizar update)
    function create() {
        $this->newSentence();

        $sql='insert into';
        $sql.=' #__'.$this->__e_table.' set ';

        $s=array();
        foreach($this->__e_fields as $c) {
            if($this->$c!==null) {
                $s[]=$c.'=?';
                $this->addVar($this->$c,$this->getFieldType($c));
            }
        }
        if(count($s)) $sql.=implode(',',$s);

        $this->prepare($sql);

        $q=$this->__e_db->query();

        $this->id=$q->id();

        return $q;
    }

    //Permite realizar un update aunque no esté seteado id
    function update() {
        $this->newSentence();

        $sql='update #__'.$this->__e_table.' set ';

        $s=array();
        foreach($this->__e_fields as $c) {
            if(
                ($this->id==null&&$this->$c!==null) ||
                ($this->id!=null&&$c!='id'&&$this->$c!==null)
            ) {
                $s[]=$c.'=?';
                $this->addVar($this->$c);
            }
        }
        if(count($s)) $sql.=implode(',',$s);

        if(count($this->__set_expr)) $sql.=($sql?',':'').implode(',',$this->__set_expr);

        if($this->id==null) {
            if($this->__e_where) $sql.=$this->buildConds();
        } else {
            $sql.=' where id=?';
            $this->addVar($this->id);
        }

        $this->prepare($sql);

        $this->__e_db->query();

        return $this;
    }

    function delete($v=1) {
        $this->newSentence();

        $sql='update #__'.$this->__e_table.' set e=?';
        $this->addVar($v);

        if($this->id==null) {
            $sql.=$this->buildConds();
        } else {
            $sql.=' where id=?';
            $this->addVar($this->id);
        }

        $this->prepare($sql);

        $this->__e_db->query();

        return $this;
    }

    function undelete($v=1) {
        return $this->delete(0);
    }

    function affectedRows() {
        return $this->__e_db->numRows;
    }

    function lock($mode='write') {
        $this->__e_db->query('lock tables #__'.$this->__e_table.' '.($this->__e_alias?$this->__e_alias:'').' '.$mode);
        
        return $this;
    }

    function unlock() {
        $this->__e_db->query('unlock tables');

        return $this;
    }

    function query($q) {
        $result=$this->__e_db->query($q);
        
        return $this;
    }

    /**
     * Devuelve la ruta a este modelo de datos.
     * @return string
     */
    function getPath() {
        return _modeloAplicacion;
    }

    //===== MÉTODOS ÚTILES PARA UTILIZAR O SOBREESCRIBIR ===========================================================

    /**
     * Devuelve un array con las filas de la tabla, cada una como un objeto.
     * @param null $limit Cantidad de filas. Opcional (predeterminado=todas).
     * @param int $page Página, en caso de especificarse $limit. Opcional (predeterminado=1).
     * @return array
     */
    function listAll($limit=null,$page=1) {
        $this->reset();
        if($limit) $this->page($page,$limit);
        return $this->getArray();
    }

    /**
     * Realiza una búsqueda y devuelve un número limitado de filas, como array. Ideal para su uso con campos de búsqueda
     * o similares.
     * @param string $query Término de búsqueda.
     * @return array
     */
    function search($query) {
        $this->reset()->limit(20);
        $this->setSearchConditions($query);
        return $this->getArray();
    }

    /**
     * Establece las condiciones para la búsqueda mediante el método search().
     * @param string $query Término de búsqueda.
     */
    function setSearchConditions($query) {
        $this->where('id=? or title like ?',$query,'%'.$query.'%');
    }

    /**
     * Devuelve una fila como objeto.
     * @param int $id ID de la fila.
     * @return mixed
     */
    function getItem($id) {
        return $this->reset()->where('id=?',$id)->getOne();
    }
}