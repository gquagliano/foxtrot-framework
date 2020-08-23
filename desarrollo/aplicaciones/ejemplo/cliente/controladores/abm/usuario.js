/**
 * Controlador de la vista abm/usuario.
 * @author 
 * @version 1.0
 */
ui.registrarControlador("abm/usuario",function() {
    "use strict";
    
    var t=this;

    this.controladorServidor="usuarios";

    this.id=null;
    
    /**
     * Evento Listo.
     */
    this.listo=function() {
        ui.aplicacion().verificarUsuario(function() {
            t.cargarDatos();
        });
    };

    /**
     * Carga el formulario.
     */
    this.cargarDatos=function() {
        var parametros=ui.obtenerParametros(),
            titulo="Crear usuario";
        if(parametros.id) {
            this.id=parametros.id;
            titulo="Modificar usuario";
            this.servidor.obtenerItem(function(obj) {
                ui.establecerValores(obj);
            },parametros.id);
        }
        componentes.titulo.obtenerElemento().establecerHtml(titulo);
    };

    /**
     * Guarda el formulario.
     */
    this.guardar=function() {
        var t=this;
        this.servidor.guardar(function(obj) {
            t.id=obj.id;
            componentes.titulo.obtenerElemento().establecerHtml("Modificar usuario");
            ui.alerta("Guardado correctamente.");
        },ui.obtenerValores(),this.id);
    };

    /**
     * Click en Nuevo.
     */
    this.nuevo=function() {
        ui.confirmar("¿Estás seguro de querer continuar?",function(r) {
            if(r) ui.irA("abm/usuario");
        });
    };

    /**
     * Click en Volver.
     */
    this.volver=function() {
        ui.confirmar("¿Estás seguro de querer continuar?",function(r) {
            if(r) ui.irA("abm/usuarios");
        });
    };

    /**
     * Muestra un mensaje de error.
     * @param {number} numero - Número de error.
     */
    this.error=function(numero) {
        var mensaje={
            1:"Completá todos los campos marcados con *.",
            2:"La contraseña y la confirmación no coinciden."
        }[numero];
        ui.alerta(mensaje,function() {
            componentes.nombre.foco();
        });
    };
});
