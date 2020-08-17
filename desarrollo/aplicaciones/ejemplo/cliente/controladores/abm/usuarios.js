/**
 * Controlador de la vista abm/usuarios.
 */
ui.registrarControlador("abm/usuarios",function() {
    var t=this;

    this.controladorServidor="usuarios";

    this.niveles={
        1:"Administrador",
        2:"Operador",
        3:"Usuario externo"
    };
    
    this.listo=function() {
        ui.aplicacion().verificarUsuario(function() {
            t.cargarDatos();
        });
    };

    this.cargarDatos=function() {
        var filtro={
            texto:componentes.filtro.valor(),
            pagina:componentes.pagina.valor()
        };

        this.servidor.obtenerListado(function(resp) {
            componentes.cantidad.establecerHtml(resp.cantidad);
            componentes.tabla.establecerDatos(resp.filas);
            ui.aplicacion().crearDesplegablePaginas(componentes.pagina,resp.paginas);
        },filtro);
    };

    this.eliminar=function(componente) {
        var id=componente.obtenerDatos().id;

        ui.confirmar("¿Estás seguro de querer eliminar?",function(resp) {
            if(resp) t.servidor.eliminar(function() {
                t.cargarDatos();
            },id);
        });
    };

    this.modificar=function(id) {
        alert(id);
        return true;
    };
});
