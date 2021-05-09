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
 * Relación del constructor de consultas MySQL.
 */
class relacion extends \datos\relacion {
    /**
     * Devuelve el código SQL de la relación.
     * @return string
     */
    public function obtenerSql() {
        $sql='';

        if($this->tipo==self::izquierda) {
            $sql.='LEFT ';
        } elseif($this->tipo==self::derecha) {
            $sql.='RIGHT ';
        } elseif($this->tipo==self::interior) {
            //$sql.='INNER ';
        } else {
            return null;
        }

        $sql.='JOIN #__'.$this->esquema.($this->alias?' '.$this->alias:'');

        $condicion=$this->condicion->obtenerSql();

        $sql.=' ON '.$condicion->sql;

        return (object)[
            'sql'=>$sql,
            'parametros'=>$condicion->parametros,
            'variables'=>$condicion->variables,
            'tipos'=>$condicion->tipos
        ];
    }
}