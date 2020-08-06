/**
 * Controlador de la vista inicio.
 */
ui.registrarControlador("inicio",function() {
    this.ingresar=function() {
        var campos=ui.obtenerValores();

        this.servidor.ingresar(function(respuesta) {
            if(!respuesta) {
                alert("Datos inválidos.");
            } else {
                ui.irA("principal");
            }
        },campos.usuario,campos.contrasena);
    };
});
