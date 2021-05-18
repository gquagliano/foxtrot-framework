/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Contenedor.
 * @class
 * @extends componente
 */
var componenteContenedor=function() {
    "use strict";

    this.componente="contenedor";

    this.propiedadesConcretas={
        "Contenedor":{
            tipo:{
                etiqueta:"Tipo",
                tipo:"opciones",
                opciones:{
                    normal:"Normal",
                    fluido:"Fluido",
                    bloque:"Bloque"
                },
                adaptativa:false,
                ayuda:"Establecer a Bloque para una etiqueta <div> sin restricción de ancho."
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this;
        this.contenedor=this.elemento;

        this.clasesCss=this.clasesCss.concat("container","container-fluid");

        this.prototipo.inicializar.call(this);
        return this;
    };
    
    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='container'/>");
        this.prototipo.crear.call(this);
        return this;
    };
    
    /**
     * Actualiza el componente. propiedad puede estar definido tras la modificación de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(expresion.contieneExpresion(valor)&&ui.enModoEdicion()) valor=null;

        if(propiedad=="tipo") {
            this.elemento.removerClase(/(container|container-fluid)/);
            if(!valor||valor=="normal") {
                this.elemento.agregarClase("container");
            } else if(valor=="fluido") {
                this.elemento.agregarClase("container-fluid");
            }
        }

        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };
};

ui.registrarComponente("contenedor",componenteContenedor,configComponente.clonar({
    descripcion:"Contenedor",
    etiqueta:"Contenedor",
    grupo:"Estructura",
    icono:"contenedor.png"
}));

