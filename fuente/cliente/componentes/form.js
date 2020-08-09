/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Formulario.
 */
var componenteFormulario=function() {    
    this.componente="form";

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.inicializado) return this; 
        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='formulario'>"); 
        this.crearComponente();
        return this;
    };
};

ui.registrarComponente("form",componenteFormulario,configComponente.clonar({
    descripcion:"Formulario o bloque de contenidos",
    etiqueta:"Formulario",
    grupo:"Estructura",
    icono:"form.png"
}));