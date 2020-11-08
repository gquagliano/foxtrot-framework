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
    this.elementoVista=null;
    this.nombreVista=null;
    this.instanciaControlador=null;

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
        if(this.nombreVista) return ui.obtenerInstanciaVista(this.nombreVista);
        return null;
    };

    /**
     * Devuelve el nombre de la vista que contiene.
     * @returns {string}
     */
    this.obtenerNombreVista=function() {
        return this.nombreVista;
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.clasePadre.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div>"); 
        this.clasePadre.crear.call(this);
        return this;
    };

    /**
     * Evento Listo.
     */
    this.listo=function() {
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
        var vista=this.vista();
        if(vista) vista.actualizar();
        this.clasePadre.actualizar.call(this);
        return this;
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
     * Inicia la carga de una vista.
     * @param {string} nombre 
     * @returns {Componente}
     */
    this.cargarVista=function(nombre) {
        var t=this, 
            doc=ui.obtenerDocumento(),
            precarga=this.propiedad(null,"precarga");

        this.nombreVista=nombre;

        var fn=function() {
            ui.obtenerVistaEmbebible(nombre,function(obj) {
                t.elementoVista=doc.crear("<div class='contenedor-vista-importada oculto'>");
                t.elementoVista.anexarA(t.elemento);

                ui.ejecutarVista(nombre,false,obj.json,obj.html,t.elementoVista,function() {
                    t.instanciaControlador=ui.obtenerInstanciaControladorVista(nombre);
                    ui.animarAparecer(t.elementoVista);
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
        if(this.elementoVista) {
            var elem=this.elementoVista;
            ui.animarDesaparecer(elem,function() {
                elem.remover();
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