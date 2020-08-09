/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Espaciador.
 */
var componenteEspaciador=function() {    
    this.componente="espaciador";

    this.propiedadesConcretas={
        "Comportamiento":{
            tipo:{
                etiqueta:"Tipo",
                tipo:"opciones",
                opciones:{
                    horizontal:{
                        etiqueta:"Horizontal",
                        clase:"horizontal"
                    },
                    vertical:{
                        etiqueta:"Vertical",
                        clase:"vertical"
                    }
                }
            },
            borde:{
                etiqueta:"Borde",
                tipo:"bool",
                clase:"borde"
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.inicializado) return this; 
        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='espaciador horizontal'></div>"); 
        this.crearComponente();
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        if(propiedad=="tipo") {
            this.removerClase("horizontal vertical");
            if(valor) this.agregarClase(valor);
            return this;
        }

        if(propiedad=="borde") {
            if(!valor) {
                this.enlace.removerClase("con-borde");
            } else {
                this.enlace.agregarClase("con-borde");
            }
            return this;
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };
};

ui.registrarComponente("espaciador",componenteEspaciador,configComponente.clonar({
    descripcion:"Espaciador horizontal o vertical",
    etiqueta:"Espacio",
    icono:"espaciador.png"
}));