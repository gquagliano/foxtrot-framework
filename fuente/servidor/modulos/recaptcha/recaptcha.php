<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace modulos\recaptcha;

defined('_inc') or exit;

/**
 * Componente concreto Recaptcha (privado).
 * 
 * El módulo define dos propiedades en la configuración de Foxtrot (global o de la aplicación):
 *  - recaptchaPublico
 *  - recaptchaPrivado
 */
class recaptcha extends \modulo {
    /**
     * Verifica un token.
     * @var string $token Token a verificar.
     * @return bool
     */
    public function verificar($token) {
        $res=\http::post('https://www.google.com/recaptcha/api/siteverify',[
            'secret'=>\configuracion::obtener('recaptchaPrivado'),
            'response'=>$token,
            'remoteip'=>$_SERVER['REMOTE_ADDR']
        ]);
        if(!$res) return false;
        $res=json_decode($res);
        if(!$res||!$res->success) return false;
        return true;
    }
}