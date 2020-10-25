/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Campo de horario.
 * @class
 * @extends {componente}
 */
var componenteHora=function() {    
    "use strict";

    this.componente="hora";

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

ui.registrarComponente("hora",componenteHora,configComponente.clonar({
    descripcion:"Campo de horario",
    etiqueta:"Hora",
    grupo:"Formulario",
    icono:"hora.png",
    ocultar:true
}));