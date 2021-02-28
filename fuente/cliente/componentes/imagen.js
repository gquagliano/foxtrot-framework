/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Imagen.
 * @class
 * @extends componente
 */
var componenteImagen=function() {
    "use strict";

    var t=this;

    this.componente="imagen";

    //Ícono del componente como se encuentra en recursos/componentes/img en base64
    var icono="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAN5JREFUeNpi/P//PwMtAeOoBURbEJ9b4wGkZgOxDIVmPgbitIWTW3aAOExIErOoYDgIyELNAgMWNAkGoM2MlJgODIn/MLPQfUATMGoBQcBCZkQKQ5N0LDBRfKXIB0DDLND4nEBqMxAHAvEUioIIaJgrkDoCpDugfJD6xUBsCVWSABRLIMsCoEYFILUCiJmBuBzIbwDSvUAcjKZ0ClBOmyQLgBo4gNQaIBZCEq4H4gIsyrmBeBVQDzfRkQyMuB9AymTIJVNQKSgLLUsoBY+x+SANWYLS4nq0yhw8FgAEGABnFE5SPUVGtgAAAABJRU5ErkJggg==";
    
    /**
     * Archivo seleccionado en la propiedad 'importar'.
     * @param {componente} componente - Componente.
     * @param {string} tamano - Tamaño de pantalla.
     * @param {string} propiedad - Nombre de la propiedad.
     * @param {FileList} archivos - Objeto del evento (solo en tipo=archivo).
     */
    var archivoSeleccionado=function(componente,tamano,propiedad,archivos) {
        if(archivos.length==0) return;
        util.archivoADataUrl(archivos[0],function(valor) {
            componente.propiedad(tamano,"origen",valor);
            //Forzar al editor que recargue las propiedades para reflejar el nuevo valor de 'origen'.
            if(ui.enModoEdicion()) editor.construirPropiedades();
        });
    };

    this.propiedadesConcretas={
        "Imagen":{
            //nombre:{
            //    etiqueta
            //    tipo (predeterminado texto|multilinea|opciones|color|numero)
            //    opciones (array {valor,etiqueta} cuando tipo=opciones)
            //    placeholder
            //    funcion
            //    ayuda
            //    adaptativa (predeterminado true)
            //}
            origen:{
                etiqueta:"Origen",
                ayuda:"URL absoluta o relativa al directorio de imagenes de la aplicación."
            },
            alt:{
                etiqueta:"Texto alternativo",
                adaptativa:false
            },
            importar:{
                etiqueta:"Embeber archivo",
                tipo:"archivo",
                funcion:archivoSeleccionado
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this;
        this.establecerOrigen();
        this.prototipo.inicializar.call(this);
        return this;
    };
    
    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<img src='"+icono+"'>");
        return this.prototipo.crear.call(this);
    };

    /**
     * Establece el atributo `src` de la imagen según el tamaño de pantalla.
     * @param {string} [tamano] - Tamaño actual.
     */
    this.establecerOrigen=function(tamano) {
        if(typeof tamano==="undefined") tamano=ui.obtenerTamano();
        if(!this.elemento) return;
        
        var origenes=this.propiedadObj("origen");
        if(!origenes) return;

        var origen=origenes.hasOwnProperty("g")?origenes.g:null, //Comenzar en 'g'
            tamanosPantalla=ui.obtenerArrayTamanos();

        for(var i=0;i<tamanosPantalla.length;i++) {
            var t=tamanosPantalla[i];
            if(origenes.hasOwnProperty(t)) origen=origenes[t];
            //Continuar hasta llegar al tamaño actual
            if(t==tamano) break;
        }

        if(origen) origen=this.evaluarExpresion(origen);
        
        //Mostrar imagen de relleno, si corresponde
        if(!origen) {
            if(ui.enModoEdicion()) {
                this.elemento.atributo("src",icono);
            } else {
                this.elemento.removerAtributo("src");
            }
        } else {
            this.elemento.atributo("src",origen);
        }
    };
    
    /**
     * Evento 'Tamaño'.
     * @param {string} tamano - Tamaño actual.
     * @param {(string|null)} tamanoAnterior - Tamaño anterior.
     */
    this.tamano=function(tamano,tamanoAnterior) {
        this.establecerOrigen(tamano);
        return this.prototipo.tamano.call(this,tamano,tamanoAnterior);
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(expresion.contieneExpresion(valor)&&ui.enModoEdicion()) valor=null;

        if(propiedad=="origen") {
            //TODO Si es una ruta relativa, anexar la URL al directorio de imágenes de la aplicación
            this.establecerOrigen();
            return this;
        }
        
        if(propiedad=="alt") {
            this.elemento.atributo("alt",valor);
            return this;
        }
        
        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.actualizar=function() {
        this.prototipo.actualizar.call(this,false);
        
        this.actualizacionEnCurso=true;

        this.establecerOrigen();
        
        this.actualizacionEnCurso=false;

        return this;
    };

    /**
     * Evento `editor`.
     * @returns {Componente}
     */
    this.editor=function() {      
        this.elemento.onerror=function() {
            this.src=icono;
        };
        this.establecerOrigen();
        return this.prototipo.editor.call(this);
    };    

    /**
     * Evento `editorDesactivado`.
     * @returns {Componente}
     */
    this.editorDesactivado=function() {
        //Remover imagen de relleno
        this.elemento.removerAtributo("src");
        return this.prototipo.editorDesactivado.call(this);
    };
};

ui.registrarComponente("imagen",componenteImagen,configComponente.clonar({
    descripcion:"Imagen",
    etiqueta:"Imagen",
    icono:"imagen.png"
}));