/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

"use strict";

//Versión provisoria simplificada

/**
 * @class Intérprete de expresiones.
 */
var expresion=function(expr) {
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
    
    this.establecerVariables=function(obj) {
        var t=this;
        obj.porCada(function(clave,valor) {
            t.variables[clave]=valor;
        });
        return this;
    };
    
    this.establecerFunciones=function(obj) {
        var t=this;
        obj.porCada(function(clave,valor) {
            t.funciones[clave]=valor;
        });
        return this;
    };

    this.obtenerVariables=function() {
        return this.variables;
    };
    
    this.obtenerFunciones=function() {
        return this.funcion;
    };
    
    this.establecerExpresion=function(expr) {
        this.cadena=null;
        if(expresion.esExpresion(expr)) {
            expr=expr.trim();
            this.cadena=expr.substr(1,expr.length-2).trim();
        }
        return this;
    };

    var buscarObjeto=function(objeto,nombre) {
        if(nombre==="") return "";
        if(nombre.length>=2&&nombre.substr(0,1)=="'"&&nombre.substr(-1)=="'") return nombre.substr(1,nombre.length-2);
        if(objeto) return objeto[nombre];
        if(this.variables.hasOwnProperty(nombre)) return this.variables[nombre];
        if(this.funciones.hasOwnProperty(nombre)) return this.funciones[nombre];
        return null;
    }.bind(this);

    this.ejecutar=function() {
        if(!this.cadena) return null;
        
        var pila=[],
            uitlimoObjeto=null,
            objeto=null,
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
                    //¿Punto decimal?
                    if(bufer=="") {
                        bufer="0";
                    } else if(/^[0-9+]$/.test(bufer)) {
                        bufer+=".";
                    } else {
                        uitlimoObjeto=objeto;
                        objeto=buscarObjeto(objeto,bufer);
                        bufer="";
                    }
                } else if(caracter=="?") {
                    ternarioCondicion=!!buscarObjeto(objeto,bufer);
                    uitlimoObjeto=objeto;
                    objeto=null;
                    bufer="";
                } else if(caracter==":") {
                    if(ternarioCondicion) {
                        //Si la condición del ternario fue verdadera, terminar
                        break;
                    }
                    uitlimoObjeto=objeto;
                    objeto=null;
                    bufer="";
                } else if(caracter=="[") {
                    pila.push(buscarObjeto(objeto,bufer));
                    uitlimoObjeto=objeto;
                    objeto=null;
                    bufer="";
                } else if(caracter=="]") {
                    uitlimoObjeto=objeto;
                    objeto=buscarObjeto(objeto,bufer);
                    var superior=pila.pop();
                    objeto=buscarObjeto(superior,objeto);
                    bufer="";
                } else if(caracter=="(") {
                    pila.push(buscarObjeto(objeto,bufer));
                    uitlimoObjeto=objeto;
                    objeto=null;
                    bufer="";
                    argumentos=[];
                } else if(caracter==",") {
                    argumentos.push(buscarObjeto(objeto,bufer));
                    uitlimoObjeto=objeto;
                    objeto=null;
                    bufer="";
                } else if(caracter==")") {
                    if(bufer!="") argumentos.push(buscarObjeto(objeto,bufer));
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
            objeto=buscarObjeto(objeto,bufer);
        }

        //Si es una función, devolver un bind al objeto anterior para que al invocarla this tenga el valor correcto
        if(uitlimoObjeto&&typeof objeto==="function") return objeto.bind(uitlimoObjeto);

        return objeto;
    };

    this.establecerExpresion(expr);
};

/**
 * Determina si un objeto es una expresión o no.
 */
expresion.esExpresion=function(obj) {
    return typeof obj==="string"&&obj.trim().length>1&&obj.trim().substr(0,1)=="{"&&obj.trim().substr(-1)=="}";
};

/**
 * Determina si una cadena probablemente contiene expresiones o no.
 */
expresion.contieneExpresion=function(obj) {
    return typeof obj==="string"&&obj.trim().length>2&&/\{.+?\}/.test(obj);
};

expresion.variablesGlobales={};
expresion.funcionesGlobales={};

/**
 * Establece las variables que estarán siempre disponibles al utilizar expresion.evaluar().
 * @param {Object} obj - Objeto cuyas propiedades se corresponden con los nombres de variables.
 */
expresion.establecerVariablesGlobales=function(obj) {
    expresion.variablesGlobales=obj;
    return expresion;
};

/**
 * Establece las funciones que estarán siempre disponibles al utilizar expresion.evaluar().
 * @param {Object} obj - Objeto cuyas propiedades se corresponden con los nombres de funciones.
 */
expresion.establecerFuncionesGlobales=function(obj) {
    expresion.funcionesGlobales=obj;
    return expresion;
};

/**
 * Busca y ejecuta todas las expresiones presentes en una cadena. Las llaves pueden escaparse con \{ \} para evitar que una expresión sea evaluada.
 * @returns {*} Cuando la cadena contenga una única expresión, el valor de retorno puede ser cualquier tipo resultante de la misma. Cuando se trate de una cadena con múltiples expresiones, el retorno siempre será una cadena con las expresiones reemplazadas por sus valores.
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
                } else {
                    //Función u objeto
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
    
    return resultado;
};

window["expresion"]=expresion;