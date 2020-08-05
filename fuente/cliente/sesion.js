/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Gestor de acceso a los datos públicos de la sesión en el servidor.
 */
var sesion=new function() {
    this.obtenerUsuario=function(funcion) {
        servidor.invocarMetodo({
            foxtrot:"sesion",
            retorno:function(resultado) {
                funcion(resultado);
            }
        });
        return this;
    };
}();

window["sesion"]=sesion;
