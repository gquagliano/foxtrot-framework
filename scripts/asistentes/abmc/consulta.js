/**
 * Controlador de la vista {nombreVista}. Autogenerado por el asistente de Foxtrot.
 * @author 
 * @version 1.0
 */
ui.registrarControlador("{nombreVista}",function() {
    "use strict";
    
    var t=this;

    this.controladorServidor="{controlador}";

    /**
     * Evento Listo.
     */
    this.listo=function() {
        //TODO Implementar verificarUsuario()
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
            crearDesplegablePaginas(componentes.pagina,resp.paginas);
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

    /**
     * Genera los números de página.
     * @param {componente} comp - Componente Desplegable.
     * @param {number} pags - Número de páginas.
     */
    var crearDesplegablePaginas=function(comp,pags) {
        var pagina=comp.valor()
            opciones={};

        for(var i=1;i<=pags;i++) opciones[i]=i;

        comp.establecerOpciones(opciones)
            .valor(pagina?pagina:1); //Reestablecer valor luego de haber reemplazado las opciones

        return this;
    };
});
