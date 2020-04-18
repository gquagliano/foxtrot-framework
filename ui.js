/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Métodos de gestión de la interfaz.
 */
var ui=new function() {
    "use strict";

    //Configuración
    var claseBotonesBarrasHerramientas="btn btn-sm";

    var componentes={};

    this.registrarComponente=function(nombre,funcion,configuracion) {
        configuracion.nombre=nombre;
        componentes[nombre]={
            fn:funcion,
            config:configuracion
        };
    };

    var configurarBarrasHerramientas=function() {
        dom("#foxtrot-barra-componentes").arrastrable({
            asa:dom("#foxtrot-barra-componentes .foxtrot-asa-arrastre"),
            mover:true
        });
    };

    var contruirBarrasHerramientas=function() {
        var barra=dom("#foxtrot-barra-componentes .foxtrot-contenidos-barra-herramientas");
        for(var nombre in componentes) {
            if(!componentes.hasOwnProperty(nombre)) continue;
            barra.anexar(
                dom("<button class='"+claseBotonesBarrasHerramientas+"'>").anexar(
                    dom("<img>")
                        .atributo("src",componentes[nombre].config.icono)
                        .atributo("title",componentes[nombre].config.descripcion)
                )
            );
        }

        configurarBarrasHerramientas();
    };

    this.ejecutar=function() {
        contruirBarrasHerramientas();

        
    };
}();

/**
 * Plantilla para los objetos de configuración a utilizar en ui.registrarComponente().
 */
var configComponente={
    nombre: null,
    descripcion: null,
    icono: null,
    /**
     * aceptaHijos:
     * - true               Cualquiera
     * - false              Ninguno
     * - [ nombre, ... ]    Nombre de componentes de los cualqes puede ser hijo, o que acepta como hijos
     */
    aceptaHijos: true
};