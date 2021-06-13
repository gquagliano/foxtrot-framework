/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Constructor de calendarios HTML.
 * @param {Object} opciones - Opciones.
 * @param {number} [opciones.valor] - Valor en tiempo epoch.
 * @param {function} [opciones.retorno] - Función a invocar cuando cambie el valor seleccionado. Recibirá como parámetros el nuevo valor y la instancia del calendario.
 * @class
 */
function calendario(opciones) {
    "use strict";

    //TODO Deshabilitar fechas
    //TODO Seleccionar rangos
    //TODO Idiomas

    var t=this;

    this.valorActual=null;
    this.elem=null;
    this.mes=null;
    this.ano=null;

    this.opciones={};

    this.meses=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    this.dias=["D","L","M","M","J","V","S"];

    /**
     * Establece las opciones de configuración del calendario. No actualizará ni reconstuirá el calendario si el mismo ya fue construído.
     * @param {Object} opciones - Opciones.
     * @param {number} [opciones.valor] - Valor en tiempo epoch.
     * @param {function} [opciones.retorno] - Función a invocar cuando cambie el valor seleccionado. Recibirá como parámetros el nuevo valor y la instancia del calendario.
     * @returns {Calendario}
     */
    this.establecerOpciones=function(opciones) {
        this.opciones=Object.assign({
            valor:util.epoch(),
            retorno:null
        },opciones);
        
        this.valorActual=this.opciones.valor;

        return this;
    };

    //Eventos
    var clickMesAnterior=function(ev) {
        ev.preventDefault();
        t.mes--;
        if(t.mes<0) {
            t.mes=11;
            t.ano--;
        }
        t.construirCuerpo();
    },
    clickMesSiguiente=function(ev) {
        ev.preventDefault();
        t.mes++;
        if(t.mes>11) {
            t.mes=0;
            t.ano++;
        }
        t.construirCuerpo();
    },
    clickAnoAnterior=function(ev) {
        ev.preventDefault();
        t.ano--;
        t.construirCuerpo();
    },
    clickAnoSiguiente=function(ev) {
        ev.preventDefault();
        t.ano++;
        t.construirCuerpo();
    },
    clickFecha=function(ev) {
        ev.preventDefault();

        var val=parseInt(this.atributo("rel"));

        t.valorActual=val;

        var elem=t.elem.querySelector(".calendario-seleccion");
        if(elem) elem.removerClase("calendario-seleccion");
        this.agregarClase("calendario-seleccion");

        ejecutarRetorno();
    };

    /**
     * Construye una celda del calendario.
     * @param {number} ano 
     * @param {number} mes 
     * @param {number} dia 
     * @param {number} hoy 
     * @param {number} fechaSeleccionada 
     * @returns {HTMLTableCellElement}
     */
    var construirDia=function(ano,mes,dia,hoy,fechaSeleccionada) {
        var fecha=new Date(ano,mes,dia);

        var div=document.crear("div"),
            a=document.crear("<a tabindex='-1' href='#' rel='"+util.fechaAEpoch(fecha)+"'>"+dia+"</a>")
                .anexarA(div)
                .evento("click",clickFecha);

        if(iguales(hoy,fecha)) a.agregarClase("calendario-hoy");
        if(iguales(fechaSeleccionada,fecha)) a.agregarClase("calendario-seleccion");

        return div;
    };

    /**
     * Devuelve la cantidad de días del mes.
     * @param {number} ano
     * @param {number} mes
     * @returns {number}
     */
    var diasDelMes=function(ano,mes) {
        var m=[31,28,31,30,31,30,31,31,30,31,30,31];
        if(ano%4==0&&ano!=1900) m[1]=29;
        return m[mes];
    };

    /**
     * Determina si dos fechas son iguales.
     * @param {Date} a 
     * @param {Date} b 
     * @returns {boolean}
     */
    var iguales=function(a,b) {
        return a.getUTCDate()==b.getUTCDate()&&a.getUTCMonth()==b.getUTCMonth()&&a.getUTCFullYear()==b.getUTCFullYear();
    };

    /**
     * Invoca la función de retorno.
     */
    var ejecutarRetorno=function() {
        if(t.opciones.retorno) t.opciones.retorno(t.valorActual,t);
    };

    /**
     * Construye el calendario dentro del elemento especificado.
     * @param {Node} destino - Elemento de destino.
     * @returns {Calendario}
     */
    this.construir=function(destino) {
        var fechaHoy=util.epochAFecha(this.valorActual);
        this.mes=fechaHoy.getUTCMonth();
        this.ano=fechaHoy.getUTCFullYear();

        //Destruir el calendario si ya se ha construído
        if(this.elem) this.elem.remover();

        this.elem=document.crear("<div class='calendario'>")
            .anexarA(destino)
            .anexar(
                documento.crear("<div class='calendario-nav'>")
                    .anexar(
                        documento.crear("<a tabindex='-1' href='#' class='btn calendario-btn-ano-previo' title='Año anterior'></a>")
                            .evento("click",clickAnoAnterior)
                    )
                    .anexar(
                        documento.crear("<a tabindex='-1' href='#' class='btn calendario-btn-mes-previo' title='Mes anterior'></a>")
                            .evento("click",clickMesAnterior)
                    )
                    .anexar(
                        documento.crear("<span class='calendario-titulo'>")
                    )
                    .anexar(
                        documento.crear("<a tabindex='-1' href='#' class='btn calendario-btn-mes-siguiente' title='Mes siguiente'></a>")
                            .evento("click",clickMesSiguiente)
                    )
                    .anexar(
                        documento.crear("<a tabindex='-1' href='#' class='btn calendario-btn-ano-siguiente' title='Año siguiente'></a>")
                            .evento("click",clickAnoSiguiente)
                    )
            );

        this.construirCuerpo();

        return this;
    };

    /**
     * Construye o reconstruye el cuerpo del calendario.
     * @returns {Calendario}
     */
    this.construirCuerpo=function() {
        var hoy=new Date();
        var fechaSeleccionada=util.epochAFecha(this.valorActual);

        this.elem.querySelector(".calendario-titulo")
            .establecerTexto(this.meses[this.mes]+" "+this.ano)
            .atributo("title",this.meses[this.mes]+" "+this.ano);

        var cuerpo=document.crear("div");
        cuerpo.className="calendario-cuerpo";

        var ano=this.ano;
        var mes=this.mes;

        var mesAnterior=mes-1;
        var anoMesAnterior=ano;
        if(mesAnterior<0) {
            mesAnterior=11;
            anoMesAnterior--;
        }

        var mesSiguiente=mes+1;
        var anoMesSiguiente=ano;
        if(mesSiguiente>11) {
            mesSiguiente=0;
            anoMesSiguiente++;
        }

        //Obtener el día de la semana del 1° del mes
        var primerDia=new Date(ano,mes,1).getDay();

        var total=diasDelMes(ano,mes);
        var totalMesAnterior=diasDelMes(anoMesAnterior,mesAnterior);

        //Generar encabezado
        var divDias=document.crear("div");
        for(var i=0;i<this.dias.length;i++)
            divDias.anexar(
                document.crear("label").establecerTexto(this.dias[i])
            );            
            cuerpo.anexar(divDias);

        var div=document.crear("div"),
            diaSemana=0;

        //Agregar últimos días del mes anterior
        for(i=1; i<=primerDia; i++) {
            var n=totalMesAnterior-primerDia+i;

            construirDia(anoMesAnterior,mesAnterior,n,hoy,fechaSeleccionada)
                .agregarClase("calendario-dias-mes-previo")
                .anexarA(div);

            diaSemana++;
        }

        //Generar semanas (<tr>) y días del mes
        for(i=1;i<=total;i++) {
            //Cada 7 días, insertar en la tabla y generar nuevo tr
            if (diaSemana%7==0) {
                if (diaSemana>0) cuerpo.anexar(div);
                div=document.crear("div");
            }

            construirDia(ano,mes,i,hoy,fechaSeleccionada)
                .anexarA(div)

            diaSemana++;
        }

        //Agregar días del mes siguiente hasta completar la tabla
        if(diaSemana%7>0) {
            var dif=7-diaSemana%7;
            for(i=1;i<=dif;i++)
                construirDia(anoMesSiguiente,mesSiguiente,i,hoy,fechaSeleccionada)
                    .agregarClase("calendario-dias-mes-siguiente")
                    .anexarA(div)
        }
        
        cuerpo.anexar(div);

        var cuerpoViejo=this.elem.querySelector("div.calendario-cuerpo");
        if(cuerpoViejo) cuerpoViejo.remover();
        this.elem.anexar(cuerpo);

        return this;
    };

    /**
     * Establece o devuelve la fecha actual en tiempo epoch.
     * @param {number} [valor] - Valor a establecer.
     * @returns {(number|Object)}
     */
    this.valor=function(valor) {
        if(typeof valor!=="undefined") {
            this.valorActual=valor;
            this.construirCuerpo();
            return this;
        }
        return this.valorActual;
    };

    /**
     * Remueve y destruye el DOM del calendario.
     * @returns {Calendario}
     */
    this.destruir=function() {
        if(this.elem) this.elem.remover();
        return this;
    };

    if(typeof opciones!=="undefined") this.establecerOpciones(opciones);
};

window["calendario"]=calendario;