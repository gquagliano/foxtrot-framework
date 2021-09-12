/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Campo.
 * @class
 * @extends componente
 */
var componenteCampo=function() {  
    "use strict";

    var t=this;
    
    this.componente="campo";
    this.tinymce=false;

    var ignorarTodaEntrada=false;

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
                    numero:"Numérico",
                    tinymce:"Editor (TinyMce)",
                    codigoBarras:"Código de barras"
                },
                adaptativa:false
            },
            valorInicial:{
                etiqueta:"Valor inicial",
                adaptativa:false,
                evaluable:true
            },
            relleno:{
                etiqueta:"Texto de relleno",
                adaptativa:false,
                evaluable:true
            },
            largoMaximo:{
                etiqueta:"Largo máximo",
                adaptativa:false,
                evaluable:true
            }
        },
        "Formato":{
            longitud:{
                etiqueta:"Longitud máxima",
                tipo:"numero",
                adaptativa:false,
                evaluable:true
            },
            paso:{
                etiqueta:"Paso (campo numérico)",
                tipo:"numero",
                adaptativa:false,
                evaluable:true
            },
            ocultarControl:{
                etiqueta:"Ocultar control ±",
                tipo:"bool",
                adaptativa:false,
                evaluable:true
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

        if(this.propiedad("tipo")=="tinymce"&&!ui.enModoEdicion()) this.cargarTinymce();

        if(!ui.enModoEdicion()) this.valor(null);       

        this.clasesCss.push("ocultar-control");

        this.prototipo.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div>");
        this.campo=document.crear("<input class='form-control' type='text'>"); 
        this.elemento.anexar(this.campo);
        this.prototipo.crear.call(this);
        return this;
    };

    var eventoKeydown=function(ev) {
        if(ignorarTodaEntrada) {console.log(1);
            ev.preventDefault();
            ev.stopPropagation();
            return;
        }
    };

    /**
     * Establece los eventos predeterminados.
     */
    this.establecerEventos=function() {
        this.prototipo.establecerEventos.call(this);
        this.campo.removerEvento("keydown",eventoKeydown)
            .evento("keydown",eventoKeydown);
        return this;
    };    

    /**
     * Evento Intro.
     * @returns {Componente}
     */
    this.intro=function(ev) {
        if(!ui.enModoEdicion()) {
            //Enviar formulario con Enter
            var tipo=t.propiedad(null,"tipo"),
                esTextarea=tipo=="multilinea",
                esCodigo=tipo=="codigoBarras",
                controlador=t.propiedad(null,"intro");
            if(esCodigo) {
                //Si es un campo de código de barras, nunca enviar el formulario
                
                //Además, ignorar toda entrada siguiente por unos milisegundos, esto se hace por compatibilidad con algunos lectores
                //de códigos de barras que envían información adicional al final y pueden causar problemas (ej. lector Bematech envía dos caracteres
                //adicionales según el tipo de código que pueden causar acciones en el navegador, como abrir la pestaña de Descargas).
                ignorarTodaEntrada=true;
                setTimeout(function() {
                    ignorarTodaEntrada=false;
                },800);
            } else if(!controlador) {
                //Para cualquier otro tipo excepto multilínea, si no hay un controlador asignado enviar el formulario
                if(!esTextarea) {
                    this.enviarFormulario();
                    ev.preventDefault();
                }
                ev.stopPropagation();
                return true;
            }
        }

        return this.prototipo.intro.call(this,evento);
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(!ui.enModoEdicion()||!expresion.contieneExpresion(valor)) {
	        if(propiedad=="relleno") {
	            this.campo.atributo("placeholder",valor);
	            return this;
	        }

	        if(propiedad=="tipo") {
	            if(valor=="multilinea"||valor=="tinymce") {
	                //Reemplazar por textarea

	                this.campo.valor("");
	                this.campo.outerHTML=this.campo.outerHTML.replace("<input ","<textarea ").replace(/type=".*?"/,"");

	                //Debe actualizarse la referencia al campo luego de reemplazar el outerHTML
	                this.campo=this.elemento.querySelector("textarea");
	            } else {
	                if(valorAnterior=="multilinea"||valor=="tinymce") {
	                    //Reemplazar por input

	                    this.campo.valor("");
	                    this.campo.outerHTML=this.campo.outerHTML.replace("<textarea ","<input ").replace("</textarea>","");

	                    //Debe actualizarse la referencia al campo luego de reemplazar el outerHTML
	                    this.campo=this.elemento.querySelector("input");
	                }

	                if(!valor) valor="text";
	                var tipos={
	                    texto:"text",
	                    codigoBarras:"text",
	                    contrasena:"password",
	                    numero:"number"
	                };
	                this.campo.atributo("type",tipos[valor]);
	            }

	            if(valor=="tinymce"&&!ui.enModoEdicion()) this.cargarTinymce();
	        
	            return this;
	        } 
	        
	        if(propiedad=="valorInicial") {
	            this.campo.valor(valor);
	            return this;
	        }
	        
	        if(propiedad=="longitud"&&!isNaN(valor)) {
	            this.campo.propiedad("maxlength",valor);
	            return this;
	        }

	        if(propiedad=="paso"&&/^[0-9\.]+$/.test(valor)) {
	            this.campo.propiedad("step",valor);
	            return this;
	        }

	        if(propiedad=="ocultarControl") {
	            if(valor===true||valor===1||valor==="1") {
	                this.campo.agregarClase("ocultar-control");
	            } else {
	                this.campo.removerClase("ocultar-control");
	            }
	            return this;
	        }

	        if(propiedad=="deshabilitado") {
	            //Aplicar al campo (por defecto se aplica al elemento)
	            if(valor===true||valor===1||valor==="1") {
	                this.campo.propiedad("disabled",true);
	            } else {
	                this.campo.removerAtributo("disabled");
	            }
	            return this;
	        }

	        if(propiedad=="largoMaximo") {
	            if(valor) {
	                this.campo.atributo("maxlength",valor);
	            } else {
	                this.campo.removerAtributo("maxlength");
	            }
	            return this;
	        }
	    }

        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Devuelve o establece el valor del campo.
     * @param {*} [valor] - Valor a establecer. Si se omite, devolverá el valor actual.
     * @returns {(*|undefined)}
     */
    this.valor=function(valor) {
        //Sincronizar el editor con el campo, si corresponde
        var sincronizarTinymce=this.campo&&this.tinymce&&typeof tinyMCE!=="undefined";
        if(sincronizarTinymce) {
            try {
                if(typeof valor!=="undefined") {
                    //Tras establecer el valor
                        this.obtenerTinymce().setContent(valor);
                } else {
                    //También al leer el valor
                    tinyMCE.triggerSave();
                }
            } catch(x) {}
        }

        //Si es null, volver al valor inicial (puede contener expresiones)
        if(valor===null) valor=this.propiedad("valorInicial");

        if(this.campo.atributo("type")=="number") {
            if(typeof valor=="undefined")
                return this.campo.valueAsNumber;
            if(!isNaN(valor)&&parseFloat(valor)!==this.campo.valueAsNumber)
                this.campo.value=valor;
            return this;
        }

        return this.prototipo.valor.call(this,valor);
    };

    /**
     * Carga y configura el editor de texto.
     * @returns {componente}
     */
    this.cargarTinymce=function() {
        ui.obtenerInstanciaModulo("tinymce").crear({
            target:this.campo,
            language:"es",
            plugins:"table paste lists advlist link image imagetools contextmenu spellchecker",
            menubar:false,
            statusbar:false,
            toolbar:"undo redo | bold italic | link | bullist numlist"
        });
        this.tinymce=true;
        return this;
    };

    /**
     * Remueve el editor de texto.
     * @returns {componente}
     */
    this.removerTinymce=function() {
        var obj=this.obtenerTinymce();
        if(obj) obj.remove();
        this.tinymce=false;
        return this;
    };

    /**
     * Devuelve la instancia de TinyMCE.
     * @returns {(Object|null)}
     */
    this.obtenerTinymce=function() {
        if(!this.tinymce||typeof tinymce==="undefined") return null;
        return tinymce.get(this.campo.atributo("id"));
    };
};

ui.registrarComponente("campo",componenteCampo,configComponente.clonar({
    descripcion:"Campo de texto, número o contraseña",
    etiqueta:"Campo",
    grupo:"Formulario",
    icono:"campo.png"
}));