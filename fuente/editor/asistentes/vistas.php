<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Asistente concreto para gestión de las vistas.
 */
class vistas extends asistente {
    /**
     * Devuelve los parámetros del asistente. Debe devolver un objeto con las propiedades [titulo,visible=>bool].
     * @return object
     */
    public static function obtenerParametros() {
        //TODO Agregar posibilidad de agregar comandos en el listado de vistas (y en el futuro en los listados de modelos y controladores) a fin de desacoplar de la clase gestor
        return (object)[
            'visible'=>false
        ];
    }

    /**
     * Elimina una vista.
     * @var string $nombre Nombre de la vista.
     */
    public function eliminar($nombre) {
        $ruta=__DIR__.'/../../aplicaciones/'.gestor::obtenerNombreAplicacion().'/';

        $archivos=glob($ruta.'cliente/vistas/'.$nombre.'.*');
        foreach($archivos as $archivo) unlink($archivo);

        //Si el directorio quedó vacío, eliminarlo también
        $dir=$ruta.'cliente/vistas/'.dirname($nombre);
        $archivos=glob($dir.'/*');
        if(!count($archivos)) rmdir($dir);

        $rutaJson=$ruta.'aplicacion.json';
        $json=json_decode(file_get_contents($rutaJson));

        foreach($json->vistas as $clave=>$valor)
            if($clave==$nombre)
                unset($json->vistas->$clave);

        file_put_contents($rutaJson,json_encode($json));
    }

    /**
     * Renombra una vista.
     * @var string $nombre Nombre de la vista.
     * @var string $nuevoNombre Nuevo nombre de la vista.
     */
    public function renombrar($nombre,$nuevoNombre) {
    }

    /**
     * Clona una vista.
     * @var string $nombre Nombre de la vista.
     * @var string $nuevoNombre Nombre de la vista nueva.
     */
    public function clonar($nombre,$nuevoNombre) {
    }
}