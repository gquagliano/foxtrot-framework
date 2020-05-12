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
            //nombre:{
            //    etiqueta
            //    tipo (predeterminado texto|multilinea|opciones|color)
            //    opciones (array {valor,etiqueta} cuando tipo=opciones)
            //    grupo
            //}
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        this.contenedor=this.elemento;
        this.inicializarComponente();
        return this;
    };
    
    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='col-sm-3 contenedor vacio'/>");
        this.establecerId();
        this.inicializar();
        return this;
    };
};

ui.registrarComponente("columna",componenteColumna,configComponente.clonar({
    descripcion:"Columna",
    grupo:"Estructura",
    icono:"componentes/iconos/columna.png"
}));

