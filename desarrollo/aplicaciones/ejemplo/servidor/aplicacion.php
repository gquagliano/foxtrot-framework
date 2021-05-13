<?php
/**
 * Aplicación de demostración de Foxtrot.
 * @author 
 * @version 1.0
 */

namespace aplicaciones\ejemplo;

defined('_inc') or exit;

/**
 * Controlador principal de la aplicación.
 */
class aplicacion extends \aplicacion {
    /**
     * Valida la sesión (método para los controladores).
     */
    public function verificarLogin() {
        //TODO Completar validaciones de seguridad.
        if(!\sesion::verificarUsuario()) {
            \foxtrot::detener();
        }
    }
}