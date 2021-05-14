<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace modulos;

defined('_inc') or exit;

/**
 * Módulo Firebase.
 * 
 * El módulo define múltiples propiedades en la configuración de Foxtrot (global o de la aplicación):  
 *  - `firebaseApiKey`
 *  - `firebaseAuthDomain`
 *  - `firebaseProjectId`
 *  - `firebaseStorageBucket`
 *  - `firebaseMessagingSenderId`
 *  - `firebaseAppId`
 *  - `firebaseVapid`
 *  - `firebaseClaveServidor`
 */
class firebase extends \modulo {
    private $error;
    private $respuesta;

    /**
     * Envia una notificación FCM (Firebase Cloud Messaging).
     * @param string $para Destino (token de usuario o tema).
     * @param object|array $notificacion Cuerpo de la notificación. Puede incluir las propiedades: `titulo`, `cuerpo`, `icono`, `accion`
     * (URL). No debe incluirse `accion` cuando la notificación esté destinada a aplicaciones Cordova.
     * @param object|array $datos Datos a enviar junto con la notificación.
     * @return bool
     */
    public function enviarNotificacion($para,$notificacion,$datos=null) {
        if(is_array($notificacion)) $notificacion=(object)$notificacion;

        $obj=(object)[
            //'icon'=>\foxtrot::url().'recursos/img/foxtrot-transp.png',
            //'click_action'=>\foxtrot::url()
        ];
        if($notificacion->titulo) $obj->title=$notificacion->titulo;
        if($notificacion->cuerpo) $obj->body=$notificacion->cuerpo;
        if($notificacion->icono) $obj->icon=$notificacion->icono;
        if($notificacion->accion) $obj->click_action=$notificacion->accion;

        $cuerpo=(object)[
            'notification'=>$obj,
            'to'=>$para
        ];

        if($datos) $cuerpo->data=(object)$datos;

        $this->error=null;
        $this->respuesta=json_decode(\http::post('https://fcm.googleapis.com/fcm/send',
            json_encode($cuerpo),
            [
                'Content-Type: application/json',
                'Authorization: key='.\configuracion::obtener('firebaseClaveServidor')
            ]
        ));

        if(\http::obtenerCodigoHttp()!='200') {
            $this->error=\http::obtenerError();
            return false;
        }

        return true;
    }

    /**
     * Devuelve el último mensaje de error, o `null`.
     * @return string
     */
    public function obtenerError() {
        return $this->error;
    }

    /**
     * Devuelve el cuerpo de respuesta de la última solicitud.
     * @return string
     */
    public function obtenerRespuesta() {
        return $this->respuesta;
    }
}