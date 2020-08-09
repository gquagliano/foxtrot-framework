/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Imagen.
 */
var componenteImagen=function() {
    this.componente="imagen";

    this.img=null;

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
            src:{
                etiqueta:"Origen",
                ayuda:"URL absoluta o relativa al directorio de imagenes de la aplicación."
            },
            alt:{
                etiqueta:"Texto alternativo",
                adaptativa:false
            }
        }
    };
    
    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<picture/>");
        this.img=document.crear("<img src='recursos/componentes/iconos/imagen.png'>").anexarA(this.elemento);
        this.crearComponente();
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(propiedad=="src") {
            //TODO Si es una ruta relativa, anexar la URL al directorio de imágenes de la aplicación
            
            if(tamano=="g") {
                this.img.atributo("src",valor.trim()!=""?valor:"recursos/componentes/iconos/imagen.png");
            } else {
                //Construir <source>s

                this.elemento.querySelectorAll("source").remover();

                var elem=this.elemento,
                    img=this.img,
                    origenes=this.propiedadObj("src"),
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
};

ui.registrarComponente("imagen",componenteImagen,configComponente.clonar({
    descripcion:"Imagen",
    etiqueta:"Imagen",
    icono:"imagen.png"
}));