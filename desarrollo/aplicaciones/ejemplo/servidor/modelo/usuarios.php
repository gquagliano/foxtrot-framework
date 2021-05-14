<?php
/**
 * Aplicación de demostración de Foxtrot.
 * @author 
 * @version 1.0
 */

namespace aplicaciones\ejemplo\modelo;

defined('_inc') or exit;

/**
 * Modelo de datos `usuarios`. Fabrica y gestiona instancias de la entidad `usuario`, a la cual se relaciona mediante la propiedad
 * `usuarios::$tipoEntidad`.
 */
class usuarios extends \modelo {
    protected static $tipoEntidad=usuario::class;
    
    /**
     * Inicializa la tabla luego de la primer sincronización.
     */
    public function instalar() {
        //Crear el usuario de prueba
        $this
            ->establecerValores([
                'usuario'=>'admin',
                'contrasena'=>'admin', //El framework se va a encargar de encriptarla en forma segura automáticamente
                'email'=>'prueba@prueba.com',
                'activo'=>true
            ])
            ->crear();
    }
}