/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Campo.
 */
var componenteCampo=function() {    
    this.componente="campo";
    this.campo=null;

    /**
     * Propiedades de Botón.
     */
    this.propiedadesConcretas={
        "Estilo":{
            relleno:{
                etiqueta:"Texto de relleno",
                adaptativa:false
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.inicializado) return this; 
        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div>");
        this.campo=document.crear("<input class='form-control' type='text'>"); 
        this.elemento.anexar(this.campo);
        this.crearComponente();
        return this;
    };    

    /**
     * Inicializa la instancia en base a su ID y sus parámetros (método para sobreescribir).
     */
    this.restaurar=function() {
        this.restaurarComponente();
                
        this.campo=this.elemento.querySelector("input");

        return this;
    };

    /**
     * Devuelve o establece el valor del componente (método para sobreescribir).
     * @param {*} valor - Valor a establecer
     * @returns {*}
     */
    this.valor=function(valor) {
        if(typeof valor==="undefined") {
            return this.campo.valor();
        } else {
            this.campo.valor(valor);
            return this;
        }
    };

    /**
     * Actualiza el componente.
     */
    this.actualizar=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        if(propiedad=="relleno") {
            this.campo.atributo("placeholder",valor);
            return this;
        }

        this.actualizarComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };
};

ui.registrarComponente("campo",componenteCampo,configComponente.clonar({
    descripcion:"Campo de texto, número o contraseña",
    etiqueta:"Campo",
    grupo:"Formulario",
    icono:"campo.png"
}));