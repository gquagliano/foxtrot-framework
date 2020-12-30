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
     * Lee una fila y devuelve el contenido de sus celdas como un array.
     * @param int $numero Número de fila, comenzando desde `1`.
     * @return array
     */
    public function leerFila($numero) {
        $hoja=$this->xls->getActiveSheet();
        $ultima=$hoja->getHighestColumn();
        return $hoja->rangeToArray('A'.$numero.':'.$ultima.$numero);
    }

    /**
     * Devuelve un objeto `[fila,columna]` con los *índices* (base `1`) de la última celda de la hoja.
     * @return object
     */
    public function obtenerDimensionesHoja() {
        $hoja=$this->xls->getActiveSheet();
        return (object)[
            'fila'=>$hoja->getHighestRow(),
            'columna'=>$this->obtenerIndice($hoja->getHighestColumn())
        ];
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

    /**
     * Combina un rango de celdas.
     * @param string $rango Rango como coordenadas Excel.
     * @return \modulos\phpspreadsheet
     */
    public function combinar($rango) {
        $this->xls->getActiveSheet()->mergeCells($rango);
        return $this;
    }

    /**
     * Aplica formato negritaa  un rango de celdas.
     * @param string $rango Rango como coordenadas Excel.
     * @param bool $desactivar Especificar `true` para *desactivar* la negrita.
     * @return \modulos\phpspreadsheet
     */
    public function negrita($rango,$desactivar=false) {
        $this->xls->getActiveSheet()
            ->getStyle($rango)
            ->getFont()
            ->setBold(!$desactivar);
        return $this;
    }

    /**
     * Aplica un color de texto a un rango de celdas.
     * @param string $rango Rango como coordenadas Excel.
     * @param string $color Color en RGB hexagesimal.
     * @return \modulos\phpspreadsheet
     */
    public function color($rango,$color) {
        if(substr($color,0,1)=='#') $color=substr($color,1);
        $this->xls->getActiveSheet()
            ->getStyle($rango)
            ->getFont()
            ->getColor()
            ->setARGB($color);
        return $this;
    }

    /**
     * Aplica un color de fondo a un rango de celdas.
     * @param string $rango Rango como coordenadas Excel.
     * @param string $color Color en RGB hexagesimal.
     * @return \modulos\phpspreadsheet
     */
    public function fondo($rango,$color) {
        if(substr($color,0,1)=='#') $color=substr($color,1);
        $this->xls->getActiveSheet()
            ->getStyle($rango)
            ->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()
            ->setARGB($color);
        return $this;
    }

    /**
     * Ajusta el tamaño de las columnas al contenido.
     * @param string $rango Nombre de la columna o rango de columnas como coordenadas Excel (ejemplo: `A:Z`).
     * @return \modulos\phpspreadsheet
     *//**
     * Ajusta el tamaño de las columnas al contenido.
     * @param string $rango Número de columna, comenzando desde `1`.
     * @return \modulos\phpspreadsheet
     */
    public function ajustarTamano($rango) {
        $rango=$this->obtenerRango($rango);
        $hoja=$this->xls->getActiveSheet();
        foreach($rango as $columna)
            $hoja->getColumnDimension($this->obtenerColumna($columna))->setAutoSize(true);
        
        return $this;
    }

    /**
     * Establece el ancho de la columna.
     * @param string $columna Nombre de la columna o rango de columnas como coordenadas Excel (ejemplo: `A:Z`).
     * @param int $ancho Ancho a establecer.
     * @return \modulos\phpspreadsheet
     *//**
     * Establece el ancho de la columna.
     * @param string $columna Número de columna, comenzando desde `1`.
     * @param int $ancho Ancho a establecer.
     * @return \modulos\phpspreadsheet
     *//**
     * Establece el ancho de la columna.
     * @param string $columna Nombre de la columna inicial.
     * @param array $ancho Lista de tamaños a establecer desde la columna inicial hacia la derecha.
     * @return \modulos\phpspreadsheet
     *//**
     * Establece el ancho de la columna.
     * @param string $columna Número de columna inicial, comenzando desde `1`.
     * @param array $ancho Lista de tamaños a establecer desde la columna inicial hacia la derecha.
     * @return \modulos\phpspreadsheet
     */
    public function anchoColumna($columna,$ancho) {
        $hoja=$this->xls->getActiveSheet();

        if(is_array($ancho)) {
            if(is_string($columna)) $columna=$this->obtenerIndice($columna);
            foreach($ancho as $medida) {
                $dimension=$hoja->getColumnDimension($this->obtenerColumna($columna));
                $dimension->setAutoSize(false);
                $dimension->setWidth($medida);
                $columna++;
            }
        } else {
            $rango=$this->obtenerRango($columna);
            foreach($rango as $columna) {
                $dimension=$hoja->getColumnDimension($this->obtenerColumna($columna));
                $dimension->setAutoSize(false);
                $dimension->setWidth($ancho);                
            }
        }

        return $this;
    }

    /**
     * Congela las filas hasta la fila especificada *inclusive*.
     * @param int $numero Número de fila a congelar, comenzando desde `1`.
     * @return \modulos\phpspreadsheet
     */
    public function congelarFilas($numero) {
        return $this->congelarFilasColumnas($numero,1);
    }

    /**
     * Congela las columnas hasta la columna especificada *inclusive*.
     * @param string $columna Nombre de la columna.
     * @return \modulos\phpspreadsheet
     *//**
     * Congela las columnas hasta la columna especificada *inclusive*.
     * @param int $columna Número de la columna, comenzando desde `1`.
     * @return \modulos\phpspreadsheet
     */
    public function congelarColumnas($columna) {
        return $this->congelarFilasColumnas(1,$columna);
    }

    /**
     * Congela las filas y columnas hasta la coordenada especificada *inclusive*.
     * @param int $fila Número de fila, comenzando desde `1`.
     * @param string $columna Nombre de la columna.
     * @return \modulos\phpspreadsheet
     *//**
     * Congela las filas y columnas hasta la coordenada especificada *inclusive*.
     * @param int $fila Número de fila, comenzando desde `1`.
     * @param int $columna Número de fila, comenzando desde `1`.
     * @return \modulos\phpspreadsheet
     */
    public function congelarFilasColumnas($fila,$columna) {
        $fila++;
        if(is_string($columna)) $columna=$this->obtenerIndice($columna);
        $letra=$this->obtenerColumna($columna);
        $this->xls->getActiveSheet()->freezePane($letra.$fila);
        return $this;
    }

    //TODO Otros métodos de formato útiles

    /**
     * Aplica el formato al rango de celdas.
     * @param string $rango Rango como coordenadas Excel.
     * @param array $formato Array de formato. Ver: https://phpspreadsheet.readthedocs.io/en/latest/topics/recipes/#styles
     * @return \modulos\phpspreadsheet
     */
    public function aplicarFormato($rango,$formato) {
        $this->xls->getActiveSheet()->getStyle($rango)->applyFromArray($formato);
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

    /**
     * Dado un rango, devuelve un array de *índices* de columna.
     * @param string $rango Rango a procesar. Puede ser un índice de columna (comenzando desde `1`), una letra o un rango con formato `A:Z`.
     * @return array
     */
    public function obtenerRango($rango) {
        if(is_numeric($rango)) {
            $rango=[$this->obtenerColumna($rango)];
        } elseif(strpos($rango,':')>0) {
            $rango=explode(':',$rango);
            $rango=range(
                $this->obtenerIndice($rango[0]),
                $this->obtenerIndice($rango[1])
            );
        } else {
            $rango=[$this->obtenerIndice($rango)];
        }
        return $rango;
    }
}