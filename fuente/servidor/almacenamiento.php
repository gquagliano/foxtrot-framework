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
     * @param string $nombre Nombre de archivo a procesar.
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
     * @param string $nombre Nombre a analizar.
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
     * Reserva y devuelve un nombre de archivo libre. Devuelve solo el nombre de archivo, sin la ruta.
     * @param string $directorio Directorio de destino.
     * @param string $nombre Nombre propuesto.
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
     * @param mixed $contenido Contenido del archivo.
     * @return string
     */
    public static function almacenarTemporal($contenido) {
        $temp=tempnam(_temporalesPrivados,'a');
        file_put_contents($temp,base64_encode($contenido));
        return basename($temp);
    }

    /**
     * Devuelve el tamaño del archivo en MB.
     * @param string $ruta Ruta local.
     * @return float
     */
    public static function obtenerTamanoArchivo($ruta) {
        if(!file_exists($ruta)||is_dir($ruta)) return null;
        return filesize($ruta)/1048576;
    }

    /**
     * Devuelve el tamaño de un archivo temporal en MB.
     * @param string $nombre Nombre del archivo temporal.
     * @return float
     */
    public static function obtenerTamanoTemporal($nombre) {
        return self::obtenerTamanoArchivo(_temporalesPrivados.$nombre);
    }

    /**
     * Mueve un archivo subido al directorio temporal y devuelve su nombre, o null.
     * @param array $archivo Elemento de $__FILES.
     * @return string
     */
    public static function subirTemporal($archivo) {
        if(!is_uploaded_file($archivo['tmp_name'])) return null;
        return self::almacenarTemporal(file_get_contents($archivo['tmp_name']));
    }

    /**
     * Mueve un archivo temporal al almacenamiento local. Devuelve el nombre final, o null.
     * @param string $temporal Nombre del archivo temporal devuelvo por `almacenarTemporal()`.
     * @param string $nombre Nombre de destino. Será sanitizado y se validará que sea único.
     * @param string $destino Ruta de destino. Por defecto, será la ruta configurada en `rutaArchivos`.
     * @param bool $mantenerCodificacion Si es `true`, el archivo permanecerá codificado. En ese caso, será necesario utilizar `obtenerArchivoLocal()` para leer el mismo, o implementar
     * un proxy que utilice `enviarArchivoLocal()` para enviar al cliente.
     * @return bool
     */
    public static function moverTemporalLocal($temporal,$nombre,$destino=null,$mantenerCodificacion=false) {
        if(!$destino) $destino=_raiz.\configuracion::$rutaArchivos;

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
     * @param string $ruta Ruta de origen.
     * @param string $nombre Nombre de destino. Será sanitizado y se validará que sea único.
     * @param string $destino Ruta de destino. Por defecto, será la ruta configurada en `rutaArchivos`.
     * @param bool $codificar Si es true, el archivo será codificado. En ese caso, será necesario utilizar obtenerArchivoLocal() para leer el mismo, o implementar
     * un proxy que utilice enviarArchivoLocal() para enviar al cliente.
     * @return string
     */
    public static function moverLocal($ruta,$nombre,$destino=null,$codificar=false) {
        if(!$destino) $destino=_raiz.\configuracion::$rutaArchivos;
        
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
     * @param mixed $contenido Contenido del archivo.
     * @param string $nombre Nombre de destino. Será sanitizado y se validará que sea único.
     * @param string $destino Ruta de destino. Por defecto, será la ruta configurada en `rutaArchivos`.
     * @param bool $codificar Si es true, el archivo será codificado. En ese caso, será necesario utilizar obtenerArchivoLocal() para leer el mismo, o implementar
     * un proxy que utilice enviarArchivoLocal() para enviar al cliente.
     * @return string
     */
    public static function almacenarLocal($contenido,$nombre,$destino=null,$codificar=false) {
        if(!$destino) $destino=_raiz.\configuracion::$rutaArchivos;
        
        $nombre=\almacenamiento::limpiarNombre($nombre);
        $nombre=\almacenamiento::obtenerNombreLibre($destino,$nombre);

        if(!is_dir($destino)) return null;
        
        if($codificar) $contenido=base64_encode($contenido);

        file_put_contents($destino.$nombre,$contenido);

        return $nombre;
    }

    /**
     * Devuelve el contenido de un archivo en el almacenamiento local, o null.
     * @param string $nombre Nombre del archivo.
     * @param string $ruta Ruta de origen. Por defecto, será la ruta configurada en `rutaArchivos`.
     * @param bool $decodificar Decodifica un archivo almacenado mediante almacenarLocal(), moverLocal() o moverTemporalLocal().
     * @return mixed
     */
    public static function obtenerArchivoLocal($nombre,$ruta=null,$decodificar=false) {
        if(!$ruta) $ruta=_raiz.\configuracion::$rutaArchivos;
        
        if(!file_exists($ruta.$nombre)||is_dir($ruta.$nombre)) return null;

        $contenido=file_get_contents($ruta.$nombre);

        if($decodificar) $contenido=base64_decode($contenido);

        return $contenido;
    }

    /**
     * Envía un archivo desde el almacenamiento local al cliente. Devuelve null en caso de error.
     * @param string $nombre Nombre del archivo.
     * @param string $ruta Ruta de origen. Por defecto, será la ruta configurada en `rutaArchivos`.
     * @param bool $descargar Si es true, enviará los encabezados para forzar la descarga del archivo.
     * @param bool $decodificar Decodifica un archivo almacenado mediante almacenarLocal(), moverLocal() o moverTemporalLocal().
     * @return mixed
     */
    public static function enviarArchivoLocal($nombre,$ruta=null,$descargar=false,$decodificar=false) {
        if(!$ruta) $ruta=_raiz.\configuracion::$rutaArchivos;

        $contenido=self::obtenerArchivoLocal($nombre,$ruta,$decodificar);
        if(!$contenido) return null;

        $mime=self::mime($ruta.$nombre);
        \solicitud::establecerEncabezado('Content-Type',$mime.'; charset=utf-8');  
        if($descargar) \solicitud::establecerEncabezado('Content-Disposition','attachment; filename="'.$nombre.'"');

        ob_clean();
        echo $contenido;
        exit;
    }

    /**
     * Determina y devuelve el tipo MIME de un archivo a partir de su extensión.
     * @param string $ruta Ruta local.
     * @param bool $incluirCharset Incluye el juego de caracteres en la salida, si corresponde (tipos de texto plano).
     * @return string
     */
    public static function mime($ruta,$incluirCharset=false) {
        //Fuente php.net con agregados
        $tipos=[
            'txt'=>'text/plain',
            'htm'=>'text/html',
            'html'=>'text/html',
            'php'=>'text/html',
            'css'=>'text/css',
            'js'=>'application/javascript',
            'json'=>'application/json',
            'xml'=>'application/xml',
            'swf'=>'application/x-shockwave-flash',
            'flv'=>'video/x-flv',
            'png'=>'image/png',
            'jpe'=>'image/jpeg',
            'jpeg'=>'image/jpeg',
            'jpg'=>'image/jpeg',
            'gif'=>'image/gif',
            'bmp'=>'image/bmp',
            'ico'=>'image/vnd.microsoft.icon',
            'tiff'=>'image/tiff',
            'tif'=>'image/tiff',
            'svg'=>'image/svg+xml',
            'svgz'=>'image/svg+xml',
            'zip'=>'application/zip',
            'rar'=>'application/x-rar-compressed',
            'exe'=>'application/x-msdownload',
            'msi'=>'application/x-msdownload',
            'cab'=>'application/vnd.ms-cab-compressed',
            'mp3'=>'audio/mpeg',
            'qt'=>'video/quicktime',
            'mov'=>'video/quicktime',
            'pdf'=>'application/pdf',
            'psd'=>'image/vnd.adobe.photoshop',
            'ai'=>'application/postscript',
            'eps'=>'application/postscript',
            'ps'=>'application/postscript',
            'doc'=>'application/msword',
            'docx'=>'application/msword',
            'rtf'=>'application/rtf',
            'xls'=>'application/vnd.ms-excel',
            'xlsx'=>'application/vnd.ms-excel',
            'ppt'=>'application/vnd.ms-powerpoint',
            'pptx'=>'application/vnd.ms-powerpoint',
            'odt'=>'application/vnd.oasis.opendocument.text',
            'ods'=>'application/vnd.oasis.opendocument.spreadsheet'
        ];
        $planos=['txt','htm','html','php','css','js','json','xml','svg'];

        $p=strrpos($ruta,'.');
        $ext=$p?strtolower(substr($ruta,$p+1)):null;

        if(!$ext||!array_key_exists($ext,$tipos)) return 'text/plain; charset=utf-8';

        $plano=in_array($ext,$planos);

        return $tipos[$ext].($plano?'; charset=utf-8':'');
    }
}