/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 /**
 * @class Utilidades para consultas AJAX
 */
var ajax=function(param) {
    "use strict";

    var self=this;

    var predeterminados={
        url:"",
        metodo:"post",
        parametros:null,
        listo:null,
        error:null,
        siempre:null,
        progreso:null, //Recibirá el progreso de 0 a 1 como argumento
        tiempo:60000,
        //Por defecto, siempre vamos a validar y procesar las respuestas como JSON, ya que es el lenguaje que hablará el framework
        json:true
    };
    param=Object.assign(predeterminados,param);
    var xhr=new XMLHttpRequest();

    if(param.tiempo!==null) xhr.timeout=param.tiempo;

    this.obtenerXhr=function() {
        return xhr;
    };

    this.abortar=function() {
        xhr.abort();
        if(param.siempre) param.siempre.call(self);
        return this;
    };

    xhr.onload=function(ev) {
        if(this.status==200) {
            var resp=null;
            try {
                resp=JSON.parse(ev.target.responseText);
            } catch { }
            if(param.listo) param.listo.call(self,resp,ev);
        } else {
            if(param.error) param.error.call(self,ev);
        }
        if(param.siempre) param.siempre.call(self,ev);
    };

    xhr.upload.onprogress=function(ev) {
        if(!ev.lengthComputable) return;
        if(param.progreso) param.progreso.call(self,ev.loaded/ev.total);
    };

    xhr.upload.onloadstart=function() {
        if(param.progreso) param.progreso.call(self,0);
    };

    xhr.upload.onloadend=function() {
        if(param.progreso) param.progreso.call(self,1);
    };

    xhr.onerror=function(ev) {
        if(param.error) param.error.call(self,ev);
        if(param.siempre) param.siempre.call(self,ev);
    };

    xhr.ontimeout=function(ev) {
        if(param.error) param.error.call(self,ev);
        if(param.siempre) param.siempre.call(self,ev);
    };

    var url=param.url,
        cuerpo=param.parametros,
        contentType="application/x-www-form-urlencoded";

    if(cuerpo instanceof FormData) {
        //FormData se envia tal cual
        contentType=null;
    } else if(typeof cuerpo=="object"&&cuerpo!==null) {
        //Construir query string (si parametros es una cadena, enviar tal cual)
        var arr=[];
        Object.keys(cuerpo).forEach(function(clave) {
            arr.push(clave+"="+encodeURIComponent(cuerpo[clave]));
        });
        cuerpo=arr.join("&");
    }

    if(param.metodo.toLowerCase()=="get"&&cuerpo) url+="?"+cuerpo;
    xhr.open(param.metodo,url,true);
    if(param.metodo.toLowerCase()=="post"&&contentType) xhr.setRequestHeader("Content-type",contentType);
    xhr.send(cuerpo);
};

window["ajax"]=ajax;