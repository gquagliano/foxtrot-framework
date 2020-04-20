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
    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.$elemento=$("<div class='container vacio'>");
        this.$contenedor=this.$elemento;

        this.datosElemento.$elemento=this.$elemento;
        this.datosElemento.$contenedorHijos=this.$contenedor;
        this.datosElemento.instancia=this;

        return this;
    };

    //Constructor
    (function() {

    })();
}
componenteContenedor.prototype=new componente();

var config=dom.clonar(configComponente);
config.descripcion="Contenedor";
config.icono="componentes/iconos/contenedor.png";

ui.registrarComponente("contenedor",componenteContenedor,config);

