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
    
    var t=this;

    var clickDocumento=function(ev) {
        if(ev.target.es({elemento:t.elemento})||ev.target.padre({elemento:t.elemento})) return;
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
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
                ayuda:"Distancia en píxeles desde el márgen izquierdo a utilizar como valor predeterminado, si el menú es de modo Flotante"
            },
            posicionSuperior:{
                etiqueta:"Posición superior (flotante)",
                tipo:"numero",
                ayuda:"Distancia en píxeles desde el márgen superior a utilizar como valor predeterminado, si el menú es de modo Flotante"
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
        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<ul class='nav'>");
        this.crearComponente();
        this.gestionarAncla();
        return this;
    };

    /**
     * Evento 'Editor'.
     */
    this.editor=function() {
        this.gestionarAncla();
    };
    
    /**
     * Actualiza el componente. propiedad puede estar definido tras la modificación de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
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

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
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
        return this.seleccionadoComponente(estado);
    };

    /**
     * Crea, configura o elimina el elemento utilizado en el editor para poder seleccionar el menú cuando es invisible.
     * @returns {Componente}
     */
    this.gestionarAncla=function() {
        if(!ui.enModoEdicion()) return this;

        if(this.ancla) {
            try {
                this.ancla.remover();
            } catch {}
        }

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
        for(var i=0;i<tamanos.length;i++) {
            var tamano=tamanos[i],
                v="none";
            if(modos.hasOwnProperty(tamano)&&(modos[tamano]=="flotante"||modos[tamano]=="deslizarIzquierda")) v="block";
            this.ancla.agregarClase("d-"+(tamano=="g"?"":tamano+"-")+v);
        }

        return this;
    };

    /**
     * Abre el menú flotante o deslizable de acuerdo a su configuración.
     * @returns {Componente}
     *//**
     * Abre el menú flotante o deslizable de acuerdo a su configuración.
     * @param {Componente} a - Componente relativo al cual se posicionará el menú.
     * @returns {Componente}
     *//**
     * Abre el menú flotante o deslizable de acuerdo a su configuración.
     * @param {number} a - Posición lateral izquierda, en píxeles.
     * @param {number} b - Posición lateral superior, en píxeles.
     * @returns {Componente}
     */
    this.abrir=function(a,b) {
        var tamano=ui.obtenerTamano(),
            modo=this.propiedadAdaptada(tamano,"modo"),
            izquierda=null,
            arriba=null;
        
        if(modo=="flotante") {
            if(typeof a!=="undefined") {
                if(typeof b==="undefined") {
                    //a = componente
                    var elem=a.obtenerElemento(),
                        posicion=elem.posicionAbsoluta(),
                        alto=elem.alto();
                    izquierda=posicion.x;
                    arriba=posicion.y+alto;
                } else {
                    //2 parámetros
                    izquierda=a;
                    arriba=b;
                }
            } else {
                izquierda=this.propiedad(tamano,"posicionLateral");
                arriba=this.propiedad(tamano,"posicionSuperior");
            }

            if(!isNaN(izquierda)) {
                //¿Abrir hacia la izquierda?
                //TODO

                this.elemento.estilos("left",izquierda);
            }

            if(!isNaN(arriba)) {
                //¿Abrir hacia arriba?
                //TODO
                
                this.elemento.estilos("top",arriba);
            }
        } else {
            this.elemento.estilos({
                left:null,
                top:null
            });
        }

        this.elemento.agregarClase("menu-abierto");

        document.evento("click mousewheel",clickDocumento,true);
        window.evento("blur",blur);

        return this;
    };

    /**
     * Cierra el menú flotante o deslizable.
     * @returns {Componente}
     */
    this.cerrar=function() {
        t.elemento.removerClase("menu-abierto");
        document.removerEvento("click mousewheel",clickDocumento,true);
        window.removerEvento("blur",blur);
        //Cerrar submenú al ocultar el contenedor (no debería haber otro menú contextual abierto, cerramos todo)
        ui.cerrarMenu();
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
};

ui.registrarComponente("contenedor-menu",componenteContenedorMenu,configComponente.clonar({
    descripcion:"Contenedor o barra de menú",
    etiqueta:"Contenedor de menú",
    grupo:"Menú",
    icono:"contenedor-menu.png",
    aceptaHijos:["item-menu"]
}));