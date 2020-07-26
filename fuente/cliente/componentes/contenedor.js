/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Contenedor.
 */
var componenteContenedor=function() {
    this.componente="contenedor";

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
        this.elemento=document.crear("<div class='container vacio'/>");
        this.crearComponente();
        return this;
    };
};

ui.registrarComponente("contenedor",componenteContenedor,configComponente.clonar({
    descripcion:"Contenedor",
    etiqueta:"Contenedor",
    grupo:"Estructura",
    icono:"contenedor.png"
}));

