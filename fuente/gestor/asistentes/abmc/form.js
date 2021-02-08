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
    this.guardar=function(volver) {
        if(typeof volver!=="boolean") volver=true;

        this.servidor.guardar(function(obj) {
            t.id=obj.id;
            ui.alerta("Guardado correctamente.",function() {
                if(volver) {
                    t.volver(false);
                } else {
                    ui.irA("{nombreSingular}");
                }
            },{icono:"ok"});
        },ui.obtenerValores(),this.id);
    };

    /**
     * Click en Guradar y nuevo.
     */
    this.guardarNuevo=function() {
        this.guardar(false);
    };

    /**
     * Click en Volver.
     */
    this.volver=function(confirmar) {
        if(typeof confirmar!=="boolean") confirmar=true;

        var fn=function(r) {
<!superior-multinivel
            if(r) ui.irA("{nombrePlural}/?{relacion}="+t.{relacion});
!>
<!no-multinivel
            if(r) ui.irA("{nombrePlural}");
!>
<!no-superior-multinivel
            if(r) ui.irA("{nombrePlural}");
!>
        };

        if(confirmar) {
            ui.confirmar("¿Estás seguro de querer continuar?",fn,{icono:"pregunta"});
        } else {
            fn(true);
        }
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
        },{icono:"informacion"});
    };
});
