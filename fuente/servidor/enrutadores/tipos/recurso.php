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
 * Tipo de solicitud concreta que representa el acceso a recursos (CSS, JS, imágenes, etc.) de la aplicación.
 */
class recurso extends \solicitud {    
    /**
     * Ejecuta la solicitud.
     * @return \solicitud
     */
    public function ejecutar() {
        //Enviar archivos de recursoss de la aplicación

        preg_match('#^aplicacion/(.+)#',$this->url,$coincidencias); //La URL ya fue validada y sanitizada por foxtrot
        $recurso=$coincidencias[1];

        //Remover versión
        $recurso=preg_replace('/-[0-9]+\.(css|js)$/','.$1',$recurso);

        $dir=realpath(_raizAplicacion);
        $ruta=realpath($dir.'/'.$recurso);
        if(substr($ruta,0,strlen($dir))!=$dir||!file_exists($ruta)||is_dir($ruta)) return $this->error();

        $mime=\mime($ruta);
        header('Content-Type: '.$mime.'; charset=utf-8',true);       
        
        $f=fopen($ruta,'r');
        fpassthru($f);
        fclose($f);
        
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
        return preg_match('#^aplicacion/(.+)#',$url);
    }
}