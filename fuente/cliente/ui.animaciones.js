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

    var duracionAnimacion=1000; //Depende de la animación CSS

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

        if(typeof retorno!=="undefined") {
            elem._timeoutAnimMenu=setTimeout(function() {
                retorno();
            },duracionAnimacion);
        }

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

        elem._timeoutAnimMenu=setTimeout(function() {
            if(typeof retorno!=="undefined") retorno();

            elem.removerClase("desaparece")
                .agregarClase("oculto");
        },duracionAnimacion);
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
        if(elem.hasOwnProperty("_timeoutAnimMenu")) clearTimeout(elem._timeoutAnimMenu);
        elem.removerClase("aparece desaparece");
        return ui;
    };
})();
