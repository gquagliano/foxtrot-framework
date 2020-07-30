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

`-d` Depuración: Omite la compilación con Closure a fin de simplificar la depuración.

Nota: Los archivos `/desarrollo/config.php` y `/desarrollo/.htaccess` no son reemplazados a fin de preservar la configuración.

#### crear-apl

Genera una nueva aplicación desde una plantilla.

    php crear-apl.php -n nombre_aplicacion

#### importar-bd

Genera el modelo de datos a partir de las tablas de una base de datos. Utiliza la base de datos y credenciales presentes en la configuración de la aplicación.

    php importar-bd.php -a nombre_aplicacion

#### construir-apl

Construye y compila todos los archivos cliente (JS, HTML y CSS) de la aplicación, generando el entorno de producción (`/produccion/`).

    php construir-apl.php -a nombre_aplicacion

#### construir-embebible

Construye y compila todos los archivos cliente (JS, HTML y CSS) de la aplicación, generando los archivos para embeber en Cordova o el cliente de escritorio (`/embeber/`).

    php construir-embebible.php -a nombre_aplicacion [-i nombre_vista_inicial]

Nota: Mientras en la implementación en servidor web la vista inicial siempre es `inicio.html`, para la versión embebible puede especificarse una vista inicial distinta mediante el segundo parámetro, a fin de poder alojar en una única aplicación ambas versiones.

### Requerimientos

- Java (JRE), disponible en PATH
- Google Closure https://github.com/google/closure-compiler/wiki/Binary-Downloads

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0
