/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Opción.
 * @class
 * @extends componente
 */
var componenteAlternar=function() {   
    "use strict";

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
                },
                adaptativa:false
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

        //Regenerar los ID de los elementos cada vez que se inicializa, ya que puede estar duplicado (por ejemplo cuando se lo inserta en un bucle, 
        //una tabla o si se clona el componente por cualuqier otro motivo)
        var id=this.id+"-"+ui.generarId();
        this.campo.atributo("id",id);
        this.elementoEditable.atributo("for",id);

        if(!ui.enModoEdicion()) this.valor(null);

        this.clasesCss.push(/^custom-(control|control-inline|switch|checkbox|radio)$/);

        this.prototipo.inicializar.call(this);
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

        this.prototipo.crear.call(this);
        return this;
    };

    /**
     * Evento `editor`.
     * @returns {Componente}
     */
    this.editor=function() {
        //Actualizar ID de los elementos
        var id="checkbox-"+this.id;
        this.elemento.querySelector("input").atributo("id",id);
        this.elemento.querySelector("label").atributo("for",id);

        return this.prototipo.editor.call(this);
    };

    /**
     * Establece los eventos predeterminados.
     * @returns {Componente}
     */
    this.establecerEventos=function() {
        this.prototipo.establecerEventos.call(this);

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
            valorInicial=null,
            componenteActivo=null;
    
        elems.forEach(function(elem) {
            var componente=ui.obtenerInstanciaComponente(elem);
            if(!componente) return;
            var campo=componente.obtenerCampo(),
                campoGrupo=campo.dato("grupo"),
                campoValor=campo.dato("valor");        
            if(typeof campoGrupo==="undefined"||grupo==""||grupo!=campoGrupo) return;
            if(typeof campoValor==="undefined"||!campoValor||campoValor.trim()=="") campoValor=componente.obtenerNombre();

            componentesGrupo[campoValor]=componente;
        
            if(componente.valorIndividual()) {
                componenteActivo=componente;
                valorActivo=campoValor;
            }

            if(desactivar&&componente!=t) componente.valorIndividual(false);

            var v=componente.propiedad(false,"valorInicial");
            if(v) valorInicial=v;
        });

        return {
            componentes:componentesGrupo,
            componenteActivo:componenteActivo,
            valorActivo:valorActivo,
            valorInicial:valorInicial
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

        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(expresion.contieneExpresion(valor)&&ui.enModoEdicion()) valor=null;
        
        if(propiedad=="valorInicial") {
            if(valor!==true&&this.propiedad("grupo")) {
                //Si es parte de un grupo, interpretar el valor
                this.valor(valor);
            } else if(valor===true||valor===1||valor==="1") {
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

        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
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

        if(typeof valor!=="boolean"&&typeof grupo==="string"&&grupo!="") {
            //Buscar/establecer valor del grupo

            if(typeof miValor==="undefined") miValor=this.nombre;

            //Buscar componentes del grupo
            var grupo=this.buscarGrupo();
            
            //Devolver valor del componente activo
            if(typeof valor==="undefined") return grupo.valorActivo;  
            
            //Si es null, volver al valor inicial del grupo (puede contener expresiones)
            if(valor===null) valor=this.evaluarExpresion(grupo.valorInicial);

            //Activar el componente que coincida con el valor asignado y desactivar el resto
            grupo.componentes.porCada(function(valorComponente,componente) {
                componente.valorIndividual(valor==valorComponente);
            });
            return this;
        }

        //Valor individual
            
        //Si es null, volver al valor inicial (puede contener expresiones)
        if(valor===null) valor=this.propiedad("valorInicial");

        return this.valorIndividual(valor);
    };
};

ui.registrarComponente("opcion",componenteAlternar,configComponente.clonar({
    descripcion:"Campo de opción",
    etiqueta:"Opción",
    grupo:"Formulario",
    icono:"opcion.png"
}));