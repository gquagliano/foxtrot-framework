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
        this.elemento.evento("dblclick",function(ev) {
            if(ui.enModoEdicion()) {
                ev.preventDefault();
                ev.stopPropagation();
                
                this.editable(true).focus();

                //Deshabilitar arrastre en todo el árbol para que se pueda arrastrar el texto seleccionado dentro del editor
                this.pausarArrastreArbol();
            }
        }).evento("blur",function(ev) {
            if(ui.enModoEdicion()) {
                this.editable(false);

                //Reestablecer arrastre en todo el árbol
                this.pausarArrastreArbol(false);
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

var config=util.clonar(configComponente);
config.descripcion="Texto";
config.icono="componentes/iconos/texto.png";
config.aceptaHijos=false;

ui.registrarComponente("texto",componenteTexto,config);

