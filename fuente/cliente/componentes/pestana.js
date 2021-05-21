/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Pestaña.
 * @class
 * @extends componente
 */
var componentePestana=function() { 
    "use strict";

    this.componente="pestana";

    this.activa=false;

    /**
     * Propiedades de Pestaña.
     */
    this.propiedadesConcretas={
        "Pestaña":{
            etiqueta:{
                etiqueta:"Etiqueta",
                adaptativa:false
            },
            mover:{
                etiqueta:"Mover",
                tipo:"comando",
                boton:"Mover pestaña",
                funcion:function(comp) {
                    var orden=parseInt(prompt("Nueva posición:")); //TODO Usar un diálogo html (¿ui.dialogos debería tener un prompt?)
                    if(!isNaN(orden))
                        comp.mover(orden)
                            .actualizarContenedor();
                }
            }
        }
    };    

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.contenedor=this.elemento;

        if(this.elemento.es({ clase:"activa" })) this.activa=true;

        this.clasesCss.push("activa");

        this.prototipo.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div>"); 
        this.contenedor=this.elemento;
        this.prototipo.crear.call(this);
        return this;
    };

    /**
     * Evento 'Insertado' (componente creado o movido en modo de edición).
     */
    this.insertado=function() {
        //en caso de que se haya copiado y pegado una pestaña activa
        this.elemento.removerClase("activa");
        this.activa=false;

        this.actualizarContenedor();
    };
    
    /**
     * Actualiza el componente tras la modificación de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(!ui.enModoEdicion()||!expresion.contieneExpresion(valor)) {
	        if(propiedad=="etiqueta") this.actualizarContenedor();

	        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);           
	        
	        //Regenerar los encabezados del componente Pestañas
	        var padre=this.obtenerPadre();
	        if(padre) padre.actualizarEncabezados(true);
	    }

        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Actualiza el contenedor de pestañas (componente Pestañas).
     * @returns {componentePestana}
     */
    this.actualizarContenedor=function() {
        var padre=this.obtenerPadre();
        if(padre) padre.actualizarEncabezados();
        return this;
    };

    /**
     * Activa, o trae al frente, la pestaña.
     * @returns {componentePestana}
     */
    this.activar=function() {
        var padre=this.obtenerPadre();
        if(!padre) return this;

        padre.desactivarTodas();

        this.elemento.agregarClase("activa");
        ui.animarAparecer(this.elemento);
        this.activa=true;

        padre.actualizarEncabezados(false);

        //Evento
        padre.pestanaActivada(this);

        return this;
    };

    /**
     * Desactiva la pestaña.
     * @returns {componentePestana}
     */
    this.desactivar=function() {
        this.activa=false;
        this.elemento.removerClase("activa");
        return this;
    };

    /**
     * Devuelve si la pestaña es la pestaña activa o no.
     * @returns {boolean}
     */
    this.esActiva=function() {
        return this.activa;
    };

    /**
     * Elimina el componente.
     * @param {*} descendencia - Parámetro de uso interno.
     * @returns {Componente}
     */
    this.eliminar=function(descendencia) {
        var padre=this.obtenerPadre();
        
        this.prototipo.eliminar.call(this,descendencia);        
        
        //Regenerar los encabezados del componente Pestañas
        if(padre) padre.actualizarEncabezados(true);

        return this;
    };

    /**
     * Oculta el componente (acceso directo a establecer la propiedad visibilidad=oculto).
     * @returns {componente}
     */
    this.ocultar=function() {
        this.desactivar();
        this.propiedad("visibilidad","oculto");
        return this;
    };

    /**
     * Muestra el componente (acceso directo a establecer la propiedad visibilidad=visible).
     * @returns {componente}
     */
    this.mostrar=function() {
        //Reestablecer propiedad en lugar de asignar "visible", ya que la visibilidad en realidad depende de si está activa o no
        this.propiedad("visibilidad",null);
        return this;
    };
};

ui.registrarComponente("pestana",componentePestana,configComponente.clonar({
    descripcion:"Pestaña",
    etiqueta:"Pestaña",
    grupo:"Estructura",
    icono:"pestana.png",
    padre:["pestanas"]
}));