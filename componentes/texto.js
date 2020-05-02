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
    this.componente="texto";

    /**
     * Reestablece la configuración a partir de un objeto previamente generado con obtenerParametros().
     */
    this.establecerParametros=function(obj) {
        return this;
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(ui.enModoEdicion()) this.elemento.editable(true);
        this.datosElemento.elemento=this.elemento;
        this.datosElemento.instancia=this;
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='texto'><p>Hacé click para comenzar a escribir...</p></div>");
        this.establecerId();
        this.inicializar();        
        return this;
    };
}
componenteTexto.prototype=new componente();

var config=util.clonar(configComponente);
config.descripcion="Texto";
config.icono="componentes/iconos/texto.png";
config.aceptaHijos=false;

ui.registrarComponente("texto",componenteTexto,config);

