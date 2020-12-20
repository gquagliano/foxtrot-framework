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
    public function recibirArchivos($datos=null) {
        $archivos=[];

        //Archivos subidos
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

        //Archivos en base 64
        if(is_object($datos)) {
            foreach($datos as $clave=>$datos) {
                if(substr($clave,0,8)=='archivo-') {
                    $resultado=(object)['origen'=>null];
                    if(substr($datos,0,23)!='data:image/jpeg;base64,') {
                        $resultado->error=1;
                    } else {
                        $datos=base64_decode(substr($datos,23)); //Será codificado nuevamente antes de almacenar
                        $nombre=\almacenamiento::almacenarTemporal($datos);
                        if($nombre) {
                            $resultado->nombre=$nombre;
                        } else {
                            $resultado->error=2;
                        }
                    }
                }
                $archivos[$clave]=$resultado;            
            }
        }

        return $archivos;
    }
}