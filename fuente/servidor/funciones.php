<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//TODO Mover a clases de utilidades

defined('_inc') or exit;

/**
 * Realiza un redireccionamiento.
 * @var string $uri URI o URL.
 * @var array|object $params Parámetros adicionales. Utilizando esta opción, se codificarán los valores y se tendrá en cuenta si la URL ya presenta o no parámetros.
 */
function redir($uri,$params=null) {
    if($params) {
        $uri.=strpos($uri,'?')===false?'?':'&';
        $uri.=http_build_query((array)$params);
    }
    if(!preg_match('#^https?:#i',$uri)) $uri=\configuracion::$url.$uri;
    \solicitud::establecerEncabezado('Location',$uri);
    exit;
}

/**
 * Alias de `htmlentites()`.
 * @var string $cadena
 * @return string
 */
function h($cadena) {
    return htmlentities($cadena,ENT_COMPAT,'utf-8');
}

/**
 * Alias de `html_entity_decode()`.
 * @var string $cadena
 * @return string
 */
function uh($cadena) {
    return html_entity_decode($cadena,ENT_COMPAT,'utf-8');
}

/**
 * Equivalente a `str_replace()` utilizando un array asociativo.
 * @var array $arr Array [buscar=>reemplazar].
 * @var string $cadena Cadena de origen.
 * @return string
 */
function str_replace_array($arr,$cadena) {
    $a=[];
    $b=[];
    foreach($arr as $c=>$v) {
        $a[]=$c;
        $b[]=$v;
    }
    return str_replace($a,$b,$cadena);
}


/**
 * Equivalente a `preg_replace()` utilizando un array asociativo.
 * @var array $arr Array [expresión=>reemplazar].
 * @var string $cadena Cadena de origen.
 * @return string
 */
function preg_replace_array($arr,$cadena) {
    foreach($arr as $c=>$v) {
    	$cadena=preg_replace($c,$v,$cadena);
    }
    return $cadena;
}

