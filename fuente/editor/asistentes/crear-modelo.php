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
     * Devuelve los parámetros del asistente. Debe devolver un objeto con las propiedades [titulo,visible=>bool].
     * @return object
     */
    public static function obtenerParametros() {
        return (object)[
            'visible'=>false
        ];
    }

    /**
     * Imprime el formulario de configuración del asistente.
     */
    public function obtenerFormulario() {
?>
        <div class="form-group row">
            <label class="col-3 col-form-label">Nombre</label>
            <div class="col-sm-9">
                <input type="text" class="form-control" name="nombre">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label">Entidad (singular)</label>
            <div class="col-sm-9">
                <input type="text" class="form-control" name="entidad">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label">Tabla</label>
            <div class="col-sm-9">
                <input type="text" class="form-control" name="tabla" placeholder="Opcional">
            </div>
        </div>
<?php
    }

    /**
     * Ejecuta el asistente.
     * @var object $param Parámetros recibidos desde el formulario.
     */
    public function ejecutar($param) {
        if(!$param->nombre||!$param->entidad) gestor::error('Ingresá el nombre del modelo y el nombre de la entidad.');
        
        $ruta=__DIR__.'/../../../desarrollo/aplicaciones/'.gestor::obtenerNombreAplicacion().'/servidor/modelo/';
        $rutaModelo=$ruta.$param->nombre.'.php';
        $rutaEntidad=$ruta.$param->entidad.'.php';

        if(file_exists($rutaModelo)) gestor::error('La clase del modelo ya existe.');
        if(file_exists($rutaEntidad)) gestor::error('La clase de la entidad ya existe.');

        $tabla='';
        if($param->tabla) $tabla='protected $nombre=\''.$param->tabla.'\';'.PHP_EOL;

        $vars=[
            '{nombreApl}'=>$this->aplicacion,
            '{modelo}'=>$param->nombre,
            '{entidad}'=>$param->entidad,
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