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
     * Separa un nombre de archivo o ruta en sus componentes, devolviendo un objeto con las propiedades 'nombre', 'extension' y 'ruta'.
     * @var string $nombre Nombre de archivo a procesar.
     * @return object
     */
    public static function separarNombre($nombre) {
        $partes=\util::separarRuta($nombre);

        $partes->extension='';
        $p=strrpos($partes->nombre,'.');
        if($p>0) {
            //En caso de dotfiles queda todo en 'nombre'
            $partes->extension=strtolower(substr($partes->nombre,$p+1));
            $partes->nombre=substr($partes->nombre,0,$p);
        }

        return $partes;
    }

    /**
     * Limpia un nombre de archivos para remover caracteres especiales o riesgosos.
     * @var string $nombre Nombre a analizar.
     * @return string
     */
    public static function limpiarNombre($nombre) {
        $nombre=\util::limpiarValor($nombre,false,true,' ');
        //Remover puntos iniciales para evitar la creación de dotfiles
        $nombre=trim(strtolower($nombre),'.');        
        
        $info=self::separarNombre($nombre);

        $nombre=$info->nombre;
        $nombre=preg_replace('/[^0-9a-z]/','-',$nombre);

        if(!$nombre) $nombre='sin-nombre';
        
        $extension=$info->extension;
        if($extension) $extension='.'.preg_replace('/[^a-z0-9]/','',$extension);

        return $nombre.$extension;
    }

    /**
     * Reserva y devuelve un nombre de archivo libre.
     * @var string $directorio Directorio de destino.
     * @var string $nombre Nombre propuesto.
     * @return string
     */
    public static function obtenerNombreLibre($directorio,$nombre=null) {
        //TODO Gestión de concurrencia

        $extension='';
        if($nombre) {
            $info=self::separarNombre($nombre);
            $nombre=$info->nombre;
            if($info->extension) $extension='.'.$info->extension;
        }

        if(!$nombre) $nombre=\util::cadenaAzar();
        
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

    /**
     * Almacena un archivo temporal y devuelve su nombre, o null.
     * @var mixed $contenido Contenido del archivo.
     * @return string
     */
    public static function almacenarTemporal($contenido) {
        $temp=tempnam(_temporalesPrivados,'a');
        file_put_contents($temp,base64_encode($contenido));
        return basename($temp);
    }

    /**
     * Devuelve el tamaño del archivo en MB.
     * @var string $ruta Ruta local.
     * @return float
     */
    public static function obtenerTamanoArchivo($ruta) {
        if(!file_exists($ruta)||is_dir($ruta)) return null;
        return filesize($ruta)/1048576;
    }

    /**
     * Devuelve el tamaño de un archivo temporal en MB.
     * @var string $nombre Nombre del archivo temporal.
     * @return float
     */
    public static function obtenerTamanoTemporal($nombre) {
        return self::obtenerTamanoArchivo(_temporalesPrivados.$nombre);
    }

    /**
     * Mueve un archivo subido al directorio temporal y devuelve su nombre, o null.
     * @var array $archivo Elemento de $__FILES.
     * @return string
     */
    public static function subirTemporal($archivo) {
        if(!is_uploaded_file($archivo['tmp_name'])) return null;
        return self::almacenarTemporal(file_get_contents($archivo['tmp_name']));
    }

    /**
     * Mueve un archivo temporal al almacenamiento local. Devuelve el nombre final, o null.
     * @var string $temporal Nombre del archivo temporal devuelvo por `almacenarTemporal()`.
     * @var string $nombre Nombre de destino. Será sanitizado y se validará que sea único.
     * @var string $destino Ruta de destino. Por defecto, será la ruta configurada en `rutaArchivos`.
     * @var bool $mantenerCodificacion Si es `true`, el archivo permanecerá codificado. En ese caso, será necesario utilizar `obtenerArchivoLocal()` para leer el mismo, o implementar
     * un proxy que utilice `enviarArchivoLocal()` para enviar al cliente.
     * @return bool
     */
    public static function moverTemporalLocal($temporal,$nombre,$destino=null,$mantenerCodificacion=false) {
        if(!$destino) $destino=_servidor.\configuracion::$rutaArchivos;

        $nombre=\almacenamiento::limpiarNombre($nombre);
        $nombre=\almacenamiento::obtenerNombreLibre($destino,$nombre);

        $temporal=_temporalesPrivados.$temporal;

        if(!file_exists($temporal)||is_dir($temporal)||!is_dir($destino)) return null;

        if(!$mantenerCodificacion) {
            file_put_contents($destino.$nombre,base64_decode(file_get_contents($temporal)));
        } else {
            rename($temporal,$destino.$nombre);
        }

        return $nombre;
    }

    /**
     * Mueve un archivo al almacenamiento local. Devuelve el nombre final, o null.
     * @var string $ruta Ruta de origen.
     * @var string $nombre Nombre de destino. Será sanitizado y se validará que sea único.
     * @var string $destino Ruta de destino. Por defecto, será la ruta configurada en `rutaArchivos`.
     * @var bool $codificar Si es true, el archivo será codificado. En ese caso, será necesario utilizar obtenerArchivoLocal() para leer el mismo, o implementar
     * un proxy que utilice enviarArchivoLocal() para enviar al cliente.
     * @return string
     */
    public static function moverLocal($ruta,$nombre,$destino=null,$codificar=false) {
        if(!$destino) $destino=_servidor.\configuracion::$rutaArchivos;
        
        $nombre=\almacenamiento::limpiarNombre($nombre);
        $nombre=\almacenamiento::obtenerNombreLibre($destino,$nombre);

        if(!file_exists($ruta)||is_dir($ruta)||!is_dir($destino)) return null;

        if($codificar) {
            file_put_contents($destino.$nombre,base64_encode(file_get_contents($ruta)));
        } else {
            rename($ruta,$destino.$nombre);
        }

        return $nombre;
    }

    /**
     * Almacena un archivo en el almacenamiento local. Devuelve el nombre final, o null.
     * @var mixed $contenido Contenido del archivo.
     * @var string $nombre Nombre de destino. Será sanitizado y se validará que sea único.
     * @var string $destino Ruta de destino. Por defecto, será la ruta configurada en `rutaArchivos`.
     * @var bool $codificar Si es true, el archivo será codificado. En ese caso, será necesario utilizar obtenerArchivoLocal() para leer el mismo, o implementar
     * un proxy que utilice enviarArchivoLocal() para enviar al cliente.
     * @return string
     */
    public static function almacenarLocal($contenido,$nombre,$destino=null,$codificar=false) {
        if(!$destino) $destino=_servidor.\configuracion::$rutaArchivos;
        
        $nombre=\almacenamiento::limpiarNombre($nombre);
        $nombre=\almacenamiento::obtenerNombreLibre($destino,$nombre);

        if(!is_dir($destino)) return null;
        
        if($codificar) $contenido=base64_encode($contenido);

        file_put_contents($destino.$nombre,$contenido);

        return $nombre;
    }

    /**
     * Devuelve el contenido de un archivo en el almacenamiento local, o null.
     * @var string $nombre Nombre del archivo.
     * @var string $ruta Ruta de origen. Por defecto, será la ruta configurada en `rutaArchivos`.
     * @var bool $decodificar Decodifica un archivo almacenado mediante almacenarLocal(), moverLocal() o moverTemporalLocal().
     * @return mixed
     */
    public static function obtenerArchivoLocal($nombre,$ruta=null,$decodificar=false) {
        if(!$ruta) $ruta=_servidor.\configuracion::$rutaArchivos;
        
        if(!file_exists($ruta.$nombre)||is_dir($ruta.$nombre)) return null;

        $contenido=file_get_contents($ruta.$nombre);

        if($decodificar) $contenido=base64_decode($contenido);

        return $contenido;
    }

    /**
     * Envía un archivo desde el almacenamiento local al cliente. Devuelve null en caso de error.
     * @var string $nombre Nombre del archivo.
     * @var string $ruta Ruta de origen. Por defecto, será la ruta configurada en `rutaArchivos`.
     * @var bool $descargar Si es true, enviará los encabezados para forzar la descarga del archivo.
     * @var bool $decodificar Decodifica un archivo almacenado mediante almacenarLocal(), moverLocal() o moverTemporalLocal().
     * @return mixed
     */
    public static function enviarArchivoLocal($nombre,$ruta=null,$descargar=false,$decodificar=false) {
        if(!$ruta) $ruta=_servidor.\configuracion::$rutaArchivos;

        $contenido=self::obtenerArchivoLocal($nombre,$ruta,$decodificar);
        if(!$contenido) return null;

        $mime=\mime($ruta.$nombre);
        \solicitud::establecerEncabezado('Content-Type',$mime.'; charset=utf-8');  
        if($descargar) \solicitud::establecerEncabezado('Content-Disposition','attachment; filename="'.$nombre.'"');

        ob_clean();
        echo $contenido;
        exit;
    }
}