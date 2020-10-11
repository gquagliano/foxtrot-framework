/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * @class Utilidades varias.
 */
var util={
    /**
     * Determina si una expresión es indefinida o no.
     */
    esIndefinido:function(expr) {
        return typeof expr==="undefined";
    },

    /**
     * Determina si una expresión es una cadena.
     */
    esCadena:function(expr) {
        return typeof expr==="string";
    },

    /**
     * Determina si un objeto es un array.
     */
    esArray:function(obj) {
        return Array.isArray(obj);
    },

    /**
     * Determina si un objeto es estrictamente un objeto (está definido y no es un array).
     */
    esObjeto:function(obj) {
        return typeof obj==="object"&&!util.esArray(obj);
    },

    /**
     * Determina si un objeto es un componente.
     * @param {Object} obj Objeto a evaluar.
     */
    esComponente:function(obj) {
        return obj instanceof componente.cttr();
    },

    //instanceof falla cuando se evaluan objetos provinientes de otra ventana, caso muy común en el editor, que utiliza marcos, por lo que implementamos algunas
    //funciones útiles para *estimar* tipos en formas alternativas.

    /**
     * Determina si un valor es una expresión regular.
     * @param {*} obj - Valor a evaluar.
     */
    esExpresionRegular:function(obj) {
        return obj!==null&&typeof obj==="object"&&(obj instanceof RegExp||typeof obj.test==="function");
    },
    
    /**
     * Determina si un valor es un elemento del DOM (Node o Element).
     * @param {*} obj - Valor a evaluar.
     */
    esElemento:function(obj) {
        return obj!==null&&typeof obj==="object"&&(obj instanceof Node||obj instanceof Element||typeof obj.nodeName==="string");
    },

    /**
     * Determina si un valor es una lista de elementos del DOM (NodeList o HTMLCollection).
     * @param {*} obj - Valor a evaluar.
     */
    esListaDeElementos:function(obj) {
        return obj!==null&&typeof obj==="object"&&(obj instanceof NodeList||obj instanceof HTMLCollection||typeof obj.entries==="function");
    },

    /**
     * Busca una propiedad anidada dada su ruta separada por puntos.
     * @param {Object} objeto - Objeto.
     * @param {string} ruta - Ruta a evaluar.
     * @returns {*|undefined}
     */
    obtenerPropiedad:function(objeto,ruta) {
        ruta=ruta.split(".");
        for(var i=0;i<ruta.length;i++) {
            if(typeof objeto==="object") {
                objeto=objeto[ruta[i]];
            } else {
                break;
            }
        }
        return objeto;
    },

    /////TODO Los siguientes métodos se están migrando desde Foxtrot 6. Solo se les asignó un nombre en español, que debe ser definitivo. Se deben terminar de
    /////traducir y se debe corregir la documentación.

    /**
     * Genera y devuelve una cadena de caracteres al azar.
     * @returns {string}
     */
    cadenaAzar:function() {
        return Math.random().toString(36).replace(/[^a-z]+/g,"");
    },

    /**
     * Trim con expresión regular.
     * @param {string} cadena - Cadena.
     * @param {string} caracteres - Caracteres (debe se compatible con expresiones regulares, escapando los caracteres necesarios).
     * @returns {string}
     */
    trim:function(cadena,caracteres) {
        var exp=new RegExp("(^"+caracteres+"|"+caracteres+"$)","g");
        while(exp.test(cadena)) cadena=cadena.replace(exp,"");
        return cadena;
    },

    /**
     * Determina si el valor dado es un objeto vacío.
     * @param {*} obj - Valor a evaluar.
     * @returns {boolean}
     */
    esObjetoVacio:function(obj) {
        var s=JSON.stringify(obj);
        return s=='{}'||s=='[]';
    },

    /**
     * Convierte un archivo a una cadena (Data URL).
     * @param {File} archivo - Archivo.
     * @param {function} retorno - Función de retorno.
     */
    archivoADataUrl:function(archivo,retorno) {        
        var lector=new FileReader();
        lector.onload=function(evento) {
            retorno(evento.target.result);
        };
        lector.readAsDataURL(archivo);
    },

    /**
     * Devuelve un entero aleatoreo en el rango dado.
     * @param {number} min - Mínimo.
     * @param {number} max - Máximo.
     * @returns {number}
     */
    azar:function(min,max) {
        return Math.round(Math.random()*(max-min)+min);
    },

    /**
     * Devuelve el directorio donde se encuentra el archivo especificado. Siempre incluye / al final.
     * @param {string} ruta - Ruta a analizar.
     * @returns {string}
     */
    nombreDirectorio:function(ruta) {
        if(ruta.substring(ruta.length-1)=="/") ruta=ruta.substring(0,ruta.length-1);
        if(ruta.indexOf("/")<0) {
            //Archivo en el raiz
            return "/";
        } else {
            //Archivo
            return ruta.substring(0,ruta.lastIndexOf("/"))+"/";
        }
    },

    /**
     * Dado un color en hexagesimal en formato: #RRGGBB, #RRGGBBAA, #RGB o #RGBA, devuelve un objeto con sus componentes RGB y Alpha.
     * @param {string} hex - Color.
     * @returns {string}
     */
    hexARgba:function(hex) {
        hex=hex.replace(/[^a-f\d]+/ig,'');

        if(hex.length==3||hex.length==4){
            //Convertir RGB a RRGGBB y RGBA a RRGGBBAA
            hex = hex.replace(/(.)/g,"$1$1");
        }

        var result;
        if(hex.length==8) {
            //RRGGBBAA
            result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        } else if(hex.length==6) {
            //RRGGBB
            result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            result[4]="FF";
        } else {
            return null;
        }

        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: parseInt(result[4], 16)/255
        };
    },

    /**
     * Dado un color en hexagesimal en formato: #RRGGBB, #RRGGBBAA, #RGB o #RGBA, devuelve un objeto con sus componentes RGB y Alpha.
     * @param {string} hex - Color.
     * @returns {string}
     */
    hexARgb:function(hex) {
        return util.hexARgba(hex);
    },

    /**
     * Convierte y devuelve la representación CSS del color.
     * @param {string} color - Color como cadena u objeto RGBA.
     * @returns {string}
     */
    rgbaAString:function(color) {
        if(typeof color=="string") color=util.hexARgba(color);
        if(!color) return "";
        return "rgba("+color.r+","+color.g+","+color.b+","+color.a+")";
    },

    /**
     * Separa la cadena por el delimitador solo una vez, aunque el delimitador vuelva a aparecer posteriormente.
     * @param {string} cadena - Cadena.
     * @param {string} delimitador - Delimitador.
     * @returns {string[]}
     */
    separarUnaVez:function(cadena,delimitador) {
        return [cadena.substring(0,cadena.indexOf(delimitador)),cadena.substring(cadena.indexOf(delimitador)+1)];
    },

    /**
     * Divide una cadena por dos delimitadores (comienzo y fin) siempre y cuando estén emparejados y no estén escapados (no tiene en cuenta la presencia de comillas).
     * @param {string} delimitadorComienzo - Delimitador de comienzo.
     * @param {string} delimitadorFinal - Delimitador de final.
     * @param {string} cadena - Cadena.
     * @param {string} [escape="\\"] - Caracter de escape.
     * @returns {string[]}
     */
    separarGrupos:function(delimitadorComienzo,delimitadorFinal,cadena,escape) {
        if(isUndefined(escape)) escape="\\";
        if(cadena.length<=1||cadena.indexOf(delimitadorComienzo)<0||cadena.indexOf(delimitadorFinal)<0) return [cadena]; //No presenta los delimitadores, nada que hacer

        var result=[];
        var lastClosePos= 0,openPos=0;
        var openSection=false;

        for(var i=0;i<cadena.length;i++) {
            if(openSection&&cadena[i]==delimitadorFinal&&cadena[i-1]!=escape) {
                //Si está abierto y se encuentra el delimitador final, agregar porción al resultado y cerrar

                var lastPiece=cadena.substring(lastClosePos, openPos);
                var thisPiece=cadena.substring(openPos, i + 1);

                if(lastPiece!="") result.push(lastPiece);
                if(thisPiece!="") result.push(thisPiece);

                lastClosePos=i+1;
                openSection=false;
            }
            if(cadena[i]==delimitadorComienzo&&(i==0||cadena[i-1]!=escape)) {
                //Si se encuentra el delimitador inicial y no está escapado, abrir
                openPos=i;
                openSection=true;
            }
        }
        //Agregar la última porción de la cadena, desde el último cierre
        if(lastClosePos<cadena.length) result.push(cadena.substring(lastClosePos,i));

        return result;
    },

    /**
     * Procesa una cadena o un array de cadenas y los convierte a sus tipos correspondientes.
     * @param {*) data - Dato a procesar.
     * @returns *
     */
    procesarValores:function(data) {
        if(isUndefined(data)||data===null) return null;

        var returnAsStr=false;
        if(isString(data)) {
            //Si es un string, convertir a un array para unificar el procesamiento con los arrays de strings
            returnAsStr=true;
            data=[data];
        }

        for(var i=0;i<data.length;i++) {
            if(data[i]=="null") data[i]=null;
            else if(data[i]=="true") data[i]=true;
            else if(data[i]=="false") data[i]=false;
            else if(data[i].match(/^[-0-9\,]+$/)&&data[i].match(/,/g)&&data[i].match(/,/g).length==1) data[i]=parseFloat(data[i].replace(',','.'));
            else if(data[i].match(/^[-0-9\.]+$/)&&data[i].match(/\./g)&&data[i].match(/\./g).length==1) data[i]=parseFloat(data[i]);
            else if(data[i].match(/^[-0-9]+$/)) data[i]=parseInt(data[i]);
        }

        //Devolver como string o array según el formato del dato original
        return returnAsStr?data[0]:data;
    },
    
    /**
     * Valida una dirección de email.
     * @param {string} v
     * @returns {boolean}
     */
    validarEmail:function(v) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(v);
    },

    /**
     * Convierte los saltos de línea en <br>.
     * @param {string} t 
     * @returns {string}
     */
    nl2br:function(t) {
        return t.replace(/\n/g,"<br>");
    },

    /**
     * Genera la descripción de un período de tiempo.
     * @param {number} v 
     * @param {*} format 
     * @returns {string}
     */
    periodo:function(v,format) {
        if(!isNumeric(v)) v=util.procesarValores(v);
        if(isNaN(v)) v=0;

        if(isUndefined(format)) format="hms";

        var res="";

        if(format=="lit") {
            if(v>604800) { //1 semana
                var s=Math.floor(v/604800);
                v-=s*604800;
                res+=s+" semana"+(s>1?"s":"")+" ";
            }
            if(v>86400) { //1 día
                var s=Math.floor(v/86400);
                v-=s*86400;
                res+=s+" día"+(s>1?"s":"")+" ";
            }
            if(v>3600) { //1 hora
                var s=Math.floor(v/3600);
                v-=s*3600;
                res+=s+" hora"+(s>1?"s":"")+" ";
            }
            if(v>60) { //1 min
                var s=Math.floor(v/60);
                v-=s*60;
                res+=s+" minuto"+(s>1?"s":"")+" ";
            }
            if(v>0) {
                res+=v+" segundo"+(v>1?"s":"");
            }
        } else if(format=="hms"||format=="dhms") {
            if(format=="dhms"&&v>86400) { //1 día
                var s=Math.floor(v/86400);
                v-=s*86400;
                res+=s+" día"+(s>1?"s":"")+" ";
            }
            if(v>3600) { //1 hora
                var s=Math.floor(v/3600);
                v-=s*3600;
                res+=s+":";
            } else {
                res+="0:";
            }
            if(v>60) { //1 min
                var s=Math.floor(v/60);
                v-=s*60;
                if(s<10) s="0"+s.toString();
                res+=s+":";
            } else {
                res+="00:";
            }
            if(v>0) {
                if(v<10) v="0"+v.toString();
                res+=v;
            } else {
                res+="00";
            }
        } else if(format=="dec") {
            res=util.formatoNumero(v/60/60);
        }

        return res;
    },

    /**
     * @enum
     */
    formatoPeriodo:{
        Literal:"lit",
        DHMS:"dhms",
        HMS:"hms",
        Decimal:"dec"
    },

    /**
     * Convierte bytes a formato legible.
     * @param {number} bytes - Tamaño en bytes.
     * @param {boolean} si - Si es true, devolverá en unidades del sistema métrico. Opcional (predeterminado=true).
     * @returns {string}
     */
    tamanoArchivo:function(bytes,si){
        //Fuente (adaptado): http://en.wikipedia.org/wiki/Template:Quantities_of_bytes
        if(isUndefined(si)) var si=true;
        var b,c,d;
        return (si=si?[1e3,'k','B']:[1024,'K','iB'],b=Math,c=b.log,
                d=c(bytes)/c(si[0])|0,bytes/b.pow(si[0],d)).toFixed(2)
            +' '+(d?(si[1]+'MGTPEZY')[--d]+si[2]:'Bytes');
    },

    completarIzquierda:function(str,len,pad) {
        if(typeof pad=="undefined") var pad=" ";
        str=str.toString();
        while(str.length<len) {
            str=pad+str;
        }
        return str;
    },

    completarDerecha:function(str,len,pad) {
        if(typeof pad=="undefined") var pad=" ";
        str=str.toString();
        while(str.length<len) {
            str=str+pad;
        }
        return str;
    },

    /**
     * Convierte una cantidad de minutos (entero) a horas:minutos.
     * @param {number} q - Número de minutos.
     * @param {boolean} str - Si es true, devolverá el valor como string. En caso contrario, devolverá un array [horas,minutos]. Opcional (predeterminado=true).
     * @returns {number}
     */
    minutosAHoras:function(q,str) {
        var j=Math.floor(q/60);
        var m=q-j*60;
        if(!isUndefined(str)&&str) {
            return j+':'+(m<10?"0":"")+m;
        } else {
            return [j,m];
        }
    },

    /**
     * Convierte una hora (string con formato horas:minutos) a un entero representando la cantidad de minutos correspondiente.
     * @param {number} q - String.
     * @returns {number}
     */
    horasAMinutos:function(q) {
        if(!/^[0-9]{1,2}:[0-9]{1,2}$/.test(q)) return null;
        q=q.split(":");
        return parseInt(q[0])*60+parseInt(q[1]);
    },

    horasAMinutosUtc:function(q) {
        q=util.horasAMinutos(q);
        if(q===null) return q;
        t+=new Date().getTimezoneOffset();
    },

    /**
     * Convierte una hora (string con formato horas:minutos) a un entero representando la cantidad de segundos correspondientes.
     * @param q String.
     */
    horasASegundos:function(q) {
        if(!/^[0-9]{1,2}:[0-9]{1,2}$/.test(q)) return null;
        q=q.split(":");
        return parseInt(q[0])*60*60+parseInt(q[1])*60;
    },

    /**
    * Convierte una hora (string con formato horas:minutos) a un entero representando la cantidad de segundos correspondientes. Convierte
    * la salida a UTC según la zona horaria actual.
    * @param q String.
    */
    horasASegundosUtc:function(q) {
        q=util.horasASegundos(q);
        if(q===null) return q;
        q+=new Date().getTimezoneOffset()*60;
        return q;
    },

    segundosAHoras:function(v) {
        var h=Math.floor(v/60/60),
            m=Math.floor((v-h*60*60)/60);
        return h+":"+(m<10?"0":"")+m;
    },

    segundosAHorasUtc:function(v) {
        v-=new Date().getTimezoneOffset()*60;
        var h=Math.floor(v/60/60),
            m=Math.floor((v-h*60*60)/60);
        return h+":"+(m<10?"0":"")+m;
    },

    /**
     * Obtiene la cantidad de minutos desde las 0:00 de la fecha epoch especificada.
     * @param q Tiempo epoch.
     */
    epochAMinutos:function(q) {
        q= util.fechaHora(q,"H:i").split(":");
        return parseInt(q[0])*60+parseInt(q[1]);
    },

    /**
     * Convierte una fecha epoch (UTC) a un objeto Date.
     * @param v Tiempo epoch.
     */
    epochAFecha:function(v) {
        return new Date(parseInt(v)*1000);
    },

    /**
     * Devuelve la cantidad de días transcurridos entre dos fechas.
     * @param a Fecha 1 (tipo Date)
     * @param b Fecha 2 (tipo Date)
     */
    diasEntre:function(a,b) {
        return Math.round(Math.abs((+a)-(+b))/8.64e7);
    },

    validarFecha:function(d) {
        return !isNaN(Date.parse(d));
    },

    /**
     * Devuelve la diferencia UTC en segundos.
     */
    obtenerSegundosZonaHoraria:function() {
        return new Date().getTimezoneOffset()*60;
    },

    /**
     * Convierte una fecha a string. La salida será UTC.
     * @param d Fecha en formato Date (zona indistinta) o tiempo epoch (UTC).
     * @param f Formato de salida. Opcional (predeterminado, n/j/Y).
     */
    fecha:function(d,f) {
        if(!(d instanceof Date)) d=util.epochAFecha(d);
        if(!util.validarFecha(d)) return "";

        if(typeof f=="undefined") f="n/j/Y";        

        var m=d.getUTCMonth()+1;
        var a=d.getUTCDate();
        var i= d.getUTCMinutes();
        var s=d.getUTCSeconds();

        var dn=["Dom","Lun","Mar","Mie","Jue","Vie","Sab","Dom"];
        var r=[
            ["d",(a<10?"0":"")+a],
            ["n",a],
            ["m",(m<10?"0":"")+m],
            ["j",m],
            ["Y",d.getUTCFullYear()],
            ["H", d.getUTCHours()],
            ["i", (i<10?"0":"")+i],
            ["s",(s<10?"0":"")+s],
            ["a",dn[d.getUTCDay()]]
        ];

        f=" "+f;
        for(var j=0;j< r.length;j++) {
            f= f.replace(new RegExp("(?!:[^\\\\])"+r[j][0],"g"),r[j][1]);
        }
        
        return f.substring(1).replace("\\","");
    },

    /**
     * Convierte una fecha a string, incluyendo horas y minutos. La salida será UTC. Esta función es alias de util.dateToString(v,f) con distinto valor predeterminado para f.
     * @param v Fecha en formato Date (zona indistinta) o tiempo epoch (UTC).
     * @param f Formato de salida. Opcional (predeterminado, d/m/Y H:i).
     */
    fechaHora:function(v,f) {
        if(typeof f=="undefined") f="n/j/Y H:i";
        return util.fecha(v,f);
    },

    /**
     * Convierte una fecha a string. La salida se convertirá a hora local.
     * @param d Fecha en formato Date (zona indistinta) o tiempo epoch (UTC).
     * @param f Formato de salida. Opcional (predeterminado, n/j/Y).
     */
    fechaLocal:function(d,f) {
        if(!(d instanceof Date)) d=util.epochAFecha(d);
        if(!util.validarFecha(d)) return "";

        if(typeof f=="undefined") f="n/j/Y";        

        var m=d.getMonth()+1;
        var a=d.getDate();
        var i= d.getMinutes();
        var s=d.getSeconds();

        var dn=["Dom","Lun","Mar","Mie","Jue","Vie","Sab","Dom"];
        var r=[
            ["d",(a<10?"0":"")+a],
            ["n",a],
            ["m",(m<10?"0":"")+m],
            ["j",m],
            ["Y",d.getFullYear()],
            ["H", d.getHours()],
            ["i", (i<10?"0":"")+i],
            ["s",(s<10?"0":"")+s],
            ["a",dn[d.getDay()]]
        ];

        f=" "+f;
        for(var j=0;j< r.length;j++) {
            f= f.replace(new RegExp("(?!:[^\\\\])"+r[j][0],"g"),r[j][1]);
        }
        
        return f.substring(1).replace("\\","");
    },

    /**
     * Convierte una fecha a string, incluyendo horas y minutos. La salida se convertirá a hora local. Esta función es alias de util.dateToStringLocal(v,f) con distinto valor predeterminado para f.
     * @param v Fecha en formato Date (zona indistinta) o tiempo epoch (UTC).
     * @param f Formato de salida. Opcional (predeterminado, n/j/Y H:i).
     */
    fechaHoraLocal:function(v,f) {
        if(typeof f=="undefined") f="n/j/Y H:i";
        return util.fechaLocal(v,f);
    },

    /**
     * Convierte un string representando una fecha en formato d/m/Y H:i:s o Y-m-d H:i:s a un objeto Date.
     * @param v String (se asume UTC).
     */
    cadenaAFecha:function(v) {
        if(v=="") return "";
        var p=[0,0,0,0,0,0];

        //Extraer la hora, si existe
        if(v.indexOf(" ")>0) {
            var v2=v.split(" ");

            v2[1]=v2[1].split(":");
            p[3]=v2[1][0];
            p[4]=v2[1][1];
            if(v2[1].length>=3) p[5]=v2[1][2];

            v=v2[0];
        }         

        //También aceptar el formato Y-m-d para los campos tipo date
        if(/^[0-9]{4,4}-[0-9]{1,2}-[0-9]{1,2}$/.test(v)) {
            var v2=v.split("-");
            p[0]=v2[2];
            p[1]=v2[1];
            p[2]=v2[0];
        } else {
            var v2=v.split("/");
            p[0]=v2[0];
            p[1]=v2[1];
            p[2]=v2[2];
        }
        
        for(var i=0;i< p.length;i++) p[i]=parseInt(p[i]);
        return new Date(Date.UTC(p[2],p[1]-1,p[0],p[3],p[4],p[5]));
    },

    /**
     * Convierte un string representando una fecha en formato d/m/Y H:i:s (se asume UTC) a tiempo epoch.
     * @param v String.
     */
    cadenaAEpoch:function(v) {
        return Math.floor(util.cadenaAFecha(v).getTime()/1000);
    },

    /**
     * Convierte una fecha a un objeto Date, autodetectando su formato.
     * @param v Fecha como string o tiempo epoch.
     */
    convertirAFecha:function(v) {
        if(isNumeric(v)) {
            return util.epochAFecha(v);
        } else {
            return util.cadenaAFecha(v);
        }
    },

    /**
     * Convierte una fecha a tiempo epoch, autodetectando su formato.
     * @param v Fecha objeto Date o tiempo epoch.
     */
    convertirAEpoch:function(v) {
        if(isNumeric(v)) {
            return v;
        } else {
            return util.fechaAEpoch(v);
        }
    },

    /**
     * Convierte un objeto Date a tiempo epoch (UTC).
     * @param d Fecha.
     */
    fechaAEpoch:function(d) {
        return util.epochAUtc(Math.floor(d.getTime()/1000));
    },

    /**
     * Devuelve el tiempo epoch actual (UTC).
     */
    epoch:function() {
        return util.epochAUtc(util.fechaAEpoch(new Date()));
    },

    /**
     * Devuelve el tiempo epoch actual (zona local).
     */
    epochLocal:function() {
        return util.fechaAEpoch(new Date());
    },

    /**
     * Convierte un epoch local a UTC.
     */
    epochAUtc:function(v) {
        var off=new Date().getTimezoneOffset()*60; //en segundos
        return v-off;
    },

    /**
     * Convierte un epoch UTC a local.
     */
    epochALocal:function(v) {
        var off=new Date().getTimezoneOffset()*60; //en segundos
        return v+off;
    },

    /**
     * Devuelve un objeto Date a las 0:00 (local) del día de la fecha especificada.
     * @param d Fecha (objeto Date)
     */
    medianoche:function(d) {
        if(!(d instanceof Date)) d=util.epochAFecha(d);
        d=new Date(d.getFullYear(), d.getUTCMonth(), d.getUTCDate(), 0,0,0);
        return d;
    },

    /**
     * Trunca y formatea a string un número a la cantidad de decimales.
     * @param v Número.
     * @param decimalPlaces Cantidad de decimales. Opcional.
     */
    formatoNumero:function(v,decimalPlaces) {
        if(isString(v)) v=util.procesarValores(v);
        if(v===null) return "";
        if(!isNumeric(v)) v=0;
        if (isUndefined(decimalPlaces)) decimalPlaces=util.decimalesPredeterminados;

        v = parseFloat(v);

        var neg=v<0;
        v=Math.abs(v);

        if (isNaN(v)) v = 0;
        var s;
        if(decimalPlaces===null) {
            //si no se especifica decimalPlaces, mantener cantidad original de decimales
            s = v.toString().split(".");
            if(s.length==1) s[1]="00";
        } else {
            v = (v * Math.pow(10, decimalPlaces)).toFixed() / Math.pow(10, decimalPlaces);
            s = v.toFixed(decimalPlaces).toString().split(".");
        }
        //agregar puntos de mil
        var e="";
        var l=s[0].length;
        for(var i=0;i<l;i++) {
            e=s[0][l-i-1]+e;
            if(i>0&&i<l-1&&(i+1)%3==0) e="."+e;
        }

        if(neg) e="-"+e;

        return e+","+s[1];
    },

    /**
     * Trunca un número a la cantidad de decimales manteniendo el tipo.
     * @param v Número.
     * @param decimalPlaces Cantidad de decimales. Opcional.
     */
    redondear:function(v,decimalPlaces) {
        if(isString(v)) v=util.procesarValores(v);
        if(!isNumeric(v)) v=0;
        if (isUndefined(decimalPlaces)) decimalPlaces=util.decimalesPredeterminados;
        return v.toFixed(decimalPlaces);
    },
    
    /**
     * Valor predeterminado para el parámetro decimalPlaces de util.numberFormat.
     */
    decimalesPredeterminados:null,

    /**
     * Recorre un array de objetos multidimensional sin recursión (utilizando una pila) para mayor eficiencia.
     * @param {*} arr Array
     * @param prop Nombre de la propiedad que contiene la descendencia
     * @param {*} fn Función. Parámetros: elemento, índice, parent (opcional)
     * @param afterFn Función a llamar luego de completar el recorrido de sus hijos. Parámetros: elemento, índice, objeto, parent. (Opcional)
     * @param par Primer elemento padre (opcional)
     */
    recorrerSinRecursion:function(arr,prop,fn,afterFn,par) {
        //Estamos eliminando la recursividad en busca de un mejor rendimiento

        if(isUndefined(fn)) fn=null;
        if(isUndefined(afterFn)) afterFn=null;
        
        var curr=arr,
            //parent permite llevar un control de herencia no de elementos del array original, sino del valores devueltos
            //por la función (ej. durante el renderizado)
            parent=isUndefined(par)?null:par,
            elem=null,
            i=0,
            stack=[];
        while(stack.length>0||i<curr.length) {
            while(i<curr.length) {
                var children=curr[i][prop];

                var conti=true;
                elem=null;
                if(fn!==null) {
                    var ret=fn(curr[i],i,parent);
                    //la función puede devolver undefined, un objeto {elem,continue} o false para detener
                    if(!isUndefined(ret)) {
                        if(isObject(ret)) {
                            elem=ret.elem;
                            conti=ret.continue;
                        } else if(ret===false) {
                            conti=false;
                        }
                    }
                }

                //si la función devuelve false se detiene el proceso de esta rama
                if(conti&&!isUndefined(children)&&children.length) {
                    //guardar la posición actual en el stack y pasar a children
                    stack.push([curr,i,parent,elem]);
                    curr=children;
                    parent=elem;
                    i=0;
                } else {              
                    //no tiene hijos, ejecutar la función after
                    if(afterFn) afterFn(curr[i],i,elem,parent);

                    i++;
                }
            }

            //finalizado el objeto, volver a la posición anterior
            var t=stack.pop();
            if(!isUndefined(t)) {
                curr=t[0];
                i=t[1];
                parent=t[2];
                elem=t[3];

                //ejecutar la función after
                if(afterFn) afterFn(curr[i],i,elem,parent);
            }

            i++;
        }
    },
    
    /**
     * Permite buscar un elemento de un array de objetos comparando por una propiedad determinada.
     * @param arr Array.
     * @param prop Propiedad de búsqueda.
     * @param val Valor buscado.
     * @param returnIndex=false Devolver el índice en lugar del elemento.
     */
    buscar:function(arr,prop,val,returnIndex) {
        if(isUndefined(returnIndex)) returnIndex=false;

        for(var i=0;i<arr.length;i++)
            if(arr[i].hasOwnProperty(prop)&&arr[i][prop]==val) return returnIndex?i:arr[i];
        return null;
    }
};

window["util"]=util;