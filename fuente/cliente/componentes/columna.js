/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Columna.
 * @class
 * @extends componente
 */
var componenteColumna=function() {
    "use strict";

    this.componente="columna";

    this.propiedadesConcretas={
        "Columna":{
            columna:{
                etiqueta:"Tamaño",
                tipo:"numero",
                ayuda:"Tamaño en proporción de la grilla de 12 columnas de Bootstrap. Pueden utilizarse las propiedades de Flexbox para establecer dimensiones personalizadas."
            }
            //nombre:{
            //    etiqueta
            //    tipo (predeterminado texto|multilinea|opciones|color|numero)
            //    opciones (array {valor,etiqueta} cuando tipo=opciones)
            //    grupo
            //}
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this;
        this.contenedor=this.elemento;
        this.prototipo.inicializar.call(this);

        this.clasesCss.push(/^col-.+/);

        return this;
    };
    
    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='col-sm-3 contenedor'/>");
        this.prototipo.crear.call(this);
        return this;
    };
    
    /**
     * Actualiza el componente. propiedad puede estar definido tras la modificación de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        var e=this.elemento;

        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(expresion.contieneExpresion(valor)&&ui.enModoEdicion()) valor=null;

        if(propiedad=="columna") {
            //Debemos remover todos los col-* y volver a generarlos en el orden correcto, no podemos simplemente desactivar y activar las clases de a una
            e.removerClase(/col-.+/);
            var tamanos=this.propiedadObj(propiedad);
            ["g","sm","md","lg","xl"].forEach(function(p) {
                if(tamanos.hasOwnProperty(p)&&!isNaN(tamanos[p])) e.agregarClase("col-"+(p=="g"?"":p+"-")+tamanos[p]);
            });
        }

        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };
};

ui.registrarComponente("columna",componenteColumna,configComponente.clonar({
    descripcion:"Columna",
    etiqueta:"Columna",
    grupo:"Estructura",
    icono:"celda.png"
}));

