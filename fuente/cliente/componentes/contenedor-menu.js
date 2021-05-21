/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Contenedor de menú.
 * @class
 * @extends componente
 */
var componenteContenedorMenu=function() { 
    "use strict";

    this.componente="contenedor-menu";
    this.ancla=null;

    var menuAbierto=false;
    
    var t=this;

    var clickDocumento=function(ev) {
        //ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        if(ev.target.es({elemento:t.elemento})||ev.target.padre({elemento:t.elemento})) return;
        t.cerrar();
    },
    blur=function() {
        t.cerrar();
    };

    this.propiedadesConcretas={
        "Contenedor de menú":{
            comportamiento:{
                etiqueta:"Comportamiento",
                tipo:"opciones",
                opciones:{
                    normal:"Normal",
                    click:"Abrir submenús solo con click"
                },
                adaptativa:false
            },
            modo:{
                etiqueta:"Modo",
                tipo:"opciones",
                opciones:{
                    bloque:"Bloque",
                    flotante:"Flotante",
                    deslizarIzquierda:"Deslizar desde la izquierda"
                    //TODO deslizarDerecha:"Deslizar desde la derecha"
                    //TODO deslizarArriba:"Deslizar desde arriba"
                    //TODO deslizarAbajo:"Deslizar desde abajo"
                }
            },
            posicionLateral:{
                etiqueta:"Posición lateral (flotante)",
                tipo:"numero",
                ayuda:"Distancia en píxeles desde el márgen izquierdo a utilizar como valor predeterminado, si el menú es de modo Flotante. No acepta unidad (siempre se asume px)."
            },
            posicionSuperior:{
                etiqueta:"Posición superior (flotante)",
                tipo:"numero",
                ayuda:"Distancia en píxeles desde el márgen superior a utilizar como valor predeterminado, si el menú es de modo Flotante. No acepta unidad (siempre se asume px)."
            },
            posicionInferior:{
                etiqueta:"Posición inferior (flotante)",
                tipo:"numero",
                ayuda:"Distancia en píxeles desde el márgen inferior a utilizar como valor predeterminado, si el menú es de modo Flotante. No acepta unidad (siempre se asume px)."
            },
            posicionDerecha:{
                etiqueta:"Posición derecha (flotante)",
                tipo:"numero",
                ayuda:"Distancia en píxeles desde el márgen derecho a utilizar como valor predeterminado, si el menú es de modo Flotante. No acepta unidad (siempre se asume px)."
            },
            componenteRelativo:{
                etiqueta:"Componente relativo (flotante)",
                ayuda:"Nombre de un componente de la misma vista relativo al cual se abrirá el menú flotante.",
                adaptativa:false
            },
            editarMenu:{
                etiqueta:"Editar menú",
                tipo:"comando",
                funcion:function(comp) {
                    comp.elemento.alternarClase("menu-edicion");
                }
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.contenedor=this.elemento;

        this.clasesCss=this.clasesCss.concat(
            /^menu-(flotante|deslizable|bloque)-activo$/,
            /^menu-(click|abierto)$/,
            /^menu(-sm|-md|-lg|-xl)?-(flotante|deslizable|bloque)$/,
            "nav"
        );

        this.prototipo.inicializar.call(this);
        return this;
    };    

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<ul class='nav'>");
        this.prototipo.crear.call(this);
        this.gestionarAncla();
        return this;
    };

    /**
     * Evento 'Editor'.
     */
    this.editor=function() {
        this.gestionarAncla();

        //En modo edición no hay eventos
        window.evento("resize",function() {
            t.tamano();
        });
        this.tamano();
        
        this.prototipo.editor.call(this);
    };

    /**
     * Evento `editorDesactivado`.
     * @returns {(boolean|undefined)}
     */
    this.editorDesactivado=function() {
        this.gestionarAncla();
        return this.prototipo.editorDesactivado.call(this);
    };
    
    /**
     * Evento *Tamaño*.
     * @param {string} tamano - Tamaño actual (`'xl'`,`'lg'`,`'md'`,`'sm'`,`'xs'`).
     * @param {(string|null)} tamanoAnterior - Tamaño anterior (`'xl'`,`'lg'`,`'md'`,`'sm'`,`'xs'` o `null` si es la primer invocación al cargar la vista).
     */
    this.tamano=function(tamano,tamanoAnterior) {
        //Ajustar modo según corresponda

        var modoActual="bloque",
            tamanos=["xs","sm","md","lg","xl"];
        for(var i=0;i<tamanos.length;i++) {
            var clase="menu-"+(tamanos[i]=="xs"?"":tamanos[i]+"-");            
            if(this.elemento.es({clase:clase+"flotante"})) {
                modoActual="flotante";
            } else if(this.elemento.es({clase:clase+"deslizable"})) {
                modoActual="deslizable";
            } else if(this.elemento.es({clase:clase+"bloque"})) {
                modoActual="bloque";
            } else {
                //Si no tiene clase para este tamaño, se mantiene el último modo establecido
            }
            if(tamanos[i]==tamano) break;
        }

        this.elemento.removerClase(/menu-.+?-activo/)
            .agregarClase("menu-"+modoActual+"-activo")
            .removerAtributo("style"); //TODO Deshacer solo los estilos asignados por abrir()

        this.prototipo.tamano.call(this,tamano,tamanoAnterior);
    };
    
    /**
     * Evento `volver`
     * @returns {(boolean|undefined)}
     */
    this.volver=function() {
        if(!ui.enModoEdicion()&&ui.esCordova()&&menuAbierto) {
            t.cerrar();
            return true;
        }
        return this.prototipo.establecerEventos.call(this);
    };
    
    /**
     * Actualiza el componente. propiedad puede estar definido tras la modificación de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(!ui.enModoEdicion()||!expresion.contieneExpresion(valor)) {
	        if(propiedad=="comportamiento") {
	            if(valor=="click") {
	                this.elemento.agregarClase("menu-click");
	            } else {
	                this.elemento.removerClase("menu-click");
	            }
	            return this;
	        }

	        if(propiedad=="modo") {
	            var claseTamano=(tamano!="g"&&tamano!="xs"?tamano+"-":"");
	            this.elemento
	                .removerClase(new RegExp("^menu-"+claseTamano+"(flotante|deslizable|bloque)$"))
	                .agregarClase("menu-"+claseTamano+{
	                    flotante:"flotante",
	                    bloque:"bloque",
	                    deslizarIzquierda:"deslizable"
	                }[valor]);
	            this.gestionarAncla();
	            return this;
	        }
	    }

        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Evento 'Seleccionado'.
     * @param {boolean} estado
     * @returns {Componente}
     */
    this.seleccionado=function(estado) {
        if(!this.ancla) return;
        if(estado)
            this.ancla.agregarClase("seleccionado");
        else
            this.ancla.removerClase("seleccionado");
        return this.prototipo.seleccionado.call(this,estado);
    };

    /**
     * Crea, configura o elimina el elemento utilizado en el editor para poder seleccionar el menú cuando es invisible.
     * @returns {Componente}
     */
    this.gestionarAncla=function() {
        if(this.ancla) this.ancla.remover();

        if(!ui.enModoEdicion()) return this;

        var t=this;
        this.ancla=ui.obtenerDocumento()
            .crear("<div class='menu-ancla foxtrot-editor-temporal' title='Seleccionar menú oculto...'>")
            .anexarA(this.elemento.padre())
            .evento("click",function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
                editor.limpiarSeleccion()
                    .establecerSeleccion(t);
            });

        var modos=this.propiedadObj("modo"),
            tamanos=["g","sm","md","lg","xl"];
        if(!modos) {
            this.ancla.agregarClase("d-none");
        } else {
            this.ancla.removerClase(/d-.+/);
            var modo="bloque";
            for(var i=0;i<tamanos.length;i++) {
                var tamano=tamanos[i],
                    v="none";
                if(modos.hasOwnProperty(tamano)) modo=modos[tamano];
                if(modo=="flotante"||modo=="deslizarIzquierda") v="block";
                this.ancla.agregarClase("d-"+(tamano=="g"?"":tamano+"-")+v);
            }
        }

        return this;
    };
    
    /**
     * 
     */
    var modoActual=(function() {
        if(this.elemento.es({clase:"menu-flotante-activo"})) return "flotante";
        if(this.elemento.es({clase:"menu-deslizable-activo"})) return "deslizable";
        return "bloque";
    }).bind(this);

    /**
     * Devuelve `true` si el menú (flotante o deslizable) se encuentra actualmente abierto.
     * @returns {boolean}
     */
    this.abierto=function() {
        return menuAbierto;
    };

    /**
     * Abre el menú flotante o deslizable de acuerdo a su configuración. Si el menú se encuentra en modo bloque, no tiene fecto.
     * @returns {Componente}
     *//**
     * Abre el menú flotante o deslizable de acuerdo a su configuración. Si el menú se encuentra en modo bloque, no tiene fecto.
     * @param {Componente} a - Componente relativo al cual se posicionará el menú. En este caso el posicionamiento será automático según el espacio
     * disponible en pantalla.
     * @returns {Componente}
     *//**
     * Abre el menú flotante o deslizable de acuerdo a su configuración. Si el menú se encuentra en modo bloque, no tiene fecto.
     * @param {(number|null)} a - Posición lateral izquierda, en píxeles, o `null`si se desea especificar posición derecha.
     * @param {(number|null)} b - Posición superior, en píxeles, o `null` si se desea especificar posición inferior.
     * @param {(number|null)} [c=null] - Posición lateral derecha, en píxeles.
     * @param {(number|null)} [d=null] - Posición inferior, en píxeles.
     * @returns {Componente}
     */
    this.abrir=function(a,b,c,d) {
        var modo=modoActual(),
            elementoRelativo=null,
            izquierda=null,
            derecha=null,
            arriba=null,
            abajo=null;                   

        if(modo=="bloque") return this;

        this.elemento.agregarClase("menu-abierto");
        ui.animarAparecer(this.elemento);

        if(typeof a==="undefined") {
            var nombre=this.propiedad("componenteRelativo");
            if(nombre) {
                var ctl=this.obtenerControlador(),
                    comp=ctl.obtenerComponente(nombre);
                if(comp) elementoRelativo=comp.obtenerElemento();
            }
            if(!elementoRelativo) {
                izquierda=this.propiedad("posicionLateral");
                arriba=this.propiedad("posicionSuperior");
                abajo=this.propiedad("posicionInferior");
                derecha=this.propiedad("posicionDerecha");
            }
        } else if(typeof a==="object"&&a!==null) {
            elementoRelativo=a.obtenerElemento();
        } else {
            izquierda=a;
            arriba=b;
            derecha=c;
            abajo=d;
        }

        ui.posicionarElemento(
            this.elemento,
            elementoRelativo,
            {
                izquierda:izquierda,
                derecha:derecha,
                superior:arriba,
                inferior:abajo
            },
            {
                anchoComponente:false
            }
        );

        document.evento("mousedown touchstart wheel click",clickDocumento);
        window.evento("blur",blur);

        menuAbierto=true;

        return this;
    };

    /**
     * Cierra el menú flotante o deslizable. Si el menú se encuentra en modo bloque, no tiene fecto.
     * @returns {Componente}
     */
    this.cerrar=function() {
        //Remover siempre los eventos en caso de que hayan sido establecidos en un modo diferente
        document.removerEvento("mousedown touchstart wheel click",clickDocumento);
        window.removerEvento("blur",blur);
        
        //Cerrar submenú al ocultar el contenedor (no debería haber otro menú contextual abierto, cerramos todo)
        ui.cerrarMenu();
        menuAbierto=false;

        this.elemento.removerClase("menu-abierto");

        //Reestablecemos todas las propiedades anteriores para realizar limpieza en caso de que se haya producido un cambio de
        //formato (flotante o deslizable <-> bloque) entre la apertura y cierre del menú, pero la animación no se debe realizar
        //la animación si estamos en modo bloque

        var modo=modoActual();
        if(modo=="flotante") {
            ui.animarDesaparecer(this.elemento);
        } else if(modo=="deslizable") {
            //TODO
        }

        return this;
    };

    /**
     * Abre o cierra el menú flotante o deslizable.
     * @returns {Componente}
     *//**
     * Abre o cierra el menú flotante o deslizable.
     * @param {Componente} a - Componente relativo al cual se posicionará el menú.
     * @returns {Componente}
     *//**
     * Abre o cierra el menú flotante o deslizable.
     * @param {number} a - Posición lateral izquierda, en píxeles.
     * @param {number} b - Posición lateral superior, en píxeles.
     * @returns {Componente}
     */
    this.alternar=function(a,b) {
        if(this.elemento.es({clase:"menu-abierto"})) return this.cerrar();
        return this.abrir(a,b);
    };

    /**
     * Evento `navegación`.
     * @param {string} nombreVista - Nombre de la vista de destino.
     */
    this.navegacion=function(nombreVista) {
        this.cerrar();
    };

    /**
     * Elimina el componente.
     * @param {boolean} [descendencia] - Si está definido y es `true`, indica que se está eliminando el componente por ser descendencia de otro componente eliminado. Parámetro de
     * uso interno; omitir al solicitar eliminar este componente.
     * @returns {componente}
     */
    this.eliminar=function(descendencia) {
        this.prototipo.call(this,descendencia);
        if(this.ancla) this.ancla.remover();
        return this;
    };
};

ui.registrarComponente("contenedor-menu",componenteContenedorMenu,configComponente.clonar({
    descripcion:"Contenedor o barra de menú",
    etiqueta:"Contenedor de menú",
    grupo:"Menú",
    icono:"contenedor-menu.png",
    aceptaHijos:["item-menu"]
}));