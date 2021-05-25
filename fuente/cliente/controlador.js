/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */
 
/**
 * @external Object
 */

/**
 * Objeto base para los controladores.
 * @class
 */
var controlador=new function() {
    "use strict";

    /**
     * @var {string} nombre - Nombre del controlador.
     * @var {servidor} servidor - Acceso al controlador de servidor.
     * @var {componente} vista - Componente vista.
     * @var {aplicacion} aplicacion - Acceso a la clase de la aplicación.
     * @var {string} controladorServidor - Nombre del controlador de servidor. Por defecto, coincide con el nombre propio.
     * @var {Object} componentes - Componentes por nombre.
     * @var {componente[]} instanciasComponentes - Listado de todos los componentes.
     * @var {Object} valores - Valores a informar por `obtenerValores()`. Estos valores serán recuperados automáticamente por `ui.obtenerValores()`, por lo que,
     * entre otros casos, serán enviados automáticamente al servidor en eventos con prefijo `enviar:`.
     * @var {controlador} prototipo - Instancia de `controlador`.
     */
    this.nombre=null;
    this.servidor=null;
    this.vista=null;
    this.aplicacion=null;
    this.controladorServidor=null;
    this.componentes={};
    this.instanciasComponentes=[];
    this.valores={};
    this.prototipo=this;

    ////Acceso a propiedades    

    /**
     * Devuelve el nombre de la instancia.
     * @returns {string}
     */
    this.obtenerNombre=function() {
        return this.nombre;
    };

    /**
     * Devuelve la instancia del gestor de la interfaz con el servidor.
     * @returns {servidor}
     */
    this.obtenerServidor=function() {
        return this.servidor;
    };

    /**
     * Devuelve el nombre de la vista que está controlando actualmente.
     * @returns {string}
     */
    this.obtenerNombreVista=function() {
        return this.vista.obtenerNombreVista();
    };

    /**
     * Establece la instancia de la vista que está controlando actualmente.
     * @param {Componente} vista 
     * @returns {controlador}
     */
    this.establecerVista=function(vista) {
        this.vista=vista;
        return this;
    };

    /**
     * Establece la propiedad `aplicacion`.
     * @param {aplicacion} aplicacion 
     * @returns {controlador}
     */
    this.establecerAplicacion=function(aplicacion) {
        this.aplicacion=aplicacion;
        return this;
    };

    /**
     * Devuelve la instancia de la vista que está controlando actualmente.
     * @param {Componente} vista 
     */
    this.obtenerVista=function() {
        return this.vista;
    };

    /**
     * Devuelve el listado de componentes.
     * @returns {componente[]}
     */
    this.obtenerComponentes=function() {
        return this.instanciasComponentes;
    };

    /**
     * Devuelve la instancia de un componente.
     * @param {string} nombre - Nombre del componente.
     * @returns {(componente|null)}
     */
    this.obtenerComponente=function(nombre) {
        if(this.componentes.hasOwnProperty(nombre)) return this.componentes[nombre];
        return null;
    };

    /**
     * Agrega la instancia del componente al repositorio.
     * @param {componente} componente - Componente.
     * @returns {controlador}
     */
    this.agregarComponente=function(componente) {
        var nombre=componente.obtenerNombre();
        if(nombre) this.componentes[nombre]=componente;

        if(!~this.instanciasComponentes.indexOf(componente))
            this.instanciasComponentes.push(componente);
            
        return this;
    };
    
    /**
     * Elimina las referencias a la instancia del componente.
     * @param {componente} componente - Componente.
     * @returns {controlador}
     */
    this.removerComponente=function(componente) {
        var nombre=componente.obtenerNombre(),
            pos=this.instanciasComponentes.indexOf(componente);

        if(~pos) this.instanciasComponentes.splice(pos,1);

        if(nombre&&this.componentes.hasOwnProperty(nombre)&&this.componentes[nombre]==componente)
            delete this.componentes[componente];

        return this;
    };

    ////Gestión de la instancia

    /**
     * Establece el nombre de la instancia.
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
     * @memberof external:Object
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
     * Inicializa la instancia.
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
     * @returns {controlador}
     */
    this.establecerValores=function(obj) {
        this.valores=Object.assign(this.valores,obj);
        return this;
    };

    ////Eventos
    
    /**
     * Evento 'Inicializado'.
     */
    this.inicializado=function() {
    };
    
    /**
     * Evento 'Tamaño'.
     * @param {string} tamano - Tamaño actual (`'xl'`,`'lg'`,`'md'`,`'sm'`,`'xs'`).
     * @param {(string|null)} tamanoAnterior - Tamaño anterior (`'xl'`,`'lg'`,`'md'`,`'sm'`,`'xs'` o `null` si es la primer invocación al cargar la vista).
     */
    this.tamano=function(tamano,tamanoAnterior) {
    };
    
    /**
     * Evento 'Listo'.
     */
    this.listo=function() {
    };

    /**
     * Evento `fin`.
     */
    this.fin=function() {
    };
    
    /**
     * Evento 'Navegación'.
     * @param {string} nombreVista - Nombre de la vista de destino.
     */
    this.navegacion=function(nombreVista) {
    };
    
    /**
     * Evento 'Volver'.
     * @returns {boolean}
     */
    this.volver=function() {
    };

    /**
     * Evento 'Error Servidor'.
     */
    this.errorServidor=function() {
    };
}();

window["controlador"]=controlador;
