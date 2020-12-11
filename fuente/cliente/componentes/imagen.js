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

    this.img=null;

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

        this.img=this.elemento.querySelector("img");

        this.img.onerror=function() {
            this.src=icono;
        };

        this.clasePadre.inicializar.call(this);
        return this;
    };
    
    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<picture/>");
        this.img=document.crear("<img src='"+icono+"'>").anexarA(this.elemento);
        this.clasePadre.crear.call(this);
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(expresion.contieneExpresion(valor)&&ui.enModoEdicion()) valor=null;

        if(propiedad=="origen") {
            //TODO Si es una ruta relativa, anexar la URL al directorio de imágenes de la aplicación
            
            if(tamano=="g") {
                this.img.atributo("src",typeof valor==="string"&&valor.trim()!=""?valor:icono);
            } else {
                //Construir <source>s

                this.elemento.querySelectorAll("source").remover();

                var elem=this.elemento,
                    img=this.img,
                    origenes=this.propiedadObj("origen"),
                    anchosPantalla=ui.obtenerTamanos();
                if(origenes) {
                    ui.obtenerArrayTamanos().reverse().forEach(function(tam) {
                        if(!origenes.hasOwnProperty(tam)) return;

                        var src=origenes[tam],
                            px=anchosPantalla[tam];

                        if(typeof src==="string"&&src.trim()!="") {
                            var tag=document.crear("<source media='(min-width:"+px+"px)'>")
                                .atributo("srcset",src);
                            elem.insertBefore(tag,img);
                        }
                    });
                }
            }

            return this;
        }
        
        if(propiedad=="alt") {
            this.img.atributo("alt",valor);
            return this;
        }
        
        this.clasePadre.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };    

    /**
     * Devuelve un objeto con todos los parámetros de configuración.
     */
    this.obtenerPropiedades=function() {
        var obj=this.valoresPropiedades.clonar();
        if(ui.enModoEdicion()) {
            //Excluir el origen cuando sea data:...
            var tamanos=ui.obtenerTamanos();
            for(var tamano in tamanos) {
                if(!tamanos.hasOwnProperty(tamano)) continue;
                if(obj.origen&&obj.origen.hasOwnProperty(tamano)&&obj.origen[tamano]&&obj.origen[tamano].substr(0,5)!="data:") delete obj.origen[tamano];
            }
        }            
        return obj;
    };

    /**
     * Actualiza el componente.
     */
    this.actualizar=function() {
        this.clasePadre.actualizar.call(this,false);

        //Actualizar el origen para todos los tamaños
        var origen=this.propiedadObj("origen"),
            t=this;
        if(origen) origen.porCada(function(tamano,valor) {
                var resultado=ui.evaluarExpresion(valor,t.datos);
                t.propiedadModificada("origen",resultado,tamano);
            });

        this.clasePadre.actualizar.call(this);
        return this;
    };

    /**
     * Evento `editor`.
     * @returns {Componente}
     */
    this.editor=function() {
        //Mostrar imagen de relleno, si corresponde
        if(!this.img.atributo("src")) this.img.atributo("src",icono);

        return this.clasePadre.editor.call(this);
    };    

    /**
     * Evento `editorDesactivado`.
     * @returns {Componente}
     */
    this.editorDesactivado=function() {
        //Remover imagen de relleno
        if(this.img.atributo("src")==icono) this.img.atributo("src","");

        return this.clasePadre.editorDesactivado.call(this);
    };
};

ui.registrarComponente("imagen",componenteImagen,configComponente.clonar({
    descripcion:"Imagen",
    etiqueta:"Imagen",
    icono:"imagen.png"
}));