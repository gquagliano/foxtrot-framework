#### construir-framework

Construye y compila todos los archivos JS y CSS del framework y del editor, generando el entorno de desarrollo (`/desarrollo/`) desde los archivos fuente (`/fuente/`). Este script es necesario para quienes trabajen con el código fuente del framework y debe ejecutarse al descargar el código fuente o tras realizarse modificaciones al mismo. 

    php construir-framework [-d]

`-d` Depuración: Omite la compilación con Closure a fin de facilitar la depuración.

*Nota:* Los archivos `/desarrollo/config.php` y `/desarrollo/.htaccess` no son reemplazados a fin de preservar la configuración.

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