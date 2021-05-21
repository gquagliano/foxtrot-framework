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

    this.objeto=null;
    this.controlador=null;
    this.componente=null;
    this.valor=null;
    this.componentes=null;
    this.this=null;

    var cacheSubexpresiones={};

    /**
     * Establece el valor de `obj` / `objeto` en la expresión.
     * @param {*} valor - Valor a establecer.
     * @returns {expresion}
     */
    this.establecerObjeto=function(valor) {
        this.objeto=valor;
        return this;
    };

    /**
     * Establece el valor de `this` para que, si la expresión devuelve una función, esta sea asociado (*bound*) a ese valor.
     * @param {*} valor - Valor a establecer.
     * @returns {expresion}
     */
    this.establecerThis=function(valor) {
        this.this=valor;
        return this;
    };

    /**
     * Establece el valor de `valor` / `val` en la expresión.
     * @param {*} valor - Valor a establecer.
     * @returns {expresion}
     */
    this.establecerValor=function(valor) {
        this.valor=valor;
        return this;
    };
    
    /**
     * Establece el valor de `controlador` en la expresión.
     * @param {*} valor - Valor a establecer.
     * @returns {expresion}
     */
    this.establecerControlador=function(valor) {
        this.controlador=valor;
        return this;
    };
    
    /**
     * Establece el valor de `componente` en la expresión.
     * @param {*} valor - Valor a establecer.
     * @returns {expresion}
     */
    this.establecerComponente=function(valor) {
        this.componente=valor;
        return this;
    };
    
    /**
     * Establece el valor de `componentes` en la expresión.
     * @param {*} valor - Valor a establecer.
     * @returns {expresion}
     */
    this.establecerComponentes=function(valor) {
        this.componentes=valor;
        return this;
    };

    /**
     * Establece la expresión a analizar.
     * @param string expr - Expresión.
     * @returns {expresion}
     */
    this.establecerExpresion=function(expr) {
        this.cadena=expr;
        return this;
    };

    var extraerUltimoMiembro=function(expresion,procesarTernario) {
        if(cacheSubexpresiones[expresion]) return cacheSubexpresiones[expresion];

        if(typeof procesarTernario==="undefined") procesarTernario=true;

        var resultado;

        //Detectar expresión con operador ternario
        var coincidencias=expresion.match(/^(.+?)\?(.+):(.+)$/);
        if(procesarTernario&&coincidencias) {
            //En este caso, vamos a modificar la expresión para extraer la subexpresión de cada término, manteniendo la condición,
            //para que se pueda interpretar cuál corresponde tomar más adelante
            resultado=coincidencias[1]+"?"+extraerUltimoMiembro(coincidencias[2],false)+":"+extraerUltimoMiembro(coincidencias[3],false);
        } else {
            var corchetes=0,
                llaves=0,
                parentesis=0,
                comillas=null,
                bufer="",
                miembros=[];
            for(var i=0;i<expresion.length;i++) {
                var c=expresion[i],
                    cAnt=i>0?expresion[i-1]:null;

                if(!comillas) {
                    if(!comillas&&!corchetes&&!llaves&&!parentesis&&(c=="."||c=="["||c=="{"||c=="(")) {
                        miembros.push(bufer);
                    }

                    if(c=="[") {
                        corchetes++;
                    } else if(c=="{") {
                        llaves++;
                    } else if(c=="(") {
                        parentesis++;
                    } else if(c=="]") {
                        corchetes--;
                    } else if(c=="}") {
                        llaves--;
                    } else if(c==")") {
                        parentesis--;
                    } else if(c=="\""||c=="'") {
                        comillas=c;
                    }
                } else {
                    if(c==comillas&&cAnt!="\\") {
                        comillas=null;
                    }
                }

                bufer+=c;
            }
            if(bufer!="") miembros.push(bufer);
            if(miembros.length<=1) return expresion;
            resultado=miembros[miembros.length-2];
        }

        cacheSubexpresiones[expresion]=resultado;
        return resultado;
    };

    /**
     * Ejecuta la expresión.
     * @returns {*}
     */
    this.ejecutar=function() {
        if(!this.cadena) return null;

        var cadena=this.cadena.substring(1,this.cadena.length-1);

        //En caso de que se trate de una contatenación de propiedades, buscar el miembro anteúltimo, para utilizar como valor de this. Por ejemplo,
        //dada la expresión objeto.propiedadA.propiedadB.funcion, se debe devolver un bind a objeto.propiedadA.propiedadB
        var expresionPadre=extraerUltimoMiembro(cadena);

        return new Function(
            //Variables locales
            "obj","objeto","item","controlador","componente","componentes","valor","val","args",
            //
"\"use strict\"; \
/*Algunas constantes útiles*/ \
var nulo=null,falso=false,f=false,verdadero=true,v=true; \
try { \
    var resultado=("+cadena+"), \
        objeto=window; \
    if(typeof resultado===\"function\") { \
        try { \
            objeto=("+expresionPadre+"); \
        } catch(x) { } \
        return resultado.bind(objeto); \
    } \
    return resultado; \
} catch(x) { \
    return null; \
}")
            //Valores de las variables locales
            (this.objeto,this.objeto,this.objeto,this.controlador,this.componente,this.componentes,this.valor,this.valor,this.this);
    };     

    /**
     * Analiza un valor y devuelve el mismo valor procesado, o tal cual, según corresponda por su tipo.
     * @param {*} valor - Valor a analizar.
     * @returns {*}
     * @memberof expresion
     */
    this.analizarValor=function(valor) {
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
     * @param {(function|null)} retorno - Función personalizada para el reemplazo de cada expresión hallada. Opcional (por defecto, ejecutará la expresión
     * y la sustituirá por el resultado).
     * @returns {*} Cuando la cadena contenga una única expresión, el valor de retorno puede ser cualquier tipo resultante de la misma. Cuando se trate de una cadena con múltiples expresiones, el retorno siempre será una cadena con las expresiones reemplazadas por sus valores.
     * @memberof expresion
     */
    this.evaluar=function(retorno) {
    	if(!this.cadena) return null;

    	if(typeof retorno!="function")
			retorno=function(expr) {
				return this.establecerExpresion(expr).ejecutar();
    		};

        var cadena=this.cadena,
            bufer="",
            enLlave=false,
            resultado="",
            valor=null,
            total=cadena.length;

        //Omitir análisis y ejecutar directamente si la cadena contiene únicamente la expresión
        if(expresion.esExpresion(cadena)) {
            try {
                return this.analizarValor(this.ejecutar());
            } catch(x) {
                return "";
            }
        }
        //O devolver tal cual si no contiene ninguna expresión
        if(!expresion.contieneExpresion(cadena)) return cadena;

        for(var i=0;i<=total;i++) {
            var caracter=cadena[i],
                anterior=i>0?cadena[i-1]:null;

            //Final de la cadena sin cerrar una llave, descartar completa
            if(i==total&&enLlave) return null;

            if(enLlave&&caracter=="}"&&anterior!="\\") {
                //Ejecutar expresión
                try {
                    valor=retorno.call(this,"{"+bufer+"}",i-bufer.length-1);
                } catch(x) {
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
        
        return this.analizarValor(resultado);
    };

    this.establecerExpresion(expr);
};

////Métodos "estáticos"

/**
 * Determina si un objeto es una expresión o no.
 * @param {*} obj - Valor a evaluar.
 * @returns {boolean}
 * @memberof expresion
 */
expresion.esExpresion=function(obj) {
    return typeof obj==="string"&&obj.trim().length>2&&/^\{[^\{\}]+\}$/.test(obj.trim());
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

/**
 * Remueve todas las expresiones presentes en la cadena.
 * @param {*} valor - Valor a evaluar.
 * @returns {string}
 * @memberof expresion
 */
expresion.remover=function(valor) {
	if(expresion.esExpresion(valor)) return "";
	if(!expresion.contieneExpresion(valor)) return valor;
	return new expresion(valor)
		.evaluar(function(expr) {
			return "";
		});
};

window["expresion"]=expresion;