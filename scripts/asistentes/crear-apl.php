<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para crear un modelo en blanco a partir de una plantilla

defined('_inc') or exit;

class crearApl extends asistente {
    public function ejecutar() {
        $opciones=obtenerArgumentos();

        foxtrot::inicializar(false);

        if(!$opciones['a']) $this->error('El argumento `-a` es requerido.');
        if(!$opciones['d']) $this->error('El argumento `-d` es requerido.');

        $nombre=$opciones['a'];
        $dominio=$opciones['d'];

        $ruta=__DIR__.'/../../desarrollo/aplicaciones/'.$nombre.'/';

        if(file_exists($ruta)) $this->error('La aplicación ya existe.');
        
        //Crear directorios
        mkdir($ruta.'cliente/controladores',0755,true);
        mkdir($ruta.'cliente/vistas',0755);
        mkdir($ruta.'recursos/css',0755,true);
        mkdir($ruta.'recursos/img',0755);
        mkdir($ruta.'servidor/controladores',0755,true);
        mkdir($ruta.'servidor/modelo',0755);

        //Copiar plantillas
        $dir=__DIR__.'/crear-apl/';
        copy($dir.'config.php',$ruta.'config.php');
        copy($dir.'aplicacion.json',$ruta.'aplicacion.json');
        copy($dir.'aplicacion.js',$ruta.'cliente/aplicacion.js');
        copy($dir.'recursos/css/estilos.css',$ruta.'recursos/css/estilos.css');

        $reemplazar=[
            '{nombre}'=>$nombre
        ];
        
        $codigo=file_get_contents($dir.'aplicacion.php');
        file_put_contents($ruta.'servidor/aplicacion.php',str_replace_array($reemplazar,$codigo));
        
        $codigo=file_get_contents($dir.'aplicacion.pub.php');
        file_put_contents($ruta.'servidor/aplicacion.pub.php',str_replace_array($reemplazar,$codigo));

        //Intentar configurar dominio
        $ruta=__DIR__.'/../../desarrollo/config.php';
        $rutaPlantilla=__DIR__.'/../../desarrollo/config-ejemplo.php';
        $config=null;
        if(file_exists($ruta)) {
            $config=file_get_contents($ruta);
        } elseif(file_exists($rutaPlantilla)) {
            $config=file_get_contents($rutaPlantilla);
        }
        if($config) {
            $config=preg_replace('/\$dominios.*?=.*?\[(.*?)(\s*)\];/s','$dominios=[\1,'.PHP_EOL."\t".'\''.$dominio.'\'=>\''.$nombre.'\''.PHP_EOL.'];',$config);
            file_put_contents($ruta,$config);
        }
    }
}