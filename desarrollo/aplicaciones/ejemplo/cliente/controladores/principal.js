/**
 * Controlador de la vista principal.
 */
ui.registrarControlador("principal",function() {
    this.listo=function() {
        ui.aplicacion().verificarUsuario(function(usuario) {
            componentes.menuUsuario.establecerEtiqueta(usuario.nombre);
        });
    };
});
