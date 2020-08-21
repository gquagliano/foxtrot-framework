/**
 * Controlador de la vista {nombreVista}. Autogenerado por el asistente de Foxtrot.
 * @author 
 * @version 1.0
 */
ui.registrarControlador("{nombreVista}",function() {
    "use strict";
    
    var t=this;

    this.controladorServidor="{controlador}";
    
    this.listo=function() {
        //TODO Implementar verificarUsuario()
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

    this.filtrar=function() {
        componentes.pagina.valor(1);
        this.cargarDatos();
    };

    this.eliminar=function(componente) {
        var id=componente.obtenerDatos().id;

        ui.confirmar("¿Estás seguro de querer eliminar?",function(resp) {
            if(resp) t.servidor.eliminar(function() {
                t.cargarDatos();
            },id);
        });
    };
});
