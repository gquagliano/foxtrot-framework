<?php
/**
 * Aplicación de demostración de Foxtrot.
 * @author 
 * @version 1.0
 */

namespace aplicaciones\ejemplo\modelo\personas;

defined('_inc') or exit;

/**
 * Entidad `persona`. Nótese que esta entidad no presenta clase concreta de modelo, sino que se define `usuario::$nombreModelo` a fin
 * de que el framework la genere automáticamente.
 */
class persona extends \entidad {
    protected static $nombreModelo='personas';

    /**
     * @tipo cadena(50)
     * @indice
     * @publico
     */
    public $apellido;

    /**
     * @tipo cadena(50)
     * @indice
     * @publico
     */
    public $nombre;

    /**
     * @tipo logico
     * @indice
     * @publico
     */
    public $activo;
    
    /**
     * @tipo entero(1)
     * @indice
     * @publico
     */
    public $tipo_documento;

    /**
     * @tipo cadena(20)
     * @indice
     * @publico
     */
    public $numero_documento;

    /**
     * @tipo relacional
     * @relacion 1:n
     * @entidad personas/contacto
     * @campo id_persona
     * @publico
     */
    public $contactos;
    
    /**
     * @tipo entero
     * @indice
     */
    public $id_localidad;

    /**
     * @tipo relacional
     * @relacion 1:0
     * @entidad localidad
     * @campo id_localidad
     * @simple
     */
    public $localidad;

    /**
     * @tipo cadena(255)
     * @indice
     */
    public $codigo_seguridad;

    /**
     * @tipo entero
     * @indice
     */
    public $id_categoria;

    /**
     * @tipo relacional
     * @relacion 1:0
     * @entidad personas/categoria
     * @campo id_categoria
     */
    public $categoria;
}