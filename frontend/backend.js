/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//¡Prototipo!


//Pruebas:
//  Abriendo la vista previa de una vista o el archivo de salida, ejecutar:
//      backend.metodo(function(a) { console.log(a); })
//          Debería invocar el método test.metodo() y mostrar "Hola" en la consola
//      backend.suma(x,y)
//          Debería invocar el método test.suma($x,$y), el cual, a su vez invoca metodoJs de la vista test, mostrando un diálogo con el número (x+y).


var vistaActual="test"; //La vista actual será consultada a la ui

/**
 * Gestor de comunicación cliente->servidor.
 */
var backend=new Proxy(new function() {
    this.funcionesError=[];
    this.ajax=[];

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
            controlador:null,
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

        var url="http://localhost/experimental-foxtrot-framework/backend/"; //La url del backend, lógicamente, será configurable

        this.ajax.push(new ajax({
            url:url,
            parametros:{
                __c:opciones.controlador,
                __m:opciones.metodo,
                __p:JSON.stringify(opciones.parametros)
            },
            listo:function(resp) {
                backend.evaluarRespuesta(resp,opciones);
            }
        }));
    };

    this.evaluarRespuesta=function(resp,opciones) {
        if(!resp||!util.esObjeto(resp)) {
            opciones.error.call(this); //this debería ser la instancia del controlador
            return;
        }

        //resp.r    Devolver valor directo al callback
        //resp.m    Invocar el método en el controlador de la vista actual, con los parámetros resp.p
        //resp.e    Evaluar código arbitrario (¿es seguro? ¿tiene sentido?)

        if(resp.hasOwnProperty("r")) {
            opciones.retorno.call(this,resp.r); //this debería ser la instancia del controlador
        } else if(resp.hasOwnProperty("m")) {
            var params=resp.hasOwnProperty("p")?resp.p:[];
            ui.obtenerInstanciaControlador(vistaActual)[resp.m].apply(this,params); //this debería ser la instancia del controlador
            procesado=true;
        } else if(resp.hasOwnProperty("e")) {
            cuerpo=resp.m;
            eval(cuerpo);
            procesado=true;
        } else{
            opciones.error.call(this); //this debería ser la instancia del controlador
            return;
        }

        if(opciones.listo) opciones.listo.call(this,resp); //this debería ser la instancia del controlador
    };
}(),{
    get(target,nombre) {
        if(target.hasOwnProperty(nombre)) return target[nombre];

        //Los métodos inexistentes serán solicitados al servidor
        return function() {
            var args=arguments.aArray(),
                opc={
                    controlador:vistaActual,
                    metodo:nombre
                };

            //Los métodos admiten múltiples formas:

            //backend.foo()
            
            //backend.foo(opciones)
            if(args.length==1&&util.esObjeto(args[0])) {
                opc=Obj.assign(opc,args[0]);
            } else {
                //backend.foo(retorno)
                if(typeof args[0]=="function") opc.retorno=args.shift();
                
                //backend.foo(retorno,...args)
                //backend.foo(...args)
                if(args.length>0) opc.parametros=args;
            }

            target.invocarMetodo(opc);
        }
    }
});

window["backend"]=backend;
