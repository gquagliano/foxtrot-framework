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
                adaptativa:false
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
        var valor=this.propiedad(null,"etiqueta"),
            resultado="";

        if(this.datos) {
            resultado=util.obtenerPropiedad(valor);
        }

        this.elemento.html(resultado);

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