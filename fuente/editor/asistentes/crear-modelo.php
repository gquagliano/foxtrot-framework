<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para crear un modelo en blanco a partir de una plantilla

defined('_inc') or exit;

/**
 * Asistente concreto para crear clases de modelo de datos.
 */
class crearModelo extends asistente {
    /**
     * Devuelve los parámetros del asistente. Debe devolver un objeto con las propiedades [nombre,visible=>bool].
     * @return object
     */
    public static function obtenerParametros() {
        return (object)[
            'visible'=>false
        ];
    }

    /**
     * Devuelve el formulario de configuración del asistente.
     * @return string
     */
    public function obtenerFormulario() {
    }

    /**
     * Ejecuta el asistente.
     * @var object $parametros Parámetros recibidos desde el formulario.
     */
    public function ejecutar($parametros) {
        $opciones=obtenerArgumentos();
      
        $aplicacion=validarParametroAplicacion($opciones);        
        foxtrot::inicializar($aplicacion);

        if(!$opciones['m']) $this->error('El argumento `-m` es requerido.');
        if(!$opciones['e']) $this->error('El argumento `-e` es requerido.');

        $modelo=$opciones['m'];
        $entidad=$opciones['e'];

        $rutaModelo=_modeloAplicacion.$modelo.'.php';
        $rutaEntidad=_modeloAplicacion.$entidad.'.php';

        if(file_exists($rutaModelo)) $this->error('La clase del modelo ya existe.');
        if(file_exists($rutaEntidad)) $this->error('La clase de la entidad ya existe.');

        $tabla='';
        if($opciones['t']) $tabla='protected $nombre=\''.$opciones['t'].'\';'.PHP_EOL;

        $vars=[
            '{nombreApl}'=>$this->aplicacion,
            '{modelo}'=>$modelo,
            '{entidad}'=>$entidad,
            '{tabla}'=>$tabla
        ];

        file_put_contents(
            $rutaModelo,
            str_replace_array($vars,file_get_contents(__DIR__.'/crear-modelo/modelo.php'))
        );

        file_put_contents(
            $rutaEntidad,
            str_replace_array($vars,file_get_contents(__DIR__.'/crear-modelo/entidad.php'))
        );
    }
}