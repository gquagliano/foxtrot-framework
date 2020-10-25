/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

"use strict";

/**
 * Enrutador concreto.
 * @typedef {enrutador}
 */

/**
 * Objeto base para los enrutadores.
 * @class
 */
var enrutador=new function() {
    //Los enrutadores de cliente permiten traducir URL a nombres de vistas (para implementaciones sin servidor) y traducir nombres de vistas y rutas a recursos a URL
    //que entenderá el enrutador de servidor. Esto significa que debe existir un enrutador de cliente compatible por cada enrutador de servidor.

    /**
    * Fabrica una instancia de un controlador concreto dada su función.
    */
    this.fabricarEnrutador=function(nombre,fn) {
        //Heredar prototipo
        fn.prototype=new (this.cttr());

        var obj=new fn;

        //obj.establecerNombre(nombre);

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
     * Devuelve la URL de una vista dado su nombre o ruta (método para sobreescribir).
     * @param {string} ruta - Cadena a evaluar.
     */
    this.obtenerUrlVista=function(ruta) {
    };

    /**
     * Devuelve el nombre de una vista dada su URL (método para sobreescribir).
     * @param {string} url - URL a evaluar.
     */
    this.obtenerNombreVista=function(url) {
        //Por defecto, vamos a extraer la ruta relativa a la URL base

        var base=ui.obtenerUrlBase(),
            p=url.indexOf("?");
        
        if(p>0) url=url.substring(0,p);
        url=url.substring(base.length);
        if(url.substring(url.length-1)=="/") url=url.substring(0,url.length-1);

        return url;
    };
};

window["enrutador"]=enrutador;
