## Índice

- [Introducción](../README.md)
- [Primeros pasos](primeros-pasos.md)
- [Estructura](estructura.md)
- [Descripción y documentación del API](api.md)
- [Editor](editor.md)
- [Componentes](componentes.md)
- [Desarrollo de componentes](componentes-estructura.md)
- [Scripts de compilación](scripts.md)

## Scripts de compilación

#### construir-framework

Construye y compila todos los archivos JS y CSS del framework y del editor, generando el entorno de desarrollo (`/desarrollo/`) desde los archivos fuente (`/fuente/`). Debe ejecutarse tras realizarse modificaciones al framework.

    php construir-framework.php [-d]

`-d` Depuración: Omite la compilación con Closure a fin de facilitar la depuración.

*Nota:* Los archivos `/desarrollo/config.php` y `/desarrollo/.htaccess` no son reemplazados a fin de preservar la configuración.

#### crear-apl

(Este script aún no está disponible) Genera una nueva aplicación desde una plantilla.

    php crear-apl.php -n=nombre_aplicacion

Este script eventualmente se integraría con el editor.

#### sincronizar-bd

Crea o actualiza las tablas a partir de la estructura del modelo de datos de la aplicación. Utiliza la base de datos y credenciales presentes en la configuración de la aplicación, excepto cuando se especifiquen los parámetros `-u`, `-c` y/o `-b`.

    php sincronizar-bd.php -a=nombre_aplicacion [-m=nombre_modelo] [-u=usuario] [-c=contrasena] [-b=nombre_base_de_datos]

Si no se especifica `-m`, se procesará el modelo de datos completo.

Cuando *no* se use `-m`, el método `instalar()` de cada modelo, si existe, será invocado luego de que hayan sido creadas todas las tablas en la base de datos.

Acumula un registro de consultas SQL en el archivo `scripts/sincronizar.sql` en caso de que sea necesario replicar los cambios en otro servidor.

Este script eventualmente se integraría con el editor.

#### construir-apl

Construye y compila todos los archivos cliente (JS, HTML y CSS) de la aplicación, generando el entorno de producción (`/produccion/`).

    php construir-apl.php -a=nombre_aplicacion [-d]

`-d` Depuración: Omite la compilación con Closure a fin de facilitar la depuración.

Este script eventualmente se integraría con el editor.

*Nota:* Debe haberse construido el framework antes de construir la aplicación.

*Nota:* Los archivos `/produccion/config.php` y `/produccion/.htaccess` no son reemplazados a fin de preservar la configuración. Es muy probable que se requieran modificaciones en estos archivos para completar la implementación.

#### construir-embebible

Construye y compila todos los archivos cliente (JS, HTML y CSS) de la aplicación, generando los archivos para embeber en Cordova o el cliente de escritorio (`/embeber/`).

    php construir-embebible.php -a=nombre_aplicacion [-i=nombre_vista_inicial] [-d] [-c="ruta a www" [-p=android]]

`-d` Depuración: Omite la compilación con Closure a fin de facilitar la depuración.

`-i` Mientras en la implementación en servidor web la vista inicial siempre es `inicio.html`, para la versión embebible puede especificarse una vista inicial distinta mediante este parámetro, a fin de poder alojar en una única aplicación ambas versiones.

`-c` Si se especifica la ruta al directorio `www` de la aplicación Cordova, intentará copiar los archivos, preparar y ejecutar la aplicación.

`-p` Junto con el parámetro `-c`, puede utilizarse `-p` para especificar la plataforma. Por defecto `android`.

Este script eventualmente se integraría con el editor. En el futuro, también se incluirá la función compilar Cordova directamente desde el editor.

*Nota:* No hace falta construir la aplicación antes de construir la versión embebible.

#### asistente

*Este script es un prototipo de funcionalidad que formará parte del editor/gestor de aplicaciones*.

Asistente de creación de vistas y controladores.

##### Asistente de creación de ABMC

    php asistente.php -a=nombre_aplicacion -s=abmc -m=nombre_modelo [-r=ruta] [-o] [-a|c]

El asistente creará vistas, controladores JS, un controlador PHP y una nueva clase para el modelo de datos que permita consultar, dar de alta, modificar y eliminar registros para el modelo especificado. No se sobreescribirán archivos si ya existen.

`-r` Ruta bajo la cual se crearán las vistas. Por ejemplo, `-r=abm` generará `/abm/usuarios` y `/abm/usuario`.

`-o` Incluir este parámetro para omitir la modificación de la clase del modelo de datos.

`-a` Si se incluye este parámetro, solo se generará el formulario de alta, con la funcionalidad de guardar y modificar registros existentes.

`-c` Si se incluye este parámetro, solo se generará la vista de consulta, con la funcionalidad de buscar y eliminar.

Las siguientes etiquetas adicionales pueden utilizarse en las entidades (ver [ORM](api/orm.md)):

`@etiqueta` Etiqueta del campo. Por defecto, se utilizará el nombre de la propiedad.

`@requerido` Campo requerido (etiqueta sin valor.)

`@tamano` Ancho del campo en unidades de la grilla de columnas (1 a 10.) Por defecto, será `10`.

### Requerimientos

- Java (JRE), disponible en PATH
- Google Closure https://github.com/google/closure-compiler/wiki/Binary-Downloads

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0
