/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Métodos anexados a la gestión de la interfaz.
 */
(function() {
    "use strict";

    var menuAbierto=[];

    var abrirElementoMenu=function(elem) {
        //Evento DOM para que otros objetos de los cuales dependa el menú puedan detectar el cierre
        elem.ejecutarEvento("menu-abierto");

        ui.animarAparecer(elem);
                
        //Reposicionar si se sale de pantalla

        elem.removerClase(/^desplegar-(izquierda|arriba)/);

        var margen=15,
            posicionamiento=elem.estilo("position"),
            pos=elem.posicionAbsoluta(),
            ancho=elem.ancho(),
            alto=elem.alto(),
            anchoVentana=elem.ownerDocument.defaultView.ancho(), //Puede estar dentro de un marco (no usar window)
            altoVentana=elem.ownerDocument.defaultView.alto(),   //Puede estar dentro de un marco (no usar window)
            excedeX=pos.x+ancho>anchoVentana-margen,
            excedeY=pos.y+alto>altoVentana-margen;
        
        if(excedeX||excedeY) {
            if(posicionamiento=="absolute"||posicionamiento=="relative") {
                //En este caso utilizaremos clases CSS para que se pueda reposicionar de acuerdo a los estilos específicos del padre
                if(excedeX) elem.agregarClase("desplegar-izquierda");
                if(excedeY) elem.agregarClase("desplegar-arriba");
            } else {
                //Por defecto, se comporta como fixed
                if(excedeX) elem.estilos({ left:anchoVentana-ancho-margen });
                if(excedeY) elem.estilos({ top:altoVentana-alto-margen });
            } 
        }
    };
    
    var cerrarElementoMenu=function(elem,omitirAnimacion,eliminar,retorno) {
        if(typeof omitirAnimacion==="undefined") omitirAnimacion=false;
        if(typeof eliminar==="undefined") eliminar=false;
        if(typeof retorno==="undefined") retorno=null;

        var fn=function() {
            if(eliminar) elem.remover();
            if(retorno) retorno();
        };

        if(omitirAnimacion) {
            ui.detenerAnimacion(elem);
            elem.agregarClase("oculto");
            fn();
        } else {
            ui.animarDesaparecer(elem,fn);
        }

        //Evento DOM para que otros objetos de los cuales dependa el menú puedan detectar el cierre
        elem.ejecutarEvento("menu-cerrado");
    };

    /**
     * Construye un menú.
     * @memberof ui
     * @param {Object[]} items - Items del menú.
     * @param {string} items[].etiqueta - Etiqueta.
     * @param {function} [items[].accion] - Función a ejecutar al seleccionarse la opción.
     * @param {(function|boolean)} [items[].habilitado=true] - Estado del item o función a ejecutar para determinar si el item se encuentra habilitado.
     * @param {boolean} [items[].separador=false] - Determina si el item es seguido de un separador.
     * @param {Object[]} [items[].submenu] - Items del submenú (admiten las mismas propiedades que items).
     * @param {string} [clase] - Clase CSS.
     * @returns {Object}
     */
    ui.construirMenu=function(items,clase) {
        if(typeof clase==="undefined") clase=null;

        //TODO Integración con Cordova
        //TODO Integración con el cliente de escritorio

        var click=function(item,ev) {
            if(item.hasOwnProperty("accion")) {
                ev.preventDefault();
                ev.stopPropagation();
                item.accion();
            } else if(item.hasOwnProperty("elemSubmenu")) {
                //Detener click si tiene submenú
                ev.preventDefault();
                ev.stopPropagation();
                return;
            }
            ui.cerrarMenu();
        },
        toque=function(item,ev) {
            if(item.hasOwnProperty("elemSubmenu")) {
                abrirSubmenu(item);
                ev.preventDefault();
                ev.stopPropagation();
            } else {
                click(item,ev);
            }
        },
        abrirSubmenu=function(item) {
            //TODO Posicionamiento según el espacio disponible
            if(!item.hasOwnProperty("elemSubmenu")) return;
            abrirElementoMenu(item.elemSubmenu);
        },
        cerrarSubmenu=function(item) {
            if(!item.hasOwnProperty("elemSubmenu")) return;
            cerrarElementoMenu(item.elemSubmenu);
        };

        var fn=function(ul,items) {
            for(var i=0;i<items.length;i++) {
                var li=document.crear("<li>"),
                    a=document.crear("<a href='#'>");

                a.establecerHtml(items[i].etiqueta);

                if(items[i].hasOwnProperty("submenu")) {
                    var ulSubmenu=document.crear("<ul class='submenu oculto'>");
                    fn(ulSubmenu,items[i].submenu);

                    li.agregarClase("con-submenu");
                    li.anexar(ulSubmenu);
                    items[i].elemSubmenu=ulSubmenu;
                }

                if(items[i].hasOwnProperty("separador")&&items[i].separador) li.agregarClase("menu-separador");

                li.anexar(a);
                ul.anexar(li);
                
                items[i].elem=li;
                items[i].elemA=a;

                //Eventos

                a.evento("mouseup",function(item) {
                    return function(ev) {
                        click(item,ev);
                    };
                }(items[i]))
                .evento("touchend",function(item) {
                    return function(ev) {
                        toque(item,ev);
                    };
                }(items[i]));

                li.evento("mouseenter",function(item) {
                    return function() {
                        abrirSubmenu(item);
                    };
                }(items[i]))
                .evento("mouseleave",function(item) {
                    return function() {
                        cerrarSubmenu(item);
                    };
                }(items[i]));
            }
        };

        var menu={
            elem:document.crear("<ul class='menu oculto'>"),
            items:items.clonar(),
            eliminar:false
        };

        if(clase) menu.elem.agregarClase(clase);

        fn(menu.elem,menu.items);

        ui.obtenerDocumento().body.anexar(menu.elem);

        return menu;
    };

    /**
     * Actualiza el estado de los items del menú.
     * @memberof ui
     * @param {Object} menu - Menú generado con ui.construirMenu().
     * @returns {ui}
     */
    ui.actualizarMenu=function(menu) {
        var fn=function(items) {
            for(var i=0;i<items.length;i++) {
                if(items[i].hasOwnProperty("habilitado")) {
                    var v=items[i].habilitado;
                    if(typeof v==="function") v=v();
                    if(v) items[i].elem.removerClase("deshabilitado");
                    else items[i].elem.agregarClase("deshabilitado");
                }
                
                if(items[i].hasOwnProperty("submenu")) fn(items[i].submenu);
            }
        };

        fn(menu.items);

        return ui;
    };

    var menuKeyDn=function(ev) {
        var eventoValido=true;
        if(ev.which==27) {
            //ESC
            ui.cerrarMenu();
        } else if(ev.which==40) {
            //Abajo
            //TODO
        } else if(ev.which==84) {
            //Arriba
            //TODO
        } else if(ev.which==13) {
            //Enter
            //TODO
        } else {
            eventoValido=false;
        }
        if(eventoValido) {
            ev.preventDefault();
            ev.stopPropagation();
        }
    };

    var menuMouseUp=function(ev) {
        ui.cerrarMenu();
    };

    var menuBlur=function(ev) {
        ui.cerrarMenu();
    };

    var removerEventosMenu=function() {
        ui.obtenerDocumento().removerEvento("keydown",menuKeyDn)
            .removerEvento("mouseup",menuMouseUp);
        window.removerEvento("blur",menuBlur);

        var marco=ui.obtenerMarco();
        if(marco) marco.contentWindow.removerEvento("blur",menuBlur);
    };

    /**
     * Devuelve los menú actualmente abiertos.
     * @memberof ui
     * @returns {Object[]}
     */
    ui.obtenerMenuAbierto=function() {
        return menuAbierto;
    };

    /**
     * Abre un menú.
     * @memberof ui
     * @param {(Object[]|Object)} obj - Array de items de menú, un menú generado con ui.construirMenu() o cualquier elemento del DOM compatible.
     * @param {(Node|Element|Object)} [posicion] - Si se especifica un elemento del DOM, se posicionará el menú sobre el mismo; en caso contrario, debe especificarse un objeto con las propiedades {x,y}.
     * @param {string} [clase] - Clase CSS.
     * @returns {ui}
     */
    ui.abrirMenu=function(obj,posicion,clase) {
        if(typeof posicion==="undefined") posicion=null;
        if(typeof clase==="undefined") clase=null;

        //TODO Integración con Cordova
        //TODO Integración con el cliente de escritorio

        if(util.esArray(obj)) {
            obj=ui.construirMenu(obj,clase);
            obj.eliminar=true;
        }

        var elem;
        if(util.esElemento(obj)) {
            elem=obj;
        } else {
            elem=obj.elem;
            ui.actualizarMenu(obj);
        }

        menuAbierto.push(obj);

        //Posición

        if(posicion) {
            var x,y;
            if(util.esElemento(posicion)) {
                var pos=posicion.posicionAbsoluta(),
                    alto=posicion.alto();
                x=pos.x;
                y=pos.y+alto;
            } else {
                x=posicion.x;
                y=posicion.y;
            }

            elem.estilos({
                    left:x,
                    top:y
                });
        }        

        abrirElementoMenu(elem);

        //Eventos

        ui.obtenerDocumento().evento("keydown",menuKeyDn)
            .evento("mouseup",menuMouseUp);
            
        window.evento("blur",menuBlur);

        var marco=ui.obtenerMarco();
        if(marco) marco.contentWindow.evento("blur",menuBlur);

        return ui;
    };

    /**
     * @memberof ui
     * Cierra el menú especificado, o todos los menús abiertos si se omite el primer parámetro.
     * @param {Object} [menu] - Menú a cerrar (objeto generado con ui.construirMenu o cualquier elemento del DOM compatible).
     * @param {boolean} [omitirAnimacion=false] - Cierra el menú inmediatamente, sin animaciones.
     * @param {function} [retorno] - Función de retorno al completar la animación.
     * @returns {ui}
     */
    ui.cerrarMenu=function(menu,omitirAnimacion,retorno) {
        if(typeof omitirAnimacion==="undefined") omitirAnimacion=false;
        if(typeof retorno==="undefined") retorno=null;

        if(typeof menu==="undefined"||!menu) {
            //Se debe crear una copia de menuAbierto para trabajar ya que ui.cerrarMenu() lo alterará
            menuAbierto.clonar().forEach(function(m) {
                ui.cerrarMenu(m,omitirAnimacion);
            });
            return ui;
        }

        var elem=util.esElemento(menu)?menu:menu.elem; //Si no es un elemento del DOM, se asume un objeto menú
        cerrarElementoMenu(elem,omitirAnimacion,menu.eliminar,retorno);

        removerEventosMenu();
        
        menuAbierto.splice(menuAbierto.indexOf(menu),1);

        return ui;
    };
})();
