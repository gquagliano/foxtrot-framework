<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace mysqli;

use datos\nulo;

defined('_inc') or exit;

/**
 * Condición del constructor de consultas MySQL.
 */
class condicion extends \datos\condicion {
    /**
     * Devuelve el código SQL de la condición.
     * @param \datos\condicion $condicionPrevia Condición previa, o `null`.
     * @param bool $incluirAlias Incluir los alias de campos en la salida.
     * @return string
     */
    public function obtenerSql($condicionPrevia=null,$incluirAlias=true) {
        $sql='';
        $variables=[];
        $tipos=[];

        if($this->union&&$condicionPrevia&&$condicionPrevia->obtenerParentesis()!='(') $sql.=[
                self::operadorY=>'AND ',
                self::operadorO=>'OR ',
                self::operadorOX=>'XOR '
            ][$this->union];

        if($this->parentesis) {
            $sql.=$this->parentesis;
            return (object)[
                'sql'=>$sql
            ];
        }

        if($this->sql) {
            $sql.=$this->sql;
            return (object)[
                'sql'=>$sql,
                'variables'=>$this->variables,
                'tipos'=>$this->tiposVariables
            ];
        }

        $campo=($incluirAlias&&$this->aliasCampo?$this->aliasCampo.'.':'').$this->campo;

        if($this->valor instanceof \nulo) {
            if($this->operador=='<>') {
                $sql.=$campo.' IS NOT NULL';
            } else {
                $sql.=$campo.' IS NULL';
            }
        } elseif($this->operador==self::operadorComo||$this->operador==self::operadorNoComo) {
            if($this->valor===null) return null;
            
            $var=constructor::obtenerVariableTemporal();

            $sql.=$campo;
            if($this->operador==self::operadorNoComo) $sql.=' NOT';
            $sql.=' LIKE @'.$var;

            $variables[$var]=$this->valor;
            $tipos[$var]=constructor::traducirTipo($this->tipoValor,$this->valor);
        } elseif($this->operador==self::operadorEn||$this->operador==self::operadorNoEn) {
            if(!is_array($this->valor)) return null;

            $lugares=[];
            foreach($this->valor as $valor) {
                if($valor===null||$valor instanceof nulo) continue;

                $var=constructor::obtenerVariableTemporal();
                $lugares[]='@'.$var;
                $variables[$var]=$valor;
                $tipos[$var]=constructor::traducirTipo($this->tipoValor,$valor);
            }

            if(count($lugares)) {
                $sql.=$campo;
                if($this->operador==self::operadorNoEn) $sql.=' NOT';
                $sql.=' IN ('.implode(',',$lugares).')';
            } else {
                return null;
            }
        } elseif(in_array($this->operador,['=','<>','<','<=','>','>='])) {
            if($this->campo2) {
                $sql.=$campo.$this->operador;
                $sql.=($incluirAlias&&$this->aliasCampo2?$this->aliasCampo2.'.':'').$this->campo2;
            } elseif($this->valor!==null) {
                $var=constructor::obtenerVariableTemporal();
                $sql.=$campo.$this->operador.'@'.$var;
                $variables[$var]=$this->valor;
                $tipos[$var]=constructor::traducirTipo($this->tipoValor,$this->valor);
            } else {
                return null;
            }
        } else {
            return null;
        }

        return (object)[
            'sql'=>$sql,
            'variables'=>$variables,
            'tipos'=>$tipos
        ];
    }
}