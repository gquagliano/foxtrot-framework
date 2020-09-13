/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * @class Componente concreto Campo.
 */
var componenteCampo=function() {    
    var t=this;
    
    this.componente="campo";

    /**
     * Propiedades de Campo.
     */
    this.propiedadesConcretas={
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
                etiqueta:"Valor inicial",
                adaptativa:false
            },
            relleno:{
                etiqueta:"Texto de relleno",
                adaptativa:false
            }
        },
        "Formato":{
            longitud:{
                etiqueta:"Longitud máxima",
                tipo:"numero",
                adaptativa:false
            },
            paso:{
                etiqueta:"Paso (campo numérico)",
                tipo:"numero",
                adaptativa:false
            },
            ocultarControl:{
                etiqueta:"Ocultar control ±",
                tipo:"bool",
                adaptativa:false
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 

        this.campo=this.elemento.querySelector("input,textarea");
        this.elementoEventos=this.campo;

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
     * Evento Intro.
     * @returns {Componente}
     */
    this.intro=function(ev) {
        if(!ui.enModoEdicion()) {
            //Enviar formulario con Enter
            var esTextarea=t.propiedad(null,"tipo")=="multilinea",
                manejador=t.propiedad(null,"intro");
            if(!manejador) { //Si hay un evento definido por el usuario, dejar que sea procesado
                if(!esTextarea) { //Campo multilínea no reacciona al enter
                    this.enviarFormulario();
                    ev.preventDefault();
                }
                //Detener evento, aunque sea multilínea
                ev.stopPropagation();
                return true;
            }
        }

        return this.introComponente(evento);
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

        if(propiedad=="deshabilitado") {
            //Aplicar al campo (por defecto se aplica al elemento)
            if(valor) {
                this.campo.propiedad("disabled",true);
            } else {
                this.campo.removerAtributo("disabled");
            }
            return this;
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };
};

ui.registrarComponente("campo",componenteCampo,configComponente.clonar({
    descripcion:"Campo de texto, número o contraseña",
    etiqueta:"Campo",
    grupo:"Formulario",
    icono:"campo.png"
}));