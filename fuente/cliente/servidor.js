/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Gestor de comunicación cliente<->servidor.
 * @class
 */
var servidor=new function() {
    "use strict";

    this.funcionesError=[];
    this.ajax=[];
    this.url="";
    this.predeterminados={};

    /**
     * Establece las opciones predeterminadas.
     * @param {*} opciones - Opciones. Ver documentación de invocarMetodo().
     * @returns {servidor}
     */
    this.establecerPredeterminados=function(opciones) {
        this.predeterminados=Object.assign({
            metodo:null,
            aplicacion:null,
            controlador:undefined,
            controladorOrigen:null,
            modelo:null, //Por el momento, no se usa
            clase:null, //Por el momento, no se usa
            modulo:null,
            retorno:null,
            error:null,
            listo:null,
            parametros:null,
            progreso:null,
            abortar:false,
            foxtrot:null,
            precarga:true,
            formulario:false,
            tiempo:null
        },opciones);
        return this;
    };

    /**
     * Establece la URL para las próximas consultas.
     * @param {string} url
     * @returns {servidor}
     */
    this.establecerUrl=function(url) {
        this.url=url;
        return this;
    };

    /**
     * Aborta todas las solicitudes en curso.
     * @returns {servidor}
     */
    this.abortarTodo=function() {
        this.ajax.forEach(function(obj) {
            obj.abortar();
        });
        this.ajax=[];
        return this;
    };

    /**
     * Invoca un método en un controlador de servidor.
     * @param {Object} [opciones] - Parámetros de la solicitud.
     * @param {Object} [opciones.metodo] - Nombre del método.
     * @param {Object} [opciones.aplicacion] - Nombre del método del controlador principal de la aplicación (clase pública). Equivalente a establecer metodo con controlador=null.
     * @param {Object} [opciones.foxtrot] - Nombre del método interno de Foxtrot.
     * @param {Object} [opciones.controlador] - Nombre del controlador. Por defecto, el controlador principal actual.
     * @param {Object} [opciones.modulo] - Nombre del Módulo.
     * @param {Object} [opciones.componente] - Nombre del componente.
     * @param {Object} [opciones.controladorOrigen] - Nombre del controlador que origina la solicitud.
     * @param {function} [opciones.retorno] - Función de retorno. Recibirá como único parámetro el valor recibido del servidor. No será invocada si el método no tuvo un valor de retorno.
     * @param {function} [opciones.error] - Función de error.
     * @param {function} [opciones.listo] - Función a invocar tras la solicitud (siempre será invocada, independientemente del valor de retorno, excepto en caso de error).
     * @param {function} [opciones.siempre] - Función a invocar tras la solicitud (siempre será invocada, incluso en caso de error).
     * @param {Object} [opciones.parametros] - Parámetros o argumentos a enviar.
     * @param {Object} [opciones.abortar=true] - Determina si se deben abortar otras solicitudes en curso.
     * @param {Object} [opciones.precarga=true] - Determina si se debe mostrar la animación de precarga. Posibles valores: true (precarga normal a pantalla completa), "barra" (barra de progreso superior que no bloquea la pantalla), false (solicitud silenciosa).
     * @param {boolean} [opciones.formulario=false] - Envía la solicitud como datos de formulario (FormData).
     * @param {function} [opciones.progreso] - Función de notificación de progreso. Recibirá el progreso de 0 a 1 como argumento.
     * @param {number} [opciones.tiempo] - Tiempo límite (si se omite, será el valor por defecto de ajax).
     * @returns {Ajax}
     */
    this.invocarMetodo=function(opciones) {
        //Valores predeterminados
        opciones=Object.assign(this.predeterminados.clonar(),opciones);

        //Valores próxima consulta
        if(this.opcionesTemporales) opciones=Object.assign(opciones,this.opcionesTemporales);
        this.opcionesTemporales=null;

        //Por defecto, el controlador principal
        if(typeof opciones.controlador==="undefined") opciones.controlador=ui.controlador().obtenerNombre();

        if(opciones.abortar) this.abortarTodo();

        if(opciones.precarga) ui.mostrarPrecarga(opciones.precarga);

        var campos={};
        if(opciones.foxtrot) campos.__f=opciones.foxtrot;
        if(opciones.metodo) campos.__m=opciones.metodo;
        if(opciones.aplicacion) campos.__a=opciones.aplicacion;
        if(opciones.controlador) campos.__c=opciones.controlador;
        if(opciones.componente) campos.__o=opciones.componente;
        if(opciones.modulo) campos.__u=opciones.modulo;

        //Si se especificó un método pero no un controlador, redirigir a la aplicación
        if(opciones.metodo&&!opciones.aplicacion&&!opciones.controlador&&!opciones.componente&&!opciones.modulo) {
            campos.__a=campos.__m;
            delete campos.__m;
        }

        var param;
        if(opciones.formulario) {
            param=new FormData;
            
            campos.porCada(function(campo,valor)  {
                param.append(campo,valor);
            });
            
            if(util.esObjeto(opciones.parametros)) {
                //Extraer los archivos
                var lista=opciones.parametros.clonar();
                lista.porCada(function(campo,valor) {
                    if(valor instanceof File) {
                        param.append(campo,valor);
                        delete opciones.parametros[campo];
                    }
                });
            }
            
            //Otros valores enviar por __p
            if(opciones.parametros) {
                var json=JSON.stringify(opciones.parametros);
                if(json!==null) param.append("__p",json);
            }
        } else {
            param=campos;
            var args=JSON.stringify(opciones.parametros);
            if(args!==null) param.__p=args;
        }

        var obj=new ajax({
            url:this.url,
            parametros:param,
            progreso:opciones.progreso,
            listo:function(resp) {
                servidor.evaluarRespuesta(resp,opciones);
            },
            siempre:function() {
                ui.ocultarPrecarga(opciones.precarga);
                if(opciones.siempre) opciones.siempre();
            },
            error:opciones.error,
            tiempo:opciones.tiempo
        });

        this.ajax.push(obj);

        return obj;
    };

    /**
     * Establece opciones a ser utilizadas únicamente en la consulta inmediatamente siguiente.
     * @param {Object} opciones 
     * @returns {servidor}
     */
    this.establecerOpcionesProximaConsulta=function(opciones) {
        this.opcionesTemporales=opciones;
        return this;
    };

    /**
     * Evalúa y ejecuta la respuesta recibida desde el servidor.
     * @param {string} resp - Respuesta recibida.
     * @param {Object} opciones - Opciones establecidas al iniciar la solicitud.
     * @returns {servidor}
     */
    this.evaluarRespuesta=function(resp,opciones) {
        if(!resp||!util.esObjeto(resp)) {
            if(opciones.error) opciones.error.call(ctl);
            return this;
        }

        var procesado=false;

        //resp.r    Devolver valor directo al callback
        //resp.m    Invocar el método en el controlador resp.c, con los parámetros resp.p
        //resp.a    Invocar el método en el controlador de la aplicación, con los parámetros resp.p
        //resp.e    Evaluar código arbitrario (TODO ¿es seguro? ¿tiene sentido?)
        //resp.n    Navegar a resp.n

        if(resp.hasOwnProperty("r")) {
            if(opciones.retorno) opciones.retorno(resp.r); //TODO usar call()
        } else if(resp.hasOwnProperty("m")) {
            var params=resp.hasOwnProperty("p")?resp.p:[];

            var nombreCtl=resp.c;
            if(!nombreCtl) nombreCtl=opciones.controladorOrigen; //Si no se especifica el controlador, devolver al que originó la solicitud
            if(!nombreCtl) nombreCtl=opciones.controlador; //O al controlador del mismo nombre
            var ctl=ui.obtenerInstanciaControlador(nombreCtl); 

            if(ctl&&ctl.hasOwnProperty(resp.m)) ctl[resp.m].apply(ctl,params);
            
            procesado=true;
        } else if(resp.hasOwnProperty("a")) {
            var params=resp.hasOwnProperty("p")?resp.p:[],
                ctl=ui.obtenerAplicacion();

            if(ctl.hasOwnProperty(resp.m)) ctl[resp.m].apply(ctl,params);
            
            procesado=true;
        } else if(resp.hasOwnProperty("e")) {
            cuerpo=resp.m;
            eval(cuerpo);
            procesado=true;
        } else if(resp.hasOwnProperty("n")) {
            ui.irA(resp.n);
        } else{
            if(opciones.error) opciones.error.call(resp.m);
            return;
        }

        if(opciones.listo) opciones.listo(); //TODO usar call()

        return this;
    };

    /**
     * Genera una instancia de una clase que redirigirá todas las llamadas a métodos al controlador de servidor especificado.
     * @param {string} [controlador=null] - Nombre del controlador, o null.
     * @param {(string|Controlador)} [controladorOrigen] - Instancia o nombre del controlador que está fabricando la instancia.
     * @returns {Proxy}
     */
    this.fabricar=function(controlador,controladorOrigen) {
        if(typeof controlador==="undefined") controlador=null;
        if(typeof controladorOrigen==="undefined") {
            controladorOrigen=null;
        } else if(typeof controladorOrigen==="object") {
            controladorOrigen=controladorOrigen.obtenerNombre();
        }

        return new Proxy(new function() {
            this.controlador=controlador;
            this.controladorOrigen=controladorOrigen;        
            this.predeterminados={};
        
            /**
             * Establece las opciones predeterminadas.
             * @param {*} opciones - Opciones. Ver documentación de servidor.invocarMetodo().
             * @returns {*}
             */
            this.establecerPredeterminados=function(opciones) {
                this.predeterminados=Object.assign(this.predeterminados,opciones);
                return this;
            };    

            /**
             * Establece opciones a ser utilizadas únicamente en la consulta inmediatamente siguiente.
             * @param {Object} opciones 
             * @returns {*}
             */
            this.establecerOpcionesProximaConsulta=function(opciones) {
                servidor.establecerOpcionesProximaConsulta(opciones);
                return this;
            };
        }(),{
            get(target,nombre) {
                if(target.hasOwnProperty(nombre)) return target[nombre];
        
                //Los métodos inexistentes serán solicitados al servidor
                return function() {
                    var args=arguments.aArray(),
                        opc={
                            controlador:target.controlador,
                            controladorOrigen:target.controladorOrigen,
                            metodo:nombre,
                            error:function() {
                                ui.evento("errorServidor");
                            }
                        };

                    opc=Object.assign(opc,target.predeterminados);
        
                    //Los métodos admiten múltiples formas:
        
                    //servidor.foo()
                    
                    //servidor.foo(opciones)
                    if(args.length==1&&util.esObjeto(args[0])) {
                        opc=Object.assign(opc,args[0]);
                    } else {
                        //servidor.foo(retorno)
                        if(typeof args[0]=="function") opc.retorno=args.shift();
                        
                        //servidor.foo(retorno,...args)
                        //servidor.foo(...args)
                        if(args.length>0) opc.parametros=args;
                    }
        
                    return servidor.invocarMetodo(opc);
                }
            }
        });
    };

    this.establecerPredeterminados({});
}();

window["servidor"]=servidor;
