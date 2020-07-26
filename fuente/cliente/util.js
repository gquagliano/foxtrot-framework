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
     * Determina si una expresión es una cadena.
     */
    esCadena:function(expr) {
        return typeof expr==="string";
    },

    /**
     * Determina si un objeto es un array.
     */
    esArray:function(obj) {
        return Array.isArray(obj);
    },

    /**
     * Determina si un objeto es estrictamente un objeto (está definido y no es un array).
     */
    esObjeto:function(obj) {
        return typeof obj==="object"&&!util.esArray(obj);
    },

    /**
     * Determina si un objeto es un componente.
     * @param {Object} obj Objeto a evaluar.
     */
    esComponente:function(obj) {
        return obj instanceof componente.cttr();
    }
};

window["util"]=util;