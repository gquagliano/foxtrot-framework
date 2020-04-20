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
    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.$elemento=$("<p>Hacé click para comenzar a escribir...</p>");

        this.datosElemento.$elemento=this.$elemento;
        this.datosElemento.instancia=this;
        
        return this;
    };

    //Constructor
    (function() {

    })();
}
componenteTexto.prototype=new componente();

var config=dom.clonar(configComponente);
config.descripcion="Texto";
config.icono="componentes/iconos/texto.png";
config.aceptaHijos=false;

ui.registrarComponente("texto",componenteTexto,config);

