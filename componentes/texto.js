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
var componenteTexto=function() {    
    this.componente="texto";

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.inicializado) return this; 
        this.contenidoEditable=true;
        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='texto'><p>Hacé doble click para comenzar a escribir...</p></div>"); 
        this.crearComponente();
        return this;
    };
};

ui.registrarComponente("texto",componenteTexto,configComponente.clonar({
    descripcion:"Texto",
    icono:"componentes/iconos/texto.png",
    aceptaHijos:false
}));