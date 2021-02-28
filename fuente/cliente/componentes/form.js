/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Formulario.
 * @class
 * @extends componente
 */
var componenteFormulario=function() {   
    "use strict";

    this.componente="form";

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 

        this.contenedor=this.elemento;

        this.prototipo.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='formulario'>"); 
        this.prototipo.crear.call(this);
        return this;
    };
};

ui.registrarComponente("form",componenteFormulario,configComponente.clonar({
    descripcion:"Formulario o bloque de contenidos",
    etiqueta:"Formulario",
    grupo:"Estructura",
    icono:"form.png"
}));