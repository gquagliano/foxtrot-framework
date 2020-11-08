/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Item de menú.
 * @class
 * @extends componente
 */
var componenteItemMenu=function() {  
    "use strict";

    var t=this;

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
                tipo:"bool",
                adaptativa:false
            },
            separador:{
                etiqueta:"Separador",
                tipo:"bool",
                adaptativa:false
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        
        this.enlace=this.elemento.querySelector("a");
        this.elementoEditable=this.enlace;
        this.elementoEventos=this.enlace;
        this.contenedor=this.elemento;

        this.clasePadre.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<li>");
        this.contenedor=this.elemento;

        this.enlace=document.crear("<a href='#'>Item</a>");
        this.enlace.anexarA(this.elemento);

        this.elementoEditable=this.enlace;
        this.elementoEventos=this.enlace;

        this.clasePadre.crear.call(this);
        return this;
    };

    /**
     * Devuelve el componente submenú.
     * @returns {componente}
     */
    this.obtenerSubmenu=function() {
        var hijos=this.obtenerHijos();
        for(var i=0;i<hijos.length;i++)
            if(hijos[i].componente==="menu")
                return hijos[i];
        return null;
    };

    /**
     * Establece los eventos.
     */
    this.establecerEventos=function() {
        if(!ui.enModoEdicion()) {
            var t=this;

            var abrirConClick=function() {
                //Determinar si debe abrirse al pasar el mouse o al hacer click (depende del contenedor de menú)
                //TODO Revisar: Los componentes de menú quedaron muy acoplados, aunque quizás está bien tratándose de un mismo grupo de componentes que debe trabajar coordinado
                var padre=t.elemento.padre({clase:"menu-click"});
                return padre?true:false;
            },
            esPrimerNivel=function() {
                var padre=t.obtenerPadre();
                if(padre) return padre.componente=="contenedor-menu";
                return false;
            },
            abrir=function(submenu) {
                var elem=submenu.obtenerElemento();

                //Se deben cerrar todos los menús abiertos que no sean ascendencia de este
                cerrarOtrosMenus(submenu);

                ui.abrirMenu(elem);
                t.submenuAbierto=true;

                //Agregar una clase a la ascendencia
                var padre=elem.padre({etiqueta:"li"});
                if(padre) padre.agregarClase("submenu-abierto");

                //Asignar evento para remover los estilos cuando se cierre
                submenu.obtenerElemento()
                    .removerEvento("menu-cerrado")
                    .evento("menu-cerrado",function(ev) {
                        ev.stopPropagation();
                        cerrado(submenu);
                    });
            },
            cerrarOtrosMenus=function(menu) {
                //Buscar ascendencia
                var padres=[],
                    padre=menu.obtenerPadre();
                while(1) {
                    if(!padre||padre.compontente=="contenedor-menu") break;
                    if(padre.obtenerTipo()=="menu") padres.push(padre.obtenerElemento());
                    padre=padre.obtenerPadre();
                }
                
                //Cerrar todo lo que no sea ascendencia
                ui.obtenerMenuAbierto().clonar().forEach(function(elem) {
                    if(padres.indexOf(elem)>=0) return;
                    ui.cerrarMenu(elem,true);
                });
            },
            cerrar=function(submenu) {
                var elem=submenu.obtenerElemento();
                ui.cerrarMenu(elem);
            },
            cerrado=function(submenu) {
                var elem=submenu.obtenerElemento();

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

            var ignorarClick=false,
                arrastre=false;

            this.elemento.evento("mouseenter",function(ev) {
                var submenu=t.obtenerSubmenu();
                if(!submenu||abrirConClick()) return;
                
                ev.preventDefault();
                ev.stopPropagation();

                abrir(submenu);
            }).evento("mouseleave",function(ev) {
                var submenu=t.obtenerSubmenu();
                if(!submenu||abrirConClick()) return;
                
                ev.preventDefault();
                ev.stopPropagation();

                cerrar(submenu);
            }).evento("mousedown",function(ev) {
                ev.stopPropagation();
                
                var submenu=t.obtenerSubmenu();
                if(!submenu||!abrirConClick()) return;
                
                ev.preventDefault();
                ignorarClick=true;

                alternar(submenu);
            }).evento("mouseup",function(ev) {
                if(ignorarClick) {
                    ev.preventDefault();
                    ev.stopPropagation();
                }
            }).evento("touchend",function(ev) {
                if(arrastre) {
                    arrastre=false;
                    return;
                }

                ev.stopPropagation();

                var submenu=t.obtenerSubmenu();
                if(!submenu) {
                    t.cerrarContenedor();
                    return;
                }
                
                ev.preventDefault();

                ignorarClick=true;
                alternar(submenu);
            }).evento("touchmove",function(ev) {
                arrastre=true;
            }).evento("click",function(ev) {
                if(ignorarClick) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    ignorarClick=false;
                    return;
                }
                t.cerrarContenedor();
            });
        }

        this.clasePadre.establecerEventos.call(this);
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

        if(propiedad=="separador") {
            if(valor) {
                this.elemento.agregarClase("menu-separador");
            } else {
                this.elemento.removerClase("menu-separador");
            }
            return this;
        }

        this.clasePadre.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Modifica el texto de la etiqueta del menú.
     * @param {string} valor - Valor a establecer (puede contener HTML.)
     * @returns Componente
     */
    this.establecerEtiqueta=function(valor) {
        this.enlace.establecerHtml(valor);
        return this;
    };

    /**
     * Elimina el componente.
     * @param {boolean} [descendencia] - Si está definido y es true, indica que se está eliminando el componente por ser descendencia de otro componente eliminado. Parámetro de
     * uso interno; omitir al solicitar eliminar este componente.
     * @returns {Componente}
     */
    this.eliminar=function(descendencia) {
        if(ui.enModoEdicion()&&(typeof descendencia==="undefined"||!descendencia)) {
            //Antes de eliminar, seleccionar el menú superior para mantener abierto el desplegable
            var comp=this.obtenerPadre();
            if(comp&&comp.componente=="menu") editor.establecerSeleccion(comp);
        }

        return this.clasePadre.eliminar.call(this,descendencia);
    };

    /**
     * Determina si el item pertenece a un menú que, a su vez, se encuentre en un contenedor de menú y, en caso afirmativo, cierra el contenedor.
     * @returns {Componente}
     */
    this.cerrarContenedor=function() {
        setTimeout(function() {
            var elem=t.elemento.padre({clase:"contenedor-menu"});
            if(elem) ui.obtenerInstanciaComponente(elem).cerrar();
        });
        return this;
    };
};

ui.registrarComponente("item-menu",componenteItemMenu,configComponente.clonar({
    descripcion:"Ítem de menú",
    etiqueta:"Item",
    grupo:"Menú",
    icono:"item-menu.png",
    padre:["menu"],
    aceptaHijos:["menu"]
}));