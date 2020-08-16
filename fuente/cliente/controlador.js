/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

"use strict";

/**
 * Controlador concreto.
 * @typedef Controlador
 */

/**
 * Objeto base para los controladores.
 */
var controlador=new function() {
    this.nombre=null;
    this.servidor=null;
    this.nombreVista=null;
    this.controladorServidor=null;

    ////Acceso a propiedades    

    /**
     * Devuelve el nombre de la instancia.
     */
    this.obtenerNombre=function() {
        return this.nombre;
    };

    /**
     * Devuelve la instancia del gestor de la interfaz con el servidor.
     */
    this.obtenerServidor=function() {
        return this.servidor;
    };

    /**
     * Devuelve el nombre de la vista que está controlando actualmente.
     */
    this.obtenerNombreVista=function() {
        return this.nombreVista;
    };

    /**
     * Establece el nombre de la vista que está controlando actualmente.
     * @param {string} nombre 
     */
    this.establecerVista=function(nombre) {
        this.nombreVista=nombre;
    };

    ////Gestión de la instancia

    /**
     * Establece el nombre de la instancia (método para sobreescribir).
     */
    this.establecerNombre=function(nombre) {
        this.establecerNombreControlador(nombre);
        return this;
    };

    /**
     * Establece el nombre de la instancia.
     */
    this.establecerNombreControlador=function(nombre) {
        //Eliminar de componentes si cambia el nombre
        if(this.nombre!=nombre) delete controladores[this.nombre];
        this.nombre=nombre;
        //Registrar en window.componentes para acceso rápido
        if(nombre) controladores[nombre]=this;

        //Inicializar comunicación con el servidor
        //Si el controlador concreto no define controladorServidor, buscar un controlador de servidor del mismo nombre que el de cliente
        this.servidor=servidor.fabricar(this.controladorServidor?this.controladorServidor:nombre);

        return this;
    };

    /**
     * Determina si un objeto es instancia de un controlador.
     */
    Object.prototype.esControlador=function() {
        return this.cttr()==controlador.cttr();
    };

    /**
     * Fabrica una instancia de un controlador concreto dada su función.
    */
    this.fabricarControlador=function(nombre,fn) {
        //Heredar prototipo
        fn.prototype=new (this.cttr());

        var obj=new fn;

        obj.establecerNombre(nombre);

        //Inicializar las propiedades que son objetos (de otro modo, se copiarán las referencias desde el prototipo)
        //obj.hijos=[];
        //obj.valoresPropiedades={};

        return obj;
    };    

    /**
     * Inicializa la instancia (método para sobreescribir).
     */
    this.inicializar=function() {
        this.inicializarControlador();
        return this;
    };

    /**
     * Inicializa la instancia.
     */
    this.inicializarControlador=function() {
        return this;
    };

    /**
     * Devuelve los parámetros del controlador para su almacenamiento.
     */
    this.obtenerPropiedades=function() {
        return {
        };
    };

    /**
     * Evento 'Listo' (método para sobreescribir).
     */
    this.listo=function() {
    };

    /**
     * Evento 'Volver'. Este evento se produce cuando se presiona el botón Atrás del dispositivo (método para sobreescribir).
     * @returns {boolean|undefined} Si el valor de retorno es falso, detendrá el procesamiento del evento.
     */
    this.volver=function() {
    };
}();

window["controlador"]=controlador;
