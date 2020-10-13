<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase de asistencia y utilidades para el almacenamiento de archivos.
 */
class almacenamiento {
    /**
     * Limpia un nombre de archivos para remover caracteres especiales o riesgosos.
     * @var string $nombre Nombre a analizar.
     * @return string
     */
    public static function limpiarNombre($nombre) {
        //Remover puntos iniciales para evitar la creación de dotfiles
        $nombre=trim(strtolower($nombre)," \t\n\r\0\x0B.");        
        
        $info=pathinfo($nombre);

        $nombre=$info['filename'];
        $nombre=preg_replace('/[^0-9a-z]/','-',$nombre);

        if(!$nombre) $nombre='sin-nombre';
        
        $extension=$info['extension'];
        if($extension) $extension='.'.preg_replace('/[^a-z0-9]/','',strtolower($extension));

        return $nombre.$extension;
    }

    /**
     * Reserva y devuelve un nombre de archivo libre.
     * @var string $directorio Directorio de destino.
     * @var string $nombre Nombre propuesto.
     * @return string
     */
    public static function obtenerNombreLibre($directorio,$nombre) {
        //TODO Gestión de concurrencia
        
        $info=pathinfo($nombre);

        $nombre=$info['filename'];
        if(!$nombre) $nombre='sin-nombre';

        $extension=$info['extension'];
        if($extension) $extension='.'.$extension;

        $u=substr($directorio,-1);
        if($u!='\\'&&$u!='/') $directorio.='/';

        $i=0;

        do {
            $nombreFinal=$nombre.($i>0?'-'.$i:'').$extension;
            $i++;
        } while(file_exists($directorio.$nombreFinal));

        touch($directorio.$nombreFinal);

        return $nombreFinal;
    }
}