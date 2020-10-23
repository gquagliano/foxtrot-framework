/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * @class Gestor de acceso a los datos públicos de la sesión en el servidor.
 * @typedef Sesion
 */
var sesion=new function() {
    "use strict";

    var temporizador=null;

    /**
     * Obtiene los datos públicos de usuario desde la sesión del servidor.
     * @param {function} funcion - Retorno. Recibirá como parámetro el valor público establecido en el servidor.
     * @param {Object} opciones - Parámetros de la solicitud. Ver documentación de servidor.invocarMetodo().
     * @returns {Sesion}
     */
    this.obtenerUsuario=function(funcion,opciones) {
        if(typeof opciones==="undefined") opciones={};

        opciones.foxtrot="sesion";
        opciones.retorno=function(resultado) {
            funcion(resultado);
        };

        servidor.invocarMetodo(opciones);
        return this;
    };

    /**
     * Mantiene la sesión abierta realizando solicitudes periódicamente para prevenir el vencimiento.
     * @param {boolean} [activar=true] - Si se especifica false, detendrá este comportamiento.
     * @returns {Sesion}
     */
    this.mantenerSesion=function(activar) {
        if(typeof activar==="undefined") activar=true;
        
        clearTimeout(temporizador);
        if(!activar) return this;

        var fn=function() {
            temporizador=setTimeout(fn2,60000);
        },
        fn2=function() {
            new ajax({parametros:{__f:"noop"}});
            fn();
        };
        fn();

        return this;
    };

    if(!ui.enModoEdicion()) this.mantenerSesion();
}();

window["sesion"]=sesion;
