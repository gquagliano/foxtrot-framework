/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * @external Object
 */

/**
 * Módulo concreto.
 * @typedef {modulo}
 */

/**
 * Objeto base para los módulos.
 * @class
 */
var modulo=new function() {
    "use strict";

    /**
     * @var {servidor} servidor - Acceso al controlador de servidor.
     * @var {string} nombre - Nombre del módulo.
     * @var {aplicacion} clasePadre - Clase `componente` (equivalente a `parent` en OOP).
     */
    this.servidor=null;
    this.nombre=null;
    this.clasePadre=this;

    /**
     * Devuelve la instancia del gestor de la interfaz con el servidor.
     * @returns {Servidor}
     */
    this.obtenerServidor=function() {
        return this.servidor;
    };

    /**
     * Determina si un objeto es instancia de un módulo.
     * @memberof external:Object
     * @returns {boolean}
     */
    Object.prototype.esModulo=function() {
        return this.cttr()==modulo.cttr();
    };    

    /**
     * Fabrica una instancia de un módulo concreto dada su función.
     * @returns {modulo}
     */
    this.fabricarModulo=function(fn) {
        //Heredar prototipo
        fn.prototype=new (this.cttr());
        var obj=new fn;
        obj.inicializar();
        return obj;
    };

    /**
     * Inicializa la instancia tras ser creada.
     * @returns {modulo}
     */
    this.inicializar=function() {
        return this.inicializarModulo();
    };

    /**
     * Inicializa la instancia tras ser creada.
     * @returns {modulo}
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
