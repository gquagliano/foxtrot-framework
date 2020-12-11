<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace componentes;

defined('_inc') or exit;

/**
 * Clase privada del componente Archivo.
 */
class archivo extends \componente {
    /**
     * Almacena un archivo recibido en su ubicación final. Devuelve la ruta final.
     * @var object $archivo Objeto de archivo (elemento del valor de un componente de subida de archivos).
     * @var string $destino Ruta de destino. Por defecto, será la configurada en `rutaArchivos`.
     * @var string $nombre Nombre de destino. Por defecto, se utilizará el nombre recibido desde el cliente, sanitizado.
     * @var bool $codificar Codificar el archivo en destino.
     * @return string
     */
    public function almacenarArchivo($archivo,$destino,$nombre=null,$codificar=false) {
        $temp=\util::limpiarValor($archivo->archivo,false,true);
        if(!$nombre) $nombre=\almacenamiento::limpiarNombre($archivo->nombre);        
        return \almacenamiento::moverTemporalLocal($temp,$nombre,$destino,$codificar);
    }

    /**
     * Procesa los archivos recibidos desde el cliente, almacenándolos localmente. Devuelve un objeto con las propiedades 'nombre' y 'archivo', con el nombre original y el
     * nombre local respectivamente.
     * @var object[] $archivos Listado de archivos (valor de un componente de subida de archivos).
     * @var string $ext Extensiones admitidas, separadas por |.
     * @var string $destino Ruta de destino.
     * @var callable $retornoError Función a invocar en caso de un archivo inválido. Recibirá los parámetros del archivo como argumento.
     * @var bool $codificar Codificar el archivo en destino.
     * @return object[]
     */
    public function recibirArchivos($archivos,$ext,$destino=null,$retornoError=null,$codificar=false) {
        if(!$archivos) return [];

        $resultado=[];
        foreach($archivos as $archivo) {
            $info=\almacenamiento::separarNombre(\almacenamiento::limpiarNombre($archivo->nombre));
            if(!preg_match('/^('.$ext.')$/i',$info->extension)) {
                if($retornoError) $retornoError($archivo);
                continue;
            }
            $ruta=$this->almacenarArchivo($archivo,$destino,null,$codificar);
            if($ruta) {
                $resultado[]=(object)[
                    'nombre'=>$archivo->nombre,
                    'archivo'=>$ruta
                ];
            }
        }

        return $resultado;
    }
}