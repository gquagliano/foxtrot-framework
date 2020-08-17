/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

"use strict";

//¡No está testeado!

//A desarrollar:
//- Posibilidad de definir arreglos con []
//- Agregar más operaciones matemáticas
//- Mejorar el análisis sintáctico

/**
 * Intérprete de expresiones.
 */
var expresion=function(expr) {
    this.cadena=null;
    this.variables={
        //Predefinidos
        //...
        //Constantes
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
        eco:function(v) { return v; }, //para pruebas
    };

    var lexico=[],
        arbol=[];

    var tS={
        valor:1,
        funcion:2,
        variable:3,
        operador:4,
        retorno:5,
        simbolo:6
    },
    simbolo=function(tipo,valor,cadena) {
        if(typeof valor==="undefined") valor=null;
        if(typeof cadena==="undefined") cadena=null;
        this.valor=valor;
        this.cadena=cadena;
        this.tipo=tipo;

        this.asignarOperador=function(obj) {
            this.precedencia=obj.precedencia;
            this.asociatividad=obj.asociatividad;
            this.funcion=obj.funcion;
        };

        this.toString=function() {
            return this.cadena;
        };
    };

    var estimarTipo=function(valor) {
        if(typeof valor==="function") return tS.funcion;
        if(typeof valor==="object") return tS.variable;
        return tS.valor;
    },
    operadorPredeterminado=function(expresion,indice,operacion) {
        var item=expresion[indice];
        if(indice<1||indice>expresion.length-2) throw "Error de síntaxis: `"+item+"` inesperado.";
        var a=valor(expresion[indice-1]),
            b=valor(expresion[indice+1]),
            r=operacion.call(this,a,b);
        expresion.splice(indice-1,3,new simbolo(estimarTipo(r),r,item));
    },
    operadorUnarioLRtlPredeterminado=function(expresion,indice,operacion) {
        var item=expresion[indice];
        if(indice<1) throw "Error de síntaxis: `"+item+"` inesperado.";
        var a=valor(expresion[indice-1]),
            r=operacion.call(this,a);
        expresion.splice(indice-1,2,new simbolo(estimarTipo(r),r,item));
    },
    operadorUnarioLtrPredeterminado=function(expresion,indice,operacion) {
        var item=expresion[indice];
        if(indice>expresion.length-2) throw "Error de síntaxis: `"+item+"` inesperado.";
        var a=valor(expresion[indice+1]),
            r=operacion.call(this,a);
        expresion.splice(indice-1,2,new simbolo(estimarTipo(r),r,item));
    };

    //Palabras reservadas, constantes, símbolos y operadores
    var simbolos="[]+-*/.&!?:\\ <>!,=()%^'",
        operadoresCompuestos=["==","!=","==","<=",">="],
        simboloComillas="'",
        simboloEscape="\\",
        simboloPuntoDecimal=".",
        simboloAbreParentesis="(",
        simboloCierraParentesis=")",
        simboloAbreCorchete="[",
        simboloCierraCorchete="]",
        simboloComa=",",
        simboloTernarioPregunta="?",
        simboloTernarioFalso=":",
        operadoresYPalabras={
            ".":{
                precedencia:1,
                asociatividad:"i",
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a[b];
                    });
                }
            },
            "o":{
                precedencia:2,
                asociatividad:"i",
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a||b;
                    });
                }
            },
            "ox":{
                precedencia:3,
                asociatividad:"i",
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a?!b:b;
                    });
                }
            },
            "y":{
                precedencia:4,
                asociatividad:"i",
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a&&b;
                    });
                }
            },
            "==":{
                precedencia:6,
                asociatividad:false,
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a==b;
                    });
                }
            },
            "!=":{
                precedencia:6,
                asociatividad:false,
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a!=b;
                    });
                }
            },
            "<":{
                precedencia:7,
                asociatividad:false,
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a<b;
                    });
                }
            },
            "<=":{
                precedencia:7,
                asociatividad:false,
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a<=b;
                    });
                }
            },
            ">":{
                precedencia:7,
                asociatividad:false,
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a>b;
                    });
                }
            },
            ">=":{
                precedencia:7,
                asociatividad:false,
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a>=b;
                    });
                }
            },
            "+":{
                precedencia:8,
                asociatividad:"i",
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a+b;
                    });
                }
            },
            "-":{
                precedencia:8,
                asociatividad:"i",
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a-b;
                    });
                }
            },
            "*":{
                precedencia:9,
                asociatividad:"i",
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a*b;
                    });
                }
            },
            "^":{
                precedencia:9,
                asociatividad:"i",
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a^b;
                    });
                }
            },
            "/":{
                precedencia:9,
                asociatividad:"i",
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a/b;
                    });
                }
            },
            "%":{
                precedencia:9,
                asociatividad:"i",
                funcion:function(expresion,indice) {
                    operadorPredeterminado(expresion,indice,function(a,b) {
                        return a%b;
                    });
                }
            },
            "!":{
                precedencia:10,
                asociatividad:"d",
                funcion:function(expresion,indice) {                    
                    operadorUnarioLtrPredeterminado(expresion,indice,function(a) {
                        return !a;
                    });
                }
            }
        };
    
    this.establecerVariables=function(obj) {
        var t=this;
        obj.forEach(function(clave,valor) {
            t.variables[clave]=valor;
        });
        return this;
    };
    
    this.establecerFunciones=function(obj) {
        var t=this;
        obj.forEach(function(clave,valor) {
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
        lexico=[];
        arbol=[];
        if(expresion.esExpresion(expr)) {
            expr=expr.trim();
            this.cadena=expr.substr(1,expr.length-2).trim();
        }
        return this;
    };

    function esCadena(v) {
        return typeof v==="string"&&v.substr(0,1)==simboloComillas&&v.substr(-1)==simboloComillas;
    }

    var valor=function(n) {
        //Valor de subexpresión
        if(n instanceof Array&&n.length==1) return n[0].valor;

        if(n instanceof simbolo) return n.valor;

        if(typeof n!=="string") return n;

        if(esCadena(n)) return n.substr(1,n.length-2);
    }.bind(this);

    var buscarCoincidencia=function(i,lista) {
        for(var j=0;j<lista.length;j++)
            if(this.cadena.substr(i,lista[j].length).toLowerCase()==lista[j]) return lista[j];
        return null;
    }.bind(this);

    var analizar=function() {
        if(lexico.length) return;

        lexico=[];
        var bufer=[],
           i=0,
           agregarBufer=function(arr) {
               if(!bufer.length) return;
               arr.push(bufer.join(""));
               bufer=[];
           };

        //Separar por símbolos y símbolos compuestos

        while(i<this.cadena.length) {
            var c=this.cadena[i],
                coincidencia=null;

            if(i<this.cadena.length-2) coincidencia=buscarCoincidencia(i,operadoresCompuestos);
            
            if(!coincidencia&&simbolos.indexOf(c)>-1) coincidencia=c;
            
            if(coincidencia) {
                agregarBufer(lexico);
                lexico.push(coincidencia);
                i+=coincidencia.length;
                continue;
            }
            
            bufer.push(c);
            i++;
        }
        agregarBufer(lexico);
        
        //Agrupar cadenas y números
        //Convertir símbolos, palabras clave y constantes a objetos

        var temp=[],
            comillas=false;
        bufer=[];
        i=0;

        while(i<lexico.length) {
            var p=lexico[i],
                anterior=i>0?lexico[i-1]:null,
                siguiente=i<lexico.length-1?lexico[i+1]:null;
            
            i++;

            if(!comillas) {
                p=p.toLowerCase().trim();

                if(p=="") {
                    //Remover vacíos
                    continue;
                }

                if(p==simboloComillas) {
                    comillas=true;
                    continue;
                }
                
                if(p==simboloPuntoDecimal&&anterior&&siguiente&&!isNaN(parseInt(anterior))&&!isNaN(parseInt(siguiente))) {
                    //Formato: 1.2
                    //Remover el símbolo anterior, ya que es la parte entera
                    temp.pop();
                    var c=[anterior,p,siguiente].join("");
                    temp.push(new simbolo(tS.valor,parseFloat(c),c));
                    //Saltear el símbolo siguiente, que es la parte decimal
                    i++;
                    continue;
                }
                
                if(p==simboloPuntoDecimal&&anterior&&siguiente&&!isNaN(parseInt(siguiente))) {
                    //Formato: .3
                    var c=[p,siguiente].join("");
                    temp.push(new simbolo(tS.valor,parseFloat(c),c));
                    //Saltear el símbolo siguiente, que es la parte decimal
                    i++;
                    continue;
                }

                //Convertir enteros
                var num=parseInt(p);
                if(!isNaN(num)) {
                    temp.push(new simbolo(tS.valor,num,p));
                    continue;
                }

                //TODO Reemplazando variables aquí, se pierde la posibilidad de repetir la interpretación

                //Variables y constantes
                if(this.variables.hasOwnProperty(p)) {
                    temp.push(new simbolo(tS.variable,this.variables[p],p));
                    continue;
                }
                
                //Funciones
                if(this.funciones.hasOwnProperty(p)) {
                    temp.push(new simbolo(tS.funcion,this.funciones[p],p));
                    continue;
                }
                
                if(operadoresYPalabras.hasOwnProperty(p)) {
                    var oper=new simbolo(tS.operador,null,p);
                    oper.asignarOperador(operadoresYPalabras[p]);
                    temp.push(oper);
                    continue;
                }

                //Otros símbolos conocidos
                if(simbolos.indexOf(p)>-1) {
                    temp.push(new simbolo(tS.simbolo,p,p));
                    continue;
                }

                //Si llegamos hasta aquí es un símbolo inválido o no definido
                //throw "Error: `"+p+"` no está definido.";
                temp.push(new simbolo(tS.valor,p,p));
                continue;
            } else {
                if(p==simboloEscape&&siguiente) {
                    if(siguiente==simboloComillas) {
                        //Saltear símbolo de escape y las comillas siguientes
                        bufer.push(siguiente);
                        i++;
                        continue;
                    }
                }
                
                if(p==simboloComillas) {
                    temp.push(new simbolo(tS.valor,bufer.join("")));
                    bufer=[];
                    comillas=false;
                    continue;
                }

                bufer.push(p);
            }
        }

        if(comillas) throw "Error de sintaxis: Comillas sin cerrar.";
        
        lexico=temp;
    }.bind(this);

    var construirArbol=function() {
        if(arbol.length) return;

        //Resolver paréntesis

        var i=0,
            parentesis=0,
            corchete=0,
            pila=[],
            nivel=[],
            subirPila=function() {
                pila.push(nivel);
                nivel=[];
            },
            bajarPila=function() {
                pila[pila.length-1].push(nivel);
                nivel=pila.pop();
            },
            abiertos=[];        

        while(i<lexico.length) {
            var pal=lexico[i];

            i++;

            if(pal==simboloAbreParentesis) {
                subirPila();
                //Subimos dos niveles en la pila, porque esperamos parámetros
                subirPila();
                abiertos.push(pal);
                parentesis++;
                continue;
            }

            if(pal==simboloAbreCorchete) {
                subirPila();
                abiertos.push(pal);
                corchete++;
                continue;
            }

            //Caso especial: ,
            if(pal==simboloComa) {
                bajarPila();
                subirPila();
                continue;
            }
            
            if(pal==simboloCierraParentesis) {
                parentesis--;
                if(parentesis<0||abiertos.pop()!=simboloAbreParentesis) throw "Error de sintaxis: Paréntesis o corchete inesperado.";

                //Descartar parámetro vacío
                if(nivel.length) {
                    bajarPila();
                } else {
                    nivel=pila.pop();
                }

                bajarPila();
                continue;
            }
            
            if(pal==simboloCierraCorchete) {
                corchete--;
                if(corchete<0||abiertos.pop()!=simboloAbreCorchete) throw "Error de sintaxis: Paréntesis o corchete inesperado.";

                bajarPila();
                continue;
            }

            nivel.push(pal);
        }
        subirPila();

        if(parentesis>0||corchete>0) throw "Error de sintaxis: Paréntesis o corchete sin cerrar.";

        arbol=pila;
    }.bind(this); 

    function parametrosFuncion(s) {
        if(!(s instanceof simbolo)||s.tipo!=tS.retorno) throw "Error: Argumento inválido.";
        var res=[];
        if(s.valor===null) return res;
        if(!(s.valor instanceof Array)) return [s.valor];
        s.valor.forEach(function(item) {
            res.push(valor(item));
        });
        return res;        
    }

    var subexpresion=function(lista,interno) {
        if(typeof interno==="undefined") interno=false;

        if(lista.length<2) return new simbolo(tS.retorno,lista.length?valor(lista[0]):null);
        
        var menor=null,
            menorIndice=null;
            
        //Resolver argumentos de función e índices de array/objeto
        //Se deben hacer múltiples pasadas ya que se transformará lista en caso de encontrarse arrays, objetos o funciones
        while(1) {
            var coincidencias=false;

            for(var i=1;i<lista.length;i++) {
                var parte=lista[i];
                if(parte instanceof simbolo&&parte.tipo==tS.retorno) {
                    var anterior=lista[i-1];
                    if(anterior instanceof simbolo&&(anterior.tipo==tS.variable||anterior.tipo==tS.funcion)) {
                        var v=anterior.valor;
                            
                        if(typeof v==="function") {
                            v=v.apply(this,parametrosFuncion(parte));
                        } else if(typeof v==="object") {
                            v=v[valor(parte)];
                        } else {
                            //throw "Error: `"+anterior.cadena+"` no es función u objeto.";
                        }

                        lista.splice(i-1,2,new simbolo(tS.valor,v));
                        coincidencias=true;
                        break;
                    }
                }
            }

            //Repetir hasta que se haya reemplazado todo
            if(!coincidencias) break;
        }

        //Ordenar por precedencia y asociatividad
        for(var i=0;i<lista.length;i++) {
            var parte=lista[i];
            
            if(parte instanceof simbolo&&parte.tipo==tS.operador) {
                if(!menor||
                    parte.precedencia>menor.precedencia||
                    (parte.precedencia==menor.precedencia&&parte.asociatividad=="r")) {
                        menor=parte;
                        menorIndice=i;
                    }
            }
        }

        //Ejecutar operador de menor precedencia y repetir
        if(menor) {
            menor.funcion(lista,menorIndice);
            subexpresion(lista,true);
        }

        if(interno) return lista;

        if(lista.length<2) return new simbolo(tS.retorno,valor(lista));

        return new simbolo(tS.retorno,lista);
    }.bind(this);

    var recorrer=function(lista,interno) {
        if(typeof interno==="undefined") interno=false;
        
        //Caso especial: Operador ternario
        var posPregunta=null,
            posDosPuntos=null;
        for(var i=0;i<lista.length;i++) {
            var parte=lista[i];

            if(parte instanceof simbolo&&parte.tipo==tS.simbolo) {
                if(parte.valor==simboloTernarioPregunta) {
                    if(posPregunta!==null) throw new "Error de síntaxis: `"+simboloTernarioPregunta+"` inesperado.";
                    posPregunta=i;
                    continue;
                }
                
                if(parte.valor==simboloTernarioFalso) {
                    if(posPregunta===null) throw new "Error de síntaxis: `"+simboloTernarioFalso+"` inesperado.";
                    posDosPuntos=i;
                    break;
                }
            }
        }

        if(posPregunta!==null&&posDosPuntos!==null) {
            var condicion=lista.slice(0,posPregunta),
                verdadero=lista.slice(posPregunta+1,posDosPuntos-posPregunta+1),
                falso=lista.slice(posDosPuntos+1);           

            var retornoCondicion=recorrer(condicion),
                retorno=retornoCondicion?verdadero:falso;

            return subexpresion(retorno);
        } 
        
        for(var i=0;i<lista.length;i++) {
            var parte=lista[i];
            if(parte instanceof Array) {
                var retorno=recorrer(parte,true);
                lista[i]=retorno;
            }
        }
        
        if(!interno) return valor(lista);

        return subexpresion(lista);
    }.bind(this);

    this.ejecutar=function() {
        if(!this.cadena) return null;
        
        analizar();
        construirArbol();

        var trabajo=Object.assign([],arbol);
        recorrer(trabajo);

        if(trabajo.length!=1) throw "La expresión no resuelve a un único valor.";

        return valor(trabajo);
    };

    this.establecerExpresion(expr);
};

/**
 * Determina si un objeto es una expresión o no.
 */
expresion.esExpresion=function(obj) {
    return typeof obj==="string"&&obj.trim().length>1&&obj.trim().substr(0,1)=="{"&&obj.trim().substr(-1)=="}";
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
        expr=new expresion();
    
    expr.establecerVariables(expresion.variablesGlobales);
    expr.establecerFunciones(expresion.funcionesGlobales);

    for(var i=0;i<=total;i++) {
        var caracter=cadena[i],
            anterior=i>0?cadena[i-1]:null;

        //Final de la cadena sin cerrar una llave, descartar completa
        if(i==total&&enLlave) return null;

        if(enLlave&&caracter=="}"&&anterior!="\\") {
            //Ejecutar expresión
            valor=expr.establecerExpresion("{"+bufer+"}").ejecutar();
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