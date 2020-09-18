<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Asistente concreto para crear una vista.
 */
class crearVista extends asistente {
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
     * Devuelve el formulario de configuración del asistente.
     * @return string
     */
    public function obtenerFormulario() {
?>
<div class="form-group row">
    <label class="col-3 col-form-label">Ruta y nombre</label>
    <div class="col-sm-9">
        <input type="text" class="form-control" name="nombre">
    </div>
</div>
<div class="form-group row">
    <label class="col-3 col-form-label">Modo</label>
    <div class="col-sm-6">
        <select class="custom-select" name="modo">
            <option value="independiente">Independiente</option>
            <option value="embebible">Embebible</option>
        </select>
    </div>
</div>
<div class="form-group row">
    <label class="col-3 col-form-label">Cliente</label>
    <div class="col-sm-6">
        <select class="custom-select" name="cliente">
            <option value="web">Web</option>
            <option value="cordova">Cordova</option>
            <option value="escritorio">Escritorio</option>
        </select>
    </div>
</div>
<?php
    }

    /**
     * Ejecuta el asistente.
     * @var object $parametros Parámetros recibidos desde el formulario.
     */
    public function ejecutar($parametros) {        
    }
}