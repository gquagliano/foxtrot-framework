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
};

ui.registrarComponente("espaciador",componenteEspaciador,configComponente.clonar({
    descripcion:"Espaciador horizontal o vertical",
    icono:"espaciador.png"
}));