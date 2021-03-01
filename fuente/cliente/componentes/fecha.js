/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Campo de fecha o calendario.
 * @class
 * @extends componente
 */
var componenteFecha=function() {   
    "use strict"; 

    var t=this;

    this.componente="fecha";

    this.valorEpoch=null;
    this.desplegable=null;
    this.calendario=null;

    /**
     * Propiedades de Campo.
     */
    this.propiedadesConcretas={
        "Fecha":{
            valorInicial:{
                etiqueta:"Valor inicial",
                adaptativa:false,
                ayuda:"En tiempo epoch (UTC)"
            },
            relleno:{
                etiqueta:"Texto de relleno",
                adaptativa:false
            }
        }
        //TODO Formato
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.campo=this.elemento.querySelector("input");

        if(!ui.enModoEdicion()) this.valor(null);

        this.prototipo.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div tabindex='0'>");
        this.campo=document.crear("<input class='form-control' autocomplete='off' type='text'>")
            .anexarA(this.elemento);
        this.prototipo.crear.call(this);
        return this;
    };

    /**
     * Establece los eventos predeterminados.
     */
    this.establecerEventos=function() {
        var t=this;

        this.campo.removerEventos();

        this.campo.evento("keydown",function(ev) {
            if(ev.which==27) { //ESC
                ev.preventDefault();
                t.cerrarCalendario();
            } else if(ev.which==13) { //Intro
                t.procesarIntro(ev);
            }
        });

        this.campo.evento("paste input",function(ev) {
            //Al borrar todo el texto, reestablecer
            if(t.campo.valor()=="") t.valorEpoch(null);
        })
        .evento("focus",function(ev) {
            this.select();
            t.abrirCalendario(); 
        })
        .evento("focusout",function(ev) {
            t.validarValor();
        });

        this.elemento.evento("focusout",function(ev) {
            //Ignorar si el foco permanece dentro del div (el focusout se está propagando desde alguno de los hijos)
            if(ev.relatedTarget&&(ev.relatedTarget.es({elemento:this})||ev.relatedTarget.padre({elemento:this}))) return;            
            //O si está en modo adaptado
            var tamano=ui.obtenerTamano();
            if(tamano=="xs"||tamano=="sm") return;

            t.cerrarCalendario();
        });

        return this;
    };

    /**
     * Evento Intro.
     * @returns {Componente}
     */
    this.intro=function(ev) {
        if(!ui.enModoEdicion()) {
            //Enviar formulario con Enter
            var controlador=t.propiedad(null,"intro");
            if(!controlador) { //Si hay un evento definido por el usuario, dejar que sea procesado
                this.enviarFormulario();
                ev.preventDefault();
                ev.stopPropagation();
                return true;
            }
        }

        return this.prototipo.intro.call(this,evento);
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

        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Despliega el calendario.
     * @returns {Componente}
     */
    this.abrirCalendario=function() {
        if(!this.desplegable) this.desplegable=ui.crearDesplegable(this,{
                destruir:true,
                retornoCierre:function() {
                    t.desplegable=null;
                    t.campo.blur();
                },
                anchoComponente:false,
                redimensionar:false,
                mantener:true,
                clase:"desplegable-calendario"
            });
        
        if(this.calendario) {
            this.calendario.destruir();
        } else {
            this.calendario=new calendario;
        }
        
        var opc={
            retorno:function(valor) {
                t.establecerValor(valor);
            }
        };
        if(this.valorEpoch) opc.valor=this.valorEpoch;
        this.calendario.establecerOpciones(opc)
            .construir(this.desplegable.obtenerElemento());

        ui.abrirDesplegable(this.desplegable);

        return this;        
    };

    /**
     * Cierra el calendario.
     * @returns {Componente}
     */
    this.cerrarCalendario=function() {
        if(this.desplegable) {
            ui.cerrarDesplegable(this.desplegable);
            this.desplegable=null;
        }
        return this;        
    };

    /**
     * Establece la fecha.
     * @param {(number|null)} epoch - Fecha epoch.
     * @returns {Componente}
     */
    this.establecerValor=function(epoch) {
        this.valorEpoch=epoch;
        var valor="";
        if(epoch) valor=util.fecha(util.epochAFecha(epoch));
        this.campo.valor(valor);
        return this;
    };

    /**
     * Valida y convierte el valor actual del campo.
     * @returns {Componente}
     */
    this.validarValor=function() {
        var v=this.campo.valor(),
            error=function() {
                t.campo.valor("");
                ui.alerta("No es una fecha válida.",function() {
                    t.campo.focus();
                });
            };

        if(!v||v.trim()=="") return this;

        var regexp=/^([0-9]{1,2})(\/([0-9]{1,2})(\/([0-9]{2,4}))?)?$/,
            coincidencias=v.match(regexp);

        if(!coincidencias) {
            error();
            return this;
        }
        
        var dia=parseInt(coincidencias[1]),
            mes,
            ano;
        if(dia<1||dia>31) {
            error();
            return this;            
        }

        if(typeof coincidencias[3]!=="undefined") {
            mes=parseInt(coincidencias[3])-1;
            if(mes<0||mes>11) {
                error();
                return this;            
            }
        } else {
            mes=new Date().getUTCMonth();
        }

        if(typeof coincidencias[5]!=="undefined") {
            ano=parseInt(coincidencias[5]);
            if(ano<1||ano>9999) { //¿?
                error();
                return this;            
            }
        } else {
            ano=new Date().getUTCFullYear();
        }

        var fecha=new Date(ano,mes,dia,0,0,0,0);
        this.valorEpoch=util.fechaAEpoch(fecha);

        var anoCadena=ano.toString();
        if(anoCadena.length==3) anoCadena="2"+anoCadena;
        else if(anoCadena.length==2) anoCadena="20"+anoCadena;
        else if(anoCadena.length==1) anoCadena="200"+anoCadena;
        this.campo.valor(dia.toString()+"/"+(mes+1).toString()+"/"+anoCadena);

        return this;
    };    

    /**
     * Devuelve o establece el valor del componente.
     * @param {*} [valor] - Valor a establecer. Si se omite, devolverá el valor actual.
     * @returns {(*|Componente)}
     */
    this.valor=function(valor) {
        if(typeof valor==="undefined") {
            return this.valorEpoch;
        } else {
            //Si es null, volver al valor inicial (puede contener expresiones)
            if(valor===null) valor=this.propiedad("valorInicial");
            this.establecerValor(valor);
        }
        return this;
    };
};

ui.registrarComponente("fecha",componenteFecha,configComponente.clonar({
    descripcion:"Campo de fecha o calendario",
    etiqueta:"Fecha",
    grupo:"Formulario",
    icono:"fecha.png"
}));