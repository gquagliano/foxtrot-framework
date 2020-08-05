# Documentación

[Índice](indice.md)

## ORM

El modelo de datos de una aplicación está compuesto por dos tipos de clases: Modelos (heredan `\modelo`) y entidades (heredan `\entidad`). Todas las clases deben residir en el directorio `servidor/modelo` de la aplicación bajo el espacio de nombres `aplicaciones\aplicacion\modelo` (donde `aplicacion` es el nombre de la misma.)

Las clases de modelos, o repositorios, se corresponden con las tablas y heredan métodos para filtrar, crear, actualizar y eliminar registros, a la vez que pueden definir métodos específicos.

    namespace aplicaciones\ejemplo\modelo;
    class usuarios extends \modelo {
        protected $tipoEntidad=usuario::class;
    }

La propiedad `tipoEntidad` relaciona el modelo con el tipo de entidades que representa.

Las clases de entidades se corresponden con las filas y definen las propiedades y relaciones con otros modelos de datos. Estos parámetros se establecen mediante comentarios. Todas las tablas deben tener las columnas `id` como clave principal y autoicremental, y `e` (tipo `tinyint(1)`) a utilizarse como baja lógica (*`e`liminado*.)

    namespace aplicaciones\ejemplo\modelo;
    class usuario extends \entidad {
        protected $tipoModelo=usuarios::class;

        //id y e (campo de baja lógica) son automáticos, no requieren propiedad ni comentario

        /**
         * @tipo cadena(50)
         * @indice
         */
        public $usuario;

        /** @tipo cadena(255) */
        public $contrasena;

        /**
         * @tipo relacional
         * @modelo direcciones
         * @relacion 1:n
         * @columna idusuario
         */
        public $direcciones;

        /**
         * @tipo relacional
         * @modelo imagenes
         * @relacion 1:0
         * @columna idfoto
         */
        public $foto;

        /**
         * @tipo entero
         */
        public $idfoto;
    }

La propiedad `tipoModelo` guarda la relación con el modelo al que pertenece la entidad. La clase puede tener otras propiedades que no se correspondan con campos, simplemente evitando el uso de las etiquetas reservadas en su documentación.

Etiquetas:

`@tipo` Define el tipo de dato: `texto`, `cadena(longitud)`, `entero(longitud)`, `decimal(entero.decimales)` o `relacional` (en el futuro, se agregarán otros tipos, como *fulltext* o campos geoespaciales.)

`@indice` Define un índice. Puede omitirse el valor para definir un índice normal, o agregar el valor `unico` para definir un índice único.

`@modelo` Nombre del modelo relacionado.

`@relacion` Tipo de relación: `1:1` (uno a uno), `1:0` (uno a uno, o nulo), `1:n` (uno a muchos). Es importante considerar durante el diseño de una entidad que las relaciones uno a muchos se procesan iterando sobre todo el resultado y relacionando fila por fila, luego de realizar la consulta principal, por lo que debe utilizarse con precaución en grandes conjuntos de resultados.

`@columna` Columna de la tabla. Las propiedades que reciben el elemento foráneo no deben necesariamente coincidir con los nombres de las columnas. Sin embargo, *se requiere* que exista una propiedad para las columnas especificadas. Por defecto, se realizará la relación por la columna especificada contra la clave primaria (`id`). Nótese que cuando la relación es `1:n`, `@columna` hace referencia a la columna de la tabla foránea. Cabe mencionar que la clase del modelo permite establecer relaciones más complejas en forma manual.

El modo de uso es tan simple como instanciar el modelo e invocar algunos de sus métodos.

    $usuarios=new usuarios;
    $usuario=$usuarios
        ->donde([
            'usuario'=>$nombre
        ])
        ->obtenerUno();

Durante las operaciones de inserción y actualización, serán procesados los campos relacionales en forma recursiva, creando o actualizando las mismas según corresponda. Este comportamiento se puede deshabilitar incovando `omitirRelaciones()`, en cuyo caso solo se tomará el ID de la entidad asignada al campo. Los campos nulos serán excluidos de las operaciones (en otras palabras, se debe dejar una propiedad sin asignar o asignar `null` para evitar que se modifique).

    $usuario=new usuario;
    $usuario->usuario=$nombreDeUsuario,
    $usuario->foto=new foto;
    $usuario->foto->archivo='foto.jpg';
    (new usuarios)
        ->establecerValores($usuario)
        ->guardar(); //Creará la foto y luego el usuario

Es posible filtrar consultas por coincidencia exacta con objetos o cadenas SQL; estas últimas aceptan parámetros con nombre precedidos por `@`.

Consultar la documentación de la clase para más información.

En el futuro, se incluirán scripts para generar y actualizar la estructura de la base de datos a partir del modelo.