<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace modulos\publico;

defined('_inc') or exit;

/**
 * Módulo Firebase (público).
 */
class firebase extends \modulo {
    /**
     * Devuelve la configuración pública de Firebase.
     * @return object
     */
    public function obtenerConfiguracion() {
        return [
            'apiKey'=>\configuracion::obtener('firebaseApiKey'),
            'authDomain'=>\configuracion::obtener('firebasAauthDomain'),
            'projectId'=>\configuracion::obtener('firebaseProjectId'),
            'storageBucket'=>\configuracion::obtener('firebaseStorageBucket'),
            'messagingSenderId'=>\configuracion::obtener('firebaseMessagingSenderId'),
            'appId'=>\configuracion::obtener('firebaseAppId'),
            'vapid'=>\configuracion::obtener('firebaseVapid')
        ];
    }
}