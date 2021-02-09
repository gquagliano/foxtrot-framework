/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Campo de búsqueda.
 * @class
 * @extends componente
 */
var componenteBuscador=function() {  
    "use strict";

    var t=this;

    this.componente="buscador";

    this.desplegableResultados=null;
    this.indiceSeleccionado=-1;

    this.seleccionarPrimerElemento=false;
    this.buscando=false;
    this.resultados=[];
    this.ajax=null;

    if(!ui.hasOwnProperty("_buscador_cacheValores")) ui._buscador_cacheValores={};
    var prefijoCache;

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
            //Deprecada por sobreescribir la propiedad común propiedadValor
            propiedadValor:{
                etiqueta:"Propiedad valor",
                adaptativa:false
            },            
            propiedadValorItem:{
                etiqueta:"Propiedad valor del ítem seleccionado",
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
                adaptativa:false,
                evento:true
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
        
        prefijoCache=this.nombreVista+this.nombre;

        this.clasePadre.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div>");
        this.campo=document.crear("<input class='form-control' autocomplete='off' type='text'>"); 
        this.elemento.anexar(this.campo);
        this.clasePadre.crear.call(this);
        return this;
    };

    /**
     * Establece los eventos predeterminados.
     */
    this.establecerEventos=function() {
        this.campo.removerEventos();

        this.campo.evento("keydown",function(ev) {
            if(ev.which==27) { //ESC
                ev.preventDefault();
                t.abortarBusqueda(true);
                t.cerrarResultados();
            } else if(ev.which==13) { //Intro
                t.procesarIntro(ev);
            } else if(t.resultados&&t.resultados.length&&(ev.which==38||ev.which==40)) { //Arriba/Abajo
                t.moverSeleccion(ev);
            }
        });

        var temporizador;

        this.campo.evento("paste input",function(ev) {
            clearTimeout(temporizador);
            var valor=t.campo.valor();
            if(valor=="") {
                //Al borrar todo el texto, reestablecer
                t.buscando=false;
                t.establecerValor(null);
            } else {
                t.buscando=true;
                temporizador=setTimeout(function() {
                    t.buscar(valor);
                },500);
            }
        });

        this.elemento.evento("focusout",function(ev) {
            //Ignorar si el foco permanece dentro del div (el focusout se está propagando desde alguno de los hijos)
            if(ev.relatedTarget&&(ev.relatedTarget.es({elemento:this})||ev.relatedTarget.padre({elemento:this}))) return;

            t.abortarBusqueda(true);
            t.cerrarResultados();
        });

        return this;
    };

    /**
     * Establece el listado de resultados.
     * @param {object[]} resultados - Listado.
     * @param {boolean} [buscandoUnico=false] - Indica si se está buscando un valor único (para mostrar el valor del campo) o, si es `false`, un listado.
     * @returns {componente}
     */
    this.establecerResultados=function(resultados,buscandoUnico) {
        if(typeof buscandoUnico==="undefined") buscandoUnico=false;

        if(!this.buscando) return this;

        this.buscando=false;

        this.resultados=resultados;

        //Si fue invocado buscar(null,valor) también seleccionar el primero automáticamente
        if(this.seleccionarPrimerElemento||buscandoUnico) {
            if(resultados&&resultados.length&&resultados[0]!==null) this.establecerValor(0);
            return;
        }

        this.mostrarResultados();

        return this;
    };

    /**
     * Inicia una nueva búsqueda.
     * @param {string} texto - Búsqueda por texto.
     * @param {string} [valor] - Busca un elemento específico.
     * @returns {componente}
     */
    this.buscar=function(texto,valor) {
        this.abortarBusqueda();

        this.buscando=true;

        if(valor&&ui._buscador_cacheValores.hasOwnProperty(prefijoCache+valor)) {
            t.establecerResultados([ui._buscador_cacheValores[prefijoCache+valor]],true);
            return;
        }
        
        //this.seleccionarPrimerElemento=false;
        ui.mostrarPrecarga("barra");

        var obj={campo:this.nombre};

        if(texto) obj.buscar=texto;
        else if(valor) obj.valor=valor;
        else return this;
        
        this.ajax=this.procesarEvento("buscar","buscar",null,null,obj,function(res) {
            ui.ocultarPrecarga("barra");

            //Si el manejador no devolvió un listado, esperar a que invoque establecerResultados()
            if(!util.esArray(res)) return;

            t.establecerResultados(res,!!valor);
        },true);

        return this;
    };

    /**
     * Aborta la búsqueda actual.
     * @param {boolean} [revertir=false] - Revertir el valor del campo.
     * @returns {Componente}
     */
    this.abortarBusqueda=function(revertir) {
        if(typeof revertir!=="undefined"&&revertir) this.campo.valor(t.etiquetaActual);

        if(!this.buscando) return this;

        this.buscando=false;
        if(typeof this.ajax==="object"&&this.ajax!==null&&this.ajax instanceof ajax) this.ajax.abortar();
        ui.ocultarPrecarga("barra");

        return this;
    };

    /**
     * Cierra el desplegable de resultados.
     * @returns {Componente}
     */
    this.cerrarResultados=function() {
        if(this.desplegableResultados) {
            ui.cerrarDesplegable(this.desplegableResultados);
            this.desplegableResultados=null;
        }
        this.resultados=[];
        this.indiceSeleccionado=-1;
        this.seleccionarPrimerElemento=false;
        return this;
    };

    /**
     * Devuelve el valor de una propiedad del item de acuerdo al valor configurado en las propiedades del componente.
     * @param {*} propiedad 
     * @param {*} obj 
     * @returns {string|null}
     */
    var obtenerValorItem=function(propiedad,obj) {
        var valor=this.propiedad(false,propiedad);

        //Predeterminados
        if(!valor) valor={propiedadValor:"id",propiedadValorItem:"id",propiedadEtiqueta:"titulo"}[propiedad];

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
        if(!this.desplegableResultados) this.desplegableResultados=ui.crearDesplegable(this,{
                adaptativo:false, //debe permitir continuar escribiendo
                reposicionar:false,
                clase:"buscador-resultados-busqueda",
                retornoCierre:function() {
                    t.desplegableResultados=null;
                    t.abortarBusqueda(true);
                }
            });

        var elem=this.desplegableResultados.obtenerElemento();
        elem.establecerHtml("");

        if(!this.resultados.length) {
            elem.anexar("<span class='sin-datos'>No se encontraron coincidencias.</span>");
        } else {
            var clickItem=function(ev) {
                    ev.preventDefault();
                    ev.stopPropagation();

                    t.establecerValor(this.dato("indice"));
                    t.campo.focus();
                };

            this.resultados.forEach(function(item,indice) {
                var etiqueta=obtenerValorItem("propiedadEtiqueta",item);

                elem.anexar(
                    document.crear("<a href='#'>")
                        .dato("indice",indice)
                        .establecerHtml(etiqueta)
                        .evento("mousedown",clickItem)
                );
            }); 
        }
        
        ui.abrirDesplegable(this.desplegableResultados);

        return this;
    };

    /**
     * Establece el valor entre los resultados de la búsqueda.
     * @param {number|null} indice - Índice del elemento a seleccionar, o null para reestablecer el valor.
     * @returns {Componente}
     */
    this.establecerValor=function(indice) {
        if(indice===null) {
            this.item=null;
            this.valorActual=null;
            this.etiquetaActual="";
        } else {
            this.item=this.resultados[indice];

            //Solución provisoria hasta que sea removido propiedadValor
            var propiedad="propiedadValorItem";
            if(!this.propiedad(false,"propiedadValorItem")) propiedad="propiedadValor";
            this.valorActual=obtenerValorItem(propiedad,this.item);
            
            this.etiquetaActual=obtenerValorItem("propiedadEtiqueta",this.item);

            ui._buscador_cacheValores[prefijoCache+this.valorActual]=this.item;
        }

        this.campo.valor(this.etiquetaActual);

        this.cerrarResultados();

        //Evento
        this.procesarEvento("modificacion","modificacion");

        return this;
    };

    /**
     * Mueve la selección arriba/abajo.
     * @param {Event} ev 
     */
    this.moverSeleccion=function(ev) {
        ev.preventDefault();

        if(!this.desplegableResultados) return;

        if(ev.which==38) { //Arriba
            this.indiceSeleccionado--;
            if(this.indiceSeleccionado<0) this.indiceSeleccionado=this.resultados.length-1;
        } else if(ev.which==40) { //Abajo
            this.indiceSeleccionado++;
            if(this.indiceSeleccionado>=this.resultados.length) this.indiceSeleccionado=0;
        }     
        
        var elem=this.desplegableResultados.obtenerElemento(),
            e=elem.querySelector(".activo");
        if(e) e.removerClase("activo");
        e=elem.querySelector("a:nth-child("+(this.indiceSeleccionado+1)+")"); //nth-child es base 1
        if(e) e.agregarClase("activo");

        //Scroll
        if(e) e.scrollIntoView();
    };

    /**
     * Procesa la tecla Intro (distinto al evento Intro).
     * @returns {Componente}
     */
    this.procesarIntro=function(ev) {
        if(!ui.enModoEdicion()) {
            if(this.buscando) {
                //Si está buscando, seleccionar el primer elemento en cuanto se complete la búsqueda
                this.seleccionarPrimerElemento=true;
                ev.stopPropagation();
                return;
            }
            
            if(this.resultados.length) {
                //Si está mostrando los resultados de búsqueda, seleccionar el elemento activo
                var indice=this.indiceSeleccionado<0?0:this.indiceSeleccionado; //si no se presionó arriba/abajo, indiceSeleccionado=-1, seleccionar el primer elemento
                this.establecerValor(indice);     
                ev.stopPropagation();           
                return;
            }

            //Si no hay un evento definido por el usuario, enviar el formulario
            var manejador=this.propiedad(null,"intro");
            if(!manejador) {
                this.enviarFormulario();
                return;
            }

            //Caso contrario, desencadenar el evento intro estándar
            this.procesarEvento("intro","intro","intro",ev);
        }
    };

    /**
     * Evento Modificacion.
     * @param {Object} evento - Parámetros del evento.
     */
    this.modificacion=function(ev) {
        //Detener evento
        ev.stopPropagation();
        return true;
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(expresion.contieneExpresion(valor)&&ui.enModoEdicion()) valor=null;

        if(propiedad=="relleno") {
            this.campo.atributo("placeholder",valor);
            return this;
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
        
        if(propiedad=="valor") return this; //No se asigna al campo realmente

        this.clasePadre.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Evento Listo.
     */
    this.listo=function() {
        this.clasePadre.listo.call(this);

        if(ui.enModoEdicion()) return;
        
        var valor=this.propiedad("valor");
        if(valor) this.valor(valor);
    };

    /**
     * Devuelve o establece el valor del componente.
     * @param {*} [valor] - Valor a establecer. Si se omite, devolverá el valor actual.
     * @returns {(*|componente)}
     */
    this.valor=function(valor) {
        if(typeof valor==="undefined") {
            return this.valorActual;
        } else if(!valor) {
            this.establecerValor(null);
        } else {
            this.valorActual=valor;
            this.buscar(null,valor);
        }
        return this;
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