/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Gestor de comunicación cliente->servidor.
 */
var servidor=new function() {
    this.funcionesError=[];
    this.ajax=[];
    this.url="";

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

    this.invocarMetodo=function(opciones) {
        //Valores predeterminados
        opciones=Object.assign({
            metodo:null,
            controlador:ui.controlador().obtenerNombre(), //Por defecto, el controlador principal
            modelo:null,
            clase:null,
            retorno:null,
            error:null,
            listo:null,
            parametros:null,
            silencio:false,
            abortar:true
        },opciones);

        if(opciones.abortar) this.abortarTodo();

        var param={
            __m:opciones.metodo
        };
        if(opciones.controlador) param.__c=opciones.controlador;
        var args=JSON.stringify(opciones.parametros);
        if(args!==null) param.__p=args;

        this.ajax.push(new ajax({
            url:this.url,
            parametros:param,
            listo:function(resp) {
                servidor.evaluarRespuesta(resp,opciones);
            }
        }));
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
}();

window["servidor"]=servidor;
