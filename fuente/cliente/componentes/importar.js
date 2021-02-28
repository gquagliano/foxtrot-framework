/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Importar.
 * @class
 * @extends componente
 */
var componenteImportar=function() { 
    "use strict";

    this.componente="importar";
    this.elementoVistaInterior=null;
    this.nombreVistaInterior=null;
    this.instanciaControlador=null;
    
    var trabajando=false,
        numeroOperacion=0,
        enCurso=[];

    this.propiedadesConcretas={
        "Importar":{
            vista:{
                etiqueta:"Vista",
                adaptativa:false
            },
            escucharNavegacion:{
                etiqueta:"Escuchar navegación",
                ayuda:"Determina si debe cambiar la vista cuando cambie la URL.",
                tipo:"bool",
                adaptativa:false
            },
            precarga:{
                etiqueta:"Mostrar precarga",
                adaptativa:false,
                tipo:"opciones",
                opciones:{
                    no:"No",
                    si:"Si",
                    barra:"Barra de progreso"
                }
            },
            demora:{
                etiqueta:"Demora",
                adaptativa:false,
                tipo:"numero",
                ayuda:"Permite establecer un tiempo de demora entre la navegación y la carga de la vista (segundos)."
            }
            //TODO Eventos
        }
    };

    /**
     * Devuelve la instancia del controlador de la vista que contiene.
     * @returns {controlador|null}
     */
    this.controlador=function() {
        return this.instanciaControlador;
    };

    /**
     * Devuelve la instancia de la vista que contiene.
     * @returns {componente|null}
     */
    this.vista=function() {
        if(this.nombreVistaInterior) return ui.obtenerInstanciaVista(this.nombreVistaInterior);
        return null;
    };

    /**
     * Devuelve el nombre de la vista que contiene.
     * @returns {string}
     */
    this.obtenerNombreVista=function() {
        return this.nombreVistaInterior;
    };

    /**
     * Devuelve `true` si se encuentra en curso la carga de una vista.
     * @returns {boolean}
     */
    this.cargando=function() {
        return trabajando;
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.prototipo.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div>"); 
        this.prototipo.crear.call(this);
        return this;
    };

    /**
     * Evento Listo.
     */
    this.listo=function() {
        this.prototipo.listo.call(this);

        if(ui.enModoEdicion()) return;
        
        //Si está habilitado para escuchar navegación, intentar cargar la vista correspondiente a la URL actual
        //Excepto en Cordova
        if(!ui.esCordova()&&this.propiedad("escucharNavegacion")) {
            var vista=ui.obtenerEnrutador().obtenerNombreVista(window.location.href);
            if(vista!=ui.obtenerNombreVistaPrincipal()) {
                this.cargarVista(vista);
                return;
            }
        }
        
        //Si la URL actual corresponde a la vista principal, intentar cargar la vista inicial
        var vistaInicial=this.propiedad("vista");
        if(vistaInicial) this.cargarVista(vistaInicial);
    };

    /**
     * Recepción de eventos externos.
     * @param {*} valor 
     * @param {Object} evento 
     */
    this.eventoExterno=function(valor,evento) {
        this.cargarVista(valor);
    };    

    /**
     * Actualiza el componente y la vista que contiene.
     * @returns {componenteImportar}
     */
    this.actualizar=function() {        
        this.actualizacionEnCurso=true;

        var vista=this.vista();
        if(vista) vista.actualizar();

        return this.prototipo.actualizar.call(this);
    };

    /**
     * Evento 'navegación'.
     * @param {string} nombreNuevaVista 
     */
    this.navegacion=function(nombreNuevaVista) {
        if(!this.propiedad(null,"escucharNavegacion")) return;
        
        var demora=this.propiedad(null,"demora");
        if(!demora) demora=0;

        var t=this;

        setTimeout(function() {
            //Si hemos vuelto a la vista principal, cargar el valor predeterminado
            if(nombreNuevaVista==ui.obtenerNombreVistaPrincipal()) nombreNuevaVista=t.propiedad(null,"vista");
            if(!nombreNuevaVista) {
                t.cerrarVistaActual();
            } else {
                t.cargarVista(nombreNuevaVista);
            }
        },demora*1000);
    };

    /**
     * Aborta la carga en curso.
     * @returns {componente}
     */
    this.abortar=function() {
        enCurso=[];
        trabajando=false;
        return this;
    };

    /**
     * Inicia la carga de una vista.
     * @param {string} nombre 
     * @returns {Componente}
     */
    this.cargarVista=function(nombre) {
        var t=this, 
            doc=ui.obtenerDocumento(),
            precarga=this.propiedad(null,"precarga");
        
        this.abortar();

        trabajando=true;
        var op=++numeroOperacion;
        //Por el momento no hay posibilidad de abortar ui.obtenerVistaEmbebible, por lo que vamos a utilizar una bandera local
        //para mantener/abortar la función de retorno
        enCurso.push(op);   

        this.nombreVistaInterior=nombre;

        var fn=function() {
            if(enCurso.indexOf(op)<0) return;

            ui.obtenerVistaEmbebible(nombre,function(obj) {
                if(enCurso.indexOf(op)<0) return;

                t.elementoVistaInterior=doc.crear("<div class='contenedor-vista-importada oculto'>");
                t.elementoVistaInterior.anexarA(t.elemento);

                ui.ejecutarVista(nombre,false,obj.json,obj.html,t.elementoVistaInterior,function() {
                    if(enCurso.indexOf(op)<0) return;

                    t.instanciaControlador=ui.obtenerInstanciaControladorVista(nombre);
                    ui.animarAparecer(t.elementoVistaInterior,function() {
                        ui.autofoco(t.elementoVistaInterior);
                    });

                    trabajando=false;
                });
            },precarga);
        };

        this.cerrarVistaActual(fn);
        
        return this;
    };

    /**
     * Cierra la vista actual.
     * @param {function} retorno 
     * @returns {Componente}
     */
    this.cerrarVistaActual=function(retorno) {
        if(typeof retorno!=="function") retorno=null;

        ui.finalizarVista(this.nombreVistaInterior);

        if(this.elementoVistaInterior) {
            var elem=this.elementoVistaInterior;
            ui.animarDesaparecer(elem,function() {
                ui.eliminarComponentes(elem);
                if(retorno) retorno();
            });
        } else {
            if(retorno) retorno();
        }
        return this;
    };

    /**
     * Devuelve o establece los valores de la vista que contiene.
     * @param {Object} [valor] - Valores a establecer.
     * @reeturns {*}
     */
    this.valor=function(valor) {
        var vista=this.vista();
        
        if(typeof valor==="undefined") {
            if(vista) return vista.obtenerValores();
            return {};
        } else {
            if(vista) vista.establecerValores(valor);
            return this;
        }
    };

    /**
     * Devuelve los valores de la vista que contiene.
     * @returns {Object}
     */
    this.obtenerValores=function() {
        return;
        //No queremos que continúe la búsqueda en forma recursiva entre los componentes importados
    };
};

ui.registrarComponente("importar",componenteImportar,configComponente.clonar({
    descripcion:"Importar vista o archivo HTML",
    etiqueta:"Importar",
    grupo:"Control",
    icono:"importar.png",
    aceptaHijos:false
}));