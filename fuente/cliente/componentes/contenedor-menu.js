/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Contenedor de menú.
 */
var componenteContenedorMenu=function() {    
    this.componente="contenedor-menu";
    
    this.propiedadesConcretas={
        "Contenedor de menú":{
            comportamiento:{
                etiqueta:"Comportamiento",
                tipo:"opciones",
                opciones:{
                    normal:"Normal",
                    click:"Abrir submenús solo con click"
                },
                adaptativa:false
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.inicializado) return this; 
        this.contenedor=this.elemento;
        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<ul class='nav'>");
        this.crearComponente();
        return this;
    };
    
    /**
     * Actualiza el componente. propiedad puede estar definido tras la modificación de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano) {
        if(propiedad=="comportamiento") {
            if(valor=="click") {
                this.elemento.agregarClase("menu-click");
            } else {
                this.elemento.removerClase("menu-click");
            }
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano);
        return this;
    };
};

ui.registrarComponente("contenedor-menu",componenteContenedorMenu,configComponente.clonar({
    descripcion:"Contenedor o barra de menú",
    etiqueta:"Contenedor de menú",
    grupo:"Menú",
    icono:"contenedor-menu.png",
    aceptaHijos:["item-menu"]
}));