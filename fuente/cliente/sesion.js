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
    /**
     * Obtiene los datos públicos de usuario desde la sesión del servidor.
     * @param {function} funcion - Retorno. Recibirá como parámetro el valor público establecido en el servidor.
     * @param {Object} opciones - Parámetros de la solicitud. Ver documentación de servidor.invocarMetodo().
     * @returns {sesion}
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
}();

window["sesion"]=sesion;
