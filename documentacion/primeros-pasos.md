## Índice

- [Introducción](../README.md)
- [Primeros pasos](primeros-pasos.md)
- [Estructura](estructura.md)
- [Descripción y documentación del API](api.md)
- [Editor](editor.md)
- [Componentes](componentes.md)
- [Desarrollo de componentes](componentes-estructura.md)
- [Scripts de compilación y asistentes](scripts.md)

## Primeros pasos

Configurar el framework es muy sencillo.

Una vez clonado el repositorio, o descargado y extraído, dentro del directiorio de archivos de tu servidor local (Apache o Nginx),

1- Debe construirse el código fuente del framework utilizando el script `construir-framework` (ver [Scripts de compilación y asistentes](scripts.md)). Ante cambios en el código fuente del framework, debe repetirse este proceso. Eventualmente, se realizarán lanzamientos de producción, es decir, con el núcleo del framework ya construído.

	cd ruta/scripts
	php construir-framework.php -d

Omitir el parámetro `-d` para obtener una salida compilada (requiere JRE correctamente configurado).

2- Debe crearse el archivo `desarrollo/config.php` utilizando `desarrollo/config-ejemplo.php` como plantilla (ver instrucciones en el código) y configurarse `desarrollo/.htaccess`.

Listo.

### Crear una aplicación en blanco

1- Podés utilizar el asistente para crear una nueva aplicación.

    php asistente.php -s=crear-apl -a=nombre -d=dominio

Ver [Scripts y asistentes](scripts.md) para más información sobre los parámetros.

### Configurar la aplicación de ejemplo

1- Para configurar la aplicación de ejemplo, primero se debe editar el archivo `desarrollo/aplicaciones/ejemplo/config.php` asignando los parámetros correctos de la base de datos, o removiéndolos si se desea tomarlos desde el archivo `config.php` global.

2- Instalar la base de datos de la aplicación de ejemplo:

	php sincronizar-bd.php -a=ejemplo

Listo. Ya puede ejecutarse la aplicación en el navegador web simplemente ingresando a `http://localhost/experimental-foxtrot-framework/desarrollo/` (reemplazando `http://localhost/experimental-foxtrot-framework/` por la URL del servidor de desarrollo).

### Crear o modificar una vista

Puede ingresarse al editor en `http://localhost/experimental-foxtrot-framework/desarrollo/editor/?apl=aplicacion&vista=nombre_vista` (reemplazando `http://localhost/experimental-foxtrot-framework/` por la URL del servidor de desarrollo y los parámetros correspondientes).

Al abrir una vista inexistente, el editor la creará automáticamente.

Ver [Editor](editor.md) para información sobre el acceso al editor de vistas.

### Compilación a producción

1- Para construir la aplicación, puede utilizarse el script `construir-apl` (ver [Scripts de compilación y asistentes](scripts.md)):

	php construir-apl.php -a=ejemplo

Listo. Puede publicarse el contenido del directorio `produccion` directamente en el servidor web.

### Compilación para Cordova

1- Para construir la aplicación para Cordova, puede utilizarse el script `construir-embebible` (ver [Scripts de compilación y asistentes](scripts.md)):

	php construir-embebible.php -a=ejemplo -i=cordova.html -d

*Nota:* El valor de `-i` debe ser el nombre de una vista creada para Cordova.

Omitir el parámetro `-d` para obtener una salida compilada (requiere JRE correctamente configurado).

2- Creada la aplicación mediante la [línea de comandos de Cordova](https://cordova.apache.org/docs/es/latest/guide/cli/), solo se requiere modificar el archivo `config.xml` para que `<content>` apunte a `index-cordova.html`.

*Ejemplo:*

    cd /ruta/
    cordova create aplicacion
    cordova platform add android

Listo. el contenido del directorio `embeber` debe copiarse tal cual al directorio `www` de la aplicación.

También es posible construir y ejecutar la aplicación en un dispositivo conectado al equipo directamente desde Foxtrot:

	php construir-embebible.php -a=ejemplo -i=cordova.html -d -c="ruta/a/www" -p=android

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0
