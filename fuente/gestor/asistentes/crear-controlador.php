<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Asistente concreto para crear un controlador.
 */
class crearControlador extends asistente {
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
        <div class="form-group row mb-0">
            <label class="col-3 col-form-label">Nombre</label>
            <div class="col-sm-9">
                <input type="text" class="form-control" name="nombre">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label"></label>
            <div class="col-sm-9">
                <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" name="publico" checked id="cc-publico">
                    <label class="custom-control-label" for="cc-publico">Público</label>
                </div>
            </div>
        </div>
<?php
    }

    /**
     * Ejecuta el asistente.
     * @var object $param Parámetros recibidos desde el formulario.
     */
    public function ejecutar($param) {
        if(!$param->nombre||preg_match('/[^a-zA-Z0-9\/_-]/',$param->nombre)) gestor::error('Ingresá un nombre válido');

        $partes=\util::separarRuta($param->nombre);
        $nombre=$partes->nombre;
        $ruta=$partes->ruta;

        $clase=\foxtrot::prepararNombreClase($param->nombre)->nombre;
        $espacio=\foxtrot::prepararNombreClase(gestor::obtenerEspacioAplicacion().$ruta.($param->publico?'publico\\':''),true,true);

        $ruta=_raiz.'aplicaciones/'.gestor::obtenerNombreAplicacion().'/servidor/controladores/'.$ruta.$nombre.($param->publico?'.pub':'').'.php';
        if(file_exists($ruta)) gestor::error('El controlador ya existe.');

        if(!is_dir(dirname($ruta))) mkdir(dirname($ruta),0755,true);

        $php=file_get_contents(__DIR__.'/crear-controlador/controlador.php');
        
        $php=str_replace_array([
            '{controlador}'=>$clase,
            '{espacio}'=>$espacio,
            '{nombre}'=>$param->nombre
        ],$php);

        file_put_contents($ruta,$php);
    }
}