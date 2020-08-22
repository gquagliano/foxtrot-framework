/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Campo desplegable.
 */
var componenteDesplegable=function() {   
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

        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div>");
        this.campo=document.crear("<select class='custom-select'>"); 
        this.elemento.anexar(this.campo);
        this.crearComponente();
        return this;
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

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
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
            valorInicial=this.propiedad(null,"valor"),
            t=this,
            fn=function(clave,valor) {
                var opcion=document.crear("option");
                opcion.valor(clave)
                    .establecerTexto(valor)
                    .anexarA(t.campo);
            };

        this.campo.querySelectorAll("option").remover();

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
            obj.forEach(function(clave,valor) {
                //Si valor es un objeto, se admite el uso de propiedadValor para determinar qué propiedad mostrar
                if(util.esObjeto(valor)&&propValor) valor=valor[propValor];

                fn(clave,valor);
            });
        }

        //Establecer valor inicial
        if(valorInicial) this.valor(valorInicial);

        return this;
    };
};

ui.registrarComponente("desplegable",componenteDesplegable,configComponente.clonar({
    descripcion:"Campo desplegable",
    etiqueta:"Desplegable",
    grupo:"Formulario",
    icono:"desplegable.png"
}));