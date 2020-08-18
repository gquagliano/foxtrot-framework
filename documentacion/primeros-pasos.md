## Índice

- [Introducción](../README.md)
- [Primeros pasos](primeros-pasos.md)
- [Estructura](estructura.md)
- [Descripción y documentación del API](api.md)
- [Editor](editor.md)
- [Componentes](componentes.md)
- [Desarrollo de componentes](componentes-estructura.md)
- [Scripts de compilación](scripts.md)

## Primeros pasos

Configurar el framework es muy sencillo.

Una vez clonado el repositorio, o descargado y extraído, dentro del directiorio de archivos de tu servidor local (Apache o Nginx),

1. Debe construirse el código fuente del framework utilizando el script `construir-framework` (ver [Scripts de compilación](scripts.md)). Ante cambios en el código fuente del framework, debe repetirse este proceso. Eventualmente, se realizarán lanzamientos de producción, es decir, con el núcleo del framework ya construído.

	cd ruta/scripts
	php construir-framework.php -d

Omitir el parámetro `-d` para obtener una salida compilada (requiere JRE correctamente configurado).

2. Debe crearse el archivo `desarrollo/config.php` (puede utilizarse `desarrollo/config-ejemplo.php` como plantilla--ver instrucciones en el código) y configurarse `desarrollo/.htaccess`.

3. Puede crearse una aplicación nueva en `desarrollo/aplicaciones` (ver [Estructura](estructura.md)), o bien instalarse la aplicación de ejemplo. Para ello, primero se debe editar el archivo `desarrollo/aplicaciones/ejemplo/config.php` asignando los parámetros correctos de la base de datos.

4. Instalar la base de datos de la aplicación de ejemplo:

	php sincronizar-bd.php -a=ejemplo

Listo. Ya puede ejecutarse la aplicación en el navegador web simplemente ingresando a `http://localhost/experimental-foxtrot-framework/desarrollo/` (reemplazando `http://localhost/experimental-foxtrot-framework/` por la URL del servidor de desarrollo).

Ver [Editor](editor.md) para información sobre el acceso al editor de vistas.

### Compilación a producción

1. Para construir la aplicación, puede utilizarse el script `construir-apl` (ver [Scripts de compilación](scripts.md)):

	php construir-apl.php -a=ejemplo

Listo. Puede publicarse el contenido del directorio `produccion` directamente en el servidor web.

### Compilación para Cordova

1. Para construir la aplicación para Cordova, puede utilizarse el script `construir-embebible` (ver [Scripts de compilación](scripts.md)):

	php construir-embebible.php -a=ejemplo -i=cordova.html -d

*Nota:* El valor de `-i` debe ser el nombre de una vista creada para Cordova.

Omitir el parámetro `-d` para obtener una salida compilada (requiere JRE correctamente configurado).

Listo. Puede copiarse el contenido del directorio `embeber` directamente al directorio `www` de la aplicación Cordova previamente creada mediante el [cliente de Cordova](https://cordova.apache.org/docs/es/latest/guide/cli/).

También es posible construir y ejecutar la aplicación en un dispositivo conectado al equipo directamente desde Foxtrot:

    php construir-embebible.php -a=ejemplo -i=cordova.html -d -c="ruta/a/www" -p=android

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0
