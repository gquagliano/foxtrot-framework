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

    this.configurarEventos=function() {
        if(!ui.enModoEdicion()) return;

        var t=this;

        this.elemento.evento("dblclick",function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            t.iniciarEdicion();
        }).evento("blur",function(ev) {
            t.finalizarEdicion();
        }).evento("keydown",function(ev) {
            if(ev.which==27) {
                ev.preventDefault();
                ev.stopPropagation();
                t.finalizarEdicion();
            }
        });
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        this.configurarEventos();        
        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='texto'><p>Hacé doble click para comenzar a escribir...</p></div>");
        this.establecerId();
        this.inicializar();        
        return this;
    };
};

ui.registrarComponente("texto",componenteTexto,configComponente.clonar({
    descripcion:"Texto",
    icono:"componentes/iconos/texto.png",
    aceptaHijos:false
}));