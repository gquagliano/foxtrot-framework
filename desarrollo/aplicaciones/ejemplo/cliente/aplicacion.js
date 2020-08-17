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

    this.crearDesplegablePaginas=function(comp,pags) {
        var pagina=comp.valor()
            opciones={};

        for(var i=1;i<=pags;i++) opciones[i]=i;

        comp.establecerOpciones(opciones)
            .valor(pagina?pagina:1); //Reestablecer valor luego de haber reemplazado las opciones

        return this;
    };
});
