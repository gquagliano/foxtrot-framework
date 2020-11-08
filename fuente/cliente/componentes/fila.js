/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Fila.
 * @class
 * @extends componente
 */
var componenteFila=function() {
    "use strict";

    this.componente="fila";

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this;
        this.contenedor=this.elemento;
        this.clasePadre.inicializar.call(this);
        return this;
    };
    
    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='row contenedor'/>");
        this.clasePadre.crear.call(this);
        return this;
    };
};

ui.registrarComponente("fila",componenteFila,configComponente.clonar({
    descripcion:"Fila",
    etiqueta:"Fila",
    grupo:"Estructura",
    icono:"fila.png"
}));