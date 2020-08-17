/**
 * Controlador de la aplicación.
 */
ui.registrarAplicacion(function() {
    this.verificarUsuario=function(retorno) {
        if(util.esIndefinido(retorno)) retorno=null;

        sesion.obtenerUsuario(function(usuario) {
            if(!usuario) {
                ui.irA("inicio");
            } else if(retorno) {
                retorno(usuario);
            }
        },{precarga:"barra"});
    };

    this.cerrarSesion=function() {
        this.servidor.cerrarSesion(function() {
            ui.irA("inicio");
        });
    };
});
