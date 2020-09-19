/**
 * Controlador de la vista {nombreVista}. Autogenerado por el asistente de Foxtrot.
 * @author 
 * @version 1.0
 */
ui.registrarControlador("{nombreVista}",function() {
    "use strict";
    
    var t=this;

    this.controladorServidor="{controlador}";

    this.id=null;
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
     * Carga el formulario.
     */
    this.cargarDatos=function() {
        var parametros=ui.obtenerParametros(),
            titulo="Crear {singular}";
        if(parametros.id) {
            this.id=parametros.id;
            titulo="Modificar {singular}";
            this.servidor.obtenerItem(function(obj) {
                ui.establecerValores(obj);
            },parametros.id);
        }
        componentes.encabezado.obtenerElemento().establecerHtml(titulo);
    };

    /**
     * Guarda el formulario.
     */
    this.guardar=function() {
        this.servidor.guardar(function(obj) {
            t.id=obj.id;
            componentes.encabezado.obtenerElemento().establecerHtml("Modificar {singular}");
            ui.alerta("Guardado correctamente.");
        },ui.obtenerValores(),this.id);
    };

    /**
     * Click en Nuevo.
     */
    this.nuevo=function() {
        ui.confirmar("¿Estás seguro de querer continuar?",function(r) {
            if(r) ui.irA("{nombreSingular}");
        });
    };

    /**
     * Click en Volver.
     */
    this.volver=function() {
        ui.confirmar("¿Estás seguro de querer continuar?",function(r) {
<!superior-multinivel
            if(r) ui.irA("{nombrePlural}/?{relacion}="+t.{relacion});
!>
<!no-multinivel
            if(r) ui.irA("{nombrePlural}");
!>
<!no-superior-multinivel
            if(r) ui.irA("{nombrePlural}");
!>
        });
    };

    /**
     * Muestra un mensaje de error.
     * @param {number} numero - Número de error.
     */
    this.error=function(numero) {
        var mensaje={
            1:"Completá todos los campos marcados con *."
            //TODO Agregar mensajes de error
        }[numero];
        ui.alerta(mensaje,function() {
            componentes.nombre.foco();
        });
    };
});
