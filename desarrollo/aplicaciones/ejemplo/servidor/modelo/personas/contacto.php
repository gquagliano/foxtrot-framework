<?php
/**
 * Aplicación de demostración de Foxtrot.
 * @author 
 * @version 1.0
 */

namespace aplicaciones\ejemplo\modelo\personas;

defined('_inc') or exit;

/**
 * Entidad `contacto`. Nótese que esta entidad no presenta clase concreta de modelo, sino que se define `contacto::$nombreModelo` a fin
 * de que el framework la genere automáticamente.
 */
class contacto extends \entidad {
    protected static $nombreModelo='contactos';

    /**
     * @tipo entero
     * @indice
     */
    public $id_persona;

    /**
     * @tipo cadena(100)
     * @indice
     * @publico
     */
    public $email;

    /**
     * @tipo cadena(20)
     * @indice
     * @publico
     */
    public $celular;
}