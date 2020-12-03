/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Campo desplegable.
 * @class
 * @extends componente
 */
var componenteDesplegable=function() {   
    "use strict";

    var t=this;
    
    this.componente="desplegable";
    this.opciones=null;
    this.opcionesAsignadas=null;
    this.gruposAsignados=null;

    /**
     * Propiedades de Campo.
     */
    this.propiedadesConcretas={
        "Desplegable":{
            opciones:{
                etiqueta:"Opciones",
                adaptativa:false,
                ayuda:"Expresión que resulte en un objeto a ser utilizado como listado de opciones."
            },
            grupos:{
                etiqueta:"Grupos",
                adaptativa:false,
                ayuda:"Expresión que resulte en un objeto a ser utilizado como listado de grupos de opciones. Cada grupo debe tener las propiedades 'etiqueta' y 'opciones' con el listado de opciones."
            },
            valor:{
                etiqueta:"Valor inicial",
                adaptativa:false
            },
            propiedadClave:{
                etiqueta:"Propiedad clave",
                adaptativa:false
            },
            propiedadEtiqueta:{
                etiqueta:"Propiedad a mostrar",
                adaptativa:false
            },
            opcional:{
                etiqueta:"Opcional",
                tipo:"logico",
                adaptativa:false,
                ayuda:"Agrega una opción en blanco al comienzo del listado."
            },
            etiquetaOpcional:{
                etiqueta:"Etiqueta opcional",
                adaptativa:false,
                ayuda:"Etiqueta de la primer opción cuando el despletable se establece como opcional."
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 

        this.campo=this.elemento.querySelector("select");
        this.elementoEventos=this.campo;

        this.clasePadre.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div>");
        this.campo=document.crear("<select class='custom-select'>"); 
        this.elemento.anexar(this.campo);
        this.clasePadre.crear.call(this);
        return this;
    };

    /**
     * Evento Listo.
     */
    this.listo=function() {
        this.clasePadre.listo.call(this);

        if(ui.enModoEdicion()) return;

        this.actualizar();
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(expresion.contieneExpresion(valor)&&ui.enModoEdicion()) valor=null;

        if(!ui.enModoEdicion()) {
            if(propiedad=="opciones"&&typeof valor==="object"&&valor!==null) {
                this.establecerOpciones(valor);
                return this;
            }
            if(propiedad=="grupos"&&typeof valor==="object"&&valor!==null) {
                this.establecerGrupos(valor);
                return this;
            }

            if(propiedad=="propiedadClave"||propiedad=="propiedadEtiqueta") {
                //Actualizar opciones
                this.actualizar();
                return this;
            }
        }

        if(propiedad=="deshabilitado") {
            //Aplicar al campo (por defecto se aplica al elemento)
            if(valor===true||valor===1||valor==="1") {
                this.campo.propiedad("disabled",true);
            } else {
                this.campo.removerAtributo("disabled");
            }
            return this;
        }

        this.clasePadre.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Devuelve un listado de `<option>`s dado el listado de opciones u objeto.
     * @param {*} listado 
     * @param {(Node|Element)} destino
     * @param {string} prefijo
     */
    var generarOpciones=function(listado,destino,prefijo) {
        if(typeof prefijo==="undefined") prefijo="";

        var propClave=t.propiedad("propiedadClave"),
            propValor=t.propiedad("propiedadEtiqueta"),
            fn=function(clave,valor) {
                document.crear("option")
                    .valor(clave)
                    .establecerTexto(valor)
                    .anexarA(destino);
            };

        if(util.esArray(listado)) {
            listado.porCada(function(indice,obj) {
                //Por defecto, usar el índice como clave y el elemento como valor
                var clave=prefijo+indice,
                    valor=obj;

                if(util.esObjeto(obj)) {
                    //Si valor es un objeto, se admite el uso de propiedadClave y propiedadValor
                    if(propClave) clave=obj[propClave];
                    if(propValor) valor=obj[propValor];
                }

                fn(clave,valor);
                t.opciones[clave]=obj;
            });
        } else if(util.esObjeto(listado)) {
            listado.porCada(function(clave,obj) {
                var valor=obj;

                //Si valor es un objeto, se admite el uso de propiedadValor para determinar qué propiedad mostrar
                if(util.esObjeto(obj)&&propValor) valor=obj[propValor];

                fn(clave,valor);
                t.opciones[clave]=obj;
            });
        }
    };

    /**
     * Establece las opciones del desplegable agrupadas (en `<optgroup>`s).
     * @param {Object[])} grupos - Listado de objetos, cada un representando un grupo de opciones.
     * @param {string} grupos.etiqueta - Etiqueta del grupo.
     * @param {Object|Object[]} grupos.opciones - Listado de opciones (objeto o array, compatible con `establecerOpciones()`). El tipo de listado (objeto o array) debe ser el
     * mismo en todos los grupos.
     * @param {string} [grupos.nombre] - Nombre del grupo. Si `opciones` es un array, el nombre se utilizará como prefijo en los valores (`nombre_0`, `nombre_1`, etc.). Si se
     * omite, en lugar del nombre, se utilizará el índice del grupo (comenzando desde `0`).
     * @returns {componente}
     */
    this.establecerGrupos=function(grupos) {
        this.gruposAsignados=grupos;
        this.opcionesAsignadas=null;
        this.opciones={};

        var valor=this.campo.valor(),
            valorInicial=this.propiedad("valor");

        this.campo.querySelectorAll("option,optgroup").remover();

        if(this.propiedad("opcional")) document.crear("<option value=''>")
                                        .establecerTexto(this.propiedad("etiquetaOpcional"))
                                        .anexarA(this.campo);

        grupos.porCada(function(i,grupo) {
            var elem=document.crear("optgroup")
                    .atributo("label",grupo.etiqueta)
                    .anexarA(t.campo);
            var prefijo=(grupo.hasOwnProperty("nombre")?grupo.nombre:i)+"_";
            generarOpciones(grupo.opciones,elem,prefijo);
        });

        if(valor) {
            //Reesstablecer valor
            this.valor(valor);
        } else if(valorInicial) {
            //O establecer valor inicial
            this.valor(valorInicial);
        }

        return this;
    };

    /**
     * Establece las opciones del desplegable.
     * @param {(Object|Object[])} obj - Listado u objeto.
     * @returns {Componente}
     */
    this.establecerOpciones=function(obj) {
        this.gruposAsignados=null;
        this.opcionesAsignadas=obj;
        this.opciones={};

        var valor=this.campo.valor(),
            valorInicial=this.propiedad("valor");

        this.campo.querySelectorAll("option,optgroup").remover();

        if(this.propiedad("opcional")) document.crear("<option value=''>")
                                        .establecerTexto(this.propiedad("etiquetaOpcional"))
                                        .anexarA(this.campo);

        generarOpciones(obj,this.campo);

        if(valor) {
            //Reesstablecer valor
            this.valor(valor);
        } else if(valorInicial) {
            //O establecer valor inicial
            this.valor(valorInicial);
        }

        return this;
    };

    /**
     * Devuelve las opciones del desplegable. Nótese que no devuelve el objeto original, sino las opciones efectivas del desplegable, siempre como objeto
     * `{valor:etiqueta,...}`. Si se utilizaron grupos, sus opciones estarán combinadas en este objeto (en un solo nivel, sin las etiquetas originales).
     * @returns {Object}
     */
    this.obtenerOpciones=function() {
        return this.opciones;
    };

    /**
     * Actualiza el componente.
     */
    this.actualizar=function() {
        //Regenerar opciones asignadas mediante establecerOpciones() / establecerGrupos()
        if(this.gruposAsignados) {
            this.establecerGrupos(this.gruposAsignados);
        } else if(this.opcionesAsignadas) {
            this.establecerOpciones(this.opcionesAsignadas);
        } else {        
            //O establecer opciones a partir de las propiedades grupos u opciones, si están asignadas
            var grupos=this.propiedad("grupos"),
                opciones=this.propiedad("opciones");
            if(typeof grupos==="object"&&grupos!==null) {
                this.establecerGrupos(grupos);
            } else if(typeof opciones==="object"&&opciones!==null) {
                this.establecerOpciones(opciones);
            }
        }

        return this.clasePadre.actualizar.call(this);
    };

    /**
     * Devuelve el objeto correspondiente al item seleccionado.
     * @returns {(Object|null)}
     */
    this.obtenerItem=function() {
        var valor=this.campo.valor();
        if(!this.opciones.hasOwnProperty(valor)) return null;
        return this.opciones[valor];
    };
};

ui.registrarComponente("desplegable",componenteDesplegable,configComponente.clonar({
    descripcion:"Campo desplegable",
    etiqueta:"Desplegable",
    grupo:"Formulario",
    icono:"desplegable.png"
}));