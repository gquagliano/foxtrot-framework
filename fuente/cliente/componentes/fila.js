/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Fila.
 */
var componenteFila=function() {
    this.componente="fila";

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this;
        this.contenedor=this.elemento;
        this.inicializarComponente();
        return this;
    };
    
    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='row contenedor'/>");
        this.crearComponente();
        return this;
    };
};

ui.registrarComponente("fila",componenteFila,configComponente.clonar({
    descripcion:"Fila",
    etiqueta:"Fila",
    grupo:"Estructura",
    icono:"fila.png"
}));