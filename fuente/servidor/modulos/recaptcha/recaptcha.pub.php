<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace modulos\recaptcha\publico;

defined('_inc') or exit;

/**
 * Componente concreto Recaptcha (público).
 */
class recaptcha extends \modulo {
    /**
     * Devuelve la configuración pública de Recaptcha.
     * @return object
     */
    public function obtenerConfiguracion() {
        return [
            'clave'=>\configuracion::obtener('recaptchaPublico')
        ];
    }
}