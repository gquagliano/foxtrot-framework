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

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.inicializado) return this;

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
     * Genera y devuelve la fila <tr> con sus celdas.
     * @param {Object} obj - Objeto a representar (datos de la fila).
     * @param {number} indice - Indice del origen de datos (índice del elemento).
     * @returns {Node}
     */
    this.generarTr=function(obj,indice) {
        var elem=document.crear("tr"),
            hijosTd=this.elemento.querySelectorAll("td.componente");
            
        hijosTd.forEach(function(hijoTd) {
            var componente=ui.obtenerInstanciaComponente(hijoTd),
                elemTd=componente.generarTd(obj,indice);
            
            elem.anexar(elemTd);
        });    

        return elem;
    };
};

ui.registrarComponente("tabla-fila",componenteFilaTabla,configComponente.clonar({
    descripcion:"Fila de tabla",
    etiqueta:"Fila",
    grupo:"Tablas de datos",
    icono:"fila.png",
    aceptaHijos:["tabla-columna"]
}));