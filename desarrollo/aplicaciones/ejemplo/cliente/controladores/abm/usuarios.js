/**
 * Controlador de la vista abm/usuarios.
 * @author 
 * @version 1.0
 */
ui.registrarControlador("abm/usuarios",function() {
    "use strict";
    
    var t=this;

    this.controladorServidor="usuarios";
    
    /**
     * Evento Listo.
     */
    this.listo=function() {
        ui.aplicacion().verificarUsuario(function() {
            t.cargarDatos();
        });
    };

    /**
     * Carga el listado.
     */
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

    /**
     * Click en Filtrar.
     */
    this.filtrar=function() {
        componentes.pagina.valor(1);
        this.cargarDatos();
    };

    /**
     * Click en eliminar.
     * @param {componente} componente - Botón clickeado.
     */
    this.eliminar=function(componente) {
        var id=componente.obtenerDatos().id;

        ui.confirmar("¿Estás seguro de querer eliminar?",function(resp) {
            if(resp) t.servidor.eliminar(function() {
                t.cargarDatos();
            },id);
        });
    };
});
