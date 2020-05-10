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
function componenteColumna() {
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
        this.datosElemento.elemento=this.elemento;
        this.datosElemento.contenedor=this.contenedor;
        this.datosElemento.instancia=this;
        this.base.inicializar.call(this);
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
}
componenteColumna.prototype=new componente();

ui.registrarComponente("columna",componenteColumna,util.clonar(configComponente,{
    descripcion:"Columna",
    grupo:"Estructura",
    icono:"componentes/iconos/columna.png"
}));

