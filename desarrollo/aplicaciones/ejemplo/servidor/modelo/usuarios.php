<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace aplicaciones\ejemplo\modelo;

include_once(_servidorAplicacion.'modeloBase.php');

use aplicaciones\ejemplo\modeloBase;

defined('_inc') or exit;

/**
 * Entidad del modelo de datos.
 */
class usuarios extends modeloBase {
    //Niveles de acceso
    const nivelAdministrador=1;
    const nivelOperador=2;
    const nivelExterno=3;

    protected $tipoEntidad=usuario::class;

    /**
     * Devuelve un usuario dado su nombre de usuario.
     * @param string $nombre Nombre de usuario a buscar.
     * @return \aplicaciones\ejemplo\modelo\usuario
     */
    public function buscarUsuario($nombre) {
        $usuario=$this
            ->reiniciar()
            ->donde([
                'usuario'=>$nombre
            ])
            ->obtenerUno();
        return $usuario;
    }

    /**
     * Devuelve el listado de usuarios junto con información para la paginación del listado.
     * @param string $filtro Filtro (texto).
     * @param int $pagina Número de página a obtener.
     * @param int $cantidadPorPag Cantidad de registros por página.
     * @return object
     */
    public function listarUsuarios($filtro=null,$pagina=1,$cantidadPorPag=50) {
        if(!$pagina) $pagina=1;

        $this->reiniciar()
            ->paginacion($cantidadPorPag,$pagina);

        if($filtro) $this->donde('nombre like @f or usuario like @f',['f'=>'%'.str_replace('*','%',$filtro).'%']);

        $cantidad=$this->estimarCantidad();

        return (object)[
            'cantidad'=>$cantidad,
            'paginas'=>ceil($cantidad/$cantidadPorPag),
            'filas'=>$this->obtenerListado()
        ];
    }

    /**
     * Elimina un usuario.
     * @param int $id ID.
     * @return \aplicaciones\ejemplo\modelo\usuarios
     */
    public function eliminarUsuario($id) {
        return $this->reiniciar()
            ->donde([
                'id'=>$id
            ])
            ->eliminar();
    }

    /**
     * Devuelve un usuario dado su ID.
     * @param int $id ID.
     * @return \aplicaciones\ejemplo\modelo\usuario
     */
    public function obtenerUsuario($id) {
        $usuario=$this
            ->reiniciar()
            ->donde([
                'id'=>$id
            ])
            ->obtenerUno();

        unset($usuario->contrasena);

        return $usuario;
    }
    
    /**
     * Guarda un usuario, creándolo o modificando un registro existente en base a la propiedad `id`. Devuelve el ID del usuario creado o actualizado.
     * @param object|\aplicaciones\ejemplo\modelo\usuario $campos Campos del usuario.
     * @return int
     */
    public function crearOModificarUsuario($campos) {
        if($campos->contrasena) {
            $campos->contrasena=self::obtenerContrasena($campos->contrasena);
        } else {
            //Si es una cadena vacía u otro valor, eliminar propiedad para que no sea reemplazada
            unset($campos->contrasena);
        }

        $this->reiniciar()
            ->establecerValores($campos)
            ->guardar();
        
        return $this->ultimoId;
    }

    /**
     * Valida una contraseña.
     * @param \aplicaciones\ejemplo\modelo\usuario $usuario Usuario.
     * @param string $contrasena Contraseña a validad.
     * @return bool
     */
    public static function validarContrasena($usuario,$contrasena) {
        return password_verify($contrasena,$usuario->contrasena);
    }

    /**
     * Devuelve una contraseña encriptada.
     * @param string $contrasena Contraseña.
     * @return string
     */
    public static function obtenerContrasena($contrasena) {
        return password_hash($contrasena,PASSWORD_DEFAULT);
    }

    /**
     * Genera los datos de ejemplo.
     */
    public static function instalar() {
        (new usuarios)
            ->establecerValores([
                'usuario'=>'admin',
                'contrasena'=>self::obtenerContrasena('test'),
                'nombre'=>'Administrador',
                'email'=>'admin@pruebas.com',
                'telefono'=>'3413333333',
                'nivel'=>self::nivelAdministrador
            ])
            ->insertar();
    }
}