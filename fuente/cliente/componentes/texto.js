/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Texto.
 */
var componenteTexto=function() {    
    this.componente="texto";
    this.contenidoEditable=true;

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<p class='texto'>Hacé doble click para comenzar a escribir...</div>");
        this.crearComponente();
        return this;
    };
};

ui.registrarComponente("texto",componenteTexto,configComponente.clonar({
    descripcion:"Texto",
    etiqueta:"Texto",
    icono:"texto.png",
    aceptaHijos:false
}));