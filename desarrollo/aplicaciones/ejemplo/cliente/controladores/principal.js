/**
 * Controlador de la vista principal.
 */
ui.registrarControlador("principal",function() {
    this.inicializar=function() {
        sesion.obtenerUsuario(function(datos) {
            if(!datos) {
                //Sin sesión iniciada
                ui.irA("inicio");
                return;
                
                //Lógicamente, este tipo de validación debe utilizarse solo a modo informativo o para redireccionar a la página de ingreso. La seguridad debe
                //estar del lado del servidor, durante el acceso a datos.
            }
            ui.vista().establecerDatos(datos);
        });
    };
});
