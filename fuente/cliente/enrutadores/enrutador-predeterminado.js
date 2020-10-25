/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Enrutador concreto predeterminado.
 * @class
 * @extends enrutador
 */
var enrutadorPredeterminado=function() {    
    /**
     * Devuelve la URL de una vista dado su nombre o ruta (método para sobreescribir).
     * @param {string} ruta - Cadena a evaluar.
     */
    this.obtenerUrlVista=function(ruta) {
        return ruta+"/";
    };    
};

ui.registrarEnrutador("predeterminado",enrutadorPredeterminado);