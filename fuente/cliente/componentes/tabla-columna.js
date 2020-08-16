/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Columna de tabla.
 */
var componenteColumnaTabla=function() {    
    this.componente="tabla-columna";

    /**
     * Propiedades de Columna de tabla.
     */
    this.propiedadesConcretas={
        "Columna de tabla":{
            encabezado:{
                etiqueta:"Encabezado",
                adaptativa:false
            },
            encabezadoActivo:{
                etiqueta:"Encabezado activo",
                tipo:"bool",
                adaptativa:false
            },
            encabezadoOrden:{
                etiqueta:"Ordenamiento",
                ayuda:"Muestra el ícono de ordanamiento en el encabezado.",
                tipo:"opciones",
                opciones:{
                    no:"Sin ícono",
                    ascendente:"Ascendente",
                    descendente:"Descendente"
                },
                adaptativa:false
            }
        },
        "Eventos":{
            clickEncabezado:{
                etiqueta:"Click en encabezado",
                adaptativa:false
            }
        }
    };

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
        //Nota: Debe usarse el nombre del tag y no <td>
        this.elemento=document.crear("td"); 
        this.crearComponente();
        return this;
    };

    /**
     * Genera y devuelve la celda <th> para el encabezado de la tabla.
     * @returns {Node}
     */
    this.generarTh=function() {
        var texto=this.propiedad(null,"encabezado"),
            elem=document.crear("th");            

        elem.establecerHtml(texto);

        return elem;
    };

    /**
     * Genera y devuelve la celda <td> para el cuerpo de la tabla.
     * @param {Object} obj - Objeto a representar (datos de la fila).
     * @param {number} indice - Indice del origen de datos (índice del elemento).
     * @returns {Node}
     */
    this.generarTd=function(obj,indice) {
        var elem=document.crear("td");  
        
        elem.establecerHtml("");

        return elem;
    };
};

ui.registrarComponente("tabla-columna",componenteColumnaTabla,configComponente.clonar({
    descripcion:"Columna de tabla",
    etiqueta:"Columna",
    grupo:"Tablas de datos",
    icono:"columna.png"
}));