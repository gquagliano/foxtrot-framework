/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * @class Módulo concreto Recaptcha.
 */
ui.registrarModulo("recaptcha",function() {
    var t=this;
    this.nombre="recaptcha";
    this.recaptchaListo=false;
    this.promesaRecaptcha=null;
    this.trabajando=false;
    this.clave=null;
    this.mostrarPrecarga=true;

    /**
     * Carga Recaptcha en la página.
     * @param {string} [clave] - Clave pública de Recaptcha. Si se omite o es nulo, intentará obtener la configuración desde el servidor.
     * @param {Object} [opciones] - Opciones para la comunicación cliente-servidor (ver documentación de servidor.invocarMetodo).
     * @returns {Modulo}
     */
    this.cargar=function(clave,opciones) {
        if(this.recaptchaListo) return this;

        if(typeof clave==="undefined") clave=null;
        if(typeof opciones==="undefined") opciones=null;

        this.promesaRecaptcha=new Promise(function(resolver,rechazar) {        
            var cargarJs=function() {
                ui.cargarJs("https://www.google.com/recaptcha/api.js?render="+t.clave,function() {
                    t.recaptchaListo=true;
                    resolver();
                });
            };

            if(!clave) {
                //Cargar clave desde el servidor
                if(opciones) t.servidor.establecerPredeterminados(opciones);
                t.servidor.obtenerConfiguracion(function(retorno) {
                    t.clave=retorno.clave;
                    cargarJs();
                });
            } else {
                //Utilizar la clave provista
                t.clave=clave;
                cargarJs();
            }
        });

        return this;
    };

    /**
     * Genera un nuevo token. No es necesario verificar que la carga de Recaptcha esté completa antes de invocar esta función.
     * @param {function} retorno - Función de retorno. Recibirá como único parámetro el token.
     * @param {string} [accion=submit] - Acción.
     * @returns {Modulo}
     */
    this.recaptchaInvisible=function(retorno,accion) {
        if(this.trabajando) return this;
        this.trabajando=true;

        if(this.mostrarPrecarga) ui.mostrarPrecarga();

        if(typeof accion==="undefined") accion="submit";

        this.promesaRecaptcha.then(function() {
            grecaptcha.ready(function() {
                grecaptcha
                    .execute(t.clave,{ action:retorno })
                    .then(function(token) {
                        if(t.mostrarPrecarga) ui.ocultarPrecarga();

                        //this = controlador
                        var ctl=ui.obtenerInstanciaControladorPrincipal();
                        retorno.call(ctl,token);

                        t.trabajando=false;
                    });
            });
        });

        return this;
    };
});