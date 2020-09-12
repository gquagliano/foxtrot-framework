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
    public function recibirArchivos() {
        $archivos=[];

        foreach($_FILES as $clave=>$archivo) {
            if(!is_uploaded_file($archivo['tmp_name'])) continue;
            $temp=tempnam(_temporalesPrivados,'a');
            move_uploaded_file($archivo['tmp_name'],$temp);
            $archivos[$clave]=basename($temp);
        }

        return $archivos;
    }
}