/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
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

    var altoBloque=60, //Valor predeterminado
        horaMinima=null,
        horaMaxima=null;

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
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        //Las propiedades con expresiones se ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(!ui.enModoEdicion()||!expresion.contieneExpresion(valor)) {
	        if(propiedad=="subdividir") {
	            if(valor!==true&&valor!==1) {
	                this.elemento.removerClase("subdividir");
	            } else {
	                this.elemento.agregarClase("subdividir");
	            }
                this.generarFondo();
	            return this;
	        }

            //Reconstruir solo si cambió alguna de las propiedades
            if(~["altoBloque","colorDivisiones","colorSubdivisiones","subdividir","horaMinima","horaMaxima"].indexOf(propiedad))
                this.generarFondo().construirHorarios();
	    }

        this.actualizar();

        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Actualiza el componente.
     * @returns {componenteAgenda}
     */
    this.actualizar=function() {
        var redibujar=this.redibujar; //componente.actualizar() reiniciará su valor

        this.prototipo.actualizar.call(this,false);

        var valor=this.propiedad("altoBloque");
        if(valor&&!isNaN(valor)) altoBloque=valor;

        if(!ui.enModoEdicion()) {        
            this.actualizacionEnCurso=true;

            if(redibujar) {
                //Aplicar cambios en los campos
                if(!this.descartarValores) this.obtenerDatosActualizados();
                this.descartarValores=false;
            }

            if(redibujar||!this.datos||!this.datos.length) {
                //Limpiar filas autogeneradas
                ui.eliminarComponentes(this.itemsAutogenerados);
                this.itemsAutogenerados=[];
            }
            
            if(!this.datos) {
                this.actualizacionEnCurso=false;
                return this;
            }        

            if(this.datos.length)
                this.generarItems();
            
            this.actualizacionEnCurso=false;
        }

        if(redibujar) {
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
        if(!this.contenedor) return this;

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

        this.contenedor.estilo("backgroundImage","url(\"data:image/svg+xml;utf8,"+svg+"\")");
        return this;
    };

    /**
     * Construye la barra lateral de horarios.
     * @reutrns {componenteAgenda}
     */
    this.construirHorarios=function() {
        if(!this.contenedor) return this;

        if(this.barraHorarios) this.barraHorarios.remover();

        var mostrar=this.propiedad("hora");
        if(mostrar===false||mostrar===0||mostrar==="0") return this;

        this.barraHorarios=document.crear("<div class='agenda-barra-horarios'>")
            .anexarA(this.elemento);
            
        var hora=horaMinima!==null?
            horaMinima:
            this.propiedad("horaMinima");
        if(!hora||hora<0) {
            hora=0;
        } else {
            hora=util.horasAMinutos(hora);
        }

        var salto=parseInt(this.propiedad("bloque"));
        if(isNaN(salto)) salto=60;
        
        var maximo=horaMaxima!==null?
            horaMaxima:
            this.propiedad("horaMaxima");
        if(!maximo||maximo==hora||maximo>1439) {
            maximo=1439;
        } else {
            maximo=util.horasAMinutos(hora);
        }

        for(;hora<maximo;hora+=salto)
            document.crear("label")
                .establecerTexto(util.minutosAHoras(hora))
                .estilo("height",altoBloque)
                .anexarA(this.barraHorarios);        

        return this;
    };

    /**
     * Genera y agrega un nuevo item.
     * @param {number} indice - Indice del origen de datos (índice del elemento).
     * @returns {componente}
     */
    this.generarItem=function(indice) {
        var t=this;
        
        /*this.obtenerHijos().forEach(function(hijo) {
            if(hijo.autogenerado) return;
    
            var nuevo=hijo.clonar(t.elementoPadre,true); //Anexar al padre del componente bucle

            t.itemsAutogenerados.push(nuevo);

            var obj=t.datos[indice];

            //Agregar método al origen de datos
            obj.obtenerIndice=(function(i) {
                return function() {
                    return i;
                };
            })(indice);

            nuevo.establecerDatos(obj);
            nuevo.indice=indice;
            nuevo.autogenerado=true;
            nuevo.ocultarDescendencia();
            nuevo.obtenerElemento().agregarClase("autogenerado");
        });*/

        return this;
    };

    /**
     * Genera los items del componente.
     * @param {number} [indice] - Índice del objeto de datos que se desea generar. Si se omite, iterará sobre todo el origen de datos. 
     * @returns {componente}
     */
    this.generarItems=function(indice) {
        /*var t=this;

        var fn=function(i) {
            if(i>=t.itemsAutogenerados.length) {
                t.generarItem(i);
            } else {
                t.itemsAutogenerados[i].establecerDatos(t.datos[i]);
            }
        },
        remover=function(i) {
            t.itemsAutogenerados[i].eliminar();
        };

        if(typeof indice==="number") {
            fn(indice);
        } else {
            this.datos.forEach(function(obj,indice) {
                fn(indice);
            });
            //Remover items excedentes
            if(this.datos.length<this.itemsAutogenerados.length) {
                for(var i=this.datos.length;i<this.itemsAutogenerados.length;i++)
                    remover(i);
                this.itemsAutogenerados.splice(this.datos.length);
            }
        }*/

        return this;
    };

    /**
     * Genera y devuelve el valor de retorno según las propiedades `filtrarPropiedades` y `filtrarItems`.
     * @returns {*}
     */
     this.extraerValor=function() {
        /*var obj=this.obtenerDatosActualizados(),
            propiedades=this.propiedad(false,"filtrarPropiedades"),
            filtro=this.propiedad(false,"filtrarItems");

        if(!obj) return obj;

        var filtrar=function(item) {
            if(filtro&&!item[filtro]) return null;

            if(!propiedades||typeof item!="object") return item;

            if(typeof propiedades!="string") {
                propiedades=propiedades.split(",");
                for(var i=0;i<propiedades.length;i++)
                    propiedades[i]=propiedades[i].trim();
            }

            var nuevoItem={};

            for(var prop in item) {
                if(~propiedades.indexOf(prop))
                    nuevoItem[prop]=item[prop];
            }

            return nuevoItem;
        },
        listado=[];

        for(var i=0;i<obj.length;i++) {
            var item=obj[i],
                filtrado=filtrar(item);

            if(filtrado!==null)
                listado.push(filtrado);
        }

        return listado;*/
    };

    /**
     * Devuelve el origen de datos actualizado con las propiedades que hayan cambiado por tratarse de componentes de ingreso de datos (campos, etc.)
     * @returns {Object[]}
     */
    this.obtenerDatosActualizados=function() {
        return this.prototipo.obtenerDatosActualizados.call(this,this.itemsAutogenerados);
    };

    /**
     * Agrega un nuevo elemento.
     * @param {*} obj - Elemento a insertar.
     * @returns {componente}
     */
    this.agregarElemento=function(obj) {
        /*if(!util.esArray(this.datos)) this.datos=[];
        var idx=this.datos.push(obj)-1;

        this.removerMensajeSinDatos();

        //Agregar el nuevo elemento sin redibujar todo
        this.generarItems(idx);
        
        //Autofoco
        ui.autofoco(this.itemsAutogenerados[idx].obtenerElemento());*/

        return this;
    };

    /**
     * Agrega los elementos del listado provisto.
     * @param {*[]} listado - Listado (*array*) de elementos a insertar.
     * @returns {componente}
     */
    this.agregarElementos=function(listado) {
        /*var t=this;

        listado.porCada(function(i,elem) {
            t.agregarElemento(elem);
        });*/

        return this;
    };

    /**
     * Remueve un elemento dado su índice.
     * @param {number} indice - Número de fila (basado en 0).
     * @returns {componente}
     */
    this.removerElemento=function(indice) {
        /*this.datos.splice(indice,1);
        this.actualizar();*/
        return this;
    };
};

ui.registrarComponente("agenda",componenteAgenda,configComponente.clonar({
    descripcion:"Agenda diaria",
    etiqueta:"Agenda",
    grupo:"Formulario",
    icono:"agenda.png"
}));