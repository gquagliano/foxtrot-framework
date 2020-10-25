/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Lista jerárquica (árbol).
 * @class
 * @extends {componente}
 */
var componenteArbol=function() {    
    "use strict";

    this.componente="arbol";

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear(""); 
        this.crearComponente();
        return this;
    };
};

ui.registrarComponente("arbol",componenteArbol,configComponente.clonar({
    descripcion:"Lista jerárquica (árbol)",
    etiqueta:"Árbol",
    grupo:"Estructura",
    icono:"arbol.png",
    ocultar:true
}));