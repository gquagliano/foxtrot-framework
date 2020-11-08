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

        this.clasePadre.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div>"); 
        this.contenedor=this.elemento;
        this.clasePadre.crear.call(this);
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
        if(propiedad=="etiqueta") this.actualizarContenedor();

        this.clasePadre.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
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

        this.clasePadre.eliminar.call(this,descendencia);
        
        if(!padre) return this;
        
        //Regenerar los encabezados del componente Pestaña
        padre.actualizarEncabezados(true);
        //Activar la ultima pestaña
        padre.activarPestana(-1);

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