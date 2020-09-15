## Índice

- [Introducción](../README.md)
- [Primeros pasos](primeros-pasos.md)
- [Estructura](estructura.md)
- [Descripción y documentación del API](api.md)
- [Gestor y editor](editor.md)
- [Componentes](componentes.md)
- [Desarrollo de componentes](componentes-estructura.md)
- [Scripts de compilación y asistentes](scripts.md)
- [Pendientes](pendientes.md)

## Scripts de compilación y asistentes

#### construir-framework

Construye y compila todos los archivos JS y CSS del framework y del editor, generando el entorno de desarrollo (`/desarrollo/`) desde los archivos fuente (`/fuente/`). Este script es necesario para quienes trabajen con el código fuente del framework y debe ejecutarse al descargar el código fuente o tras realizarse modificaciones al mismo. 

    php construir-framework [-d]

`-d` Depuración: Omite la compilación con Closure a fin de facilitar la depuración.

*Nota:* Los archivos `/desarrollo/config.php` y `/desarrollo/.htaccess` no son reemplazados a fin de preservar la configuración.

#### Scripts deprecados

[Documentación de los scripts deprecados](scripts-deprecados.md) mientras se completa su integración en el gestor de aplicaciones.

### Requerimientos

- Java (JRE), disponible en PATH
- Google Closure https://github.com/google/closure-compiler/wiki/Binary-Downloads

## Más información

contacto@foxtrot.ar