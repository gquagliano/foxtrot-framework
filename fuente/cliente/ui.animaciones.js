/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Métodos anexados a la gestión de la interfaz.
 */
(function() {
    "use strict";

    /**
     * @ignore
     * @var {number} duracionAnimacion - Duración máxima de la animación, acorde al CSS.
     */
    var duracionAnimacion=300;

    /**
     * Establece el evento animationend y un temporizador en caso de que el navegador no tenga soporte para el mismo.
     * @param {(Node|Element)} elem 
     * @param {function} funcion 
     */
    function establecerEvento(elem,funcion) {
        elem._eventoCompleto=false;
        elem._temporizadorAnimacion=setTimeout(function() {
            if(elem._eventoCompleto) return;
            elem._eventoCompleto=true;
            funcion();
        },duracionAnimacion);
        elem.evento("animationend",function() {
            if(elem._eventoCompleto) return;
            elem._eventoCompleto=true;
            funcion();
        });
    };

    /**
     * Remueve el evento animationend y el temporizador.
     * @param {(Node|Element)} elem 
     */
    function removerEvento(elem) {
        elem._eventoCompleto=false;
        if(elem.hasOwnProperty("_temporizadorAnimacion")) clearTimeout(elem._temporizadorAnimacion);
        elem.removerEvento("animationend");
    };

    /**
     * Hace aparecer el elemento en forma animada utilizando animaciones CSS.
     * @param {(Node|Element)} elem - Elemento.
     * @param {function} [retorno] - Función de retorno.
     * @returns {ui}
     */
    ui.animarAparecer=function(elem,retorno) {
        ui.detenerAnimacion(elem);

        elem.removerClase("oculto")
            .agregarClase("aparece");  

        if(typeof retorno!=="undefined") establecerEvento(elem,retorno);

        return ui;
    };

    /**
     * Hace desaparecer y oculta el elemento en forma animada utilizando animaciones CSS.
     * @param {(Node|Element)} elem - Elemento.
     * @param {function} [retorno] - Función de retorno.
     * @returns {ui}
     */
    ui.animarDesaparecer=function(elem,retorno) {
        ui.detenerAnimacion(elem);

        elem.agregarClase("desaparece");

        establecerEvento(elem,function() {
            if(typeof retorno!=="undefined") retorno();

            elem.removerClase("desaparece")
                .agregarClase("oculto");
        });
    };

    /**
     * Oculta el elemento mediante el mismo mecanismo que animarDesaparecer(), pero de forma inmediata.
     * @param {(Node|Element)} elem - Elemento.
     * @returns {ui}
     */
    ui.desaparecer=function(elem) {
        elem.removerClase("aparece")
            .agregarClase("oculto");
        return ui;
    };

    /**
     * Detiene la animación en curso.
     * @param {(Node|Element)} elem - Elemento.
     * @returns {ui}
     */
    ui.detenerAnimacion=function(elem) {
        removerEvento(elem);
        elem.removerClase("aparece desaparece");
        return ui;
    };
})();
