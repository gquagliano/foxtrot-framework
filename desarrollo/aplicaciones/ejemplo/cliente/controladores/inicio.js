/**
 * Controlador de la vista inicio.
 */
ui.registrarControlador("inicio",function() {
    var t=this;
    
    this.ingresar=function() {
        var datos=ui.obtenerValores();

        if(!datos.u.trim()||!datos.c.trim()) {
            t.error();
            return;
        }

        this.servidor.iniciarSesion(function(respuesta) {
            if(!respuesta) {
                t.error();
            } else {
                ui.mostrarPrecarga()
                    .irA(respuesta);
            }
        },datos);
    };

    this.error=function() {
        ui.alerta("Datos de acceso inválidos.",function() {
            componentes.u.foco();
        });
    };
});
