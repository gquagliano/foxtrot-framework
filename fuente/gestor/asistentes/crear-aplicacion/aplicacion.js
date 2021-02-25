/**
 * Controlador de la aplicación. Autogenerado por el asistente de Foxtrot.
 */
ui.registrarAplicacion(function() {
    "use strict";

    var t=this;

    /**
     * Valida la sesión.
     * @param {function} retorno - Función de retorno en caso de ser un usuario autenticado.
     */
    this.verificarUsuario=function(retorno) {
        if(util.esIndefinido(retorno)) retorno=null;

        sesion.obtenerUsuario(function(usuario) {
            if(!usuario) {
                //TODO Acción en caso de sesión vacía
            } else if(retorno) {
                retorno(usuario);
            }
        },{precarga:"barra"});
    };

    /**
     * Cierra la sesión.
     */
    this.cerrarSesion=function() {
        this.servidor.cerrarSesion(function() {
            //TODO ¿Volver al ingreso?
        });
    };
});
