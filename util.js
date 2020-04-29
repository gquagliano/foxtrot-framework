/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Utilidades varias.
 */
var util={
    /**
     * Determina si un objeto es un elemento del DOM (Element).
     */
    esElemento:function(obj) {
        return obj instanceof Element;
    },

    /**
     * Determina si una expresión es indefinida o no.
     */
    esIndefinido:function(expr) {
        return typeof expr==="undefined";
    },

    /**
     * Determina si un objeto es un array.
     */
    esArray:function(obj) {
        return Array.isArray(obj);
    },

    /**
     * Clona un objeto.
     */
    clonar:function(obj) {
        return Object.assign({},obj);
    }
};

window["util"]=util;