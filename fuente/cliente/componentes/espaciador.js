/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Espaciador.
 * @class
 * @extends componente
 */
var componenteEspaciador=function() { 
    "use strict";

    this.componente="espaciador";

    this.propiedadesConcretas={
        "Comportamiento":{
            tipo:{
                etiqueta:"Tipo",
                tipo:"opciones",
                opciones:{
                    horizontal:"Horizontal",
                    vertical:"Vertical"
                }
            },
            borde:{
                etiqueta:"Borde",
                tipo:"bool",
                clase:"borde"
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.clasePadre.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='espaciador horizontal'></div>"); 
        this.clasePadre.crear.call(this);
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(expresion.contieneExpresion(valor)&&ui.enModoEdicion()) valor=null;

        if(propiedad=="tipo") {
            this.elemento.removerClase("horizontal vertical");
            if(valor) this.elemento.agregarClase(valor);
            return this;
        }

        if(propiedad=="borde") {
            if(valor!==true&&valor!==1) {
                this.elemento.removerClase("con-borde");
            } else {
                this.elemento.agregarClase("con-borde");
            }
            return this;
        }

        this.clasePadre.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };
};

ui.registrarComponente("espaciador",componenteEspaciador,configComponente.clonar({
    descripcion:"Espaciador horizontal o vertical",
    etiqueta:"Espacio",
    icono:"espaciador.png"
}));