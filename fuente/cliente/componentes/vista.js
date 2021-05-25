/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Vista.
 * @class
 * @extends componente
 */
var componenteVista=function() {   
    "use strict";

    this.componente="vista";
    this.arrastrable=false;
    this.nombreVista=null;
    this.principal=false;
    /** @var {componente[]} componentes - Listado de componentes *adicionales* a aquellos que le pertenecen por jerarquía del DOM. */
    this.componentes=null;

    this.propiedadesConcretas={
        "Metadatos":{
            titulo:{
                etiqueta:"Título",
                adaptativa:false
            },
            descripcion:{
                etiqueta:"Descripción",
                adaptativa:false
            },
            palabrasClave:{
                etiqueta:"Palabras clave",
                adaptativa:false
            },
            imagen:{
                etiqueta:"Imagen (OG)",
                adaptativa:false
            }
        },
        "Comportamiento":{
            precarga:{
                etiqueta:"Precarga visible",
                tipo:"logico",
                adaptativa:false
            }
        }
    };

    /**
     * Asigna el controlador de la vista.
     * @param {controlador} controlador - Instancia del controlador.
     * @returns {componenteVista}
     */
    this.establecerControlador=function(controlador) {
        this.controlador=controlador;
        return this;
    };

    /**
     * Establece el nombre de la vista.
     * @param {string} nombre - Nombre.
     * @returns {componente}
     */
    this.establecerNombreVista=function(nombre) {
        this.nombreVista=nombre;
        return this;
    };

    /**
     * Devuelve el nombre de la vista.
     * @returns {string}
     */
    this.obtenerNombreVista=function() {
        return this.nombreVista;
    };

    /**
     * Establece que esta vista es la vista principal.
     * @returns {componente}
     */
    this.establecerPrincipal=function() {
        this.principal=true;
        return this;
    };

    /**
     * Devuelve si la vista es la vista principal.
     * @returns {boolean}
     */
    this.esPrincipal=function() {
        return this.principal;
    };

    /**
     * Agrega un componente a la descendencia de esta instancia.
     * @param {componente} componente - Componente a agregar.
     * @returns {componente}
     */
    this.agregarComponente=function(componente) {
        if(this.componentes===null) this.componentes=[];
        if(!~this.componentes.indexOf(componente))
            this.componentes.push(componente);
        return this;
    };

    /**
     * Remueve un componente de la descendencia de esta instancia.
     * @param {componente} componente - Componente a remover.
     * @returns {componente}
     */
    this.removerComponente=function(componente) {
        var p=this.componentes.indexOf(componente);
        if(~p) this.componentes.splice(p,1);
        return this;
    };

    /**
     * Inicializa la instancia.
     * @returns {componente}
     */ 
    this.inicializar=function() {
        this.vista=this;
        this.contenedor=this.elemento;
        return this.prototipo.inicializar.call(this);
    };
    
    /**
     * Inicializa la instancia en base a su ID y sus parámetros.
     */
    this.restaurar=function() {
        return this;
    };
    
    /**
     * Actualiza el componente tras la modificación de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(!ui.enModoEdicion()||!expresion.contieneExpresion(valor)) {
	        //TODO Estas propiedades deberían aceptar expresiones, las cuales se actualizarían al cargar la página o modificarse el 
	        //origen de datos, puede quedar como algo configurable en cada propiedad (que el usario elija si debe o no aceptar expresiones 
	        //para evitar procesar todo cada vez)

	        if(propiedad=="titulo") {
	            ui.obtenerDocumento().title=valor;
	            return this;
	        }
	        
	        if(propiedad=="descripcion"||propiedad=="palabrasClave") {
	            var nombres={
	                descripcion:"description",
	                palabrasClave:"keywords"
	            };
	            var doc=ui.obtenerDocumento(),
	                elem=doc.querySelector("meta[name='"+nombres[propiedad]+"']");
	            if(!elem) elem=doc.crear("<meta name='"+nombres[propiedad]+"'>").anexarA(doc.head);
	            elem.propiedad("content",valor);
	            return this;
	        }
	        
	        if(propiedad=="imagen") {
	            var doc=ui.obtenerDocumento(),
	                elem=doc.querySelector("meta[property='og:image']");
	            if(!elem) elem=doc.crear("<meta property='og:image'>").anexarA(doc.head);
	            elem.propiedad("content",valor);
	            return this;
	        }
	        
	        if(propiedad=="precarga") {
	            var doc=ui.obtenerDocumento();
	            if(valor===true||valor===1||valor==="1") {
	                ui.obtenerCuerpo().insertarDespues(doc.crear("<div id='foxtrot-precarga' class='visible'>"));
	            } else {
	                var elem=doc.querySelector("#foxtrot-precarga");
	                if(elem) elem.remover();
	            }
	            return this;
	        }
	    }

        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Actualiza toda la vista. Este método no redibuja los componentes ni reasigna todas sus propiedades. Está diseñado para poder
     * solicitar a los componentes que se refresquen o vuelvan a cargar determinadas propiedades, como el origen de datos.
     * @param {boolean} [actualizarHijos=true] - Determina si se debe desencadenar la actualización de la descendencia del componente.
     * @returns {componente}
     */
     this.actualizar=function(actualizarHijos) {
        this.prototipo.actualizar.call(this,actualizarHijos);

        //Actualizar también los componentes registrados en el almacén
        if(this.componentes!==null) {
            this.actualizacionEnCurso=true;
            for(var i=0;i<this.componentes.length;i++)
                this.componentes[i].actualizar(true);
            this.actualizacionEnCurso=false;
        }

        return this;
    };
    
    /**
    * Devuelve un listado de componentes hijos (descendencia directa).
    * @returns {componente[]}
    */
    this.obtenerHijos=function() {
        var hijos=this.prototipo.obtenerHijos.call(this);

        //Sumar también los componentes registrados en el almacén
        //Ignora el filtro
        if(this.componentes!==null)
            hijos=hijos.concat(this.componentes);
        
        return hijos;
    };
};

ui.registrarComponente("vista",componenteVista,configComponente.clonar({
    descripcion:"Vista",
    etiqueta:"Vista"
}));