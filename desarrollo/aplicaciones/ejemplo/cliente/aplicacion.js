/**
 * Controlador de la aplicación.
 */
ui.registrarAplicacion(function() {
    this.nivelesUsuario={
        1:"Administrador",
        2:"Operador",
        3:"Externo"
    };

    /**
     * Valida la sesión.
     * @param {function} retorno - Función de retorno en caso de ser un usuario autenticado.
     */
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

    /**
     * Cierra la sesión.
     */
    this.cerrarSesion=function() {
        this.servidor.cerrarSesion(function() {
            ui.irA("inicio");
        });
    };

    /**
     * Genera los números de página.
     * @param {componente} comp - Componente Desplegable.
     * @param {number} pags - Número de páginas.
     */
    this.crearDesplegablePaginas=function(comp,pags) {
        var pagina=comp.valor()
            opciones={};

        for(var i=1;i<=pags;i++) opciones[i]=i;

        comp.establecerOpciones(opciones)
            .valor(pagina?pagina:1); //Reestablecer valor luego de haber reemplazado las opciones

        return this;
    };
});
