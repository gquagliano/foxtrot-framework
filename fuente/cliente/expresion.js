/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Intérprete de expresiones (Versión provisoria simplificada).
 * @class 
 */
function expresion(expr) {
    "use strict";

    this.cadena=null;

    this.variables={
        "nul":null,
        "nulo":null,
        "null":null,
        "v":true,
        "verdadero":true,
        "true":true,
        "f":false,
        "falso":false,
        "false":false
    };

    this.funciones={
        //Predefinidos
        eco:function(v) { return v; },
    };
    
    /**
     * 
     */
    this.establecerVariables=function(obj) {
        var t=this;
        obj.porCada(function(clave,valor) {
            t.variables[clave]=valor;
        });
        return this;
    };
    
    /**
     * 
     */
    this.establecerFunciones=function(obj) {
        var t=this;
        obj.porCada(function(clave,valor) {
            t.funciones[clave]=valor;
        });
        return this;
    };

    /**
     * 
     */
    this.obtenerVariables=function() {
        return this.variables;
    };
    
    /**
     * 
     */
    this.obtenerFunciones=function() {
        return this.funcion;
    };
    
    /**
     * 
     */
    this.establecerExpresion=function(expr) {
        this.cadena=null;
        if(expresion.esExpresion(expr)) {
            expr=expr.trim();
            this.cadena=expr.substr(1,expr.length-2).trim();
        }
        return this;
    };

    var analizarObjeto=function(nombre) {
        if(nombre==="") return "";
        if(/^[0-9]$/.test(nombre)) return parseInt(nombre);
        if(/^[0-9\.]$/.test(nombre)) return parseFloat(nombre);
        if(nombre.length>=2&&nombre.substr(0,1)=="'"&&nombre.substr(-1)=="'") return nombre.substr(1,nombre.length-2);
        if(nombre==="verdadero"||nombre==="v") return true;
        if(nombre==="falso"||nombre==="f") return false;
        if(nombre==="n"||nombre==="nulo") return null;
        if(typeof nombre==="undefined") return null;
        return nombre;
    }.bind(this);

    var buscarPropiedad=function(objeto,nombre) {
        nombre=analizarObjeto(nombre);

        if(typeof objeto!=="undefined"&&(typeof nombre==="string"||typeof nombre==="number")) {
            var elem=objeto[nombre];
            //Si es una función, devolver un bind para que al ejecutarla el valor de this sea el correcto
            if(typeof elem==="function") return elem.bind(objeto);
            return expresion.analizarValor(elem);
        }

        if(typeof nombre==="string") {
            if(this.variables.hasOwnProperty(nombre)) return expresion.analizarValor(this.variables[nombre]);
            if(this.funciones.hasOwnProperty(nombre)) return expresion.analizarValor(this.funciones[nombre]);
        }

        return expresion.analizarValor(nombre);
    }.bind(this);

    /**
     * 
     */
    this.ejecutar=function() {
        if(!this.cadena) return null;
        
        var pila=[],
            uitlimoObjeto=null,
            objeto,
            bufer="",
            argumentos=[],
            enCadena=false,
            ternarioCondicion=null;

        for(var i=0;i<this.cadena.length;i++) {
            var caracter=this.cadena[i];

            if(!enCadena) {
                if(caracter=="'") {
                    enCadena=true;
                    bufer="'";
                } else if(ternarioCondicion===false) {
                    //Si la condición del ternario fue falsa, saltar hasta :
                    if(caracter!=":") continue;
                    ternarioCondicion=null;
                    bufer="";
                } else if(caracter==".") {
                    if(bufer=="") {
                        //Punto decimal (.123)
                        bufer="0";
                    } else if(/^[0-9+]$/.test(bufer)) {
                        //Punto decimal (12.345)
                        bufer+=".";
                    } else {
                        //Acceso a propiedad
                        uitlimoObjeto=objeto;
                        objeto=buscarPropiedad(objeto,bufer);
                        bufer="";
                    }
                } else if(caracter=="?") {
                    ternarioCondicion=!!buscarPropiedad(objeto,bufer);
                    uitlimoObjeto=objeto;
                    objeto=undefined;
                    bufer="";
                } else if(caracter==":") {
                    if(ternarioCondicion) {
                        //Si la condición del ternario fue verdadera, terminar
                        break;
                    }
                    uitlimoObjeto=objeto;
                    objeto=undefined;
                    bufer="";
                } else if(caracter=="[") {
                    pila.push(buscarPropiedad(objeto,bufer));
                    uitlimoObjeto=objeto;
                    objeto=undefined;
                    bufer="";
                } else if(caracter=="]") {
                    uitlimoObjeto=objeto;
                    objeto=buscarPropiedad(objeto,bufer);
                    var superior=pila.pop();
                    objeto=buscarPropiedad(superior,objeto);
                    bufer="";
                } else if(caracter=="(") {
                    pila.push(buscarPropiedad(objeto,bufer));
                    uitlimoObjeto=objeto;
                    objeto=undefined;
                    bufer="";
                    argumentos=[];
                } else if(caracter==",") {
                    argumentos.push(buscarPropiedad(objeto,bufer));
                    uitlimoObjeto=objeto;
                    objeto=undefined;
                    bufer="";
                } else if(caracter==")") {
                    if(bufer!="") argumentos.push(buscarPropiedad(objeto,bufer));
                    var superior=pila.pop();
                    uitlimoObjeto=objeto;
                    objeto=superior.apply(window,argumentos);
                    bufer="";
                } else {
                    bufer+=caracter;
                }
            } else {
                bufer+=caracter;
                var anterior=this.cadena[i-1];
                if(caracter=="'"&&anterior!="\\") enCadena=false;
            }
        }

        if(bufer!="") {
            uitlimoObjeto=objeto;
            objeto=buscarPropiedad(objeto,bufer);
        }

        //Si es una función, devolver un bind al objeto anterior para que al invocarla this tenga el valor correcto
        if(uitlimoObjeto&&typeof objeto==="function") return objeto.bind(uitlimoObjeto);

        return objeto;
    };

    this.establecerExpresion(expr);
};

/**
 * Determina si un objeto es una expresión o no.
 * @memberof expresion
 */
expresion.esExpresion=function(obj) {
    return typeof obj==="string"&&obj.trim().length>1&&obj.trim().substr(0,1)=="{"&&obj.trim().substr(-1)=="}";
};

/**
 * Determina si una cadena probablemente contiene expresiones o no.
 * @memberof expresion
 */
expresion.contieneExpresion=function(obj) {
    return typeof obj==="string"&&obj.trim().length>2&&/\{.+?\}/.test(obj);
};

expresion.variablesGlobales={};
expresion.funcionesGlobales={};

/**
 * Establece las variables que estarán siempre disponibles al utilizar expresion.evaluar().
 * @param {Object} obj - Objeto cuyas propiedades se corresponden con los nombres de variables.
 * @memberof expresion
 */
expresion.establecerVariablesGlobales=function(obj) {
    expresion.variablesGlobales=obj;
    return expresion;
};

/**
 * Establece las funciones que estarán siempre disponibles al utilizar expresion.evaluar().
 * @param {Object} obj - Objeto cuyas propiedades se corresponden con los nombres de funciones.
 * @memberof expresion
 */
expresion.establecerFuncionesGlobales=function(obj) {
    expresion.funcionesGlobales=obj;
    return expresion;
};

expresion.analizarValor=function(valor) {
    if(typeof valor==="undefined") return null;
    if(typeof valor!=="string") return valor;
    if(/^[0-9]$/.test(valor)) return parseInt(valor);
    if(/^[0-9\.]$/.test(valor)) return parseFloat(valor);
    if(valor==="false") return false;
    if(valor==="true") return true;
    if(valor==="null") return null;
    return valor;
};

/**
 * Busca y ejecuta todas las expresiones presentes en una cadena. Las llaves pueden escaparse con \{ \} para evitar que una expresión sea evaluada.
 * @returns {*} Cuando la cadena contenga una única expresión, el valor de retorno puede ser cualquier tipo resultante de la misma. Cuando se trate de una cadena con múltiples expresiones, el retorno siempre será una cadena con las expresiones reemplazadas por sus valores.
 * @memberof expresion
 */
expresion.evaluar=function(cadena) {
    if(typeof cadena!=="string") return null;

    var bufer="",
        enLlave=false,
        resultado="",
        valor=null,
        total=cadena.length,
        expr=new expresion;
    
    expr.establecerVariables(expresion.variablesGlobales);
    expr.establecerFunciones(expresion.funcionesGlobales);

    for(var i=0;i<=total;i++) {
        var caracter=cadena[i],
            anterior=i>0?cadena[i-1]:null;

        //Final de la cadena sin cerrar una llave, descartar completa
        if(i==total&&enLlave) return null;

        if(enLlave&&caracter=="}"&&anterior!="\\") {
            //Ejecutar expresión
            try {
                valor=expr.establecerExpresion("{"+bufer+"}").ejecutar();
            } catch {
                //Si falla, devolver vacío
                valor="";
            }
            if(valor!==null) {
                if(typeof valor==="string") {
                    resultado+=valor;            
                } else if(typeof valor==="number") {
                    resultado+=valor.toString();
                } else if(typeof valor==="function"||typeof valor==="object"||typeof valor==="boolean") {
                    //Función, objeto o lógico, devolver directamente, descartando la parte literal previa
                    resultado=valor;
                }
            }

            bufer="";
            enLlave=false;
        } else if((caracter=="{"&&anterior!="\\")||i==total) {
            //Concatenar tal cual al comenzar una expresión o llegar al final de la cadena
            if(bufer!="") resultado+=bufer;

            bufer="";
            enLlave=true;
        } else {
            bufer+=caracter;
        }
    }
    
    return expresion.analizarValor(resultado);
};

window["expresion"]=expresion;