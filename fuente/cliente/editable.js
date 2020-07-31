/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Gestión de elementos editables (contenteditable).
 */
var editable=new function() {
    this.observador=null;

    var componentesEliminados={},
        moviendoSeleccion=false,
        moviendoNodo=null;

    this.mostrarBarra=function(elem) {
        //TODO
    };

    this.ocultarBarra=function() {
        //TODO
    };

    function insertarComponente(rango,componente) {
        var obj=null,
            nuevo=false,
            tipos=ui.obtenerComponentes();

        if(tipos.hasOwnProperty(componente)) {
            obj=ui.crearComponente(componente);
            nuevo=true;
        } else {
            obj=ui.obtenerInstanciaComponente(componente);
        }
        var elem=obj.obtenerElemento();

        //Almacenar en moviendoNodo para poder evitar eliminarlo cuando el observador detecte que se removió de su posición actual
        moviendoNodo=elem;
        try {
            rango.insertNode(elem);
        } catch { }

        obj.inicializar();

        elem.editable(false);

        if(nuevo) {
            editor.prepararComponenteInsertado(obj);
        }
    }

    function contenidoModificado(lista,o) {
        for(var p in lista) {
            if(!lista.hasOwnProperty(p)) continue;

            var item=lista[p];

            if(item.removedNodes.length) {
                //Verificar si alguno de los nodos eliminados correspondía a un componente
                for(var i=0;i<item.removedNodes.length;i++) {
                    var nodo=item.removedNodes[i];
                    if(nodo==moviendoNodo||!(nodo instanceof Node)) continue;
                    var id=nodo.dato("fxid");
                    if(!id) continue;

                    //Eliminar componente
                    var comp=ui.obtenerInstanciaComponente(id);
                    if(comp) comp.eliminar();
                }

                //Evitar que se elimine todo el texto del componente
                if(!item.target.childNodes.length||(item.target.childNodes.length==1&&item.target.childNodes[0].es({clase:"foxtrot-etiqueta-componente"}))) {
                    item.target.anexar("&nbsp;");
                }
            }

            if(item.addedNodes.length) {
                //Verificar si alguno de los nodos insertados corresponde a un componente
                for(var i=0;i<item.addedNodes.length;i++) {
                    var nodo=item.addedNodes[i];
                    if(nodo==moviendoNodo||!(nodo instanceof Node)) continue;
                    var id=nodo.dato("fxid");
                    if(!id) continue;

                    //TODO Restaurar componente (fue eliminado previamente, no se lo podemos pedir a ui)
                    //TODO Creo que sería mejor implementar un historial (ctrl-z/ctrl-y) propio
                }                
            }
        }
    }

    function onDrop(e) {        
        e.stopPropagation();

        if(moviendoSeleccion) {
            moviendoSeleccion=false;
            return;
        }
        moviendoSeleccion=false;

        //Identificar el tipo de contenido
        var datos=e.dataTransfer.getData("text/plain"),
            obj=null,
            comp=null,
            insertar=null;

        try { obj=JSON.parse(datos); } catch {}
        
        if(obj) {
            if(obj.hasOwnProperty("insertarComponente")) {
                //Nuevo componente
                comp=obj.insertarComponente;
            } else if(obj.hasOwnProperty("idComponente")) {
                //Moviendo componente
                comp=obj.idComponente;
            } else {
                //Tratar el json como texto
                insertar=datos;
            }
        //} else if(!datos&&html!="") {
        //    //Extraer el texto
        //    insertar=document.crear("<div>").html(html).texto();
        } else if(datos) {
            //TODO Intentar insertar como imagen
            //TODO Insertar link si es una url
            //TODO Archivos

            insertar=datos;
        } else {
            //Otros (ignorar)
            e.preventDefault();
            return;
        }

        e.preventDefault();

        var doc=ui.obtenerDocumento();        

        //Crear el cursor en la posición en la cual se soltó el contenido
        var rango,seleccion;
        if(doc.caretRangeFromPoint) {
            rango=doc.caretRangeFromPoint(e.clientX,e.clientY);
        } else if(e.rangeParent) {
            rango=doc.createRange();
            rango.setStart(e.rangeParent,e.rangeOffset);
        }
        e.target.focus();
        seleccion=doc.getSelection();
        seleccion.removeAllRanges(); 
        seleccion.addRange(rango);

        //Insertar en el cursor
        if(comp) {
            insertarComponente(rango,comp);
        } else if(typeof insertar==="string") {
            doc.execCommand("insertText",false,insertar);
        }
        seleccion.removeAllRanges();
    }

    /**
     * Establece la propiedad contentEditable.
     */
    Node.prototype.editable=function(estado) {
        if(util.esIndefinido(estado)) estado=true;
        this.propiedad("contentEditable",estado);

        //TODO controles de formato

        return this;
    };

    function onFocus() {
        editable.mostrarBarra(this);
    }

    function onBlur() {
        editable.ocultarBarra();
    }

    function dragStart(e) {
        //Detectar si se está moviendo el texto seleccionado
        if(e.target.nodeType==Node.TEXT_NODE) moviendoSeleccion=true;
        //Evitar que al arrastrar se arrastre el elemento completo o alguno de sus padres
        e.stopPropagation();
    }

    function keyDown(e) {
        if(e.which==46) { //DEL
            //Evitar que se elimine el componente
            e.stopPropagation();
        }
    }
    
    /**
     * Activa el modo de edición.
     */
    Node.prototype.iniciarEdicion=function() {
        this.editable(true);

        var t=this,
            f=function(e) {
                e.stopPropagation();
            };

        //Crear un destino especial que permita soltar algunos componentes (etiqueta, imagen) como así también contenido como texto e imágenes
        this.crearDestino({
            drop:onDrop,
            dragenter:f,
            dragleave:f,
            dragover:f
        });

        //TODO Pegar componentes y contenido externo (texto, imágenes)

        this.evento("focus",onFocus)
            .evento("blur",onBlur)
            .evento("dragstart",dragStart)
            .evento("keydown",keyDown);

        //Escuchar cambios para detectar cuando se elimina/reestablece (ctrl+z) contenido que corresponde a un componente hijo
        this.observador=new MutationObserver(contenidoModificado);
        this.observador.observe(this,{
            childList:true,
            subtree:true
        });

        //TODO Limpieza del html generado
        
        return this;
    };

    /**
     * Desactiva el modo de edición.
     */
    Node.prototype.finalizarEdicion=function() {
        this.editable(false);

        //Remover eventos
        this.removerDestino()
            .removerEvento("focus",onFocus)
            .removerEvento("blur",onBlur)
            .removerEvento("dragstart",dragStart);

        this.observador.disconnect();         
        return this;
    };
};

window["editable"]=editable;
