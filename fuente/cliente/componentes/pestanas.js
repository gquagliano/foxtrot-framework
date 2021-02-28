/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Bloque de pestañas.
 * @class
 * @extends componente
 */
var componentePestanas=function() { 
    "use strict";

    this.componente="pestanas";

    /**
     * Propiedades de Pestañas.
     */
    this.propiedadesConcretas={
        "Eventos":{
            pestanaActivada:{
                etiqueta:"Pestaña activada",
                evento:true,
                adaptativa:false
            }
        },
        "Pestañas":{
            predeterminada:{
                etiqueta:"Pestaña predeterminada",
                adaptativa:false,
                ayuda:"Número de pestaña, comenzando desde 0. Al guardar, siempre volverá a esta pestaña."
            }
        }
    };

    this.encabezado=null;

    var editandoPestana=null;

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this;

        //TODO Desarrollar una forma más simple de buscar entre los hijos de un elemento
        this.encabezado=this.elemento.childNodes.filtrar({ clase:"encabezados" })[0];
        this.contenedor=this.elemento.childNodes.filtrar({ clase:"contenedor" })[0];

        this.prototipo.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div>"); 

        this.encabezado=document.crear("<div class='encabezados'>");
        this.elemento.anexar(this.encabezado);

        this.contenedor=document.crear("<div class='contenedor'>");
        this.elemento.anexar(this.contenedor);

        this.prototipo.crear.call(this);
        return this;
    };
    
    /**
     * Evento 'Listo'.
     */
    this.listo=function() {
        this.actualizarEncabezados(false);
        this.prototipo.listo.call(this);
    };   

    /**
     * Evento `editorDesactivado`.
     * @returns {(boolean|undefined)}
     */
    this.editorDesactivado=function() {
        editandoPestana=this.obtenerPestanaActiva();

        //Volver a la pestaña predeterminada (de otro modo, al guardar, queda activa la pestaña que está activa actualmente en el editor)
        var indice=this.propiedad("predeterminada");
        if(typeof indice==="string"||typeof indice==="number") this.activarPestana(indice);

        return this.prototipo.editorDesactivado.call(this);
    };    

    /**
     * Evento `editor`.
     * @returns {(boolean|undefined)}
     */
    this.editor=function() {
        //Volver a la pestaña en la que se estaba trabajando
        if(editandoPestana) this.activarPestana(editandoPestana);

        return this.prototipo.editor.call(this);
    };

    /**
     * Devuelve *el índice* de la pestaña activa.
     * @returns {number}
     */
    this.obtenerPestanaActiva=function() {
        var hijos=this.obtenerHijos();
        for(var i=0;i<hijos.length;i++) {
            var pestana=hijos[i];
            //Validar si por error el hijo no es un componente pestaña
            //TODO Buscar otras necesidades de validaciones de este tipo (en todos los componentes)
            if(pestana.componente!="pestana") continue;
            if(pestana.esActiva()) return i;
        }
        return 0;
    };

    /**
     * Regenera los botones del encabezado.
     * @param {boolean} [regenerar=true] - Regenerar botones.
     * @returns {componentePestanas}
     */
    this.actualizarEncabezados=function(regenerar) {
        if(typeof regenerar==="undefined") regenerar=true;

        if(regenerar) this.encabezado.establecerHtml("");

        var pestanaActiva=null;

        var t=this;
        this.obtenerHijos().forEach(function(pestana,i) {            
            if(pestana.componente!="pestana") return;

            var etiqueta=pestana.propiedad("etiqueta");
            if(!etiqueta) etiqueta="Pestaña "+(i+1);

            var boton;
            
            if(regenerar) {
                boton=documento.crear("<button class='btn btn-etiqueta-pestana' data-indice='"+i+"'>");
                boton.anexarA(t.encabezado);
            } else {
                boton=t.encabezado.querySelector("button:nth-child("+(i+1)+")");
            }
            if(ui.enModoEdicion()) boton.agregarClase("foxtrot-editor-ignorar");

            boton.establecerHtml(etiqueta)
                .removerEventos()
                .evento("click",function(ev) {
                    ev.preventDefault();
                    ev.stopPropagation();

                    if(!ui.enModoEdicion()&&this.es({clase:"deshabilitado"})) return;

                    t.activarPestana(parseInt(this.dato("indice")));
                    
                    //En el editor, seleccionar pestaña
                    if(ui.enModoEdicion()) {
                        if(!ev.shiftKey) editor.limpiarSeleccion();
                        editor.alternarSeleccion(pestana);
                    }
                },true);

            var habilitado=pestana.habilitado();
            if(!habilitado) {
                boton.agregarClase("deshabilitado");
            } else {
                boton.removerClase("deshabilitado");
            }

            var visible=pestana.visible();
            if(!visible) {
                boton.agregarClase("d-none");
            } else {
                boton.removerClase("d-none");
            }

            if(pestana.esActiva()&&(ui.enModoEdicion()||(visible&&habilitado))) {
                boton.agregarClase("activa");
                pestanaActiva=i;
            } else {
                boton.removerClase("activa");
            }
        });

        //Si ninguna pestaña está activa, activar la primera
        if(pestanaActiva===null) this.activarPestana(0);

        return this;
    };

    /**
     * Desactiva todas las pestañas.
     * @returns {componentePestanas}
     */
    this.desactivarTodas=function() {
        this.obtenerHijos().forEach(function(pestana) {
            if(pestana.componente!="pestana") return;
            pestana.desactivar();
        });
        return this;
    };

    /**
     * Activa una pestaña dado su orden o instancia.
     * @param {(number|Componente)} pestana - Pestaña a activar.
     * @returns {componentePestanas}
     */
    this.activarPestana=function(pestana) {
        if(typeof pestana==="string") pestana=parseInt(pestana);
        if(!isNaN(pestana)) {
            var hijos=this.obtenerHijos();
            if(pestana<0) pestana=hijos.length+pestana;
            if(hijos.length>pestana) pestana=hijos[pestana];
        }
        if(typeof pestana==="object"&&pestana.componente=="pestana") pestana.activar();
        return this;
    };

    /**
     * Ejecuta el evento pestanaActivada.
     * @param {componentePestana} pestana - Pestaña activada.
     * @returns {componentePestanas}
     */
    this.pestanaActivada=function(pestana) {
        if(!ui.enModoEdicion()) this.procesarEvento("pestanaActivada","pestanaActivada",null,null,{pestana:pestana});
        return this;
    };
};

ui.registrarComponente("pestanas",componentePestanas,configComponente.clonar({
    descripcion:"Bloque de pestañas",
    etiqueta:"Pestañas",
    grupo:"Estructura",
    icono:"pestanas.png",
    aceptaHijos:["pestana"]
}));