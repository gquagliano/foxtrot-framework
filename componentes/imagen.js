/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Imagen.
 */
var componenteImagen=function() {
    this.componente="imagen";
    
    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<img src='componentes/iconos/imagen.png'>");
        this.crearComponente();
        return this;
    };
};

ui.registrarComponente("imagen",componenteImagen,configComponente.clonar({
    descripcion:"Imagen",
    icono:"componentes/iconos/imagen.png"
}));