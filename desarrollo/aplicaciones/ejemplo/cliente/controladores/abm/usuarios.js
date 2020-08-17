/**
 * Controlador de la vista abm/usuarios.
 */
ui.registrarControlador("abm/usuarios",function() {
    var t=this;

    this.controladorServidor="usuarios";
    
    this.listo=function() {
        ui.aplicacion().verificarUsuario(function() {
            t.cargarDatos();
        });
    };

    this.cargarDatos=function() {
        var filtro={
            texto:componentes.filtro.valor()
        };

        this.servidor.obtenerListado(function(listado) {
            componentes.tabla.establecerDatos(listado);
        },filtro);
    };

    this.eliminar=function(componente) {
        var id=componente.obtenerDatos().id;

        ui.confirmar("¿Estás seguro de querer eliminar?",function(resp) {
            if(resp) t.servidor.eliminar(function() {
                t.cargarDatos();
            },id);
        });
    };

    this.modificar=function(id) {
        alert(id);
        return true;
    };
});
