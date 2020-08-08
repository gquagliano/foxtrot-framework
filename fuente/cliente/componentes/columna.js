/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Columna.
 */
var componenteColumna=function() {
    this.componente="columna";

    this.propiedadesConcretas={
        "Tamaño":{
            tamano:{
                etiqueta:"Tamaño",
                tipo:"numero",
                ayuda:"Tamaño en proporción de la grilla de 12 columnas de Bootstrap. Pueden utilizarse las propiedades de Flexbox para establecer dimensiones personalizadas."
            }
            //nombre:{
            //    etiqueta
            //    tipo (predeterminado texto|multilinea|opciones|color|numero)
            //    opciones (array {valor,etiqueta} cuando tipo=opciones)
            //    grupo
            //}
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
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='col-sm-3 contenedor vacio'/>");
        this.crearComponente();
        return this;
    };
    
    /**
     * Actualiza el componente. propiedad puede estar definido tras la modificación de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano) {
        var e=this.elemento;

        if(propiedad=="tamano") {
            //Debemos remover todos los col-* y volver a generarlos en el orden correcto, no podemos simplemente desactivar y activar las clases de a una
            e.removerClase(/col-.+/);
            var tamanos=this.propiedadObj(propiedad);
            ["g","sm","md","lg","xl"].forEach(function(p) {
                if(tamanos.hasOwnProperty(p)) e.agregarClase("col-"+(p=="g"?"":p+"-")+tamanos[p]);
            });
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano);
        return this;
    };
};

ui.registrarComponente("columna",componenteColumna,configComponente.clonar({
    descripcion:"Columna",
    etiqueta:"Columna",
    grupo:"Estructura",
    icono:"celda.png"
}));

