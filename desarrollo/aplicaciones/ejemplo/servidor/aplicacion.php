<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace aplicaciones\ejemplo;

defined('_inc') or exit;

class aplicacion extends \aplicacion {
    /**
     * Valida la sesión (método para los controladores).
     */
    public function verificarLogin() {
        if(!\sesion::verificarUsuario()) {
            //Podemos simplemente detener la ejecución sin devolver ningún mensaje; si es un acceso legítimo, el cliente ya habrá redirigido al usuario al ingreso.
            \foxtrot::detener();
        }
    }
}