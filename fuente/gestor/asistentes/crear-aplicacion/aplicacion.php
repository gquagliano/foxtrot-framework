<?php
/**
 * Controlador de la aplicación. Autogenerado por el asistente de Foxtrot
 * @author 
 * @version 1.0
 */

namespace {espacio};

defined('_inc') or exit;

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