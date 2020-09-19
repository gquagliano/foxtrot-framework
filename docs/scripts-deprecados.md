#### construir-framework

Construye y compila todos los archivos JS y CSS del framework y del editor, generando el entorno de desarrollo (`/desarrollo/`) desde los archivos fuente (`/fuente/`). Este script es necesario para quienes trabajen con el código fuente del framework y debe ejecutarse al descargar el código fuente o tras realizarse modificaciones al mismo. 

    php construir-framework [-d]

`-d` Depuración: Omite la compilación con Closure a fin de facilitar la depuración.

*Nota:* Los archivos `/desarrollo/config.php` y `/desarrollo/.htaccess` no son reemplazados a fin de preservar la configuración.