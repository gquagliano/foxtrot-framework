/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Texto.
 */
var componenteTexto=function() {    
    this.componente="texto";
    this.contenidoEditable=true;   

    /**
     * Propiedades de Botón.
     */
    this.propiedadesConcretas={
        "Texto":{
            formato:{
                etiqueta:"Formato",
                tipo:"opciones",
                opciones:{
                    p:"Párrafo",
                    h1:"Título 1",
                    h2:"Título 2",
                    h3:"Título 3",
                    h4:"Título 4",
                    h5:"Título 5",
                    h6:"Título 6"
                },
                adaptativa:false
            }
        }
    };

    /**
     * Inicializa la instancia.
     */
    this.inicializar=function() {
        if(this.inicializado) return this;         
        
        this.elementoEditable=this.elemento.querySelector("p,h1,h2,h3,h4,h5,h6");

        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='texto'><p>Hacé doble click para comenzar a escribir...</p></div>");
        
        this.crearComponente();
        return this;
    };
    
    /**
     * Actualiza el componente tras la modificación de una propiedad (método para sobreescribir).
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(propiedad=="formato") {
            //Cambiar tipo de etiqueta
            if(!valor) valor="p";
            var elem=document.crear("<"+valor+(valor=="p"?" class='texto'":"")+">");
            elem.innerHTML=this.elementoEditable.innerHTML;
            this.elementoEditable.outerHTML=elem.outerHTML;
            
            this.inicializado=false;
            this.inicializar();

            return this;
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };
};

ui.registrarComponente("texto",componenteTexto,configComponente.clonar({
    descripcion:"Texto",
    etiqueta:"Texto",
    icono:"texto.png",
    aceptaHijos:false
}));