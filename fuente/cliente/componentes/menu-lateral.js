/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Menú lateral.
 */
var componenteMenuLateral=function() {    
    this.componente="menu-lateral";

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
        this.elemento=document.crear(""); 
        this.crearComponente();
        return this;
    };
};

ui.registrarComponente("menu-lateral",componenteMenuLateral,configComponente.clonar({
    descripcion:"Menú lateral",
    grupo:"Estructura",
    icono:"menu-lateral.png"
}));