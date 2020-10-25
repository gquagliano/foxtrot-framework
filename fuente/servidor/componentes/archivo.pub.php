<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace componentes\publico;

defined('_inc') or exit;

/**
 * Clase pública del componente Archivo.
 */
class archivo extends \componente {
    /**
     * 
     */
    public function recibirArchivos() {
        $archivos=[];

        foreach($_FILES as $clave=>$archivo) {
            $resultado=(object)['origen'=>$archivo['name']];
            if($archivo['error']==UPLOAD_ERR_INI_SIZE) {
                $resultado->error=1;
            } else {
                $nombre=\almacenamiento::subirTemporal($archivo);
                if($nombre) {
                    $resultado->nombre=$nombre;
                } else {
                    $resultado->error=2;
                }
            }
            $archivos[$clave]=$resultado;
        }

        return $archivos;
    }
}