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
    protected $ruta=null;

    /**
     * Ejecuta la solicitud.
     * @return \solicitud\tipos\pagina
     */
    public function ejecutar() {
        //Cargar una página independiente

        header('Content-Type: text/html; charset=utf-8',true);

        $ruta=$this->obtenerRuta();

        if(!$ruta) return $this->error();

        //Excluir archivos
        //dotfiles ya son excluidos por la expresión regular en es().
        //TODO Validación configurable de páginas disponibles públicamente.
        if(preg_match('/(index|config)\.php/',$ruta)) return $this->error();

        include($ruta);

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
        if(preg_match('#^error/?$#i',$url)) return true;

        //Página HTML o PHP
        if(preg_match('#^([a-zA-Z0-9_-]+)/?$#',$url,$coincidencia)&&(file_exists(_raiz.$coincidencia[1].'.html')||file_exists(_raiz.$coincidencia[1].'.php'))) return true;

        return false;
    }   

    /**
     * Devuelve la ruta local a la página solicitada.
     * @return string
     */
    public function obtenerRuta() {
        if(!$this->ruta) {
            //Ecluir barras o puntos que representen riesgo de seleccionar un archivo distinto
            if(preg_match('#^([a-zA-Z0-9_-]+)/?$#',$this->url,$coincidencia)) {
                $nombre=_raiz.$coincidencia[1];
                if(file_exists($nombre.'.html')) {
                    $nombre.='.html';
                } elseif(file_exists($nombre.'.php')) {
                    $nombre.='.php';
                }
                $this->ruta=$nombre;
            }
        }
        return $this->ruta;
    }

    /**
     * Establece la página a mostrar. Nota: Este valor no será sanitizado, no debe pasarse un valor obtenido desde el cliente.
     * @var string $ruta Ruta local al archivo.
     * @return \solicitud\tipos\pagina
     */
    public function establecerRuta($ruta) {
        $this->ruta=$ruta;
        return $this;
    }
}