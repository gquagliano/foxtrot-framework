/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Texto.
 */
function componenteTexto() {
    //Constructor
    (function() {

    })();
}
componenteTexto.prototype=new componente();

var config=Object.assign({},configComponente);
config.descripcion="Texto";
config.icono="componentes/iconos/texto.png";
config.aceptaHijos=false;

ui.registrarComponente("texto",componenteTexto,config);

