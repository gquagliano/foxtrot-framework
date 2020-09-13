/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * @class Componente concreto Menú contextual.
 */
var componenteMenu=function() {    
    this.componente="menu";

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.contenedor=this.elemento;

        //Agregar una clase al padre si se está utilizando como submenú
        var padre=this.elemento.padre();
        if(padre.es({etiqueta:"li"})) padre.agregarClase("con-submenu");

        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        //El menú debe ser compatible con el gestor de menús de ui, para poder aprovechar los métodos existentes
        this.elemento=document.crear("<ul class='foxtrot-menu oculto menu-contextual'>"); 
        this.contenedor=this.elemento;
        this.crearComponente();
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