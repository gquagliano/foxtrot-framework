/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */


/**
 * Prototipo de comunicación cliente->servidor.
 */
var backend=new Proxy(new function() {
    this.funcionesError=[];

    this.invocarMetodo=function(opciones) {
        //Valores predeterminados
        opciones=Object.assign({
            metodo:null,
            controlador:null,
            modelo:null,
            clase:null,
            retorno:null,
            error:null,
            parametros:null,
            silencio:false
        },opciones);

        console.log(opciones);
    };
}(),{
    get(target,name) {
        if(target.hasOwnProperty(name)) return target[name];

        //Los métodos inexistentes serán solicitados al servidor
        return function() {
            var vistaActual="test"; //Eventualmente, la vista actual será consultada a la ui

            var args=arguments.aArray();

            //Los métodos admiten múltiples formas:
            //backend.foo()
            //backend.foo(retorno)
            //backend.foo(retorno,...args)
            //backend.foo(...args)
            //backend.foo({
            //  retorno
            //  parametros
            //  silencio
            //  error    
            //})

            console.log(arguments);

            target.invocarMetodoControlador();
        }
    }
});

window["backend"]=backend;
