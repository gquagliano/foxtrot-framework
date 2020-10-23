<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase de utilidades.
 */
class util {
    /**
     * Separa una cadena en un objeto con las propiedades 'nombre' y 'ruta' equivalentes a basename() y dirname() respectivamente pero en forma independiente
     * del sistema de archivos local y admitiendo únicamente / como separador. Nota: No limpia la cadena de entrada.
     * @var string $ruta Ruta a procesar.
     * @return object
     */
    public static function separarRuta($ruta) {
        $ruta=str_replace('\\','/',$ruta);
        $partes=explode('/',trim($ruta));
        return (object)[
            'nombre'=>array_pop($partes),
            'ruta'=>count($partes)?implode('/',$partes).'/':''
        ];
    }    

    /**
     * Limpia un valor para ser utilizado como ruta, nombre de aplicación, nombre de clase, nombre de método y afines, removiendo caracteres no seguros, como caracteres
     * de control, ASCII extendido, unicode, caracteres codificados, entre otros.
     * @var string $cadena Cadena a procesar.
     * @var bool $admiteBarra Determina si debe admitir barras (/) en la cadena.
     * @var bool $admitePunto Determina si debe admitir puntos (.) en la cadena.
     * @var string $otrosAdmitidos Otros caracteres admitidos. Escapar de acuerdo a expresiones regulares.
     * @return string
     */
    public static function limpiarValor($cadena,$admiteBarra=false,$admitePunto=false,$otrosAdmitidos='') {
        $cadena=urldecode($cadena);
        $cadena=html_entity_decode($cadena);
        $cadena=filter_var($cadena,FILTER_UNSAFE_RAW,FILTER_FLAG_STRIP_LOW|FILTER_FLAG_STRIP_HIGH);
        if(strlen($cadena)>255) $cadena=substr($cadena,0,255);
        
        //Removiendo caracteres especiales y limitando la longitud, podemos usar expresiones regulares de forma más segura
        $cadena=preg_replace('#[^a-z0-9_'.($admiteBarra?'/':'').($admitePunto?'\\.':'').$otrosAdmitidos.'-]+#i','',$cadena);

        //Remover caracteres repetidos (//, ..)
        if($admiteBarra) $cadena=preg_replace('#/{2,}#','/',$cadena);
        if($admitePunto) $cadena=preg_replace('#\.{2,}#','.',$cadena);

        return trim($cadena);
    }

    /**
     * Dada una cadena, removerá los guiones con el formato: nombre-metodo -> nombreMetodo. Se recomienda utilizar limpiarValor() previamente.
     * @var string $cadena Cadena a procesar. Nota: No limpia la cadena de entrada.
     * @return string
     */
    public static function convertirGuiones($cadena) {
        $partes=explode('-',strtolower(trim($cadena)));
        $resultado=array_shift($partes);
        foreach($partes as $parte) $resultado.=ucfirst($parte);
        return $resultado;
    }

    /**
     * Genera y devuelve una cadena alfanumerica al azar.
     * @var int $longitud Longitud.
     * @return string
     */
    public static function cadenaAzar($longitud=10) {
        return substr(random_bytes($longitud),0,$longitud);
    }
}