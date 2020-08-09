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
     * Propiedades de Campo.
     */
    this.propiedadesConcretas={
        "Estilo":{
            relleno:{
                etiqueta:"Texto de relleno",
                adaptativa:false
            }
        },
        "Campo":{
            tipo:{
                etiqueta:"Tipo",
                tipo:"opciones",
                opciones:{
                    texto:"Texto",
                    multilinea:"Texto multilínea",
                    contrasena:"Contraseña",
                    numero:"Numérico"
                },
                adaptativa:false
            },
            valor:{
                etiqueta:"Valor inicial"
            }
        },
        "Formato":{
            longitud:{
                etiqueta:"Longitud máxima",
                tipo:"numero"
            },
            paso:{
                etiqueta:"Paso (campo numérico)",
                tipo:"numero"
            },
            ocultarControl:{
                etiqueta:"Ocultar control +/-",
                tipo:"bool"
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.inicializado) return this; 

        this.campo=this.elemento.querySelector("input");

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
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        if(propiedad=="relleno") {
            this.campo.atributo("placeholder",valor);
            return this;
        }

        if(propiedad=="tipo") {
            if(valor=="multilinea") {
                //Reemplazar por textarea

                this.campo.valor("");
                this.campo.outerHTML=this.campo.outerHTML.replace("<input ","<textarea ").replace(/type=".*?"/,"");

                //Debe actualizarse la referencia al campo luego de reemplazar el outerHTML
                this.campo=this.elemento.querySelector("textarea");
            } else {
                if(valorAnterior=="multilinea") {
                    //Reemplazar por input

                    this.campo.valor("");
                    this.campo.outerHTML=this.campo.outerHTML.replace("<textarea ","<input ").replace("</textarea>","");

                    //Debe actualizarse la referencia al campo luego de reemplazar el outerHTML
                    this.campo=this.elemento.querySelector("input");
                }

                var tipos={
                    texto:"text",
                    contrasena:"password",
                    numero:"number"
                };
                this.campo.atributo("type",tipos[valor]);
            }
        
            return this;
        } 
        
        if(propiedad=="valor") {
            this.campo.atributo("value",valor);
            return this;
        }
        
        if(propiedad=="longitud") {
            this.campo.propiedad("maxlength",valor);
            return this;
        }

        if(propiedad=="paso") {
            this.campo.propiedad("step",valor);
            return this;
        }

        if(propiedad=="ocultarControl") {
            if(valor) {
                this.campo.agregarClase("ocultar-control");
            } else {
                this.campo.removerClase("ocultar-control");
            }
            return this;
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };    

    /**
     * Da foco al componente.
     */
    this.foco=function() {
        this.campo.focus();
        return this;
    };
};

ui.registrarComponente("campo",componenteCampo,configComponente.clonar({
    descripcion:"Campo de texto, número o contraseña",
    etiqueta:"Campo",
    grupo:"Formulario",
    icono:"campo.png"
}));