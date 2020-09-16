## Índice

- [Introducción](../README.md)
- [Primeros pasos](primeros-pasos.md)
- [Estructura](estructura.md)
- [Descripción y documentación del API](api.md)
- [Gestor y editor](editor.md)
- [Componentes](componentes.md)
- [Desarrollo de componentes](componentes-estructura.md)
- [Scripts de compilación](scripts.md)
- [Pendientes](pendientes.md)

## Primeros pasos

Configurar el framework es muy sencillo.

Una vez clonado el repositorio, o descargado y extraído, dentro del directiorio de archivos de tu servidor local (Apache o Nginx),

1- Debe construirse el código fuente del framework utilizando el script `construir-framework` (ver [Scripts de compilación y asistentes](scripts.md)). Ante cambios en el código fuente del framework, debe repetirse este proceso.

*Nota:* Esto solo es necesario ya que se está trabajando con el repositorio fuente de Foxtrot. Eventualmente, se realizarán lanzamientos de producción, es decir, con el núcleo del framework ya construído, y este paso será necesario solo para aquellos que deseen modificar el núcleo del framework.

	cd ruta/scripts
	php construir-framework -d

Omitir el parámetro `-d` para obtener una salida compilada (requiere JRE correctamente configurado).

2- Debe crearse el archivo `desarrollo/config.php` utilizando `desarrollo/config-ejemplo.php` como plantilla y editándolo, como mínimo, para establecer la URL y la ruta donde fue instalado  (ver instrucciones en el código).

**¿`localhost` ya está en uso?** En un entorno de desarrollo, usualmente no tendremos un dominio distinto para cada aplicación. Lo ideal es crear dominios locales modificando el [archivo hosts](https://es.wikipedia.org/wiki/Archivo_hosts).

3- Debe configurarse `desarrollo/.htaccess`. Normalmente solo será necesario cambiar la ruta en `RewriteBase`.

**Nota:** El gestor de aplicaciones requiere valores elevados de `max_execution_time` y `max_input_time` (`0` no es recomendable), y acceso a la función `exec()` a fin de poder ejecutar las compilaciones de JavaScript y Cordova.

### Acceder a la documentación

(En desarrollo)

#### PHP

https://gquagliano.github.io/experimental-foxtrot-framework/docs/phpdoc/

#### JS

https://gquagliano.github.io/experimental-foxtrot-framework/docs/jsdoc/

### Acceso al gestor de aplicaciones

Para ingresar al gestor de aplicaciones, acceder a `http://localhost/experimental-foxtrot-framework/desarrollo/editor/` (reemplazando `http://localhost/experimental-foxtrot-framework/` por la URL del servidor de desarrollo).

Desde allí se podrá:

- Crear una aplicación en blanco
- Crear y editar vistas
- Crear controladores de servidor
- Crear y sincronizar el modelo de datos
- Ejecutar los asistentes
- Construir la aplicación para embeber (Cordova) o producción

Ver [Gestor y editor](editor.md) para más información.

### Configurar la aplicación de ejemplo

1- Para configurar la aplicación de ejemplo, primero se debe editar el archivo `desarrollo/aplicaciones/ejemplo/config.php` asignando los parámetros correctos de la base de datos, o removiéndolos si se desea tomarlos desde el archivo `config.php` global.

2- Instalar la base de datos de la aplicación de ejemplo mediante el comando *Sincronizar modelo* del gestor de aplicaciones

### Vista de inicio

La vista de inicio será `inicio`.

### Probar la aplicación

Puede ejecutarse la aplicación en el navegador web simplemente ingresando a `http://localhost/experimental-foxtrot-framework/desarrollo/` (reemplazando `http://localhost/experimental-foxtrot-framework/` por la URL del servidor de desarrollo).

### Compilación para producción

Utilizar el comando correspondiente del gestor. Una vez construída la aplicación, puede publicarse el contenido del directorio `produccion` directamente en el servidor web.

### Compilación para Cordova

1- Crear la aplicación mediante la [línea de comandos de Cordova](https://cordova.apache.org/docs/es/latest/guide/cli/).

*Ejemplo:*

    cd /ruta/
    cordova create aplicacion
    cordova platform add android

2- Utilizar el comando correspondiente del gestor. Una vez construída la aplicación, el contenido del directorio `embeber` debe copiarse tal cual al directorio `www` de la aplicación.

### Probar una vista para Cordova

Para ejecutar una vista diseñada para Cordova en el navegador web, debe configurarse `/desarrollo/index-cordova.html` para que apunte a la misma y luego acceder a: `http://localhost/experimental-foxtrot-framework/desarrollo/index-cordova.html` (reemplazando `http://localhost/experimental-foxtrot-framework/` por la URL del servidor de desarrollo).

## Más información

contacto@foxtrot.ar