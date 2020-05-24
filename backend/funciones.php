<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Realiza un redireccionamiento.
 */
function redir($uri) {
    if(!preg_match('#^https?:#i',$uri)) $uri=\configuracion::$url.$uri;
    header('Location: '.$uri);
    exit;
}

/**
 * Determina y devuelve el tipo MIME de un archivo.
 */
function mime($ruta) {
    $ext=strtolower(substr($ruta,strrpos($ruta,'.')+1));
    //Fuente php.net
    $tipos=[
        'txt'=>'text/plain',
        'htm'=>'text/html',
        'html'=>'text/html',
        'php'=>'text/html',
        'css'=>'text/css',
        'js'=>'application/javascript',
        'json'=>'application/json',
        'xml'=>'application/xml',
        'swf'=>'application/x-shockwave-flash',
        'flv'=>'video/x-flv',
        'png'=>'image/png',
        'jpe'=>'image/jpeg',
        'jpeg'=>'image/jpeg',
        'jpg'=>'image/jpeg',
        'gif'=>'image/gif',
        'bmp'=>'image/bmp',
        'ico'=>'image/vnd.microsoft.icon',
        'tiff'=>'image/tiff',
        'tif'=>'image/tiff',
        'svg'=>'image/svg+xml',
        'svgz'=>'image/svg+xml',
        'zip'=>'application/zip',
        'rar'=>'application/x-rar-compressed',
        'exe'=>'application/x-msdownload',
        'msi'=>'application/x-msdownload',
        'cab'=>'application/vnd.ms-cab-compressed',
        'mp3'=>'audio/mpeg',
        'qt'=>'video/quicktime',
        'mov'=>'video/quicktime',
        'pdf'=>'application/pdf',
        'psd'=>'image/vnd.adobe.photoshop',
        'ai'=>'application/postscript',
        'eps'=>'application/postscript',
        'ps'=>'application/postscript',
        'doc'=>'application/msword',
        'rtf'=>'application/rtf',
        'xls'=>'application/vnd.ms-excel',
        'ppt'=>'application/vnd.ms-powerpoint',
        'odt'=>'application/vnd.oasis.opendocument.text',
        'ods'=>'application/vnd.oasis.opendocument.spreadsheet'
    ];
    if(!array_key_exists($ext,$tipos)) return 'text/plain';
    return $tipos[$ext];
}