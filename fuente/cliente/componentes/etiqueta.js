/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Etiqueta.
 */
var componenteEtiqueta=function() {
    this.componente="etiqueta";

    /**
     * Propiedades de Etiqueta.
     */
    this.propiedadesConcretas={
        "Etiqueta":{
            contenido:{
                etiqueta:"Contenido",
                adaptativa:false,
                ayuda:"Admite expresiones."
            }
        }
    };
    
    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<label class='etiqueta'/>");
        this.crearComponente();
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.actualizar=function() {
        var propiedad=this.propiedad(null,"propiedad"),
            contenido=this.propiedad(null,"contenido"),
            resultado="";

        if(this.datos) {
            if(propiedad) {
                //Como propiedad específica
                resultado=util.obtenerPropiedad(this.datos,propiedad);
            } else if(contenido) {
                //Como expresion
                resultado=ui.evaluarExpresion(contenido,this.datos);
            }
        }

        this.elemento.establecerHtml(resultado);

        this.actualizarComponente();
        return this;
    };
};

ui.registrarComponente("etiqueta",componenteEtiqueta,configComponente.clonar({
    descripcion:"Etiqueta",
    etiqueta:"Etiqueta",
    grupo:"Control",
    icono:"etiqueta.png"
}));