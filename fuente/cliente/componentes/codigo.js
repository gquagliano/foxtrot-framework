/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Código.
 * @class
 * @extends componente
 */
var componenteCodigo=function() {    
    "use strict";

    this.componente="codigo";

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.clasePadre.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear(""); 
        this.clasePadre.crear.call(this);
        return this;
    };
};

ui.registrarComponente("codigo",componenteCodigo,configComponente.clonar({
    descripcion:"Código",
    etiqueta:"Código",
    grupo:"Control",
    icono:"codigo.png",
    ocultar:true
}));