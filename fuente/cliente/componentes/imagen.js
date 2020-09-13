/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * @class Componente concreto Imagen.
 */
var componenteImagen=function() {
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

        this.inicializarComponente();
        return this;
    };
    
    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<picture/>");
        this.img=document.crear("<img src='"+icono+"'>").anexarA(this.elemento);
        this.crearComponente();
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(propiedad=="origen") {
            //TODO Si es una ruta relativa, anexar la URL al directorio de imágenes de la aplicación
            
            if(tamano=="g") {
                this.img.atributo("src",valor.trim()!=""?valor:icono);
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

                        var tag=document.crear("<source media='(min-width:"+px+"px)'>")
                            .atributo("srcset",src);
                        elem.insertBefore(tag,img); //TODO Agregar a dom
                    });
                }
            }
        } else if(propiedad=="alt") {
            this.img.atributo("alt",valor);
        }
        
        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.actualizar=function() {
        if(this.datos) {
            //Actualizar el origen para todos los tamaños
            var origen=this.propiedadObj("origen"),
                t=this;
            if(origen) origen.forEach(function(tamano,valor) {
                    var resultado=ui.evaluarExpresion(valor,t.datos);
                    t.propiedadModificada("origen",resultado,tamano);
                });
        }

        this.actualizarComponente();
        return this;
    };
};

ui.registrarComponente("imagen",componenteImagen,configComponente.clonar({
    descripcion:"Imagen",
    etiqueta:"Imagen",
    icono:"imagen.png"
}));