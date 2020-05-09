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

    var self=this;

    /**
     * Reestablece la configuración a partir de un objeto previamente generado con obtenerParametros().
     */
    this.establecerParametros=function(obj) {
        return this;
    };

    this.configurarEventos=function() {
        if(!ui.enModoEdicion()) return;

        this.elemento.evento("dblclick",function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            self.iniciarEdicion();
        }).evento("blur",function(ev) {
            self.finalizarEdicion();
        }).evento("keydown",function(ev) {
            if(ev.which==27) {
                ev.preventDefault();
                ev.stopPropagation();
                self.finalizarEdicion();
            }
        });
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        this.datosElemento.elemento=this.elemento;
        this.datosElemento.instancia=this;

        this.configurarEventos();
        
        this.base.inicializar.call(this);

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
}
componenteTexto.prototype=new componente();

ui.registrarComponente("texto",componenteTexto,util.clonar(configComponente,{
    descripcion:"Texto",
    icono:"componentes/iconos/texto.png",
    aceptaHijos:false
}));

