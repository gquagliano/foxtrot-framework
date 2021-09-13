/**
 * Controlador de la vista {nombreVista}. Autogenerado por el asistente de Foxtrot.
 * @author 
 * @version 1.0
 */
ui.registrarControlador("{nombreVista}",function() {
    "use strict";
    
    var t=this,
        orden=null;

    this.controladorServidor="{controlador}";
<!superior-multinivel
    this.{relacion}=ui.obtenerParametro("{relacion}");
!>

    /**
     * Evento Listo.
     */
    this.listo=function() {
        //TODO Implementar verificarUsuario()
        //ui.aplicacion().verificarUsuario(function() {
        //    t.cargarDatos();
        //});
        t.cargarDatos();
    };

    /**
     * Carga el listado.
     */
    this.cargarDatos=function() {
        var filtro={
<!superior-multinivel
            {relacion}:this.{relacion},
!>
            texto:componentes.filtro.valor(),
            pagina:componentes.pagina.valor(),
            orden:orden
        };

        this.servidor.obtenerListado(function(resp) {
            componentes.cantidad.establecerHtml(resp.cantidad);
            componentes.tabla.establecerDatos(resp.filas);
            crearDesplegablePaginas(componentes.pagina,resp.paginas);
<!multinivel
            componentes.encabezado.establecerHtml(resp.ruta);
!>
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
        },{icono:"pregunta"});
    };

    this.clickEncabezado=function(comp,ev) {
        if(orden&&orden[0]==ev.columna) {
            orden[1]=orden[1]=="ascendente"?"descendente":"ascendente"
        } else {
            orden=[ev.columna,"ascendente"];
        }
        componentes.tabla
            .limpiarOrdenamiento()
            .obtenerColumna(orden[0])
            .propiedad("orden",orden[1]);
        this.cargarDatos();
    };

    /**
     * Genera los números de página.
     * @param {componente} comp - Componente Desplegable.
     * @param {number} pags - Número de páginas.
     */
    var crearDesplegablePaginas=function(comp,pags) {
        var pagina=comp.valor(),
            opciones={};

        for(var i=1;i<=pags;i++) opciones[i]=i;

        comp.establecerOpciones(opciones)
            //Reestablecer valor luego de haber reemplazado las opciones
            .valor(pagina?pagina:1); 

        return this;
    };
});
