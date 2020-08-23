/**
 * Controlador de la vista inicio.
 */
ui.registrarControlador("inicio",function() {
    var t=this;
    
    /**
     * Envía el formulario.
     */
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

    /**
     * Muestra el mensaje de error de ingreso.
     */
    this.error=function() {
        ui.alerta("Datos de acceso inválidos.",function() {
            componentes.u.foco();
        });
    };
});
