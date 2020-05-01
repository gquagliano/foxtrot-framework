/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Métodos de gestión de la interfaz.
 */
var ui=new function() {
    "use strict";

    var componentes={},
        instanciasComponentes=[];

    var doc=document,
        body=document.body,
        cuerpo=doc.querySelector("#foxtrot-cuerpo");

    this.modoEdicion=false;

    this.obtenerCuerpo=function() {
        return cuerpo;
    };

    this.registrarComponente=function(nombre,funcion,configuracion) {
        configuracion.nombre=nombre;
        componentes[nombre]={
            fn:funcion,
            config:configuracion
        };
    };

    this.obtenerComponentes=function() {
        return componentes;
    };

    /**
     * Crea una instancia de un componente dado su nombre.
     */
    this.crearComponente=function(nombre) {
        var obj=new componentes[nombre].fn;
        instanciasComponentes.push(obj);
        return obj;
    };

    this.establecerModoEdicion=function(valor) {
        this.modoEdicion=valor;
        body.alternarClase("foxtrot-modo-edicion");
    };

    this.ejecutar=function() {
        
    };
}();

/**
 * Plantilla para los objetos de configuración a utilizar en ui.registrarComponente().
 */
var configComponente={
    nombre: null,
    descripcion: null,
    icono: null,
    /**
     * aceptaHijos:
     * - true               Cualquiera
     * - false              Ninguno
     * - [ nombre, ... ]    Nombre de componentes de los cualqes puede ser hijo, o que acepta como hijos
     */
    aceptaHijos: true
};

/**
 * Plantilla para los objetos que contienen la relación entre elementos del DOM e instancias de componentes.
 */
var elementoComponente={
    elemento:null,
    contenedorHijos:null,
    instancia:null
};

//Exportar para Closure
window["ui"]=ui;
