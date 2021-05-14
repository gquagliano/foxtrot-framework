<?php
/**
 * Aplicación de demostración de Foxtrot.
 * @author 
 * @version 1.0
 */

namespace aplicaciones\ejemplo\modelo;

/**
 * Entidad `localidad`. Nótese que esta entidad no presenta clase concreta de modelo, sino que se define `localidad::$nombreModelo` a fin
 * de que el framework la genere automáticamente.
 */
class localidad extends \entidad {
    protected static $nombreModelo='localidades';

    /**
     * @tipo cadena(30)
     * @indice
     */
    public $nombre;
}