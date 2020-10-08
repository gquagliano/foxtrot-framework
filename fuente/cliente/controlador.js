/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

"use strict";

/**
 * Controlador concreto.
 * @typedef Controlador
 */

/**
 * @class Objeto base para los controladores.
 */
var controlador=new function() {
    this.nombre=null;
    this.servidor=null;
    this.vista=null;
    this.controladorServidor=null;
    /** Componentes por nombre. */
    this.componentes={};
    /** Listado de todos los componentes. */
    this.instanciasComponentes=[];

    /**
     * @var {Object} datos - Valores a informar por obtenerValores(). Estos valores serán recuperados automáticamente por ui.obtenerValores(), por lo que,
     * entre otros casos, serán enviados automáticamente al servidor en eventos 'enviar:'.
     */
    this.valores={};

    ////Acceso a propiedades    

    /**
     * Devuelve el nombre de la instancia.
     */
    this.obtenerNombre=function() {
        return this.nombre;
    };

    /**
     * Devuelve la instancia del gestor de la interfaz con el servidor.
     */
    this.obtenerServidor=function() {
        return this.servidor;
    };

    /**
     * Devuelve el nombre de la vista que está controlando actualmente.
     * @returns {string}
     */
    this.obtenerNombreVista=function() {
        return this.vista.obtenerNombre();
    };

    /**
     * Establece la instancia de la vista que está controlando actualmente.
     * @param {Componente} vista 
     */
    this.establecerVista=function(vista) {
        this.vista=vista;
        return this;
    };

    /**
     * Devuelve la instancia de la vista que está controlando actualmente.
     * @param {Componente} vista 
     */
    this.obtenerVista=function(vista) {
        return this.vista=vista;
    };

    /**
     * Devuelve el listado de componentes.
     * @returns {componente[]}
     */
    this.obtenerComponentes=function() {
        return this.instanciasComponentes;
    };

    /**
     * Agrega la instancia del componente al repositorio.
     * @param {componente} componente - Componente.
     * @param {string} [nombre] - Si se especifica el nombre, será agregado a componentes en lugar de instanciasComponentes.
     * @returns {controlador}
     */
    this.agregarComponente=function(componente,nombre) {
        if(typeof nombre!=="undefined") {
            this.componentes[nombre]=componente;
        } else {
            this.instanciasComponentes.push(componente);
        }
        return this;
    };
    
    /**
     * Elimina las referencias a la instancia del componente.
     * @param {componente} componente - Componente.
     * @returns {controlador}
     */
    this.removerComponente=function(componente) {
        for(var i=0;i<this.instanciasComponentes.length;i++) {
            if(this.instanciasComponentes[i]==componente) {
                delete this.instanciasComponentes[i];
                break;
            }
        }
        if(this.componentes.hasOwnProperty(componente.nombre)) delete this.componentes[componente.obtenerNombre()];
        return this;
    };    

    ////Gestión de la instancia

    /**
     * Establece el nombre de la instancia (método para sobreescribir).
     */
    this.establecerNombre=function(nombre) {
        this.establecerNombreControlador(nombre);
        return this;
    };

    /**
     * Establece el nombre de la instancia.
     */
    this.establecerNombreControlador=function(nombre) {
        //Eliminar de componentes si cambia el nombre
        if(this.nombre!=nombre) delete controladores[this.nombre];
        this.nombre=nombre;
        //Registrar en window.componentes para acceso rápido
        if(nombre) controladores[nombre]=this;

        //Inicializar comunicación con el servidor
        //Si el controlador concreto no define controladorServidor, buscar un controlador de servidor del mismo nombre que el de cliente
        if(!this.controladorServidor) this.controladorServidor=nombre;
        this.servidor=servidor.fabricar(this.controladorServidor,nombre);

        return this;
    };

    /**
     * Determina si un objeto es instancia de un controlador.
     */
    Object.prototype.esControlador=function() {
        return this.cttr()==controlador.cttr();
    };

    /**
     * Fabrica una instancia de un controlador concreto dada su función.
    */
    this.fabricarControlador=function(nombre,fn) {
        //Heredar prototipo
        fn.prototype=new (this.cttr());

        var obj=new fn;

        obj.establecerNombre(nombre);

        //Inicializar las propiedades que son objetos (de otro modo, se copiarán las referencias desde el prototipo)
        //obj.hijos=[];
        //obj.valoresPropiedades={};

        return obj;
    };    

    /**
     * Inicializa la instancia (método para sobreescribir).
     */
    this.inicializar=function() {
        this.inicializarControlador();
        return this;
    };

    /**
     * Inicializa la instancia.
     */
    this.inicializarControlador=function() {
        return this;
    };

    /**
     * Devuelve los parámetros del controlador para su almacenamiento.
     */
    this.obtenerPropiedades=function() {
        return {
        };
    };

    /**
     * Devuelve los valores del controlador (propiedades asignadas en this.valores).
     * @returns {Object}
     */
    this.obtenerValores=function() {
        return this.valores;
    };

    /**
     * Establece los valores del controlador.
     * @param {Object} obj - Objeto {valores:propiedades} a asignar.
     * @returns {Controlador}
     */
    this.establecerValores=function(obj) {
        this.valores=Object.assign(this.valores,obj);
        return this;
    };

    ////Eventos
    
    /**
     * Evento 'Inicializado' (método para sobreescribir).
     */
    this.inicializado=function() {
    };
    
    /**
     * Evento 'Listo' (método para sobreescribir).
     */
    this.listo=function() {
    };
    
    /**
     * Evento 'Navegación' (método para sobreescribir).
     * @param {string} nombreVista - Nombre de la vista de destino.
     */
    this.navegacion=function(nombreVista) {
    };
    
    /**
     * Evento 'Volver' (método para sobreescribir).
     * @returns {boolean}
     */
    this.volver=function() {
    };

    /**
     * Evento 'Error Servidor' (método para sobreescribir).
     */
    this.errorServidor=function() {
    };
}();

window["controlador"]=controlador;
