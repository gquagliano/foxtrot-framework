/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Deslizable o carrusel.
 * @class
 * @extends componente
 */
var componenteDeslizable=function() {   
    "use strict";

    this.componente="deslizable";

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.prototipo.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear(""); 
        this.prototipo.crear.call(this);
        return this;
    };
};

ui.registrarComponente("deslizable",componenteDeslizable,configComponente.clonar({
    descripcion:"Deslizable o carrusel",
    etiqueta:"Deslizable",
    grupo:"Estructura",
    icono:"deslizable.png",
    ocultar:true
}));