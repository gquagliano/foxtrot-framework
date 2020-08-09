/*global cordova, module*/

module.exports={
    inicializar:function(successCallback,errorCallback) {
        cordova.exec(successCallback,errorCallback,"FoxtrotCordova","inicializar");
    },
    imprimirTexto:function(cuerpo,successCallback,errorCallback) {
        cordova.exec(successCallback,errorCallback,"FoxtrotCordova","imprimirTexto",[cuerpo]);
    },
    alert:function(mensaje,callback) {
        cordova.exec(function() {
            if(typeof callback==="function") callback();
        },function() {},"FoxtrotCordova","alert",[mensaje]);
    },
    confirm:function(mensaje,callback) {
        cordova.exec(function(res) {
            if(typeof callback==="function") callback(res==1);
        },function() {
        },"FoxtrotCordova","confirm",[mensaje]);
    },
    dialogoFecha:function(fecha,callback) {
        cordova.exec(function(res) {
        	if(typeof callback==="function") callback(res);
        },function() {},"FoxtrotCordova","dialogoFecha",[fecha]);
    },
    dialogoHora:function(hora,callback) {
        cordova.exec(function(res) {
        	if(typeof callback==="function") callback(res);
        },function() {},"FoxtrotCordova","dialogoHora",[hora]);
    }
};
