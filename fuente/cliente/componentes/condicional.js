/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Condicional.
 * @class
 * @extends componente
 */
var componenteCondicional=function() {   
    "use strict";

    this.componente="condicional";

    /**
     * Propiedades de Condicional.
     */
    this.propiedadesConcretas={
        "Condicional":{
            condicion:{
                etiqueta:"Condición",
                adaptativa:false
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.contenedor=this.elemento;
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
     * Muestra u oculta el contenido independientemente de la condición. Este estado *no* se preserva al actualizar el componente y reevaluar la condición.
     * @param {boolean} estado - Estado a asignar. Establecer a `true` para forzar la visibilidad del componente, `false` para ocultarlo.
     * @returns {componente}
     */
    this.establecerVisibilidad=function(estado) {
        if(estado) {
            this.elemento.agregarClase("visible");
        } else {
            this.elemento.removerClase("visible");
        }
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.actualizar=function() {
        this.actualizacionEnCurso=true;

        var condicion;
        if(!this.propiedad(false,"condicion")) {
            //Sin condición, utilizar el origen de datos
            if(typeof this.datos==="object") {
                var propiedad=this.propiedad(false,"propiedadValor");
                condicion=propiedad?util.obtenerPropiedad(this.datos,propiedad):this.datos;
            } else {
                condicion=this.datos;
            }
        } else {
            //Obtener valor procesado
            condicion=this.propiedad("condicion");
        }
        this.establecerVisibilidad(!!condicion);
        
        return this.prototipo.actualizar.call(this);
    };

    /**
     * Evento Listo.
     */
    this.listo=function() {
        this.actualizar();
        this.prototipo.listo.call(this);
    };
    
    /**
     * Establece el origen de datos.
     * @param {Object} obj - Objeto a asignar.
     * @param {boolean} [actualizar=true] - Actualizar el componente luego de establecer el origen de datos.
     * @returns Componente
     */
    this.establecerDatos=function(obj,actualizar) {
        //Ignorar propiedad
        this.prototipo.establecerDatos.call(this,obj,actualizar,true,true);
        return this;
    };

    /**
     * Establece el valor del componente. Nótese que este componente no tiene valor propio, solo se ofrece este método como sinónimo de `establecerDatos()`; invocarlo sin
     * especificar `valor` devolverá `null`.
     * @param {*} [valor] - Valor a establecer.
     * @returns {(undefined|componente)}
     */
    this.valor=function(valor) {
        if(typeof valor==="undefined") return;
        
        //Cuando se asigne un valor, establecer como origen de datos
        this.establecerDatos(valor);
        
        return this;
    };
};

ui.registrarComponente("condicional",componenteCondicional,configComponente.clonar({
    descripcion:"Condicional",
    etiqueta:"Condicional",
    grupo:"Control",
    icono:"condicional.png"
}));