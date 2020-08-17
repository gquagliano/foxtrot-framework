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
    },

    //instanceof falla cuando se evaluan objetos provinientes de otra ventana, caso muy común en el editor, que utiliza marcos, por lo que implementamos algunas
    //funciones útiles para *estimar* tipos en formas alternativas.

    /**
     * Determina si un valor es una expresión regular.
     * @param {*} obj - Valor a evaluar.
     */
    esExpresionRegular:function(obj) {
        return obj!==null&&typeof obj==="object"&&(obj instanceof RegExp||typeof obj.test==="function");
    },
    
    /**
     * Determina si un valor es un elemento del DOM (Node o Element).
     * @param {*} obj - Valor a evaluar.
     */
    esElemento:function(obj) {
        return obj!==null&&typeof obj==="object"&&(obj instanceof Node||obj instanceof Element||typeof obj.nodeName==="string");
    },

    /**
     * Determina si un valor es una lista de elementos del DOM (NodeList o HTMLCollection).
     * @param {*} obj - Valor a evaluar.
     */
    esListaDeElementos:function(obj) {
        return obj!==null&&typeof obj==="object"&&(obj instanceof NodeList||obj instanceof HTMLCollection||typeof obj.entries==="function");
    },

    /**
     * Busca una propiedad anidada dada su ruta separada por puntos.
     * @param {Object} objeto - Objeto.
     * @param {string} ruta - Ruta a evaluar.
     * @returns {*|undefined}
     */
    obtenerPropiedad:function(objeto,ruta) {
        ruta=ruta.split(".");
        for(var i=0;i<ruta.length;i++) {
            if(typeof objeto==="object") {
                objeto=objeto[ruta[i]];
            } else {
                break;
            }
        }
        return objeto;
    },

    /**
     * Genera y devuelve una cadena de caracteres al azar.
     * @returns {string}
     */
    cadenaAzar:function() {
        return Math.random().toString(36).replace(/[^a-z]+/g,"");
    },

    /**
     * Trim con expresión regular.
     * @param {string} cadena - Cadena.
     * @param {string} caracteres - Caracteres (debe se compatible con expresiones regulares, escapando los caracteres necesarios).
     * @returns {string}
     */
    trim:function(cadena,caracteres) {
        var exp=new RegExp("(^"+caracteres+"|"+caracteres+"$)","g");
        while(exp.test(cadena)) cadena=cadena.replace(exp,"");
        return cadena;
    }
};

window["util"]=util;