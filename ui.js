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

    var componentesRegistrados={},
        instanciasComponentes=[],
        instanciasComponentesId={},
        instanciasComponentesNombre={},
        modoEdicion=false,
        id=1;

    this._nombreDatoId="fxid";

    var doc=document,
        body=document.body,
        cuerpo=doc.querySelector("#foxtrot-cuerpo"),
        estilos=doc.querySelector("#foxtrot-estilos");

    this.obtenerCuerpo=function() {
        return cuerpo;
    };

    this.obtenerElementoEstilos=function() {
        return estilos;
    };

    this.obtenerEstilos=function(selector) {
        if(util.esIndefinido(selector)) selector=null;

        var reglas=[];
        for(var i in estilos.sheet.cssRules) {
            if(!estilos.sheet.cssRules.hasOwnProperty(i)) continue;
            var regla=estilos.sheet.cssRules[i];

            var obj={
                selector:regla.selectorText,
                estilos:regla.style,
                texto:regla.style.cssText,
                indice:i
            };

            if(selector&&regla.selectorText==selector) return obj;
            
            reglas.push(obj);
        }

        return selector?null:reglas;
    };

    this.establecerEstilos=function(css) {
        estilos.innerText=css;
        return this;
    };

    this.establecerEstilosSelector=function(selector,css) {
        for(var i in estilos.sheet.cssRules) {
            if(!estilos.sheet.cssRules.hasOwnProperty(i)) continue;

            var regla=estilos.sheet.cssRules[i];

            if(selector==regla.selectorText) {
                estilos.sheet.deleteRule(i);
                break;
            }
        };
        estilos.sheet.insertRule(selector+"{"+css+"}",estilos.sheet.cssRules.length);
        return this;
    };

    this.generarId=function() {
        return id++;
    };

    this.registrarComponente=function(nombre,funcion,configuracion) {
        configuracion.nombre=nombre;
        componentesRegistrados[nombre]={
            fn:funcion,
            config:configuracion
        };
    };

    this.obtenerConfigComponente=function(nombre) {
        return componentesRegistrados[nombre].config;
    };

    this.obtenerComponentes=function() {
        return componentesRegistrados;
    };

    /**
     * Crea una instancia de un componente dado su nombre.
     */
    this.crearComponente=function(nombre) {
        var obj=new componentesRegistrados[nombre].fn,
            id=this.generarId();
        obj.establecerId(id);
        
        var i=instanciasComponentes.push(obj);
        //Índices
        instanciasComponentesId[id]=i-1;

        return obj;
    };

    /**
     * Devuelve las instancias de los componentes existentes.
     */
    this.obtenerInstanciasComponentes=function() {
        return instanciasComponentes;
    };

    this.establecerModoEdicion=function(valor) {
        modoEdicion=valor;
        body.alternarClase("foxtrot-modo-edicion");
    };

    this.enModoEdicion=function() {
        return modoEdicion;
    };    

    /**
     * Devuelve el HTML de la vista.
     */
    this.obtenerHtml=function() {
        return editor.limpiarHtml(cuerpo.innerHTML);
    };

    /**
     * Devuelve el CSS de la vista.
     */
    this.obtenerCss=function() {
        var css="";
        this.obtenerEstilos().forEach(function(regla) {
            css+=regla.selector+"{"+regla.texto+"}";
        });
        return css;        
    };

    /**
     * Genera y devuelve un JSON con las relaciones entre el DOM y los componentes.
     */
    this.obtenerJson=function() {
        var resultado={
            ver:1,
            componentes:[],
            vista:{
                nombre:null,
                parametros:{}
            }
        };

        instanciasComponentes.forEach(function(obj) {
            resultado.componentes.push({
                id:obj.id,
                nombre:obj.nombre,
                componente:obj.componente,
                parametros:obj.obtenerParametros()
            });
        });

        return JSON.stringify(resultado);
    };

    /**
     * Inserta el código html en el cuerpo del editor. Este método solo debería utilizarse en modo edición.
     */
    this.reemplazarHtml=function(html) {
        cuerpo.innerHTML=html;
        return this;        
    };

    /**
     * Establece e inicializa l a vista y sus componentes dado su json.
     */
    this.establecerJson=function(json) {
        json=JSON.parse(json);
        
        json.componentes.forEach(function(componente) {
            ui.crearComponente(componente.componente)
                .establecerId(componente.id)
                .establecerNombre(componente.nombre)
                .establecerParametros(componente.parametros)
                .restaurar();
        });

        return this;  
    };

    /**
     * Devuelve la instancia de un componente dado su ID o elemento del DOM.
     */
    this.obtenerInstanciaComponente=function(param) {
        var id;
        if(typeof param==="number") {
            id=param;
        } else {
            id=param.dato(this._nombreDatoId);
        }
        if(!id||!instanciasComponentesId.hasOwnProperty(id)) return null;
        return instanciasComponentes[instanciasComponentesId[id]];
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
    aceptaHijos: true,
    grupo:null
};

/**
 * Plantilla para los objetos que contienen la relación entre elementos del DOM e instancias de componentes.
 */
var elementoComponente={
    elemento:null,
    contenedor:null,
    instancia:null
};

window["ui"]=ui;
window["componentes"]={};