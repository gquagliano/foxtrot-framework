<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

include(__DIR__.'/prueba.php');

class pruebasModelo extends prueba {
    /**
     * @var \modelo $items
     * @var \modelo $tipos
     * @var \modelo $imagenes
     * @var \modelo $comentarios
     * @var \modelo $extra
     */
    protected static $items;
    protected static $tipos;
    protected static $imagenes;
    protected static $comentarios;
    protected static $extra;

    /**
     * 
     */
    public static function inicializar() {
        header('Content-Type: text/plain; charset=utf-8');
        
        //Configurar (no se cargó archivo config.php)
        configuracion::establecer([
            'nombreBd'=>'pruebas-foxtrot',
            'usuarioBd'=>'root',
            'contrasenaBd'=>'toor'
        ]);
        define('_espacioApl','');
        define('_apl','');

        foxtrot::incluirDirectorio(__DIR__.'/modelo/');

        self::$items=foxtrot::fabricarModelo('item');
        self::$tipos=foxtrot::fabricarModelo('tipo');
        self::$imagenes=foxtrot::fabricarModelo('imagen');
        self::$comentarios=foxtrot::fabricarModelo('comentario');
        self::$extra=foxtrot::fabricarModelo('extra');
        if(!self::$items||!self::$tipos||!self::$imagenes||!self::$comentarios||!self::$extra) return false;

        self::limpieza();

        return parent::inicializar();
    }

    /**
     * 
     */
    protected static function limpieza() {
        $bd=foxtrot::bd();
        $bd->consulta('truncate comentarios');
        $bd->consulta('truncate extras');
        $bd->consulta('truncate imagenes');
        $bd->consulta('truncate items');
        $bd->consulta('truncate tipos');
    }

    /**
     * 
     */
    public static function depuracion() {
        if(!self::$items) return 'No pudo instanciarse el modelo items.';
        if(!self::$tipos) return 'No pudo instanciarse el modelo tipos.';
        if(!self::$imagenes) return 'No pudo instanciarse el modelo imagenes.';
        if(!self::$comentarios) return 'No pudo instanciarse el modelo comentarios.';
        if(!self::$extra) return 'No pudo instanciarse el modelo extra.';

        $error=self::$items->obtenerUltimaConsulta()->error;
        if($error) return 'items: '.$error;

        $error=self::$tipos->obtenerUltimaConsulta()->error;
        if($error) return 'tipos: '.$error;

        $error=self::$imagenes->obtenerUltimaConsulta()->error;
        if($error) return 'imagenes: '.$error;

        $error=self::$comentarios->obtenerUltimaConsulta()->error;
        if($error) return 'comentarios: '.$error;

        $error=self::$extra->obtenerUltimaConsulta()->error;
        if($error) return 'extra: '.$error;

        return parent::depuracion();
    }

    /**
     * Prueba de inserción de filas con todos los tipos de datos básicos.
     * @return mixed
     */
    public static function tiposBasicos() {
        $valores=[
            'titulo'=>'Título',
            'texto'=>'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Phasellus hendrerit. Pellentesque aliquet nibh nec urna. In nisi neque, aliquet vel, dapibus id, mattis vel, nisi. Sed pretium, ligula sollicitudin laoreet viverra, tortor libero sodales leo, eget blandit nunc tortor eu nibh. Nullam mollis. Ut justo. Suspendisse potenti.',
            'precio'=>123.45,
            'activo'=>true,
            'duracion'=>999,
            'usuario'=>'prueba',
            'contrasena'=>'prueba123'
        ];

        $id=self::$items
            ->reiniciar()
            ->establecerValores($valores)
            ->crear()
            ->id();

        if(!$id) return 1;

        $item=self::$items
            ->reiniciar()
            ->obtenerItem($id);

        if($item===null) return 2;

        //El valor de contrasena debe haber sido encriptado, no lo compararemos
        unset($valores['contrasena']);

        if(!self::coincide($item,$valores)) return 3;

        return true;
    }

    /**
     * Prueba de asignación de campos públicos y privados.
     * @return mixed
     */
    public static function camposPublicos() {
        $id=self::$items
            ->reiniciar()
            ->establecerValoresPublicos([
                'titulo'=>'Prueba',
                'secreto'=>'Hola'
            ])
            ->crear()
            ->id();

        if(!$id) return 1;

        $item=self::$items
            ->reiniciar()
            ->obtenerItem($id);

        if(!self::coincide($item,[
                'titulo'=>'Prueba',
                //debe haberse ignorado el valor de secreto al utilizar establecerValoresPublicos
                'secreto'=>null
            ])) return 2;

        self::$items
            ->reiniciar()
            ->establecerValores([
                'secreto'=>'Hola actualizado'
            ])
            ->guardar($id);

        $item=self::$items
            ->reiniciar()
            ->obtenerItem($id);

        if(!self::coincide($item,[
                'titulo'=>'Prueba',
                //debe haberse actualizado el valor de secreto al utilizar establecerValores
                'secreto'=>'Hola actualizado'
            ])) return 3;

        self::$items
            ->reiniciar()
            ->eliminar($id);

        if(self::$items->cantidad()!=1) return 4;

        return true;
    }

    /**
     * Prueba de prepararValores y procesarValores.
     * @return mixed
     */
    public static function prepararProcesarValores() {
        $id=self::$items
            ->reiniciar()
            ->obtenerUno()
            ->id;

        self::$items
            ->reiniciar()
            ->establecerValores([
                'procesado'=>'uno'
            ])
            ->guardar($id);

        //Consultar mediante SQL para comprobar que se haya almacenado el valor procesado en lugar de la cadena 'uno'
        $item=foxtrot::bd()
            ->consulta('select * from items where id='.$id)
            ->siguiente();

        if(!$item||$item->procesado!=1) return 1;

        $item=self::$items
            ->reiniciar()
            ->obtenerItem($id);

        //Al consultar mediante el modelo, el valor 1 debe haberse vuelto a convertir en 'uno'
        if($item->procesado!='uno') return 2;

        return true;
    }

    /**
     * Prueba de asignación de relaciones.
     * @return mixed
     */
    public static function asignarRelaciones() {
        $id=self::$items
            ->reiniciar()
            ->obtenerUno()
            ->id;

        //El campo tipo tiene @simple, no creará la fila en el modelo foráneo
        $tipo=self::$tipos
            ->reiniciar()
            ->establecerValores([
                'titulo'=>'Tipo 1'
            ])
            ->crear()
            ->id();

        if(!$tipo) return 1;

        self::$items
            ->reiniciar()
            ->establecerValores([
                'id_tipo'=>$tipo,
                //subtipo, comentarios e imagenes no tienen @simple, deberían crearse
                //Prueba 1:0
                'subtipo'=>[
                    'titulo'=>'Subtipo 1'
                ],
                //Pruebas 1:n
                'comentarios'=>[
                    [ 'texto'=>'Comentario 1' ],
                    [ 'texto'=>'Comentario 2' ]
                ],
                'imagenes'=>[
                    [ 'archivo'=>'imagen-1.jpg' ]
                ],
                //Prueba con @campoForaneo
                'extras'=>[
                    'valor_extra'=>'Extra, extra'
                ]
            ])
            ->guardar($id);

        if(self::$items->cantidad()!=1) return 2;

        $item=self::$items
            ->reiniciar()
            ->obtenerItem($id);

        if(!$item->tipo||$item->tipo->titulo!='Tipo 1') return 3;

        if(!$item->subtipo||$item->subtipo->titulo!='Subtipo 1') return 4;
        
        if(!is_array($item->comentarios)||count($item->comentarios)!=2) return 5;
        
        if(!is_array($item->imagenes)||count($item->imagenes)!=1) return 6;
        
        if(!$item->extras||$item->extras->valor_extra!='Extra, extra') return 7;

        return true;
    }

    /**
     * Pruebas de actualización de modelos foráneos desde el modelo principal.
     * @return mixed
     */
    public static function actualizarRelaciones() {
        $item=self::$items
            ->reiniciar()
            ->obtenerUno();

        //Asignar un subtipo existente no debería crear un duplicado
        $item->subtipo=self::$tipos
            ->reiniciar()
            ->establecerValores([
                'titulo'=>'Subtipo 3'
            ])
            ->crear()
            ->obtenerEntidad();

        //Agregar un comentario al listado solo debería crear el nuevo, remover un comentario no debería eliminarlo ya que no tiene @eliminar
        unset($item->comentarios[0]);
        $item->comentarios[1]->texto='Comentario 1 actualizado';
        $item->comentarios[]=[ 'texto'=>'Comentario 3' ];

        //Reemplazar la imagen sí debería eliminarla
        $item->imagenes=[
            [ 'archivo'=>'imagen-2.jpg' ],
            [ 'archivo'=>'imagen-3.jpg' ]
        ];

        //Actualizar extra debería actualizar recursivamente por @campoForaneo
        $item->extras->valor_extra='Extra modificado';

        self::$items
            ->reiniciar()
            ->establecerValores($item)
            ->guardar();

        if(self::$items->cantidad()!=1) return 1;

        $item=self::$items
            ->reiniciar()
            ->obtenerItem($item->id);

        if($item->id_subtipo!=3||$item->subtipo->titulo!='Subtipo 3') return 2;
        if(count($item->comentarios)!=3||$item->comentarios[1]->texto!='Comentario 1 actualizado'||$item->comentarios[2]->texto!='Comentario 3') return 3; //La cantidad de comentarios debe seguir siendo 3
        if(count($item->imagenes)!=2||$item->imagenes[0]->archivo!='imagen-2.jpg'||$item->imagenes[1]->archivo!='imagen-3.jpg') return 4;

        //Verificar que la primer imagen haya sido eliminada
        $imagen=self::$imagenes
            ->donde('id',1)
            ->seleccionarEliminados()
            ->obtenerUno();
        if(!$imagen->e) return 5;
        
        return true;
    }

    /**
     * Pruebas de todos los distintos tipos de condiciones.
     * @return mixed
     */
    public static function condiciones() {
        //donde(entidad[,operador])

        $entidad=self::$items->fabricarEntidad(['id'=>1]);

        $item=self::$items
            ->reiniciar()
            ->donde($entidad)
            ->obtenerUno();

        if(!$item||$item->id!=1) return 1;

        //donde(objeto[,operador])

        $items=self::$imagenes
            ->reiniciar()
            ->donde([
                'id'=>2
            ],'>=')
            ->obtenerListado();

        if(count($items)!=2) return 2;

        //donde(campo,valor[,operador])

        $item=self::$items
            ->reiniciar()
            ->donde('id',1,'=')
            ->obtenerUno();

        if(!$item||$item->id!=1) return 3;

        //donde(campo,operador,valor)

        $item=self::$items
            ->reiniciar()
            ->donde('id','=',1)
            ->obtenerUno();

        if(!$item||$item->id!=1) return 4;

        //donde(sql,parametros,tipos)

        $item=self::$items
            ->reiniciar()
            ->establecerAlias('items')
            ->donde('items.id=@id',[
                'id'=>1
            ],'i')
            ->obtenerUno();

        if(!$item||$item->id!=1) return 5;

        //TODO Uniones (o, ox)
        //TODO Accesos directos (dondeEn, etc.), negados

        return true;
    }

    /**
     * Pruebas de agrupación y ordenamiento.
     * @return mixed
     */
    public static function agruparOrdenarTeniendo() {
        //TODO
        return true;
    }

    /**
     * Pruebas de relaciones manuales (condiciones SQL personalizadas).
     * @return mixed
     */
    public static function relaciones() {
        $item=self::$items
            ->reiniciar()
            ->omitirRelaciones() //Se omiten las relaciones automáticas, pero no las que configuremos manualmente
            ->establecerAlias('items')
            ->relacionar(modelo::relacion11,'extra','extras','extras.id_item=items.id','extras')
            ->obtenerUno();

        if(!$item||!$item->extras) return 1;

        return true;
    }

    /**
     * Pruebas de selección con contraseña.
     * @return mixed
     */
    public static function contrasena() {
        $item=self::$items
            ->reiniciar()
            ->donde([
                'usuario'=>'',
                'contrasena'=>''
            ])
            ->obtenerUno();

        if($item) return 1;

        $item=self::$items
            ->reiniciar()
            ->donde([
                'usuario'=>'\' or 1 or \''
            ])
            ->obtenerUno();

        if($item) return 2;

        $item=self::$items
            ->reiniciar()
            ->donde([
                'usuario'=>'prueba',
                'contrasena'=>''
            ])
            ->obtenerUno();

        if($item) return 3;

        $item=self::$items
            ->reiniciar()
            ->donde([
                'usuario'=>'prueba',
                'contrasena'=>'xx'
            ])
            ->obtenerUno();

        if($item) return 4;

        $item=self::$items
            ->reiniciar()
            ->donde([
                'usuario'=>'prueba',
                'contrasena'=>'prueba123'
            ])
            ->obtenerUno();

        if(!$item) return 5;

        return true;
    }

    /**
     * Pruebas de baja de items con relaciones.
     * @return mixed
     */
    public static function eliminar() {
        self::$items
            ->reiniciar()
            ->eliminar(1);

        //Lo único que debe haberse eliminado son las imágenes
        $imagenes=self::$imagenes
            ->reiniciar()
            ->obtenerListado();
        if(count($imagenes)) return 1;

        return true;
    }
}

//// Realizar las pruebas

prueba::ejecutar(pruebasModelo::class,[
    'tiposBasicos',
    'camposPublicos',
    'prepararProcesarValores',
    'asignarRelaciones',
    'actualizarRelaciones',
    'condiciones',
    'agruparOrdenarTeniendo',
    'relaciones',
    'contrasena',
    'eliminar'
]);

//Pruebas implícitas:
// Crear
// Insertar contraseñas
// Guardar por id
// Guardar por valores->id
// Obtener un item
// Obtener un item por id
// Obtener id del item insertado
// Obtener entidad insertada
// Obtener cantidad de filas afectadas

//TODO
// Condiciones avanzadas y métodos de acceso directo de \modelo (ver TODOs previos)
// Completar relaciones manuales
// Agrupar (GROUP BY), teniendo (HAVING) (ver TODOs previos)
// Ordenamiento, paginación
// Búsquedas
// Recursión

