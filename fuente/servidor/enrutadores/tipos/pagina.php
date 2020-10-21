<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace solicitud\tipos;

defined('_inc') or exit;

/**
 * Tipo de solicitud concreta que representa una página HTML, existente en el sistema de archivos.
 */
class pagina extends \solicitud {    
    /**
     * Ejecuta la solicitud.
     * @return \solicitud
     */
    public function ejecutar() {
        //Cargar una página independiente

        header('Content-Type: text/html; charset=utf-8',true);

        //TODO Validación configurable de páginas disponibles públicamente.

        if(!preg_match('#^([a-zA-Z0-9_-]+)/?$#',$this->url,$coincidencia)) //La URL ya fue validada y sanitizada por foxtrot
            return $this->error();                                         //No admitimos barras ni puntos que representen riesgo de seleccionar un archivo distinto

        $nombre=_raiz.$coincidencia[1];

        //Excluir archivos
        //(dotfiles ya son excluidos por la expresión regular en es()).
        if(in_array($nombre,['config','index'])) return $this->error();

        if(file_exists($nombre.'.html')) {
            $nombre.='.html';
        } elseif(file_exists($nombre.'.php')) {
            $nombre.='.php';
        }
        include($nombre);

        return $this;
    }

    /**
     * Determina si los parámetros dados a una solicitud de este tipo.
     * @var string $url URL
     * @var object $parametros Parámetros de la solicitud.
     * @return bool
     */
    public static function es($url,$parametros) {
        //$url se asume validado y sanitizado por el enrutador

        //Página de error
        if(preg_match('#^error/#i',$url)) return true;

        //Página HTML o PHP
        if(preg_match('#^([a-zA-Z0-9_-]+)/?$#',$url,$coincidencia)&&(file_exists(_raiz.$coincidencia[1].'.html')||file_exists(_raiz.$coincidencia[1].'.php'))) return true;

        return false;
    }
}