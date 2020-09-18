<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

include(__DIR__.'/funciones.php');
include(__DIR__.'/../asistentes/asistente.php');

/**
 * Procesa las solicitudes del gestor de aplicaciones.
 */
class gestor {
    /** @var string $aplicacion Nombre de la aplicación activa. */
    public static $aplicacion;

    //TODO *Desharcodear* rutas

    /**
     * Analiza y procesa la solicitud actual.
     */
    public static function procesarSolicitud() {
        self::$aplicacion=$_SESSION['_gestorAplicacion'];
        
        $metodos=[
            'seleccionarAplicacion',
            'crearAplicacion',
            'eliminarVista'
        ];

        foreach($metodos as $metodo) {
            if($_REQUEST[$metodo]) {
                self::$metodo($_REQUEST[$metodo]);
                break;
            }
        }

        self::ok();
    }

    /**
     * Cambia la aplicación activa.
     * @var $nombre Nombre de la aplicación.
     */
    protected static function seleccionarAplicacion($nombre) {
        $_SESSION['_gestorAplicacion']=$nombre;
    }

    /**
     * Crea una aplicación.
     * @var $nombre Nombre de la aplicación.
     */
    protected static function crearAplicacion($nombre) {
        
        self::seleccionarAplicacion($nombre);
    }

    /**
     * Elimina una vista.
     * @var $nombre Nombre de la vista.
     */
    protected static function eliminarVista($nombre) {
        $ruta=__DIR__.'/../../aplicaciones/'.self::$aplicacion.'/';

        $archivos=glob($ruta.'cliente/vistas/'.$nombre.'.*');
        foreach($archivos as $archivo) unlink($archivo);

        //Si el directorio quedó vacío, eliminarlo también
        $dir=$ruta.'cliente/vistas/'.basename($nombre);
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
     * Redirecciona al gestor, cuando no se trate de una solicitud AJAX.
     */
    protected static function volver() {
        header('Location: ../');
        exit;
    }

    /**
     * Responde un OK.
     * @var $datos Información a enviar.
     */
    public static function ok($datos=null) {
        echo json_encode(['r'=>'ok','d'=>$datos]);
        exit;
    }

    /**
     * Responde un mensaje de error.
     * @var $datos Información a enviar.
     */
    public static function error($datos=null) {
        echo json_encode(['r'=>'error','d'=>$datos]);
        exit;
    }
}

gestor::procesarSolicitud();