/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * @class Componente concreto Contenedor.
 */
var componenteContenedor=function() {
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
        this.inicializarComponente();
        return this;
    };
    
    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='container'/>");
        this.crearComponente();
        return this;
    };
    
    /**
     * Actualiza el componente. propiedad puede estar definido tras la modificación de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(propiedad=="tipo") {
            this.elemento.removerClase(/(container|container-fluid)/);
            if(!valor||valor=="normal") {
                this.elemento.agregarClase("container");
            } else if(valor=="fluido") {
                this.elemento.agregarClase("container-fluid");
            }
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };
};

ui.registrarComponente("contenedor",componenteContenedor,configComponente.clonar({
    descripcion:"Contenedor",
    etiqueta:"Contenedor",
    grupo:"Estructura",
    icono:"contenedor.png"
}));

