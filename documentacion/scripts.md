## Índice

- [Introducción](../README.md)
- [Primeros pasos](primeros-pasos.md)
- [Estructura](estructura.md)
- [API](api.md)
- [Editor](editor.md)
- [Scripts de compilación](scripts.md)

## Scripts de compilación

#### construir-framework

Construye y compila todos los archivos js y css del framework y del editor, generando el entorno de desarrollo (`/desarrollo/`) desde los archivos fuente (`/fuente/`). Debe ejecutarse tras realizarse modificaciones al framework.

    php construir-framework.php

Nota: Los archivos `/desarrollo/config.php` y `/desarrollo/.htaccess` no son reemplazados a fin de preservar la configuración.

#### construir-apl

Construye y compila todos los archivos cliente (js, html y css) de la aplicación, generando el entorno de producción (`/produccion/`).

    php construir-apl.php nombre_aplicacion

#### construir-embebible

Construye y compila todos los archivos cliente (js, html y css) de la aplicación, generando los archivos para embeber en Cordova o el cliente de escritorio (`/embeber/`).

    php construir-embebible.php nombre_aplicacion [nombre_vista_inicial]

Nota: Mientras en la implementación en servidor web la vista inicial siempre es `inicio.html`, para la versión embebible puede especificarse una vista inicial distinta mediante el segundo parámetro, a fin de poder alojar en una única aplicación ambas versiones.

### Requerimientos

- Java (JRE), disponible en PATH
- Google Closure https://github.com/google/closure-compiler/wiki/Binary-Downloads

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0
