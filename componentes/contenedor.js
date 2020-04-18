/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Contenedor.
 */
function componenteContenedor() {
    //Constructor
    (function() {

    })();
}
componenteContenedor.prototype=new componente();

var config=Object.assign({},configComponente);
config.descripcion="Contenedor";
config.icono="componentes/iconos/contenedor.png";

ui.registrarComponente("contenedor",componenteContenedor,config);

