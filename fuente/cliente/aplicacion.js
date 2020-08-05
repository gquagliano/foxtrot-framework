/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

"use strict";

/**
 * Aplicación concreta.
 * @typedef Aplicacion
 */

/**
 * Objeto base para las aplicaciones.
 */
var aplicacion=new function() {
    this.servidor=null;
    
    /**
     * Devuelve la instancia del gestor de la interfaz con el servidor.
     */
    this.obtenerServidor=function() {
        return this.servidor;
    };

    /**
     * Fabrica una instancia de una aplicación concreta dada su función.
     */
    this.fabricarAplicacion=function(fn) {
        //Heredar prototipo
        fn.prototype=new (this.cttr());

        var obj=new fn;

        //Inicializar las propiedades que son objetos (de otro modo, se copiarán las referencias desde el prototipo)
        //obj.hijos=[];
        //obj.valoresPropiedades={};

        return obj;
    };

    /**
     * Inicializa la instancia (método para sobreescribir).
     */
    this.inicializar=function() {
        this.inicializarAplicacion();
        return this;
    };

    /**
     * Inicializa la instancia.
     */
    this.inicializarAplicacion=function() {
        //Inicializar comunicación con el servidor
        this.servidor=servidor.fabricar();
        return this;
    };
}();

window["aplicacion"]=aplicacion;