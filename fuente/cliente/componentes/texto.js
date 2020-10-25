/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Texto.
 * @class
 * @extends componente
 */
var componenteTexto=function() {    
    "use strict";

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
                    enLinea:"En línea",
                    h1:"Título 1",
                    h2:"Título 2",
                    h3:"Título 3",
                    h4:"Título 4",
                    h5:"Título 5",
                    h6:"Título 6",
                    etiqueta:"Etiqueta de campo"
                },
                adaptativa:false
            }
        }
    };

    /**
     * Inicializa la instancia.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this;         
        
        this.elementoEditable=this.elemento;

        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<p class='texto'>Hacé doble click para comenzar a escribir...</p>");
        
        this.crearComponente();
        return this;
    };
    
    /**
     * Actualiza el componente tras la modificación de una propiedad (método para sobreescribir).
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(propiedad=="formato") {
            var seleccionado=this.elemento.es({clase:"seleccionado"});

            //Cambiar tipo de etiqueta
            if(!valor) valor="p";
            if(valor=="etiqueta") valor="label";
            if(valor=="enLinea") valor="span";
            
            //Crear nuevo elemento con el contenido del actual
            var elem=document.crear("<"+valor+(valor=="p"?" class='texto'":"")+">");
            elem.innerHTML=this.elemento.innerHTML;

            //Reemplazar
            this.elemento.insertarDespues(elem)
                .remover();

            //Actualizar referencia
            this.elemento=elem;            
            this.fueInicializado=false;
            this.inicializar();

            //Restaurar selección
            if(seleccionado) {
                editor.limpiarSeleccion()
                    .establecerSeleccion(this.elemento);
            }

            if(ui.enModoEdicion()) {
                //En el editor, debemos notificar que el elemento fue reemplazado, ya que todos los eventos estaban aplicados sobre el elemento viejo (a diferencia
                //de otros componentes que cuentan con un contenedor)
                editor.prepararComponenteInsertado(this);
            }

            return this;
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Reemplaza el contenido del componente.
     * @param {string} html - Contenido.
     * @returns {Componente}
     */
    this.establecerHtml=function(html) {
        this.elemento.establecerHtml(html);
        return this;
    };

    /**
     * Reemplaza el contenido del componente como texto plano (sin HTML).
     * @param {string} texto - Contenido.
     * @returns {Componente}
     */
    this.establecerTexto=function(texto) {
        this.elemento.establecerTexto(texto);
        return this;
    };
};

ui.registrarComponente("texto",componenteTexto,configComponente.clonar({
    descripcion:"Texto",
    etiqueta:"Texto",
    icono:"texto.png",
    aceptaHijos:false
}));