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

    var componentes={},
        //Cache de instancias objetoDom
        //Por convención utilizaremos el signo $ al comienzo de cada variable que almacene una instancia de objetoDom. La idea es facilitar la visualización
        //de qué variables contienen elementos del DOM (Element) y cuáles instancias de objetoDom a fin de mantener la creación de instancias al mínimo.
        $doc=$(document),
        $body=$("body"),
        $ventana=$(window),
        $cuerpo=$("#foxtrot-cuerpo");

    this.registrarComponente=function(nombre,funcion,configuracion) {
        configuracion.nombre=nombre;
        componentes[nombre]={
            fn:funcion,
            config:configuracion
        };
    };

    var configurarBarrasHerramientas=function() {
        $("#foxtrot-barra-componentes").arrastrable({
            asa:$("#foxtrot-barra-componentes .foxtrot-asa-arrastre"),
            mover:true
        });
    };

    var contruirBarrasHerramientas=function() {
        var $barra=$("#foxtrot-barra-componentes .foxtrot-contenidos-barra-herramientas");
        for(var nombre in componentes) {
            if(!componentes.hasOwnProperty(nombre)) continue;
            $barra.anexar(
                $("<button class='"+claseBotonesBarrasHerramientas+"'>")
                    .anexar(
                        $("<img>")
                            .atributo("src",componentes[nombre].config.icono)
                            .atributo("title",componentes[nombre].config.descripcion)
                    )
                    .metadatos("componente",nombre)
                );
        }

        configurarBarrasHerramientas();
    };

    var prapararArrastrarYSoltar=function() {
        var componentes=$("#foxtrot-barra-componentes .foxtrot-contenidos-barra-herramientas button").obtener();
        for(var i=0;i<componentes.length;i++) {
            var $comp=$(componentes[i]);
            $comp.arrastrable({
                icono:$comp.buscar("img").obtener(0),
                datos:$comp.metadatos("componente")
            });
        }

        $cuerpo.aceptarColocacion({
            drop:function(e) {
                
            }
        });
    };

    this.ejecutar=function() {
        contruirBarrasHerramientas();

        prapararArrastrarYSoltar();
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

//Exportar para Closure
window["ui"]=ui;
