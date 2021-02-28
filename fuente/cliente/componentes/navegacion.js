/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Navegación.
 * @class
 * @extends componente
 */
var componenteNavegacion=function() {    
    "use strict";

    this.componente="navegacion";

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

ui.registrarComponente("navegacion",componenteNavegacion,configComponente.clonar({
    descripcion:"Navegación o paginado",
    etiqueta:"Navegación",
    grupo:"Estructura",
    icono:"navegacion.png",
    ocultar:true
}));