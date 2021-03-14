/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Fila de tabla.
 * @class
 * @extends componente
 */
var componenteFilaTabla=function() {   
    "use strict";

    this.componente="tabla-fila";

    this.autogenerado=false;
    this.indice=null;

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
        //Nota: Debe usarse el nombre del tag y no <tr>
        this.elemento=document.crear("tr"); 
        this.prototipo.crear.call(this);
        return this;
    };

    /**
     * Genera y devuelve la fila con sus celdas.
     * @param {Componente} padre - Componente padre (tabla).
     * @param {Object} obj - Objeto a representar (datos de la fila).
     * @param {number} indice - Indice del origen de datos (índice del elemento).
     * @returns {componente}
     */
    this.generarFila=function(padre,obj,indice) {
        var nuevo=this.clonar(padre,true);

        //Agregar método al oriden de datos
        obj.obtenerIndice=(function(i) {
            return function() {
                return i;
            };
        })(indice);

        nuevo.establecerDatos(obj);
        nuevo.indice=indice;
        nuevo.autogenerado=true;
        nuevo.obtenerElemento().agregarClase("autogenerado");

        return nuevo;
    };    

    /**
     * Asigna un nuevo origen de datos a la fila existente.
     * @param {Object} obj - Objeto a representar (datos de la fila).
     * @returns {componente}
     */
    this.actualizarFila=function(obj) {
        this.establecerDatos(obj);
        return this;
    };    

    /**
     * Evento Click.
     * @param {Object} evento - Parámetros del evento.
     */
    this.click=function(evento) {
        var controlador=this.propiedad("click");
        if(!controlador) {
            //Sin controlador, buscar un botón predeterminado
            var btn=this.elemento.querySelector(".predeterminado");
            if(btn) {
                btn.ejecutarEvento("click");
                return true;
            }
        }
        return this.prototipo.click.call(this,evento);
    };
};

ui.registrarComponente("tabla-fila",componenteFilaTabla,configComponente.clonar({
    descripcion:"Fila de tabla",
    etiqueta:"Fila",
    grupo:"Tablas de datos",
    icono:"fila.png",
    padre:["tabla"],
    aceptaHijos:["tabla-columna"]
}));