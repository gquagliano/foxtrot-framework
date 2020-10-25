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
        }
    };

    this.encabezado=null;

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this;

        //TODO Desarrollar una forma más simple de buscar entre los hijos de un elemento
        this.encabezado=this.elemento.childNodes.filtrar({ clase:"encabezados" })[0];
        this.contenedor=this.elemento.childNodes.filtrar({ clase:"contenedor" })[0];

        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div>"); 

        this.encabezado=document.crear("<div class='encabezados'>");
        this.elemento.anexar(this.encabezado);

        this.contenedor=document.crear("<div class='contenedor'>");
        this.elemento.anexar(this.contenedor);

        this.crearComponente();
        return this;
    };
    
    /**
     * Evento 'Listo'.
     */
    this.listo=function() {
        this.actualizarEncabezados(false);
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
            var etiqueta=pestana.propiedad("etiqueta");
            if(!etiqueta) etiqueta="Pestaña "+(i+1);

            var boton;
            
            if(regenerar) {
                boton=documento.crear("<button class='btn btn-etiqueta-pestana' data-indice='"+i+"'>");
                boton.anexarA(t.encabezado);
            } else {
                boton=t.encabezado.querySelector("button:nth-child("+(i+1)+")");
            }

            boton.establecerHtml(etiqueta)
                .removerEventos()
                .evento("click",function(ev) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    t.activarPestana(parseInt(this.dato("indice")));
                });

            if(pestana.esActiva()) {
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
        if(typeof pestana==="number") {
            var hijos=this.obtenerHijos();
            if(pestana<0) pestana=hijos.length+pestana;
            if(hijos.length>pestana) pestana=hijos[pestana];
        }
        if(typeof pestana==="object") pestana.activar();
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