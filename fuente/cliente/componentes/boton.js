/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * @class Componente concreto Botón.
 */
var componenteBoton=function() {    
    this.componente="boton"; 
    this.contenidoEditable=true;

    /**
     * Propiedades de Botón.
     */
    this.propiedadesConcretas={
        //TODO En el futuro, sería bueno tener clases adaptativas. Ello puede servir para muchas clases de Bootstrap, donde no tiene sentido reescribirlas con
        //sufijos (-md, -lg, etc.), pero por el momento es preferible evitar la carga de JS que implicaría verificar las clases de todos los componentes cada
        //vez que se redimensiona la pantalla.
        "Estilo":{
            estilo:{
                etiqueta:"Estilo",
                tipo:"opciones",
                opciones:{
                    primary:"Primario",
                    secondary:"Secundario",
                    success:"Éxito",
                    danger:"Peligro",
                    warning:"Advertencia",
                    info:"Información",
                    light:"Claro",
                    dark:"Oscuro"
                },
                adaptativa:false
            },
        },
        "Comportamiento":{
            tipo:{
                etiqueta:"Tipo",
                tipo:"opciones",
                opciones:{
                    enlace:"Enlace - Hipervínculo",
                    boton:"Botón"
                },
                adaptativa:false
            },
            enlace:{
                etiqueta:"Enlace",
                adaptativa:false
            },
            nuevaVentana:{
                etiqueta:"Abrir en nueva ventana",
                tipo:"bool"
            },
            predeterminado:{
                etiqueta:"Acción predeterminada",
                tipo:"bool",
                ayuda:"Si se activa esta propiedad, se invocará el evento Click de este botón cuando se ejecute la acción predeterminada del formulario (por ejemplo, al presionar Enter en un campo)."
            }
        }
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<a href='#'>Botón</a>"); 
        this.crearComponente();
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        if(propiedad=="estilo") {
            this.elemento.removerClase(/btn-(primary|secondary|success|danger|warning|info|light|dark)/);
            if(valor) this.elemento.agregarClase("btn-"+valor);
            return this;
        }

        if(propiedad=="tipo") {
            if(valor=="boton") {
                this.elemento.agregarClase("btn");
            } else {
                this.elemento.removerClase("btn");
            }
            return this;
        }

        if(propiedad=="enlace") {
            if(!valor) valor="#";
            this.elemento.atributo("href",valor);
            return this;
        }

        if(propiedad=="nuevaVentana") {
            if(!valor) {
                this.elemento.removerAtributo("target");
            } else {
                this.elemento.atributo("target","_blank");
            }
            return this;
        }

        if(propiedad=="predeterminado") {
            if(valor) {
                this.elemento.agregarClase("predeterminado");
            } else {
                this.elemento.removerClase("predeterminado");
            }
            return this;
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };
};

ui.registrarComponente("boton",componenteBoton,configComponente.clonar({
    descripcion:"Botón o enlace",
    etiqueta:"Botón",
    icono:"boton.png"
}));