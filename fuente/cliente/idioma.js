/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * @typedef idioma
 */

/**
 * @class Prototipo de los archivos de idioma.
 */
var idioma=new function() {
    "use strict";

    this.idiomas={};
    this.idioma="espanol";

    /**
     * Registra una definición de idiomas.
     * @param {string} nombre - Nombre del idioma.
     * @param {function} funcion - Función.
     * @returns {idioma}
     */
    this.registrarIdioma=function(nombre,funcion) {
        this.idiomas[nombre]=funcion;
        return this;
    };

    /**
     * Establece el idioma de la aplicación y, en modo de edición, del gestor y el editor.
     * @param {string} idioma - Nombre del idioma.
     * @returns {idioma}
     */
    this.establecerIdioma=function(idioma) {
        this.idioma=idioma;
        this.inicializar();
        return this;
    };

    /**
     * Inicializa la traducción.
     * @returns {idioma}
     */
    this.inicializar=function() {
        //TODO
        return this;
    };

    /**
     * Traduce una cadena.
     * @param {string} cadena - Cadena.
     * @returns {string}
     */
    this.traducir=function(cadena) {
        //TODO
        return cadena;
    };

    /**
     * Devuelve la función de traducción.
     * @returns {function}
     */
    this.obtenerFuncion=function() {
        return this.traducir;
    };
}();

window["idioma"]=idioma;
window["__"]=idioma.obtenerFuncion();