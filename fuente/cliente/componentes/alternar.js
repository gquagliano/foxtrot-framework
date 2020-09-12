/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Campo de alternar.
 */
var componenteAlternar=function() {    
    this.componente="alternar";
    this.contenidoEditable=true; 

    /**
     * Propiedades de Alternar.
     */
    this.propiedadesConcretas={
        "Campo":{
            valor:{
                etiqueta:"Valor inicial",
                adaptativa:false
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 

        this.campo=this.elemento.querySelector("input");
        this.elementoEditable=this.elemento.querySelector("label");

        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='custom-control custom-switch'>");

        this.campo=document.crear("<input type='checkbox' class='custom-control-input' id='checkbox-"+this.id+"'>");

        this.elementoEditable=document.crear("<label class='custom-control-label' for='checkbox-"+this.id+"'>Activar</label>");

        this.elemento.anexar(this.campo);
        this.elemento.anexar(this.elementoEditable);

        this.crearComponente();
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;
        
        if(propiedad=="valor") {
            if(valor) {
                this.campo.atributo("checked",true);
            } else {
                this.campo.removerAtributo("checked");
            }
            return this;
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Establece o devuelve el valor del componente.
     * @param {boolean} [valor] - Valor a establecer.
     * @returns {(boolean|componente)}
     */
    this.valor=function(valor) {
        if(typeof valor==="undefined") return this.campo.valor();
        this.campo.valor(valor);
        return this;
    };
};

ui.registrarComponente("alternar",componenteAlternar,configComponente.clonar({
    descripcion:"Campo de alternar",
    etiqueta:"Alternar",
    grupo:"Formulario",
    icono:"alternar.png"
}));