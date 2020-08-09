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

    this.enlace=null;
    this.submenuAbierto=false;

    /**
     * Propiedades de Botón.
     */
    this.propiedadesConcretas={
        "Comportamiento":{
            enlace:{
                etiqueta:"Enlace",
                adaptativa:false
            },
            nuevaVentana:{
                etiqueta:"Abrir en nueva ventana",
                tipo:"bool"
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.inicializado) return this; 
        
        this.enlace=this.elemento.querySelector("a");
        this.elementoEditable=this.enlace;
        this.elementoEventos=this.enlace;
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

        this.enlace=document.crear("<a href='#'>Item</a>");
        this.enlace.anexarA(this.elemento);

        this.elementoEditable=this.enlace;
        this.elementoEventos=this.enlace;

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
        }

        this.establecerEventosComponente();
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        if(propiedad=="enlace") {
            if(!valor) valor="#";
            this.enlace.atributo("href",valor);
            return this;
        }

        if(propiedad=="nuevaVentana") {
            if(!valor) {
                this.enlace.removerAtributo("target");
            } else {
                this.enlace.atributo("target","_blank");
            }
            return this;
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Modifica el texto de la etiqueta del menú.
     * @param {string} valor - Valor a establecer (puede contener HTML.)
     * @returns Componente
     */
    this.establecerEtiqueta=function(valor) {
        this.enlace.html(valor);
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