<?php
/**
 * Aplicación de demostración de Foxtrot.
 * @author 
 * @version 1.0
 */

namespace aplicaciones\ejemplo\publico;

defined('_inc') or exit;

/**
 * Métodos públicos de la aplicación.
 */
class aplicacion extends \aplicacion {
    /**
     * Cierra la sesión.
     */
    public function cerrarSesion() {
        \sesion::cerrarSesion();
    }
}

