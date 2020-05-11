/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Contenedor.
 */
function componenteContenedor() {
    this.componente="contenedor";

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        this.contenedor=this.elemento;
        this.base.inicializar.call(this);
        return this;
    };
    
    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='container vacio'/>");
        this.establecerId();
        this.inicializar();
        return this;
    };
}
componenteContenedor.prototype=new componente();

ui.registrarComponente("contenedor",componenteContenedor,util.clonar(configComponente,{
    descripcion:"Contenedor",
    grupo:"Estructura",
    icono:"componentes/iconos/contenedor.png"
}));

