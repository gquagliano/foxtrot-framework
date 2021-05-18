/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Menú contextual.
 * @class
 * @extends componente
 */
var componenteMenu=function() { 
    "use strict";

    this.componente="menu";

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.contenedor=this.elemento.querySelector("ul");

        this.clasesCss=this.clasesCss.concat("menu","menu-contextual");
        
        this.prototipo.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        //El menú debe ser compatible con el gestor de menús de ui, para poder aprovechar los métodos existentes
        this.elemento=document.crear("<div class='menu oculto menu-contextual'>");
        this.contenedor=document.crear("<ul>")
            .anexarA(this.elemento);

        this.prototipo.crear.call(this);

        return this;
    };
};

ui.registrarComponente("menu",componenteMenu,configComponente.clonar({
    descripcion:"Menú desplegable o contextual",
    etiqueta:"Menú",
    grupo:"Menú",
    icono:"menu.png",
    aceptaHijos:["item-menu"]
}));