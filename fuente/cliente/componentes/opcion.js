/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * @class Componente concreto Opción.
 */
var componenteAlternar=function() {    
    this.componente="opcion";
    this.contenidoEditable=true; 

    /**
     * Propiedades de Opción.
     */
    this.propiedadesConcretas={
        "Campo de opción":{
            tipo:{
                etiqueta:"Tipo",
                tipo:"opciones",
                opciones:{
                    alternar:"Alternar",
                    checkbox:"Checkbox",
                    opcion:"Botón de opción"
                },
                adaptativa:false
            },
            valorInicial:{
                etiqueta:"Valor inicial",
                adaptativa:false
            }
        },
        "Grupo":{
            grupo:{
                etiqueta:"Grupo",
                adaptativa:false
            },
            valor:{
                etiqueta:"Valor",
                adaptativa:false
            }
        },
        "Posicionamiento":{            
            estructura:{
                etiqueta:"Estructura",
                tipo:"opciones",
                opciones:{
                    bloque:"Bloque",
                    enLinea:"En línea"
                }
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 

        this.campo=this.elemento.querySelector("input");
        this.elementoEditable=this.elemento.querySelector("label");

        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='custom-control custom-switch'>");

        this.campo=document.crear("<input type='checkbox' class='custom-control-input' id='checkbox-"+this.id+"'>");

        this.elementoEditable=document.crear("<label class='custom-control-label' for='checkbox-"+this.id+"'>Etiqueta</label>");

        this.elemento.anexar(this.campo);
        this.elemento.anexar(this.elementoEditable);

        this.crearComponente();
        return this;
    };

    /**
     * Establece los eventos predeterminados.
     * @returns {Componente}
     */
    this.establecerEventos=function() {
        this.establecerEventosComponente();

        var t=this;
        this.campo.evento("change",function() {
            t.desactivarGrupo();
        });

        return this;
    };

    /**
     * Busca y devuelve todos los componentes del grupo.
     * @param {boolean} [desactivar=false] - Desactiva todos los componentes excepto esta instancia.
     * @returns {Object}
     */
    this.buscarGrupo=function(desactivar) {
        if(typeof desactivar==="undefined") desactivar=false;

        var t=this,
            grupo=this.campo.dato("grupo"),
            doc=ui.obtenerCuerpo(),
            elems=doc.querySelectorAll(".componente.opcion"),
            componentesGrupo={},
            valorActivo=null,
            componenteActivo=null;
    
        elems.forEach(function(elem) {
            var componente=ui.obtenerInstanciaComponente(elem),
                campo=componente.obtenerCampo(),
                campoGrupo=campo.dato("grupo"),
                campoValor=campo.dato("valor");        
            if(typeof campoGrupo==="undefined"||grupo!=campoGrupo) return;
            if(typeof campoValor==="undefined"||!campoValor||campoValor.trim()=="") campoValor=componente.obtenerNombre();

            componentesGrupo[campoValor]=componente;
        
            if(componente.valorIndividual()) {
                componenteActivo=componente;
                valorActivo=campoValor;
            }

            if(desactivar&&componente!=t) componente.valorIndividual(false);
        });

        return {
            componentes:componentesGrupo,
            componenteActivo:componenteActivo,
            valorActivo:valorActivo
        };
    };

    /**
     * Desactiva los demás componentes del grupo.
     * @returns {Componente}
     */
    this.desactivarGrupo=function() {
        this.buscarGrupo(true);
        return this;
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;
        
        if(propiedad=="valorInicial") {
            if(valor) {
                this.campo.atributo("checked",true);
            } else {
                this.campo.removerAtributo("checked");
            }
            return this;
        }

        if(propiedad=="tipo") {
            if(!valor) valor="switch";
            this.elemento.removerClase(/custom-(switch|checkbox|radio)/)
                .agregarClase("custom-"+{
                        alternar:"switch",
                        checkbox:"checkbox",
                        opcion:"radio"
                    }[valor]);
            this.campo.atributo("type",valor=="opcion"?"radio":"checkbox");
            return this;
        }

        if(propiedad=="grupo"||propiedad=="valor") {
            this.campo.dato(propiedad,valor);
            return this;
        }

        if(propiedad=="estructura") {
            if(valor=="enLinea") {
                this.elemento.agregarClase("custom-control-inline");
            } else {
                this.elemento.removerClase("custom-control-inline");
            }
            return this;
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Establece o devuelve el valor del componente en forma individual, ignorando la propiedad Grupo.
     * @param {boolean} [valor] - Valor a establecer.
     * @returns {(boolean|componente)}
     */
    this.valorIndividual=function(valor) {
        if(typeof valor==="undefined") return this.campo.valor();
        this.campo.valor(valor);
        return this;
    };

    /**
     * Establece o devuelve el valor del componente.
     * @param {boolean} [valor] - Valor a establecer.
     * @returns {(boolean|componente)}
     */
    this.valor=function(valor) {
        var grupo=this.campo.dato("grupo"),
            miValor=this.campo.dato("valor");
        if(typeof valor!=="boolean"&&typeof grupo==="string") {
            //Buscar/establecer valor del grupo

            if(typeof miValor==="undefined") miValor=this.nombre;

            //Buscar componentes del grupo
            var grupo=this.buscarGrupo();
            
            //Devolver valor del componente activo
            if(typeof valor==="undefined") return grupo.valorActivo;            

            //Activar el componente que coincida con el valor asignado y desactivar el resto
            grupo.componentes.porCada(function(valorComponente,componente) {
                componente.valorIndividual(valor==valorComponente);
            });
            return this;
        }

        //Valor individual
        return this.valorIndividual(valor);
    };
};

ui.registrarComponente("opcion",componenteAlternar,configComponente.clonar({
    descripcion:"Campo de opción",
    etiqueta:"Opción",
    grupo:"Formulario",
    icono:"opcion.png"
}));