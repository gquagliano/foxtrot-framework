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
function componenteFila() {
    this.componente="fila";

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        this.contenedor=this.elemento;
        this.datosElemento.elemento=this.elemento;
        this.datosElemento.contenedor=this.contenedor;
        this.datosElemento.instancia=this;
        this.base.inicializar.call(this);
        return this;
    };
    
    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='row contenedor vacio'/>");
        this.establecerId();
        this.inicializar();
        return this;
    };
}
componenteFila.prototype=new componente();

ui.registrarComponente("fila",componenteFila,util.clonar(configComponente,{
    descripcion:"Fila",
    grupo:"Estructura",
    icono:"componentes/iconos/fila.png"
}));

