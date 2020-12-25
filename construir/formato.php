<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//TRABAJO EN CURSO

/**
 * Gestión del formateo y compilación de archivos HTML, CSS y JS.
 */
class formato {
    /**
     * 
     */
    public static function formatearHtml($codigo) {
        $vacias=['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
        $enLinea=['b','big','i','small','tt','abbr','acronym','cite','code','dfn','em','kbd','strong','samp','var','a','bdo','br','img','span','sub','sup'];
        $mantener=['textarea','option','title'];
        $noIndentarContenido=['p','h1','h2','h3','h4','h5','h6'];

        define('t',"\t");
        define('n',"\r\n");

        $salida='';
        $bufer='';

        $long=strlen($codigo);

        $nivel=0;
        $enBloque=null;
        $enComentario=false;
        $enCadena=null;        
        $nombreEtiqueta='';
        $escape=0;

        //Limpiar espacios en blanco
        $codigo=preg_replace('/\s{2,}/',' ',$codigo);

        for($i=0;$i<$long;) {
            $c=$codigo[$i];

        }
    }

    /**
     * Agrega la cantidad especificada de tabulaciones al inicio de cada línea.
     * @param string $codigo
     * @param int $cantidad
     * @return string
     */
    protected static function indentar($codigo,$cantidad) {

    }

    /**
     * 
     */
    public static function comprimirHtml($codigo) {

    }

    /**
     * Devuelve el código JSON indentado.
     * @param string $codigo
     * @return string
     */
    public static function formatearJson($codigo) {
        return json_encode(json_decode($codigo),JSON_PRETTY_PRINT);
    }

    /**
     * Devuelve el código JSON comprimido.
     * @param string $codigo
     * @return string
     */
    public static function comprimirJson($codigo) {
        return json_encode(json_decode($codigo));
    }

    /**
     * 
     */
    public static function formatearCss($codigo) {

    }

    /**
     * 
     */
    public static function comprimirCss($codigo) {

    }

    /**
     * 
     */
    public static function compilarCss($codigo) {

    }

    /**
     * 
     */
    public static function formatearJs($codigo) {
        //TODO
        //Por el momento no hay necesidad de esta función
    }

    /**
     * 
     */
    public static function comprimirJs($codigo) {

    }

    /**
     * 
     */
    public static function compilarJs($archivos,$usarClosure=false) {

    }
}