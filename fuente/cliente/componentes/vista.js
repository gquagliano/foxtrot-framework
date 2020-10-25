/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Vista.
 * @class
 * @extends componente
 */
var componenteVista=function() {   
    "use strict";

    this.componente="vista";
    this.arrastrable=false;
    this.nombreControlador=null;  

    this.propiedadesConcretas={
        "Metadatos":{
            titulo:{
                etiqueta:"Título",
                adaptativa:false
            },
            descripcion:{
                etiqueta:"Descripción",
                adaptativa:false
            },
            palabrasClave:{
                etiqueta:"Palabras clave",
                adaptativa:false
            },
            imagen:{
                etiqueta:"Imagen (OG)",
                adaptativa:false
            }
        },
        "Comportamiento":{
            precarga:{
                etiqueta:"Precarga visible",
                tipo:"logico",
                adaptativa:false
            }
        }
    };  

    /**
     * Devuelve el nombre del controlador actual de la vista.
     */
    this.obtenerNombreControlador=function() {
        return this.nombreControlador;
    };

    /**
     * Establece el nombre del controlador actual de la vista.
     * @param {string} nombre 
     */
    this.establecerControlador=function(nombre) {
        this.nombreControlador=nombre;
    };

    this.inicializar=function() {
        this.contenedor=this.elemento;
        return this.inicializarComponente();
    };
    
    /**
     * Inicializa la instancia en base a su ID y sus parámetros.
     */
    this.restaurar=function() {
        //Si el elemento no se encuentra por id, asignar como elemento el cuerpo de la página (caso vista nueva)
        var body=ui.obtenerDocumento().body;
        this.elemento=body.querySelector("[data-fxid='"+this.id+"']");
        if(!this.elemento) this.elemento=body.querySelector("#foxtrot-cuerpo");

        this.restaurarComponente();
        return this;
    };
    
    /**
     * Actualiza el componente tras la modificación de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        //TODO Estas propiedades deberían aceptar expresiones, las cuales se actualizarían al cargar la página o modificarse el origen de datos, puede quedar como algo configurable en cada propiedad (que el usario elija si debe o no aceptar expresiones para evitar procesar todo cada vez)

        if(propiedad=="titulo") {
            ui.obtenerDocumento().title=valor;
            return this;
        }
        
        if(propiedad=="descripcion"||propiedad=="palabrasClave") {
            var nombres={
                descripcion:"description",
                palabrasClave:"keywords"
            };
            var doc=ui.obtenerDocumento(),
                elem=doc.querySelector("meta[name='"+nombres[propiedad]+"']");
            if(!elem) elem=doc.crear("<meta name='"+nombres[propiedad]+"'>").anexarA(doc.head);
            elem.propiedad("content",valor);
            return this;
        }
        
        if(propiedad=="imagen") {
            var doc=ui.obtenerDocumento(),
                elem=doc.querySelector("meta[property='og:image']");
            if(!elem) elem=doc.crear("<meta property='og:image'>").anexarA(doc.head);
            elem.propiedad("content",valor);
            return this;
        }
        
        if(propiedad=="precarga") {
            var doc=ui.obtenerDocumento();
            if(valor) {
                ui.obtenerCuerpo().insertarDespues(doc.crear("<div id='foxtrot-precarga' class='visible'>"));
            } else {
                var elem=doc.querySelector("#foxtrot-precarga");
                if(elem) elem.remover();
            }
            return this;
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };
};

ui.registrarComponente("vista",componenteVista,configComponente.clonar({
    descripcion:"Vista",
    etiqueta:"Vista"
}));