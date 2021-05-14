<?php
/**
 * Aplicación de demostración de Foxtrot.
 * @author 
 * @version 1.0
 */

namespace aplicaciones\ejemplo\api\publico;

use aplicaciones\ejemplo\modelo\personas\persona;

/**
 * API pública de demostración.
 */
class pruebas {
    public function demostracionORM() {
        $cuerpo=(object)[
            'titulo'=>'Demostración del ORM'
        ];

        //Fabricar modelo
        $usuarios=\foxtrot::fabricarModelo('usuarios');
        //También puede instanciarse en forma manual, aunque no es ideal:
        //$usuarios=new \aplicaciones\ejemplo\modelo\usuarios;
        
        //Selección de un listado
        $cuerpo->usuarios=$usuarios->obtenerListado(true);

        //Selección de un registro con validación de contraseña
        $cuerpo->usuarioAdmin=$usuarios
            ->reiniciar() //Reiniciar para realizar otra consulta sin crear una nueva instancia
            ->donde([
                'usuario'=>'admin',
                'contrasena'=>'admin', //El framework se encargará de validar la contraseña (encriptada)
                'activo'=>1
            ])
            ->obtenerUno();

        //Fabricar modelo sin contar con una clase de modelo concreto (solo la entidad)
        $localidades=\foxtrot::fabricarModeloPorEntidad('localidad');

        //Crear localidad
        $localidad=$localidades
            ->establecerValores([
                'nombre'=>'Rosario'
            ])
            ->crear()
            ->obtenerEntidad();        

        $cuerpo->localidadCreada=$localidad;

        //Fabricar una entidad (nótese que esta entidad se encuentra en un subdirectorio)
        $persona=\foxtrot::fabricarEntidad('personas/persona');
        //También puede instanciarse en forma manual, aunque no es ideal:
        //$persona=new \aplicaciones\ejemplo\modelo\personas\persona;

        $persona->nombre='Nombre';
        $persona->apellido='Apellido';
        $persona->codigo_seguridad='8888xxxyyyzzz';

        //Estableciendo el campo id_localidad, al guardar, simplemente se establecerá la relación
        $persona->id_localidad=$localidad->id;

        //Estableciendo el campo relacional en sí, al guardar, se creará el registro en la tabla foránea
        $persona->categoria=[
            'nombre'=>'Potenciales clientes'
        ];

        //Fabricar modelo desde una entidad
        $personas=persona::fabricarModelo();

        //Insertar una entidad (en lugar de definir un objeto estándar como en los casos anteriores)
        $personas
            ->establecerValores($persona)
            ->guardar(); //guardar() actualizará o creará el registro según esté o no definido el ID

        //Crear registros en la tabla foránea automáticamente (ej. crear contactos desde la persona)
        $persona->contactos=[
            [
                'email'=>'prueba@prueba.com',
                'celular'=>'3413333333'
            ],
            [
                'celular'=>'3416666666'
            ]
        ];

        $personas
            ->reiniciar()
            ->establecerValores($persona)
            ->actualizar(); //Al guardar, serán procesados los elementos de persona->contactos

        //Cargar/refrescar las relaciones en la instancia $persona
        $persona->procesarRelaciones(true);

        //Actualizar un contacto desde la persona
        $persona->contactos[1]->email='email@prueba.com';

        $personas
            ->reiniciar()
            ->establecerValores($persona)
            ->actualizar();

        //Remover un contacto

        unset($persona->contactos[1]);        

        $personas
            ->reiniciar()
            ->eliminarRelacionados() //Establecer que los elementos que se hayan removido de las propiedades 1:n sean eliminados de la base de datos
            ->establecerValores($persona)
            ->actualizar();

        //(No) actualizar la localidad desde la persona
        //Esta operación no debería tener efecto ya que el campo tiene la etiqueta @simple (a diferencia del campo categoría)

        $persona->localidad->nombre='Roldán';

        //Aprovechamos para probar la actualización de otros campos
        $persona->activa=true;
        $persona->tipo_documento=1;
        $persona->numero_documento='66666666';

        $personas
            ->reiniciar()
            ->establecerValores($persona)
            ->actualizar();

        //Refrescar las relaciones para mostrar
        $persona->procesarRelaciones(true);

        $cuerpo->personaCreada=$persona;

        //Eliminar una persona

        //Crear otra persona primero
        $id=$personas
            ->reiniciar()
            ->establecerValoresPublicos([
                'nombre'=>'Persona',
                'apellido'=>'Dos',
                'codigo_seguridad'=>'999aaabbbccc' //Nótese que al utilizar establecerValoresPublicos() este valor debería ser ignorado ya que
                                                    //el campo no tiene etiqueta @publico. Este método es el que debe utilizarse para recibir
                                                    //datos desde el cliente y almacenarlos en la base de datos en forma segura
            ])
            ->crear()
            ->id();
        
        $personas
            ->reiniciar()
            ->eliminar($id);

        $cuerpo->personaCreadaYEliminada=$id;

        //Utilizar un campo @busqueda

        $cuerpo->buscarCategoria=\foxtrot::fabricarModeloPorEntidad('personas/categoria')
            ->donde('cache_busqueda','potencia') //Buscará '%potencia%' automáticamente entre todos los campos agrupados mediante @busqueda
            ->obtenerUno();

        //Solicitar al framework que formatee (pretty-print) el JSON de salida para demostración
        \cliente::establecerFormatearSalida();        

        //El valor de retorno de la función será devuelto como JSON automáticamente
        return $cuerpo;
    }
}