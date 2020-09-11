/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Fila de tabla.
 */
var componenteFilaTabla=function() {    
    this.componente="tabla-fila";

    this.autogenerado=false;
    this.indice=null;

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this;

        this.contenedor=this.elemento;

        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        //Nota: Debe usarse el nombre del tag y no <tr>
        this.elemento=document.crear("tr"); 
        this.crearComponente();
        return this;
    };

    /**
     * Genera y devuelve la fila con sus celdas.
     * @param {Componente} padre - Componente padre (tabla).
     * @param {Object} obj - Objeto a representar (datos de la fila).
     * @param {number} indice - Indice del origen de datos (índice del elemento).
     * @returns {Componente}
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
};

ui.registrarComponente("tabla-fila",componenteFilaTabla,configComponente.clonar({
    descripcion:"Fila de tabla",
    etiqueta:"Fila",
    grupo:"Tablas de datos",
    icono:"fila.png",
    aceptaHijos:["tabla-columna"]
}));