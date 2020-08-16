/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Gestor de comunicación cliente->servidor.
 * @typedef {servidor}
 */

/**
 * Gestor de comunicación cliente->servidor.
 */
var servidor=new function() {
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
            controlador:null,
            modelo:null, //Por el momento, no se usa
            clase:null, //Por el momento, no se usa
            retorno:null,
            error:null,
            listo:null,
            parametros:null,
            abortar:true,
            foxtrot:null,
            precarga:true
        },opciones);
        return this;
    };

    this.establecerUrl=function(url) {
        this.url=url;
        return this;
    };

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
     * @param {Object} [opciones.foxtrot] - Nombre del método interno de Foxtrot.
     * @param {Object} [opciones.controlador] - Nombre del controlador. Por defecto, el controlador principal actual.
     * @param {Object} [opciones.retorno] - Función de retorno. Recibirá como único parámetro el valor recibido del servidor. No será invocada si el método no tuvo un valor de retorno.
     * @param {Object} [opciones.error] - Función de error.
     * @param {Object} [opciones.listo] - Función a invocar tras la solicitud (siempre será invocada, independientemente del valor de retorno).
     * @param {Object} [opciones.parametros] - Parámetros o argumentos a enviar.
     * @param {Object} [opciones.abortar=true] - Determina si se deben abortar otras solicitudes en curso.
     * @param {Object} [opciones.precarga=true] - Determina si se debe mostrar la animación de precarga. Posibles valores: true (precarga normal a pantalla completa), "barra" (barra de progreso superior que no bloquea la pantalla), false (solicitud silenciosa).
     * @returns {servidor}
     */
    this.invocarMetodo=function(opciones) {
        //Valores predeterminados
        opciones=Object.assign(this.predeterminados,opciones);

        //Por defecto, el controlador principal
        if(!opciones.controlador) opciones.controlador=ui.controlador().obtenerNombre();

        if(opciones.abortar) this.abortarTodo();

        if(opciones.precarga) ui.mostrarPrecarga(opciones.precarga);

        var param={};
        if(opciones.foxtrot) param.__f=opciones.foxtrot;
        if(opciones.metodo) param.__m=opciones.metodo;
        if(opciones.controlador) param.__c=opciones.controlador;
        var args=JSON.stringify(opciones.parametros);
        if(args!==null) param.__p=args;

        this.ajax.push(new ajax({
            url:this.url,
            parametros:param,
            listo:function(resp) {
                servidor.evaluarRespuesta(resp,opciones);
                ui.ocultarPrecarga(opciones.precarga);
            }
        }));

        return this;
    };

    this.evaluarRespuesta=function(resp,opciones) {
        if(!resp||!util.esObjeto(resp)) {
            if(opciones.error) opciones.error.call(ctl);
            return;
        }

        var procesado=false;

        //resp.r    Devolver valor directo al callback
        //resp.m    Invocar el método en el controlador resp.c, con los parámetros resp.p
        //resp.e    Evaluar código arbitrario (TODO ¿es seguro? ¿tiene sentido?)
        //resp.n    Navegar a resp.n

        if(resp.hasOwnProperty("r")) {
            if(opciones.retorno) opciones.retorno(resp.r); //TODO usar call()
        } else if(resp.hasOwnProperty("m")) {
            var params=resp.hasOwnProperty("p")?resp.p:[];
            var ctl=ui.obtenerInstanciaControlador(resp.c);
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
    };

    /**
     * Genera una instancia de una clase que redirigirá todas las llamadas a métodos al controlador de servidor especificado.
     * @param {string} controlador - Nombre del controlador.
     */
    this.fabricar=function(ctl) {
        if(typeof controlador==="undefined") controlador=null;

        return new Proxy(new function() {
            this.controlador=ctl;
        }(),{
            get(target,nombre) {
                if(target.hasOwnProperty(nombre)) return target[nombre];
        
                //Los métodos inexistentes serán solicitados al servidor
                return function() {
                    var args=arguments.aArray(),
                        opc={
                            controlador:target.controlador,
                            metodo:nombre
                        };
        
                    //Los métodos admiten múltiples formas:
        
                    //servidor.foo()
                    
                    //servidor.foo(opciones)
                    if(args.length==1&&util.esObjeto(args[0])) {
                        opc=Obj.assign(opc,args[0]);
                    } else {
                        //servidor.foo(retorno)
                        if(typeof args[0]=="function") opc.retorno=args.shift();
                        
                        //servidor.foo(retorno,...args)
                        //servidor.foo(...args)
                        if(args.length>0) opc.parametros=args;
                    }
        
                    servidor.invocarMetodo(opc);
                }
            }
        });
    };

    this.establecerPredeterminados({});
}();

window["servidor"]=servidor;
