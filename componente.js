/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Objeto base (prototipo) de los componentes.
 */
function componente() {
    this.base=this;
    this.id=null;
    this.componente=null;
    this.nombre=null;
    this.elemento=null;
    this.contenedor=null;
    this.datosElemento=util.clonar(elementoComponente);

    /**
     * Inicializa la instancia.
     */
    this.inicializar=function() {

    };

    /**
     * Establece el ID de la instancia. Si se omite id, intentará configurar el DOM de la instancia con un id previamente asignado.
     */
    this.establecerId=function(id) {
        if(!util.esIndefinido(id)) this.id=id;
        if(this.elemento) this.elemento.dato("fxid",this.id);
        return this;
    };

    /**
     * Establece el nombre de la instancia.
     */
    this.establecerNombre=function(nombre) {
        //Eliminar de componentes si cambia el nombre
        if(this.nombre!=nombre) delete window["componentes"][this.nombre];
        this.nombre=nombre;
        //Registrar en window.componentes para acceso rápido (debe accederse de esta forma para que quede exportado al compilar con Closure)
        if(nombre) window["componentes"][nombre]=this;
        return this;
    };

    /**
     * Devuelve el ID de la instancia.
     */
    this.obtenerId=function() {
        return this.id;
    };

    /**
     * Devuelve el elemento correspondiente a esta instancia, o uno nuevo si es una nueva instancia.
     */
    this.obtenerElemento=function() {
        if(!this.elemento) this.crear();
        return this.datosElemento;
    };

    /**
     * Devuelve un objeto con todos los parámetros de configuración.
     */
    this.obtenerParametros=function() {
        return "test";
    };

    /**
     * Reestablece la configuración a partir de un objeto previamente generado con obtenerParametros().
     */
    this.establecerParametros=function(obj) {
        return this;
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        return this;
    };

    /**
     * Inicializa la instancia en base a su ID y sus parámetros.
     */
    this.restaurar=function() {
        this.elemento=document.querySelector("[data-fxid='"+this.id+"']");
        this.inicializar();
        return this;
    };
    
    /**
     * Constructor.
     */
    (function() {

    })();
}

//Exportar para Closure
window["componente"]=componente;
