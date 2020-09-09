/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Campo de búsqueda.
 */
var componenteBuscador=function() {    
    this.componente="buscador";

    this.elementoResultados=null;

    this.seleccionarPrimerElemento=false;
    this.buscando=false;
    this.resultados=[];
    this.ajax=null;

    //Selección
    this.item=null;
    this.valorActual=null;
    this.etiquetaActual="";

    /**
     * Propiedades de Campo.
     */
    this.propiedadesConcretas={
        "Campo de búsqueda":{
            valor:{
                etiqueta:"Valor inicial",
                adaptativa:false
            },
            relleno:{
                etiqueta:"Texto de relleno",
                adaptativa:false
            },
            propiedadValor:{
                etiqueta:"Propiedad valor",
                adaptativa:false
            },
            propiedadEtiqueta:{
                etiqueta:"Propiedad a mostrar",
                adaptativa:false
            },
            valor:{
                etiqueta:"Valor inicial",
                adaptativa:false,
                ayuda:"Valor del item a seleccionar por defecto, realizando la búsqueda correspondiente al cargar la vista. Puede contener expresiones."
            }
        },
        "Eventos":{
            buscar:{
                etiqueta:"Buscar",
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
        this.elementoEventos=this.campo;

        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div>");
        this.campo=document.crear("<input class='form-control' autocomplete='off' type='text'>"); 
        this.elemento.anexar(this.campo);
        this.crearComponente();
        return this;
    };

    /**
     * Establece los eventos predeterminados.
     */
    this.establecerEventos=function() {
        var t=this;

        this.campo.evento("keydown",function(ev) {
            if(ev.which==27&&t.buscando) { //ESC
                ev.preventDefault();
                t.abortarBusqueda();
            }
        });

        this.campo.evento("paste input",function(ev) {
            t.buscar(t.campo.valor());
        });

        this.elemento.evento("focusout",function(ev) {
            t.abortarBusqueda();
            t.cerrarResultados();
            //Revertir el valor del campo cuando se pierda el foco sin haber hecho una nueva selección
            t.campo.valor(t.etiquetaActual);
        });

        this.establecerEventosComponente();
        return this;
    };

    /**
     * Inicia una nueva búsqueda.
     * @param {string} texto - Búsqueda por texto.
     * @param {string} [valor] - Busca un elemento específico.
     * @returns {Componente}
     */
    this.buscar=function(texto,valor) {
        this.abortarBusqueda();

        if(!this.buscando) {
            this.buscando=true;
            ui.mostrarPrecarga("barra");
        }
        this.seleccionarPrimerElemento=false;

        var t=this,
            obj={campo:this.nombre};

        if(texto) obj.buscar=texto;
        else obj.valor=valor;
        
        this.ajax=this.procesarEvento("buscar","buscar",null,null,obj,function(resultado) {
                t.buscando=false;
                ui.ocultarPrecarga("barra");

                t.resultados=resultado;

                if(t.seleccionarPrimerElemento||valor) { //Si fue invocado buscar(null,valor) también seleccionar el primero automáticamente
                    if(resultado.length) t.establecerValor(0);
                    return;
                }

                t.mostrarResultados();
            },true);

        return this;
    };

    /**
     * Aborta la búsqueda actual.
     * @returns {Componente}
     */
    this.abortarBusqueda=function() {
        if(!this.buscando) return this;

        this.cerrarResultados();
        this.buscando=false;

        if(typeof this.ajax!=="undefined") this.ajax.abortar();

        ui.ocultarPrecarga("barra");

        return this;
    };

    /**
     * Cierra el desplegable de resultados.
     * @returns {Componente}
     */
    this.cerrarResultados=function() {
        if(this.elementoResultados) this.elementoResultados.remover();
        this.elementoResultados=null;
        this.resultados=[];
        return this;
    };

    /**
     * Devuelve el valor de una propiedad del item de acuerdo al valor configurado en las propiedades del componente.
     * @param {*} propiedad 
     * @param {*} obj 
     * @returns {string|null}
     */
    var obtenerValorItem=function(propiedad,obj) {
        var valor=this.propiedad(propiedad);

        //Predeterminados
        if(!valor) valor={propiedadValor:"id",propiedadEtiqueta:"titulo"}[propiedad];

        //Expresión
        if(expresion.contieneExpresion(valor)) return ui.evaluarExpresion(valor,obj);

        //Nombre de propiedad
        if(obj.hasOwnProperty(valor)) return obj[valor];
        
        return null;
    }.bind(this);

    /**
     * Muestra el desplegable de resultados.
     * @returns {Componente}
     */
    this.mostrarResultados=function() {
        if(this.elementoResultados) this.elementoResultados.remover();
        this.elementoResultados=document.crear("<div class='resultados-busqueda'>");
        this.elemento.anexar(this.elementoResultados);

        if(!this.resultados.length) {
            this.elementoResultados.anexar("<span class='sin-datos'>No se encontraron coincidencias.</span>");
            return this;
        }

        var t=this,
            clickItem=function(ev) {
                ev.preventDefault();
                ev.stopPropagation();

                t.establecerValor(this.dato("indice"));
                t.campo.focus();
            };

        this.resultados.forEach(function(item,indice) {
            var etiqueta=obtenerValorItem("propiedadEtiqueta",item);

            t.elementoResultados.anexar(
                document.crear("<a href='#'>")
                    .dato("indice",indice)
                    .establecerHtml(etiqueta)
                    .evento("mousedown",clickItem)
            );
        });
    };

    /**
     * Establece el valor entre los resultados de la búsqueda.
     * @param {number} indice - Índice del elemento a seleccionar.
     * @returns {Componente}
     */
    this.establecerValor=function(indice) {
        this.item=this.resultados[indice];

        this.valorActual=obtenerValorItem("propiedadValor",this.item);
        this.etiquetaActual=obtenerValorItem("propiedadEtiqueta",this.item);

        this.campo.valor(this.etiquetaActual);

        this.cerrarResultados();

        return this;
    };

    /**
     * Evento Intro.
     * @returns {Componente}
     */
    this.intro=function(ev) {
        if(!ui.enModoEdicion()) {
            if(this.buscando) {
                //Si está buscando, seleccionar el primer elemento en cuanto se complete la búsqueda
                this.seleccionarPrimerElemento=true;
            } else if(this.resultados.length) {
                //Si está mostrando los resultados de búsqueda, seleccionar el primer elemento
                //TODO Navegación por teclado
                this.establecerValor(0);
            } else {
                //Enviar formulario con Enter
                var manejador=this.propiedad("intro");
                //Si hay un evento definido por el usuario, dejar que sea procesado
                if(!manejador) {
                    //Detener evento, aunque sea multilínea
                    ev.stopPropagation();
                    return true;
                }
            }
        }

        return this.introComponente(evento);
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        if(propiedad=="relleno") {
            this.campo.atributo("placeholder",valor);
            return this;
        }

        if(propiedad=="deshabilitado") {
            //Aplicar al campo (por defecto se aplica al elemento)
            if(valor) {
                this.campo.propiedad("disabled",true);
            } else {
                this.campo.removerAtributo("disabled");
            }
            return this;
        }        
        
        if(propiedad=="valor") return this; //No se asigna al campo realmente

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Evento Listo.
     * @returns {componente}
     */
    this.listo=function() {
        var valor=ui.evaluarExpresion(this.propiedad("valor"));
        if(valor) this.valor(valor);
        return this;
    };

    /**
     * Devuelve o establece el valor del componente.
     * @param {*} [valor] - Valor a establecer. Si se omite, devolverá el valor actual.
     * @returns {(*|undefined)}
     */
    this.valor=function(valor) {
        if(typeof valor==="undefined") {
            return this.valorActual;
        } else {
            this.buscar(null,valor);
        }
    };

    /**
     * Devuelve el objeto correspondiente al item seleccionado.
     * @returns {Object}
     */
    this.obtenerItem=function() {
        return this.item;
    };
};

ui.registrarComponente("buscador",componenteBuscador,configComponente.clonar({
    descripcion:"Campo de búsqueda",
    etiqueta:"Búsqueda",
    grupo:"Formulario",
    icono:"buscador.png"
}));