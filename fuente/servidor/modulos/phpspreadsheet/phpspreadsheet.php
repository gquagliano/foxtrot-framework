<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace modulos;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;

defined('_inc') or exit;

include_once(__DIR__.'/vendor/autoload.php');

/**
 * Módulo concreto phpspreadsheet. Implementa PhpOffice/PhpSpreadsheet versión 1.15.0.  
 * *Nota:* Todos los índices se trabajan en base `1`.
 */
class phpspreadsheet extends \modulo {
    /** @var \PhpOffice\PhpSpreadsheet\Spreadsheet $xls Instancia de Spreadsheet. */
    protected $xls;

    /**
     * Crea un nuevo libro.
     * @return \modulos\phpspreadsheet
     */
    public function crear() {
        $this->xls=new Spreadsheet();
        return $this;
    }

    /**
     * Devuelve la instancia de Spreadsheet.
     * @return \PhpOffice\PhpSpreadsheet\Spreadsheet
     */
    public function obtenerInstancia() {
        return $this->xls;
    }

    /**
     * Devuelve la instancia de la hoja actual.
     * @return \PhpOffice\PhpSpreadsheet\Worksheet
     */
    public function obtenerHoja() {
        return $this->xls->getActiveSheet();
    }

    /**
     * Abre un libro.
     * @param string $ruta Ruta local.
     * @return \modulos\phpspreadsheet
     */
    public function abrir($ruta) {
        $this->xls=IOFactory::load($ruta);
        return $this;
    }

    /**
     * Devuelve el listado de hojas del libro.
     * @return array
     */
    public function obtenerHojas() {
        return $this->xls->getSheetNames();
    }

    /**
     * Establece la hoja activa.
     * @param string $hoja Nombre de la hoja.
     * @return \modulos\phpspreadsheet
     *//**
     * Establece la hoja activa.
     * @param int $hoja Número de hoja, comenzando desde `0`.
     * @return \modulos\phpspreadsheet
     */
    public function establecerHoja($hoja) {
        if(is_string($hoja)) {
            $this->xls->setActiveSheetIndexByName($hoja);
        } else {
            $this->xls->setActiveSheetIndex($hoja);
        }        
        return $this;
    }

    /**
     * Devuelve el contenido de la hoja completa, como array.
     * @return array
     */
    public function obtenerArray() {
        return $this->xls->getActiveSheet()->toArray();
    }

    /**
     * Escribe una fila, tomando cada elemento de un array como una celda.
     * @param int $numero Número de fila, comenzando desde `1`.
     * @param array $datos Datos a escribir.
     * @param string $columna Columna inicial.
     * @return \modulos\phpspreadsheet
     *//**
     * Escribe una fila, tomando cada elemento de un array como una celda.
     * @param int $numero Número de fila, comenzando desde `1`.
     * @param array $datos Datos a escribir.
     * @param int $columna Índice de la columna inicial, comenzando desde `1`.
     * @return \modulos\phpspreadsheet
     */
    public function escribirFila($numero,$datos,$columna='A') {
        if(is_numeric($columna)) $columna=$this->obtenerColumna($columna);
        $this->xls->getActiveSheet()->fromArray($datos,null,$columna.$numero);
        return $this;
    }

    /**
     * Escribe una fila, tomando cada elemento de un array como una celda.
     * @param int $numero Número de fila, comenzando desde `1`.
     * @param array $datos Datos a escribir.
     * @param string $columna Columna inicial.
     * @return array
     */
    public function leerFila($numero) {
        $hoja=$this->xls->getActiveSheet();
        $ultima=$hoja->getHighestColumn();
        return $hoja->rangeToArray('A'.$numero.':'.$ultima.$numero);
    }

    /**
     * Escribe una celda.
     * @param string $a Coordenada.
     * @param string $b Valor.
     * @param string $c No aplica.
     * @return \modulos\phpspreadsheet
     *//**
     * Escribe una celda.
     * @param string $a Número de columna, comenzando desde `1`.
     * @param string $b Número de fila, comenzando desde `1`.
     * @param string $c Valor
     * @return \modulos\phpspreadsheet
     */
    public function escribirCelda($a,$b,$c=null) {
        $hoja=$this->xls->getActiveSheet();
        if($c!==null) {
            //escribirCelda(columna,fila,'valor')
            $celda=$hoja->getCellByColumnAndRow($a,$b);
            $valor=$c;
        } else {
            //escribirCelda('A1','valor')
            $celda=$hoja->getCell($a);
            $valor=$b;
        }
        return $celda->setValue($valor);
        return $this;
    }

    /**
     * Lee una celda.
     * @param string $a Coordenada.
     * @param null $b No aplica.
     * @return string
     *//**
     * Lee una celda.
     * @param int $a Índice de la columna, comenzando desde `1`.
     * @param int $b Índice de la fila, comenzando desde `1`.
     * @return string
     */
    public function leerCelda($a,$b=null) {
        $hoja=$this->xls->getActiveSheet();
        if($b!==null) {
            //leerCelda(columna,fila)
            $celda=$hoja->getCellByColumnAndRow($a,$b);
        } else {
            //leerCelda('A1')
            $celda=$hoja->getCell($a);
        }
        return $celda->getValue();
    }

    public function combinar($rango) {
        //TODO
        return $this;
    }

    public function negrita($rango) {
        //TODO
        return $this;
    }

    public function fondo($rango,$color) {
        //TODO
        return $this;
    }

    public function ajustarTamano($rango) {
        //TODO
        return $this;
    }

    /**
     * Guarda el libro actual en formato `xlsx`.
     * @param string $ruta Ruta local.
     * @return \modulos\phpspreadsheet
     */
    public function guardarXlsx($ruta) {        
        $xlsx=new Xlsx($this->xls);
        $xlsx->save($ruta);
        return $this;
    }

    /**
     * Devuelve la coordenada de la celda dado sus números de fila y columna.
     * @param int $columna Índice de la columna, comenzando desde `1`.
     * @param int $fila Índice de la fila, comenzando desde `1`.
     * @return string
     */
    public function obtenerCoordenada($columna,$fila) {
        return Coordinate::stringFromColumnIndex($columna).$fila;
    }

    /**
     * Devuelve el nombre de la columna dado su índice.
     * @param int $columna Índice de la columna, comenzando desde `1`.
     * @return string
     */
    public function obtenerColumna($indice) {
        return Coordinate::stringFromColumnIndex($indice);
    }

    /**
     * Devuelve el índice de una columna, en base `1`, dado su nombre.
     * @param string $columna Columna.
     * @return int
     */
    public function obtenerIndice($columna) {
        return Coordinate::columnIndexFromString($columna);
    }
}