## Índice

- [Introducción](../README.md)
- [Estructura](estructura.md)
- [API](api.md)
- [Editor](editor.md)
- [Scripts de compilación](scripts.md)

## Scripts de compilación

#### construir-framework

Construye y compila todos los archivos js y css del framework y del editor, generando el entorno de desarrollo (`/desarrollo/`) desde los archivos fuente (`/fuente/`). Debe ejecutarse tras realizarse modificaciones al framework.

    php construir-framework.php

#### construir-apl

Construye y compila todos los archivos cliente (js, html y css) de la aplicación, generando el entorno de producción (`/produccion/`).

    php construir-apl.php nombre_aplicacion

#### construir-embebible

Construye y compila todos los archivos cliente (js, html y css) de la aplicación, generando los archivos para embeber en Cordova o el cliente de escritorio (`/embeber/`).

    php construir-embebible.php nombre_aplicacion

## Requerimientos

- Java (JRE), disponible en PATH
- Google Closure https://github.com/google/closure-compiler/wiki/Binary-Downloads