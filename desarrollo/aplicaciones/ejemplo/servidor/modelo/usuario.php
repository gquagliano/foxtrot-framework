<?php
/**
 * Aplicación de demostración de Foxtrot.
 * @author 
 * @version 1.0
 */

namespace aplicaciones\ejemplo\modelo;

/**
 * Entidad del modelo `usuarios`. Nótese que esta entidad (a diferencia del resto, como demostración) sí presenta una clase concreta del
 * modelo (`usuarios`), a la cual se relaciona mediante `usuario::$tipoModelo`. La clase `usuarios` puede utilizarse para agregar o
 * extender métodos útiles para la gestión de los datos, pre/post-procesamiento, implementar `instalar()`, etc.
 */
class usuario extends \entidad {
    protected static $tipoModelo=usuarios::class;

    /**
     * @tipo cadena(20)
     * @indice
     * @publico
     */
    public $usuario;

    /**
     * @tipo cadena(100)
     * @indice
     * @publico
     */
    public $email;

    /**
     * @tipo logico
     * @indice
     * @publico
     */
    public $activo;

    /**
     * @contrasena
     */
    public $contrasena;
}