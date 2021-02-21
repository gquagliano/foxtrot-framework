/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Intérprete de expresiones.
 * @class 
 */
function expresion(expr) {
    "use strict";

    this.cadena=null;

    this.variables={
        "nul":null,
        "nulo":null,
        "v":true,
        "verdadero":true,
        "f":false,
        "falso":false
    };

    this.funciones={
        //Predefinidos
        eco:function(v) { return v; },
    };
    
    /**
     * Agrega las variables a la instancia.
     * @param {Object} obj - Variables en el formato `{nombre:valor}`.
     * @returns {expresion}
     */
    this.establecerVariables=function(obj) {
        var t=this;
        obj.porCada(function(clave,valor) {
            t.variables[clave]=valor;
        });
        return this;
    };
    
    /**
     * Agrega las funciones a la instancia.
     * @param {Object} obj - Variables en el formato `{nombre:función}`.
     * @returns {expresion}
     */
    this.establecerFunciones=function(obj) {
        var t=this;
        obj.porCada(function(clave,valor) {
            t.funciones[clave]=valor;
        });
        return this;
    };

    /**
     * Devuelve las variables asignadas.
     * @returns {Object}
     */
    this.obtenerVariables=function() {
        return this.variables;
    };
    
    /**
     * Devuelve las funciones definidas.
     * @returns {Object}
     */
    this.obtenerFunciones=function() {
        return this.funcion;
    };
    
    /**
     * Establece la expresión a analizar.
     * @param string expr - Expresión.
     * @returns {expresion}
     */
    this.establecerExpresion=function(expr) {
        this.cadena=null;
        if(expresion.esExpresion(expr)) {
            expr=expr.trim();
            this.cadena=expr.substr(1,expr.length-2).trim();
        }
        return this;
    };

    /**
     * Ejecuta la expresión.
     * @returns {*}
     */
    this.ejecutar=function() {
        if(!this.cadena) return null;
        return new Function("variables","for(var i=0;i<=1;i++) { \
    for(var p in variables[i]) { \
        if(variables[i].hasOwnProperty(p)) { \
            var variable=variables[i][p]; \
            try { \
                eval(\"var \"+p+\"=variable;\"); \
            } catch { } \
        } \
    } \
} \
\"use strict\"; \
try { \
    return ("+this.cadena+"); \
} catch { \
    return null; \
}")([this.variables,this.funciones]);
    };

    this.establecerExpresion(expr);
};

/**
 * Determina si un objeto es una expresión o no.
 * @param {*} obj - Valor a evaluar.
 * @returns {boolean}
 * @memberof expresion
 */
expresion.esExpresion=function(obj) {
    return typeof obj==="string"&&obj.trim().length>1&&obj.trim().substr(0,1)=="{"&&obj.trim().substr(-1)=="}";
};

/**
 * Determina si una cadena probablemente contiene expresiones o no.
 * @param {*} obj - Valor a evaluar.
 * @returns {boolean}
 * @memberof expresion
 */
expresion.contieneExpresion=function(obj) {
    return typeof obj==="string"&&obj.trim().length>2&&/\{.+?\}/.test(obj);
};

expresion.variablesGlobales={};
expresion.funcionesGlobales={};

/**
 * Establece las variables que estarán siempre disponibles al utilizar expresion.evaluar().
 * @param {Object} obj - Variables a definir con el formato `{nombre:valor}`.
 * @returns {expresion}
 * @memberof expresion
 */
expresion.establecerVariablesGlobales=function(obj) {
    expresion.variablesGlobales=obj;
    return expresion;
};

/**
 * Establece las funciones que estarán siempre disponibles al utilizar expresion.evaluar().
 * @param {Object} obj - Funciones a definir con el formato `{nombre:funcion}`.
 * @returns {expresion}
 * @memberof expresion
 */
expresion.establecerFuncionesGlobales=function(obj) {
    expresion.funcionesGlobales=obj;
    return expresion;
};

/**
 * Analiza un valor y devuelve el mismo valor procesado, o tal cual, según corresponda por su tipo.
 * @param {*} valor - Valor a analizar.
 * @returns {*}
 * @memberof expresion
 */
expresion.analizarValor=function(valor) {
    if(typeof valor==="undefined") return null;
    if(typeof valor!=="string") return valor;
    if(/^[0-9]$/.test(valor)&&!isNaN(valor)) return parseInt(valor);
    if(/^[0-9\.]$/.test(valor)&&!isNaN(valor)) return parseFloat(valor);
    if(valor==="false") return false;
    if(valor==="true") return true;
    if(valor==="null") return null;
    return valor;
};

/**
 * Busca y ejecuta todas las expresiones presentes en una cadena. Las llaves pueden escaparse con \{ \} para evitar que una expresión sea evaluada.
 * @param {string} cadena - Cadena a analizar.
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

    //Omitir análisis si la cadena contiene únicamente la expresión
    if(expresion.esExpresion(cadena)) {
        try {
            return expresion.analizarValor(expr.establecerExpresion(cadena).ejecutar());
        } catch {
            return "";
        }
    }
    //O si no contiene ninguna expresión
    if(!expresion.contieneExpresion(cadena)) return cadena;

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