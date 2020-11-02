/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */


/**
 * Módulo concreto Tinymce 5.5.1.
 * @class
 * @extends modulo
 */
var moduloTinymce=function() {
    "use strict";

    var t=this;
    this.nombre="tinymce";
    this.promesa=null;

    /**
     * Crea un editor Tinymce.
     * @param {Object} opciones - Opciones de configuración de Tinymce.
     * @returns {Modulo}
     */
    this.crear=function(opciones) {
        if(!this.promesa) this.promesa=new Promise(function(resolver,rechazar) {
            if(typeof tinymce==="undefined") {            
                ui.cargarJs(ui.obtenerUrlBase()+"cliente/modulos/tinymce/tinymce-5.5.1/tinymce.min.js",function() {
                    resolver();
                });
            } else {
                resolver();
            }
        });

        this.promesa.then(function() {
            //TODO Detectar tema o hacer configurable
            opciones.content_css=ui.obtenerUrlBase()+"cliente/modulos/tinymce/css/tema-sistema.css",
            tinymce.init(opciones);
        });

        return this;
    };
};

ui.registrarModulo("tinymce",moduloTinymce);