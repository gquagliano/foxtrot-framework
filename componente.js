/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Objeto base (prototipo) de los componentes.
 */
function componente() {
    this.base=this;
    this.nombre=null;
    this.$elemento=null;
    this.$contenedor=null;
    this.datosElemento=dom.clonar(elementoComponente);

    /**
     * Inicializa la instancia.
     */
    this.inicializar=function() {

    };

    /**
     * Devuelve el elemento correspondiente a esta instancia, o uno nuevo si es una nueva instancia.
     */
    this.obtenerElemento=function() {
        if(!this.$elemento) this.crear();
        return this.datosElemento;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        return this;
    };
    
    /**
     * Constructor.
     */
    (function() {

    })();
}

//Exportar para Closure
window["componente"]=componente;
