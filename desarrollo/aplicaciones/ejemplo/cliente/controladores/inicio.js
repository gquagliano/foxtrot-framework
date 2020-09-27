/**
 * Controlador de la vista inicio.
 */
ui.registrarControlador("inicio",function() {
    var t=this;

    this.recaptcha=null;

    this.listo=function() {
        //Configurar credenciales en config.php y remover comentario para activar Recaptcha
        //this.recaptcha=ui.obtenerInstanciaModulo("recaptcha").cargar();
    };
    
    /**
     * Envía el formulario.
     */
    this.ingresar=function() {
        var datos=ui.obtenerValores();

        if(!datos.u.trim()||!datos.c.trim()) {
            t.error();
            return;
        }

        //Remover comentario para activar Recaptcha
        //this.recaptcha.recaptchaInvisible(function(token) {
        //    datos.recaptcha=token;
            this.servidor.iniciarSesion(function(respuesta) {
                if(!respuesta) {
                    t.error();
                } else {
                    ui.mostrarPrecarga()
                        .irA(respuesta);
                }
            },datos);
        //});
    };

    /**
     * Muestra el mensaje de error de ingreso.
     */
    this.error=function() {
        ui.alerta("Datos de acceso inválidos.",function() {
            componentes.u.foco();
        });
    };

    /**
     * Muestra el mensaje de error de Recaptcha.
     */
    this.errorRecaptcha=function() {
        ui.alerta("Falló la verificación de seguridad. Por favor, recargá la página e intentá nuevamente. Si el problema\
            persiste, deshabilitá los bloqueadores de publicidad y rastreo como AdBlock.",function() {
                componentes.u.foco();
        });
    };
});
