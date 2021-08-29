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
     * Devuelve la URL de una vista dado su nombre o ruta.
     * @param {string} ruta - Cadena a evaluar.
     */
    this.obtenerUrlVista=function(ruta) {
        if(!ui.esCordova())
            return ruta+"/";

        //En Cordova (especialmente Electron, en otras plataformas quizás no tiene sentido), se debe dirigir al archivo HTML
        var nombreAplicacion=ui.obtenerAplicacion().obtenerNombre();
        if(!nombreAplicacion) {
            //La aplicación desconoce su nombre, obtener a partir de la ruta en el sistema de archivos
            nombreAplicacion=window.location.href.match(/\/www\/aplicaciones\/(.+?)\/cliente/)[1];
        }
        return "aplicaciones/"+nombreAplicacion+"/cliente/vistas/"+ruta+".html";
    };    
};

ui.registrarEnrutador("predeterminado",enrutadorPredeterminado);