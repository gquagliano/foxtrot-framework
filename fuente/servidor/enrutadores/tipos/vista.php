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
 * Tipo de solicitud concreta que representa el acceso a una vista.
 */
class vista extends \solicitud {
    protected $nombre=null;

    /**
     * Devuelve el nombre de la vista.
     * @return string
     */
    public function obtenerNombreVista() {
        if($this->nombre) return $this->nombre;

        if($this->url=='') {
            $vista='inicio';
        } else {
            preg_match('#^([A-Za-z0-9_/-]+)#',$this->url,$coincidencia);
            $vista=trim($coincidencia[1],'/');
        }

        $this->vista=$vista;

        return $this->vista;
    }

    /**
     * Modifica el nombre de la vista.
     * @return \solicitud
     */
    public function establecerVista($nombre) {
        $this->nombre=$nombre;
        return $this;
    }

    /**
     * Ejecuta la solicitud.
     * @return \solicitud
     */
    public function ejecutar() {
        //Devuelve el contenido html de la vista
            
        header('Content-Type: text/html; charset=utf-8',true);

        $vista=$this->obtenerNombreVista();        

        //Validar que el archivo solicitado exista y no salga del directorio de cliente
        //TODO Verificar tipo de vista en aplicacion.json
        $dir=realpath(_vistasAplicacion);
        $rutaPhp=realpath($dir.'/'.$vista.'.php');
        $rutaHtml=realpath($dir.'/'.$vista.'.html');
        if($rutaPhp) {
            if(substr($rutaPhp,0,strlen($dir))!=$dir) return $this->error();
            ob_start();
            include($rutaPhp);
            $html=ob_get_clean();
        } elseif($rutaHtml) {
            if(substr($rutaHtml,0,strlen($dir))!=$dir) return $this->error();
            $html=file_get_contents($rutaHtml);
        } else {
            return $this->error();
        }

        echo $html;

        return $this;
    }

    /**
     * Determina si los parámetros dados a una solicitud de este tipo.
     * @var string $url URL
     * @var object $parametros Parámetros de la solicitud.
     * @return bool
     */
    public static function es($url,$parametros) {
        return $url==''||preg_match('#^([A-Za-z0-9_/-]+)#',$url);
    }
}