<?php
/**
 * Aplicación de demostración de Foxtrot.
 * @author 
 * @version 1.0
 */

namespace aplicaciones\ejemplo\modelo\personas;

/**
 * Entidad `categoria`. Nótese que esta entidad no presenta clase concreta de modelo, sino que se define `categoria::$nombreModelo` a fin
 * de que el framework la genere automáticamente.
 */
class categoria extends \entidad {
    protected static $nombreModelo='categorias';

    /**
     * @tipo cadena(30)
     * @indice
     */
    public $nombre;

    /**
     * @busqueda nombre
     */
    public $cache_busqueda;
}