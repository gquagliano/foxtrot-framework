/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * @class Componente concreto Condicional.
 */
var componenteCondicional=function() {    
    this.componente="condicional";

    /**
     * Propiedades de Condicional.
     */
    this.propiedadesConcretas={
        "Condicional":{
            condicion:{
                etiqueta:"Condición",
                adaptativa:false
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.contenedor=this.elemento;
        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div>"); 
        this.contenedor=this.elemento;
        this.crearComponente();
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.actualizar=function() {
        var condicion=this.procesarEvento("condicion","condicion");
        if(condicion) {
            this.elemento.agregarClase("visible");
        } else {
            this.elemento.removerClase("visible");
        }
        return this;
    };

    /**
     * Evento Listo.
     */
    this.listo=function() {
        this.actualizar();
        this.listoComponente();
    };

    /**
     * Establece el valor del componente.
     * @param {*} [valor] - Valor a establecer.
     * @returns {(null|componente)}
     */
    this.valor=function(valor) {
        if(typeof valor==="undefined") return this.datos;
        //Cuando se asigne un valor, establecer como origen de datos
        this.establecerDatos(valor);
        return this;
    };
};

ui.registrarComponente("condicional",componenteCondicional,configComponente.clonar({
    descripcion:"Condicional",
    etiqueta:"Condicional",
    grupo:"Control",
    icono:"condicional.png"
}));