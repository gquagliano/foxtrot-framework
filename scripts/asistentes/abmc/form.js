/**
 * Controlador de la vista {nombre}.
 */
ui.registrarControlador("{nombre}",function() {
    var t=this;

    this.controladorServidor="{modelo}";
    
    this.listo=function() {
        ui.aplicacion().verificarUsuario(function() {
            t.cargarDatos();
        });
    };

    this.cargarDatos=function() {

    };

    this.guardar=function() {

    };

    this.nuevo=function() {

    };
});
