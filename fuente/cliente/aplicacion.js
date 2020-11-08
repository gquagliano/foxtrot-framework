/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * @typedef {aplicacion} Aplicación concreta.
 */

/**
 * Objeto base para las aplicaciones.
 * @class
 */
var aplicacion=new function() {
    "use strict";

    /**
     * @var {servidor} servidor - Acceso al controlador de servidor.
     * @var {aplicacion} clasePadre - Clase `aplicacion` (equivalente a `parent` en OOP).
     */
    this.servidor=null;
    this.clasePadre=this;
    
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

    ////Eventos
    
    /**
     * Evento 'Inicializado' (método para sobreescribir).
     */
    this.inicializado=function() {
    };
    
    /**
     * Evento 'Listo' (método para sobreescribir).
     */
    this.listo=function() {
    };
    
    /**
     * Evento 'Navegación' (método para sobreescribir).
     * @param {string} nombreVista - Nombre de la vista de destino.
     */
    this.navegacion=function(nombreVista) {
    };
    
    /**
     * Evento 'Volver' (método para sobreescribir).
     * @returns {boolean}
     */
    this.volver=function() {
    };

    /**
     * Evento 'Error Servidor' (método para sobreescribir).
     */
    this.errorServidor=function() {
    };
};

window["aplicacion"]=aplicacion;
