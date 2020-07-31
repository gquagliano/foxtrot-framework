/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Botón.
 */
var componenteBoton=function() {    
    this.componente="boton"; 
    this.contenidoEditable=true;

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<a href='#'>Botón</a>"); 
        this.crearComponente();
        return this;
    };
};

ui.registrarComponente("boton",componenteBoton,configComponente.clonar({
    descripcion:"Botón o enlace",
    etiqueta:"Botón",
    icono:"boton.png"
}));