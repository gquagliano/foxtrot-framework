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
    
    this.listo=function() {
        //TODO Implementar verificarUsuario()
        ui.aplicacion().verificarUsuario(function() {
            t.cargarDatos();
        });
    };

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
        componentes.titulo.obtenerElemento().establecerHtml(titulo);
    };

    this.guardar=function() {
        var t=this;
        this.servidor.guardar(function(obj) {
            t.id=obj.id;
            componentes.titulo.obtenerElemento().establecerHtml("Modificar {singular}");
            ui.alerta("Guardado correctamente.");
        },ui.obtenerValores(),this.id);
    };

    this.nuevo=function() {
        ui.confirmar("¿Estás seguro de querer continuar?",function(r) {
            if(r) ui.irA("{nombreSingular}");
        });
    };

    this.volver=function() {
        ui.confirmar("¿Estás seguro de querer continuar?",function(r) {
            if(r) ui.irA("{nombrePlural}");
        });
    };

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
