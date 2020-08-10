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

Genera una nueva aplicación desde una plantilla.

    php crear-apl.php -n nombre_aplicacion

Este script eventualmente se integraría con el editor.

#### sincronizar-bd

Crea o actualiza las tablas a partir de la estructura del modelo de datos de la aplicación. Utiliza la base de datos y credenciales presentes en la configuración de la aplicación.

    php sincronizar-bd.php -a=nombre_aplicacion [-m=nombre_modelo]

Si no se especifica `-m`, se procesará el modelo de datos completo.

Acumulará un registro de consultas SQL en el archivo `scripts/sincronizacion.sql`.

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

`-c` Si se especifica la ruta al directorio `www` de la aplicación Cordova, intentará copiar los archivos, prepara y ejecutar la aplicación.

`-p` Junto con el parámetro `-c`, puede utilizarse `-p` para especificar la plataforma. Por defecto `android`.

Este script eventualmente se integraría con el editor. En el futuro, también se incluirá la función compilar Cordova directamente desde el editor.

*Nota:* No hace falta construir la aplicación antes de construir la versión embebible.

### Requerimientos

- Java (JRE), disponible en PATH
- Google Closure https://github.com/google/closure-compiler/wiki/Binary-Downloads

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0
