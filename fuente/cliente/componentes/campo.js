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
                    tinymce:"Editor (TinyMce)"
                },
                adaptativa:false
            },
            valorInicial:{
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

        if(this.propiedad("tipo")=="tinymce"&&!ui.enModoEdicion()) this.cargarTinymce();

        this.clasePadre.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div>");
        this.campo=document.crear("<input class='form-control' type='text'>"); 
        this.elemento.anexar(this.campo);
        this.clasePadre.crear.call(this);
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

        return this.clasePadre.intro.call(this,evento);
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

                var tipos={
                    texto:"text",
                    contrasena:"password",
                    numero:"number"
                };
                this.campo.atributo("type",tipos[valor]);
            }

            if(valor=="tinymce"&&!ui.enModoEdicion()) this.cargarTinymce();
        
            return this;
        } 
        
        if(propiedad=="valorInicial") {
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

        this.clasePadre.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
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
            } catch {}
        }

        return this.clasePadre.valor.call(this,valor);
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