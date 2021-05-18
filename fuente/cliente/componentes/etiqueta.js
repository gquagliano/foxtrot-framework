/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Etiqueta.
 * @class
 * @extends componente
 */
var componenteEtiqueta=function() {
    "use strict";

    this.componente="etiqueta";

    /**
     * Propiedades de Etiqueta.
     */
    this.propiedadesConcretas={
        "Etiqueta":{
            contenido:{
                etiqueta:"Contenido",
                adaptativa:false,
                ayuda:"Admite expresiones."
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 

        this.clasesCss=this.clasesCss.concat("etiqueta");

        this.prototipo.inicializar.call(this);
        return this;
    };
    
    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<span class='etiqueta'/>");
        this.prototipo.crear.call(this);
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.actualizar=function() {
        this.prototipo.actualizar.call(this,false);
        
        this.actualizacionEnCurso=true;

        var propiedad=this.propiedad(false,"propiedad"),
            contenido=this.propiedad(false,"contenido"),
            resultado="";

        if(this.datos) {
            if(propiedad) {
                //Como propiedad específica
                resultado=util.obtenerPropiedad(this.datos,propiedad);
            } else if(contenido) {
                //Como expresion
                resultado=this.evaluarExpresion(contenido);
            }

            if(typeof resultado==="undefined"||typeof resultado==="object"||typeof resultado==="function") resultado=""; //Evitar 'undefined' u otros valores
            this.elemento.establecerHtml(resultado);
        }
        
        this.actualizacionEnCurso=false;

        return this;
    };

    /**
     * Reemplaza el contenido del componente.
     * @param {string} html - Contenido.
     * @returns {Componente}
     */
    this.establecerHtml=function(html) {
        this.elemento.establecerHtml(html);
        return this;
    };

    /**
     * Reemplaza el contenido del componente como texto plano (sin HTML).
     * @param {string} texto - Contenido.
     * @returns {Componente}
     */
    this.establecerTexto=function(texto) {
        this.elemento.establecerTexto(texto);
        return this;
    };
    
    /**
     * Establece el origen de datos.
     * @param {Object} obj - Objeto a asignar.
     * @param {boolean} [actualizar=true] - Actualizar el componente luego de establecer el origen de datos.
     * @returns Componente
     */
    this.establecerDatos=function(obj,actualizar) {
        //Ignorar propiedad, ya que esta puede variar cuando se genera el contenido de la etiqueta
        this.prototipo.establecerDatos.call(this,obj,actualizar,false,true);
        return this;
    };

    /**
     * Establece el valor del componente.
     * @param {*} [valor] - Valor a establecer.
     * @returns {(undefined|componente)}
     */
    this.valor=function(valor) {
        if(typeof valor==="undefined") return;
        
        //Cuando se asigne un valor, establecer como origen de datos
        this.establecerDatos(valor);
        
        return this;
    };
};

ui.registrarComponente("etiqueta",componenteEtiqueta,configComponente.clonar({
    descripcion:"Etiqueta",
    etiqueta:"Etiqueta",
    grupo:"Control",
    icono:"etiqueta.png"
}));