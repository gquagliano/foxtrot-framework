/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Item de menú.
 */
var componenteItemMenu=function() {    
    this.componente="item-menu";
    this.contenidoEditable=true;

    this.submenuAbierto=false;

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.inicializado) return this; 
        this.contenedor=this.elemento;

        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<li>");
        this.contenedor=this.elemento;
        this.elementoEditable=document.crear("<a href='#'>Item</a>");
        this.elementoEditable.anexarA(this.elemento);
        this.crearComponente();
        return this;
    };

    /**
     * Establece los eventos.
     */
    this.establecerEventos=function() {
        if(!ui.enModoEdicion()) {
            var t=this;

            var abrirConClick=function() {
                //Determinar si debe abrirse al pasar el mouse o al hacer click (depende del <nav>)
                var padre=t.elemento.padre({clase:"menu-click"});
                return padre?true:false;
            },
            abrir=function(submenu) {
                var elem=submenu.obtenerElemento();

                ui.abrirMenu(elem);
                t.submenuAbierto=true;

                //Agregar una clase a la ascendencia
                elem.padres({etiqueta:"li"}).forEach(function(padre) {
                    padre.agregarClase("submenu-abierto");
                });
            },
            cerrar=function(submenu) {
                var elem=submenu.obtenerElemento();

                ui.cerrarMenu(elem);
                t.submenuAbierto=false;

                //Remover clase
                var padre=elem.padre({etiqueta:"li"});
                if(padre) padre.removerClase("submenu-abierto");
            },
            alternar=function(submenu) {
                if(t.submenuAbierto) {
                    cerrar(submenu);
                } else {
                    abrir(submenu);
                }
            };

            this.elemento.evento("mouseenter",function(ev) {
                var submenu=t.obtenerHijos();
                if(!submenu.length||abrirConClick()) return;
                
                ev.preventDefault();
                ev.stopPropagation();

                abrir(submenu[0]);
            }).evento("mouseleave",function(ev) {
                var submenu=t.obtenerHijos();
                if(!submenu.length||abrirConClick()) return;
                
                ev.preventDefault();
                ev.stopPropagation();

                cerrar(submenu[0]);
            }).evento("mousedown",function(ev) {
                var submenu=t.obtenerHijos();
                if(!submenu.length||!abrirConClick()) return;
                
                ev.preventDefault();
                ev.stopPropagation();

                alternar(submenu[0]);
            }).evento("touchstart",function(ev) {
                //Este evento se procesa siempre, ya que en dispositivos táctiles siempre abre/cierra al toque
                var submenu=t.obtenerHijos();
                if(!submenu.length) return;
                
                ev.preventDefault();
                ev.stopPropagation();

                alternar(submenu[0]);
            });
            return this;
        }

        this.establecerEventosComponente();
        return this;
    };
};

ui.registrarComponente("item-menu",componenteItemMenu,configComponente.clonar({
    descripcion:"Ítem de menú",
    etiqueta:"Item",
    grupo:"Menú",
    icono:"item-menu.png",
    aceptaHijos:["menu"]
}));