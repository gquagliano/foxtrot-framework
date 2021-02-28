/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Campo de horario.
 * @class
 * @extends componente
 */
var componenteHora=function() {    
    "use strict";

    this.componente="hora";

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 

        if(!ui.enModoEdicion()) this.valor(null);
        
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

    /**
     * Devuelve o establece el valor del campo.
     * @param {*} [valor] - Valor a establecer. Si se omite, devolverá el valor actual.
     * @returns {(*|undefined)}
     */
    this.valor=function(valor) {
        //Si es null, volver al valor inicial (puede contener expresiones)
        if(valor===null) valor=this.propiedad("valorInicial");
        return this.prototipo.valor.call(this,valor);
    };
};

ui.registrarComponente("hora",componenteHora,configComponente.clonar({
    descripcion:"Campo de horario",
    etiqueta:"Hora",
    grupo:"Formulario",
    icono:"hora.png",
    ocultar:true
}));