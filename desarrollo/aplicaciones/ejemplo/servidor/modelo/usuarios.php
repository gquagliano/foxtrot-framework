<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace aplicaciones\ejemplo\modelo;

defined('_inc') or exit;

/**
 * Entidad del modelo de datos.
 */
class usuarios extends \modelo {
    const nivelAdministrador=1;
    const nivelOperador=2;
    const nivelExterno=3;

    protected $tipoEntidad=usuario::class;

    public function buscarUsuario($nombre) {
        $usuario=$this
            ->reiniciar()
            ->donde([
                'usuario'=>$nombre
            ])
            ->obtenerUno();
        return $usuario;
    }

    public function listarUsuarios($filtro=null,$cantidad=50,$pagina=1) {
        $this->reiniciar()
            ->paginacion($cantidad,$pagina);

        if($filtro) $this->donde('nombre like @f or usuario like @f',['f'=>'%'.str_replace('*','%',$filtro).'%']);

        return $this->obtenerListado();
    }

    public function eliminarUsuario($id) {
        return $this->reiniciar()
            ->donde([
                'id'=>$id
            ])
            ->eliminar();
    }

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

    public static function validarContrasena($usuario,$contrasena) {
        return password_verify($contrasena,$usuario->contrasena);
    }

    public static function obtenerContrasena($contrasena) {
        return password_hash($contrasena,PASSWORD_DEFAULT);
    }

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