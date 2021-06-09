/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Agenda.
 * @class
 * @extends componente
 */
var componenteAgenda=function() {    
    "use strict";

    var t=this,
        altoBloque=60, //Valor predeterminado
        duracionBloque=60, //Valor predeterminado
        horaMinima=null,
        horaMaxima=null,
        ultimaHoraMinima=null,
        ultimaHoraMaxima=null;

    this.componente="agenda";
    this.iterativo=true;
    
    this.barraHorarios=null;
    this.descartarValores=false;

    /**
     * Propiedades de Agenda.
     */
    this.propiedadesConcretas={
        "Agenda":{
            bloque:{
                etiqueta:"Duración de cada bloque",
                ayuda:"En minutos."
            },
            altoBloque:{
                etiqueta:"Alto del bloque"                
            },
            colorDivisiones:{
                etiqueta:"Color de las divisiones",
                tipo:"color"
            },
            colorSubdivisiones:{
                etiqueta:"Color de las subdivisiones",
                tipo:"color"
            },
            subdividir:{
                etiqueta:"Subdividir bloques",
                tipo:"logico",
                ayuda:"Activar para subdividir los bloques por la mitad. Por ejemplo, si la duración del bloque es de 60 minutos, presentará subdivisiones cada\
                    30 min. El efecto es solo estético."
            },
            fecha:{
                etiqueta:"Fecha",
                ayuda:"Fecha del día que representa. Admite el nombre (o ruta) de una propiedad de su origen de datos.",
                adaptativa:false
            },
            horaActual:{
                etiqueta:"Señalar hora actual",
                ayuda:"Señala la hora actual, si la fecha asignada coincide con la fecha de hoy.",
                tipo:"logico",
                adaptativa:false
            },
            hora:{
                etiqueta:"Mostrar barra de horario",
                tipo:"logico"
            },
            horaMinima:{
                etiqueta:"Hora mínima",
                ayuda:"H:mm (24 horas)."
            },
            horaMaxima:{
                etiqueta:"Hora máxima",
                ayuda:"H:mm (24 horas)."
            },
            propiedadDesde:{
                etiqueta:"Propiedad Desde",
                adaptativa:false
            },
            propiedadHasta:{
                etiqueta:"Propiedad Hasta",
                adaptativa:false
            },
            modo:{
                etiqueta:"Modo de origen",
                tipo:"opciones",
                opciones:{
                    fecha:"Fechas",
                    minutos:"Horas o minutos"
                }
            },
            extenderHorario:{
                etiqueta:"Extender horario",
                ayuda:"Especifica si se debe extender el horario mínimo o máximo si alguno de los elementos se excede de los mismos.",
                tipo:"logico"
            },
            filtrarPropiedades:{
                etiqueta:"Devolver propiedades",
                adaptativa:false,
                ayuda:"Propiedades a incluir de cada elemento del listado del valor devuelto, separadas por coma (por defecto\
                    devuelve el objeto original)."
            },
            filtrarItems:{
                etiqueta:"Filtrar valor devuelto",
                adaptativa:false,
                ayuda:"Nombre de una propiedad a evaluar en cada elemento del listado. Solo se incluirán en el valor devuelto aquellos\
                    elementos cuya valor se evalúe como verdadero (truthy)."
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this;

        this.contenedor=this.elemento.querySelector(".componente-agenda-plantilla");
        this.barraHorarios=this.elemento.querySelector(".agenda-barra-horarios");

        this.clasesCss.push("subdividir");

        this.prototipo.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div>"); 
        
        this.contenedor=document.crear("<div class='componente-agenda-plantilla'></div>")
            .anexarA(this.elemento);

        this.generarFondo()
            .construirHorarios();

        this.prototipo.crear.call(this);
        return this;
    };

    /**
     * Evento Listo.
     */
    this.listo=function() {
        this.actualizar();
        this.prototipo.listo.call(this);
    };    

    /**
     * Procesa un evento.
     * @param {string} nombre - Nombre del evento.
     * @param {string} propiedad - Nombre de la propiedad.
     * @param {string} [metodo] - Método interno del componente.
     * @param {Event} [evento] - Objeto nativo del evento.
     * @param {*} [parametros] - Parámetros a pasar a la función.
     * @param {function} [retorno] - Función de retorno.
     * @param {boolean} [silencioso=false] - Deshabilita la precarga en caso de llamados al servidor.
     * @param {boolean} [nuevaVentana=false] - En caso de navegación, abrir la nueva vista o URL en una nueva ventana.
     * @returns {(ajax|*|undefined)}
     */
    this.procesarEvento=function(nombre,propiedad,metodo,evento,parametros,retorno,silencioso,nuevaVentana) {
        if(typeof parametros=="undefined") parametros={};

        if(evento instanceof MouseEvent||evento instanceof TouchEvent) {
            //Determinar la hora correspondiente a la posición donde se produjo el evento
            
            var bloque=obtenerParametrosBloque(),
                y=evento.offsetY,
                modo=this.propiedad(false,"modo"),
                subdividir=this.propiedad("subdividir"),
                fecha=this.propiedad("fecha"),
                minutos=(y/bloque.alto)*bloque.duracion;

            //Redondear los minutos al bloque más cercano, considerando subdivisiones
            var bloques=Math.floor(minutos/(bloque.duracion/(subdividir?2:1)));
            minutos=bloques*bloque.duracion;
            //Sumar los minutos hasta el primer bloque
            minutos+=obtenerHoraMinima();
            
            if(modo=="fecha") {
                parametros.fecha=fecha+minutos*60;
            } else {
                parametros.fecha=minutos;
            }
        }

        return this.prototipo.procesarEvento.call(this,nombre,propiedad,metodo,evento,parametros,retorno,silencioso,nuevaVentana);
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        //Reconstruir solo si cambió alguna de las propiedades
        if(~["hora","altoBloque","colorDivisiones","colorSubdivisiones","subdividir","horaMinima","horaMaxima"].indexOf(propiedad))
            this.actualizar().generarFondo().construirHorarios();

        //Las propiedades con expresiones se ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(!ui.enModoEdicion()||!expresion.contieneExpresion(valor)) {
	        if(propiedad=="subdividir") {
	            if(valor!==true&&valor!==1) {
	                this.elemento.removerClase("subdividir");
	            } else {
	                this.elemento.agregarClase("subdividir");
	            }
	            return this;
	        }

            if(propiedad=="hora") {
	            if(valor!==true&&valor!==1) {
	                this.elemento.agregarClase("ocultar-hora");
	            } else {
	                this.elemento.removerClase("ocultar-hora");
	            }
	            return this;
	        }
	    }

        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    var obtenerParametrosBloque=(function() {
        var valor=this.propiedad("altoBloque");
        if(valor&&!isNaN(valor)) altoBloque=valor;
        
        valor=this.propiedad("bloque");
        if(valor&&!isNaN(valor)) duracionBloque=valor;

        return {
            alto:altoBloque,
            duracion:duracionBloque
        };
    }).bind(this);

    /**
     * Actualiza el componente.
     * @returns {componenteAgenda}
     */
    this.actualizarIterativo=function() {
        obtenerParametrosBloque();

        this.prototipo.actualizarIterativo.call(this);
        
        if(this.redibujar) {
            this.generarFondo()
                .construirHorarios();
        }

        return this;
    };

    /**
     * Genera y asigna la imagen de fondo.
     * @reutrns {componenteAgenda}
     */
    this.generarFondo=function() {
        if(!this.elemento) return this;

        //Es mucho más eficiente y rápido (especialmente en móviles) utilizar una imagen de fondo para subdividir los horarios y luego posicionar los
        //eventos en forma absoluta, que agregar un elemento por cada franja horaria. Creamos la imagen dinámicamente (el formato SVG se debe simplemente
        //a que es lo más sencillo) a fin de tener control sobre sus dimensiones en lugar de acoplarnos a una imagen externa predefinida.
        
        var colorDivisiones=this.propiedad("colorDivisiones"),
            colorSubdivisiones=this.propiedad("colorSubdivisiones");
        //Valores predeterminados
        if(!colorDivisiones) colorDivisiones="#dadce0";
        if(!colorSubdivisiones) colorSubdivisiones="#efefef";

        var svg="<svg width='10' height='"+altoBloque+"' xmlns='http://www.w3.org/2000/svg'><g>\
            <line stroke='"+encodeURIComponent(colorDivisiones)+"' x1='0' y1='"+altoBloque+"' x2='10' y2='"+altoBloque+"' stroke-width='1' shape-rendering='crispEdges'/>";

        if(this.propiedad("subdividir")) {
            var y=Math.round(altoBloque/2);
            svg+="<line stroke='"+encodeURIComponent(colorSubdivisiones)+"' x1='0' y1='"+y+"' x2='10' y2='"+y+"' stroke-width='1' shape-rendering='crispEdges'/>";
        }
            
        svg+="</g></svg>";

        obtenerEstilos().backgroundImage="url(\"data:image/svg+xml;utf8,"+svg+"\")";

        return this;
    };

    var obtenerEstilos=(function(selector) {
        if(typeof selector=="undefined")
            return this.obtenerEstilos("g");

        //Para elementos hijos, generar un nuevo selector en la hoja de estilos
        return ui.obtenerEstilos(this.selector+" "+selector,"g")[0].estilos;
    }).bind(this);

    var obtenerHoraMinima=(function() {
        if(horaMinima===null) {
            horaMinima=this.propiedad("horaMinima");
            if(isNaN(horaMinima)) horaMinima=util.horasAMinutos(horaMinima);
            if(!horaMinima||horaMinima<0) horaMinima=0;
        }

        return horaMinima;
    }).bind(this);

    /**
     * Construye la barra lateral de horarios.
     * @reutrns {componenteAgenda}
     */
    this.construirHorarios=function() {
        if(!this.contenedor) return this;

        var mostrar=this.propiedad("hora");
        if(mostrar===null) mostrar=true; //por defecto, true
            
        var minimo=obtenerHoraMinima(),        
            maximo=horaMaxima!==null?
                horaMaxima:
                this.propiedad("horaMaxima");

        if(isNaN(maximo)) maximo=util.horasAMinutos(maximo);
        if(!maximo||maximo<=hora||maximo>1439) maximo=1439;

        //Siempre establecer el alto del componente
        obtenerEstilos().minHeight=((((maximo-hora)/duracionBloque)*altoBloque)-1)+"px";

        if(!mostrar&&this.barraHorarios) {
            this.barraHorarios.remover();
            this.barraHorarios=null;
            return this;
        }

        //No regenerar si el rango no cambió
        if(this.barraHorarios&&ultimaHoraMinima!==null&&ultimaHoraMaxima!==null&&ultimaHoraMinima<=minimo&&ultimaHoraMaxima>=maximo)
            return this;

        if(this.barraHorarios) {
            this.barraHorarios.establecerHtml("");
        } else {
            this.barraHorarios=document
                .crear("<div class='agenda-barra-horarios'>")
                .anexarA(this.elemento);
        }

        ultimaHoraMinima=minimo;
        ultimaHoraMaxima=maximo;

        for(var hora=minimo;hora<maximo;hora+=duracionBloque)
            document.crear("label")
                .establecerTexto(util.minutosAHoras(hora))
                .anexarA(this.barraHorarios);

        obtenerEstilos(".agenda-barra-horarios label").height=altoBloque+"px";
        obtenerEstilos(".agenda-barra-horarios label:last-child").height=(altoBloque-1)+"px";

        return this;
    };

    /**
     * Genera y agrega un nuevo item correspondiente a un elemento del origen de datos.
     * @param {Node} destino - Elemento de destino.
     * @param {*} objeto - Objeto o elemento del origen de datos.
     * @param {number} indice - Indice del elemento en el listado u origen de datos.
     * @returns {Node}
     */
    this.generarItem=function(destino,objeto,indice) {
        var divEvento=document
            .crear("<div class='agenda-evento'>")
            .dato("indice",indice)
            .anexarA(destino);

        this.prototipo.generarItem.call(this,divEvento,objeto,indice);
    };

    /**
     * Genera los items del componente.
     * @param {number} [indice] - Índice del objeto de datos que se desea generar. Si se omite, iterará sobre todo el origen de datos. 
     * @param {object[]} [listado] - Listado a utilizar. Por defecto, utilizará el origen de datos.
     * @param {Node} [destino] - Elemento de destino. Por defecto, utilizará el elemento del componente.
     * @returns {componenteAgenda}
     */
    this.generarItems=function(indice,listado,destino) {
        this.posicionarEventos();
        this.prototipo.generarItems.call(this,indice,listado,destino);
        this.actualizarEventos();
    };

    /**
     * Calcula el posicionamiento de los eventos de acuerdo a su horario.
     * @returns {componenteAgenda}
     */
    this.posicionarEventos=function() {
        var eventos=this.obtenerDatos(),
            resultado=[];

        if(!eventos||!util.esArray(eventos)) return;

        horaMinima=null;
        horaMaxima=null;

        //Reiniciar hora mínima al valor por defecto o configurado
        obtenerHoraMinima();

        var modo=this.propiedad(false,"modo"),
            bloque=obtenerParametrosBloque(),
            fecha=this.propiedad("fecha"),
            desde=this.propiedad(false,"propiedadDesde"),
            hasta=this.propiedad(false,"propiedadHasta");

        //Propiedades predeterminadas
        if(!desde) desde="desde";
        if(!hasta) hasta="hasta";

        for(var i=0;i<eventos.length;i++) {
            var item=eventos[i];
            if(item.hasOwnProperty(desde)&&item.hasOwnProperty(hasta)) {
                //Convertir horas a minutos, guardar resultados en _desde y _hasta para no sobreescribir los valores originales
                if(modo=="minutos") {
                    if(isNaN(item[desde])) {
                        item._desde=util.horasAMinutos(item[desde]);
                    } else {
                        item._desde=parseInt(item[desde]);
                    }
                    
                    if(isNaN(item[hasta])) {
                        item._hasta=util.horasAMinutos(item[hasta]);
                    } else {
                        item._hasta=parseInt(item[hasta]);
                    }
                } else {
                    //Restar la fecha del día
                    item._desde=item[desde]-fecha;
                    item._hasta=item[hasta]-fecha;
                }

                //Mantener solo eventos válidos
                if(item._desde>=item._hasta) continue;

                resultado.push(item);

                //Buscar el horario mínimo y máximo
                if(horaMinima===null||item._desde<horaMinima) horaMinima=item._desde;
                if(horaMaxima===null||item._hasta>horaMaxima) horaMaxima=item._hasta;

                //TODO Corregir fechas de eventos que comiencen o finalicen en un día distinto
                //Sería posible solo en modo fecha                
            }
        }

        //Ordenar eventos por hora de inicio, luego por duración
        resultado
            .sort(function(a,b) {
                return a._desde>b._desde?1:-1
            })
            .sort(function(a,b) {
                return (a._hasta-a._desde)<=(b._hasta-b._desde)?1:0
            });

        //Posicionar verticalmente
        resultado.forEach(function(item) {
            item._posicion={
                x:0,
                y:((item._desde-horaMinima)/bloque.duracion)*bloque.alto,
                alto:((item._hasta-item._desde)/bloque.duracion)*bloque.alto
            };       
        });

        //TODO Mejorar posicionamiento horizontal de superposiciones
        for(var i=0;i<resultado.length;i++) {
            var cant=0;
            for(var j=0;j<i;j++) {
                if(!(resultado[i]._hasta<=resultado[j]._desde||resultado[i]._desde>=resultado[j]._hasta))
                    cant++;
            }
            resultado[i]._posicion.x=10*cant;
        }        
        
        //Regenerar barra de horarios si es necesario (si hay eventos que se exceden los valores actuales)
        this.construirHorarios();

        this.datos=resultado;
    };

    /**
     * Actualiza los contenedores de los eventos.
     * @returns {componenteAgenda}
     */
    this.actualizarEventos=function() {
        this.elemento.querySelectorAll(".agenda-evento").forEach(function(elem) {
            if(elem.obtenerHtml()=="") {
                elem.remover();
                return;
            }

            var obj=t.datos[elem.dato("indice")];

            //Posicionamiento
            elem.estilos({
                top:obj._posicion.y,
                marginLeft:obj._posicion.x,
                height:obj._posicion.alto
            });
        });

        return this;
    };
};

ui.registrarComponente("agenda",componenteAgenda,configComponente.clonar({
    descripcion:"Agenda diaria",
    etiqueta:"Agenda",
    grupo:"Formulario",
    icono:"agenda.png"
}));