/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Campo desplegable.
 * @class
 * @extends componente
 */
var componenteDesplegable=function() {   
    "use strict";

    var t=this;
    
    this.componente="desplegable";
    this.opciones=null;

    /**
     * Propiedades de Campo.
     */
    this.propiedadesConcretas={
        "Desplegable":{
            opciones:{
                etiqueta:"Opciones",
                adaptativa:false,
                ayuda:"Expresión que resulte en un objeto a ser utilizado como listado de opciones."
            },
            valor:{
                etiqueta:"Valor inicial",
                adaptativa:false
            },
            propiedadClave:{
                etiqueta:"Propiedad clave",
                adaptativa:false
            },
            propiedadEtiqueta:{
                etiqueta:"Propiedad a mostrar",
                adaptativa:false
            },
            opcional:{
                etiqueta:"Opcional",
                tipo:"logico",
                adaptativa:false,
                ayuda:"Agrega una opción en blanco al comienzo del listado."
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 

        this.campo=this.elemento.querySelector("select");
        this.elementoEventos=this.campo;

        this.clasePadre.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div>");
        this.campo=document.crear("<select class='custom-select'>"); 
        this.elemento.anexar(this.campo);
        this.clasePadre.crear.call(this);
        return this;
    };

    /**
     * Evento Listo.
     */
    this.listo=function() {
        if(ui.enModoEdicion()) return;
        
        //Establecer opciones a partir de la propiedad opciones, si está asignada
        var valor=this.propiedad(null,"opciones");
        if(valor) {
            valor=ui.evaluarExpresion(valor);
            if(typeof valor==="object") this.establecerOpciones(valor);
        }
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        if(!ui.enModoEdicion()) {
            if(propiedad=="opciones") {
                this.establecerOpciones(valor);
                return this;
            }

            if(propiedad=="propiedadClave"||propiedad=="propiedadEtiqueta") {
                //Actualizar opciones
                this.establecerOpciones(this.opciones);
                return this;
            }
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
     * Establece las opciones del desplegable.
     * @param {(Object|Object[])} obj - Listado u objeto.
     * @returns {Componente}
     */
    this.establecerOpciones=function(obj) {
        this.opciones=obj;

        var propClave=this.propiedad(null,"propiedadClave"),
            propValor=this.propiedad(null,"propiedadEtiqueta"),
            valor=this.campo.valor(),
            valorInicial=this.propiedad(null,"valor"),
            t=this,
            fn=function(clave,valor) {
                var opcion=document.crear("option");
                opcion.valor(clave)
                    .establecerTexto(valor)
                    .anexarA(t.campo);
            };

        this.campo.querySelectorAll("option").remover();

        if(this.propiedad("opcional")) fn("","");

        if(util.esArray(obj)) {
            obj.forEach(function(valor,indice) {
                //Por defecto, usar el índice como clave
                var clave=indice;

                if(util.esObjeto(valor)) {
                    //Si valor es un objeto, se admite el uso de propiedadClave y propiedadValor
                    if(propClave) clave=valor[propClave];
                    if(propValor) valor=valor[propValor];
                }

                fn(clave,valor);
            });
        } else if(util.esObjeto(obj)) {
            obj.porCada(function(clave,valor) {
                //Si valor es un objeto, se admite el uso de propiedadValor para determinar qué propiedad mostrar
                if(util.esObjeto(valor)&&propValor) valor=valor[propValor];

                fn(clave,valor);
            });
        }

        if(valor) {
            //Reesstablecer valor
            this.valor(valor);
        } else if(valorInicial) {
            //O establecer valor inicial
            this.valor(valorInicial);
        }

        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.actualizar=function() {
        //Reconstruir opciones
        this.listo();

        return this.clasePadre.actualizar.call(this);
    };

    /**
     * Devuelve el objeto correspondiente al item seleccionado.
     * @returns {(Object|null)}
     */
    this.obtenerItem=function() {
        var valor=this.campo.valor(),
            propClave=this.propiedad("propiedadClave");

        if(util.esArray(this.opciones)) {
            for(var i=0;i<this.opciones.length;i++) {
                if(util.esObjeto(this.opciones[i])) {
                    if(this.opciones[i].hasOwnProperty(propClave)&&this.opciones[i][propClave]==valor) return this.opciones[i];
                } else if(i==valor) {
                    return this.opciones[i];
                }
            }
        } else if(util.esObjeto(this.opciones)) {
            for(var clave in this.opciones) {
                if(!this.opciones.hasOwnProperty(clave)||!this.opciones[clave].hasOwnProperty(propClave)) continue;
                if(this.opciones[clave][propClave]==valor) return this.opciones[clave];
            }
        }

        return null;
    };
};

ui.registrarComponente("desplegable",componenteDesplegable,configComponente.clonar({
    descripcion:"Campo desplegable",
    etiqueta:"Desplegable",
    grupo:"Formulario",
    icono:"desplegable.png"
}));