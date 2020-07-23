## Índice

- [Introducción](../README.md)
- [Primeros pasos](primeros-pasos.md)
- [Estructura](estructura.md)
- [API](api.md)
- [Editor](editor.md)
- [Componentes](componentes.md)
- [Desarrollo de componentes](componentes-estructura.md)
- [Scripts de compilación](scripts.md)

## Primeros pasos

1. Debe construirse el código fuente del framework utilizando el script `construir-framework` (ver [Scripts de compilación](scripts.md)). Ante cambios en el código fuente del framework, debe repetirse este proceso. Eventualmente, se realizarán lanzamientos de producción, es decir, con el núcleo del framework ya construído.

2. Debe crearse la aplicación en `desarrollo/aplicaciones` (ver [Estructura](estructura.md)). La aplicación `test` puede utilizarse como plantilla, simplemente copiando el contenido del directorio `/desarrollo/aplicaciones/test`.

3. Debe configurarse el sistema en el archivo `/desarrollo/config.php`.

4. Ver [Editor](editor.md) para información sobre el acceso al editor de vistas.

5. Puede ejecutarse la aplicación en el navegador web simplemente ingresando a `http://localhost/experimental-foxtrot-framework/desarrollo/` (reemplácese `http://localhost/experimental-foxtrot-framework/` por la URL del servidor de desarrollo).

6. Para construir la aplicación, puede utilizarse el script `construir-apl` (ver [Scripts de compilación](scripts.md)). Luego puede publicarse el contenido del directorio `produccion` directamente en el servidor web.

7. Para construir la aplicación para Cordova, puede utilizarse el script `construir-embebible` (ver [Scripts de compilación](scripts.md)). Luego puede copiarse el contenido del directorio `embeber` directamente al directorio `www` de la aplicación Cordova previamente creada mediante el [cliente de Cordova](https://cordova.apache.org/docs/es/latest/guide/cli/). Ampliaremos los pasos para crear aplicaciones Cordova próximamente.

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0
