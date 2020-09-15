#### sincronizar-bd

Crea o actualiza las tablas a partir de la estructura del modelo de datos de la aplicación. Utiliza la base de datos y credenciales presentes en la configuración de la aplicación, excepto cuando se especifiquen los parámetros `-u`, `-c` y/o `-b`.

    php sincronizar-bd -a=nombre_aplicacion [-m=nombre_modelo] [-u=usuario] [-c=contrasena] [-b=nombre_base_de_datos]

Si no se especifica `-m`, se procesará el modelo de datos completo.

Cuando *no* se use `-m`, el método `instalar()` de cada modelo, si existe, será invocado luego de que hayan sido creadas todas las tablas en la base de datos.

Acumula un registro de consultas SQL en el archivo `scripts/sincronizar.sql` en caso de que sea necesario replicar los cambios en otro servidor.

#### construir-apl

Construye y compila todos los archivos cliente (JS, HTML y CSS) de la aplicación, generando el entorno de producción (`/produccion/`).

    php construir-apl -a=nombre_aplicacion [-d] [-l] [-j]

`-d` Depuración: Omite la compilación con Closure a fin de facilitar la depuración.

`-l` Omitir la limpieza de los directorios `/produccion/` y `/embeber/` antes de comenzar.

`-j` Omitir la compilación de las vistas embebibles. Normalmente (si no se incluye este parámetro), el código HTML y CSS de las vistas embebibles será incorporado dentro del código JS.

*Nota:* Debe haberse construido el framework antes de construir la aplicación.

*Nota:* Los archivos `/produccion/config.php` y `/produccion/.htaccess` no son reemplazados a fin de preservar la configuración. Es muy probable que se requieran modificaciones en estos archivos para completar la implementación.

#### construir-embebible

Construye y compila todos los archivos cliente (JS, HTML y CSS) de la aplicación, generando los archivos para embeber en Cordova o el cliente de escritorio (`/embeber/`).

    php construir-embebible -a=nombre_aplicacion [-i=nombre_vista_inicial] [-j] [-d] [-c="ruta a www" [-p=android] [-f]] [-l]

`-d` Depuración: Omite la compilación con Closure a fin de facilitar la depuración.

`-i` Mientras en la implementación en servidor web la vista inicial siempre es `inicio.html`, para la versión embebible puede especificarse una vista inicial distinta mediante este parámetro, a fin de poder alojar en una única aplicación ambas versiones. Especificar ruta, sin extensión.

`-c` Si se especifica la ruta al directorio `www` de la aplicación Cordova, intentará copiar los archivos, preparar y ejecutar la aplicación.

`-p` Junto con el parámetro `-c`, puede utilizarse `-p` para especificar la plataforma. Por defecto `android`.

`-l` Omitir la limpieza de los directorios `/produccion/` y `/embeber/` antes de comenzar.

`-f` Omitir la validación y modificación al archivo `config.xml`.

`-j` Omitir la compilación de las vistas embebibles. Normalmente (si no se incluye este parámetro), el código HTML y CSS de las vistas embebibles será incorporado dentro del código JS.

*Nota:* No hace falta construir la aplicación antes de construir la versión embebible. Sí debe haberse construido el framework.

#### asistente

Asistentes de creación de vistas y controladores.

##### Plantilla de aplicación en blanco

    php asistente crear-apl -a=nombre -d="dominio"

El asistente creará una aplicación en blanco y configurará Foxtrot para que la misma se ejecute en el dominio especificado. Los archivos serán creados en `/desarrollo/aplicaciones/nombre/`.

Es posible que sea necesario editar el archivo `config.php` de la aplicación para establecer una base de datos diferente u otros ajustes; el asistente creará un archivo de configuración en blanco.

Ver [Primeros pasos](primeros-pasos.md) para más información.

##### Plantilla de modelo de datos

    php asistente crear-modelo -a=nombre_aplicacion -m=nombre_modelo -e=nombre_entidad [-t=nombre_tabla]

`-t` Si se especifica, establecerá un nombre de tabla distinto al nombre del modelo (opcional).

El asistente creará las clases del repositorio y de la entidad, vacías, para completar.

*Nota:* Luego de agregar las propiedades a la clase de la entidad, se puede crear la tabla correspondiente en la base de datos mediante el script `sincronizar-bd` (ver más arriba).

[Más información sobre la estrcutrura de las clases del ORM](api/orm.md).

##### Asistente de creación de ABMC

    php asistente abmc -a=nombre_aplicacion -m=nombre_modelo [-t=Título] [-r=ruta] [-o] [-f|c] [-p=plural] [-n=singular] [-u [-v=vista_anterior] [-g=vista_siguiente_nivel] [-k=campo]]

El asistente creará vistas, controladores JS y un controlador PHP, y agregará métodos a la clase del modelo que permitan consultar, dar de alta, modificar y eliminar registros para el modelo especificado. No se sobreescribirán archivos si ya existen.

`-r` Ruta bajo la cual se crearán las vistas. Por ejemplo, `-r=abm` generará `/abm/usuarios` y `/abm/usuario`.

`-o` Incluir este parámetro para omitir la modificación de la clase del modelo de datos.

`-f` Si se incluye este parámetro, *solo* se generará el formulario de alta, con la funcionalidad de guardar y modificar registros existentes. *Nota:* Si el controlador de servidor ya existe, no se agregarán los métodos de acceso a datos.

`-c` Si se incluye este parámetro, *solo* se generará la vista de consulta, con la funcionalidad de buscar y eliminar. *Nota:* Si el controlador de servidor ya existe, no se agregarán los métodos de acceso a datos.

`-t` Título (por defecto, el nombre del modelo).

`-p` Nombre plural (por defecto, el nombre del modelo).

`-n` Nombre singular (por defecto, el nombre de la entidad).

`-u` Generará vistas con soporte *multinivel*, como, por ejemplo, Rubros 🡒 Subrubros.

`-g` Nombre de la vista para las opciones para ingresar al siguiente nivel (por ejemplo `subrubros`).

`-v` Nombre de la vista para las opciones para volver al nivel anterior (por ejemplo `rubros`).

`-k` Nombre del campo que relaciona la entidad con su ascendente (por ejemplo `idrubro`).

Las siguientes etiquetas adicionales compatibles con este asistente pueden utilizarse en las entidades (ver [ORM](api/orm.md)):

`@etiqueta` Etiqueta del campo. Por defecto, se utilizará el nombre de la propiedad.

`@requerido` Campo requerido (etiqueta sin valor).

`@tamano` Ancho del campo en unidades de la grilla de columnas (1 a 10). Por defecto, será `10`.

Por defecto, todos los campos serán de ingreso de texto (en el futuro, variará según el tipo de columna y se añadirá la etiqueta `@tipo` para mayor precisión).

*Nota:* Siempre será necesario realizar algunos ajustes manuales al código generado, es solo una plantilla.