/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

"use strict";

/**
 * Módulo concreto.
 * @typedef Modulo
 */

/**
 * @class Objeto base para los módulos.
 */
var modulo=new function() {
    this.servidor=null;
    this.nombre=null;

    /**
     * Devuelve la instancia del gestor de la interfaz con el servidor.
     * @returns {Servidor}
     */
    this.obtenerServidor=function() {
        return this.servidor;
    };

    /**
     * Determina si un objeto es instancia de un módulo.
     * @returns {boolean}
     */
    Object.prototype.esModulo=function() {
        return this.cttr()==modulo.cttr();
    };    

    /**
     * Fabrica una instancia de un módulo concreto dada su función.
     * @returns {Modulo}
     */
    this.fabricarModulo=function(fn) {
        //Heredar prototipo
        fn.prototype=new (this.cttr());
        var obj=new fn;
        obj.inicializar();
        return obj;
    };

    /**
     * Inicializa la instancia tras ser creada (método para sobreescribir).
     * @returns {Modulo}
     */
    this.inicializar=function() {
        return this.inicializarModulo();
    };

    /**
     * Inicializa la instancia tras ser creada.
     * @returns {Modulo}
     */
    this.inicializarModulo=function() {
        this.servidor=servidor.fabricar();
        this.servidor.establecerPredeterminados({
            modulo:this.nombre
        });
        return this;
    };
}();

//Exportar para Closure
window["modulo"]=modulo;
