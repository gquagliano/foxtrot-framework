<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace datos;

defined('_inc') or exit;

/**
 * Interfaz de las condiciones del constructor de consultas.
 */
class condicion {
    const operadorY=5;
    const operadorO=6;
    const operadorOX=7;
    const operadorComo=8;
    const operadorNoComo=9;
    const operadorEn=10;
    const operadorNoEn=11;

    const donde=1;
    const teniendo=2;

    protected $union;
    protected $aliasCampo;
    protected $campo;
    protected $operador;
    protected $valor;
    protected $tipoValor;
    protected $aliasCampo2;
    protected $campo2;
    protected $parentesis;
    protected $sql;
    protected $variables=[];
    protected $tiposVariables=[];
    protected $tipo=self::donde;

    /**
     * Devuelve los parámetros de la condición.
     * @return object
     */
    public function obtenerCondicion() {
        return (object)[
            'sql'=>[
                'sql'=>$this->sql,
                'variables'=>$this->variables
            ],
            'campo'=>[
                $this->aliasCampo2,
                $this->campo
            ],
            'operador'=>$this->operador,
            'valor'=>$this->valor,
            'campo2'=>[
                $this->aliasCampo2,
                $this->campo2
            ]
        ];
    }

    /**
     * Establece el tipo de condición.
     * @param int $tipo Tipo de condición, `condicion::donde` (`WHERE`) o `condicion::teniendo` (`HAVING`).
     * @return \datos\condicion
     */
    public function establecerTipo($tipo) {
        $this->tipo=$tipo;
        return $this;
    }

    /**
     * Devuelve el tipo de condición.
     * @return int
     */
    public function obtenerTipo() {
        return $this->tipo;
    }

    /**
     * Abre un paréntesis en la secuencia de condiciones.
     * @return \datos\condicion
     */
    public function abreParentesis($union) {
        $this->union=$union;
        $this->parentesis='(';
        return $this;
    }

    /**
     * Cierra un paréntesis en la secuencia de condiciones.
     * @return \datos\condicion
     */
    public function cierraParentesis() {
        $this->parentesis=')';
        return $this;
    }

    /**
     * Devuelve el tipo de paréntesis (`'('` o `')'`), o `null`.
     * @return string
     */
    public function obtenerParentesis() {
        return $this->parentesis;
    }

    /**
     * Configura la condición como una comparación entre un campo y un valor dado `campo[operador]valor`.
     * @param int $union Unión con la condición anterior (ver constantes `condicion::operador...`).
     * @param string $alias Alias del esquema.
     * @param string $campo Nombre del campo.
     * @param mixed $operador Operador de comparación (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`).
     * @param mixed $valor Valor.
     * @param int $tipo Tipo del valor (ver constantes `constructor::tipo....`). Opcional; si se omite, se estimará el tipo automáticamente.
     */
    public function valor($union,$alias,$campo,$operador,$valor,$tipo=null) {
        $this->union=$union;
        $this->aliasCampo=$alias;
        $this->campo=$campo;
        $this->operador=$operador;
        $this->valor=$valor;
        $this->tipoValor=$tipo;
        return $this;
    }

    /**
     * Configura la condición como una comparación entre un dos campos `campo[operador]campo2`.
     * @param int $union Unión con la condición anterior (ver constantes `condicion::operador...`).
     * @param string $alias Alias del esquema.
     * @param string $campo Nombre del campo.
     * @param string $operador Operador de comparación (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`).
     * @param string $alias2 Alias del esquema del segundo campo.
     * @param string $campo2 Nombre del segundo campo.
     */
    public function campo($union,$alias,$campo,$operador,$alias2,$campo2) {
        $this->union=$union;
        $this->aliasCampo=$alias;
        $this->campo=$campo;
        $this->operador=$operador;
        $this->aliasCampo2=$alias2;
        $this->campo2=$campo2;
        return $this;
    }

    /**
     * Configura la condición como un fragmento de código SQL.
     * @param int $union Unión con la condición anterior (ver constantes `condicion::operador...`).
     * @param string $sql Código SQL.
     * @param array $variables Variables utilizadas en la sentencia, como `['nombre'=>valor]`.
     * @param array $tipos Tipos de los valores, como `['nombre'=>tipo]` (ver constantes `constructor::tipo`).  Opcional; si
     * se omite, se estimarán los tipos automáticamente.
     */
    public function sql($union,$sql,$variables=null,$tipos=null) {
        $this->union=$union;
        $this->sql=$sql;
        if($variables) $this->variables=(array)$variables;
        if($tipos) $this->tiposVariables=(array)$tipos;
        return $this;
    }

    /**
     * Devuelve el código SQL de la condición.
     * @param \datos\condicion $condicionPrevia Condición previa, o `null`.
     * @param bool $incluirAlias Incluir los alias de campos en la salida.
     * @return string
     */
    public function obtenerSql($condicionPrevia=null,$incluirAlias=true) {}
}