## Índice

- [Introducción](../README.md)
- [Primeros pasos](primeros-pasos.md)
- [Estructura](estructura.md)
- [Descripción y documentación del API](api.md)
- [Editor](editor.md)
- [Componentes](componentes.md)
- [Desarrollo de componentes](componentes-estructura.md)
- [Scripts de compilación y asistentes](scripts.md)
- [Pendientes](pendientes.md)

## Estructura general del proyecto

`/fuente/` Código fuente del framework. Debería existir solo en instalaciones de desarrollo del núcleo del framework.

`/desarrollo/` Framework compilado + Código fuente de las aplicaciones. Debería existir en instalaciones de desarrollo de aplicaciones.

`/produccion/` Framework y aplicaciones compilados. Su contenido es el que se debe implementar en el servidor de producción.

`/embeber/` Framework y una aplicación específica compilados para embeber en Cordova o el cliente de escritorio.

`/scripts/` Scripts de compilación.

## Estructura de una aplicación

Las aplicaciones se definen dentro de subdirectorios de `/[desarrollo|produccion]/aplicaciones/`.

Cada aplicación cuenta con los siguientes archivos:

- `config.php` Primer archivo que se carga, donde puede establecerse la configuración específica, como, por ejemplo, las credenciales de la base de datos (Opcional).
- `aplicacion.json` Definición de la estructura y configuración pública de la aplicación.
- `servidor/` Directorio donde se almacenan las clases de servidor.
- `servidor/aplicacion.php` Clase principal de la aplicación (Opcional).
- `servidor/aplicacion.pub.php` Métodos públicos (http) de la clase principal de la aplicación (Opcional).
- `servidor/controladores/*.php` Controladores.
- `servidor/controladores/*.pub.php` Métodos públicos (http) de los distintos controladores.
- `servidor/modelo/*.php` Entidades del modelo de datos.
- `cliente/` Archivos del lado del cliente de la aplicación.
- `cliente/aplicacion.js` Controlador principal de la aplicación.
- `cliente/controladores/` Controladores JS de la aplicación.
- `cliente/vistas/` Archivos HTML, JSON y CSS de las vistas de la aplicación.
- `cliente/vistas/inicio.html` Vista principal de la aplicación (al menos con el enrutador predeterminado).
- `recursos/` Otros recursos (imágenes, estilos) de la aplicación.
- `recursos/estilos.css` Archivo principal de estilos de usuario, se incluye en forma automática (en el futuro, se podrán configurar otros).

**Nombres y espacios de nombre:**

- Todos los archivos de la aplicación usarán el espacio `\aplicaciones\apl` donde `apl` es el nombre de la aplicación.
- Todos los archivos públicos (http) de la aplicación usarán el espacio `\aplicaciones\apl\publico` donde `apl` es el nombre de la aplicación.
- Las clases princales de la aplicación (ambas, la privada como la pública) deben llamarse `aplicacion` y extender `\aplicacion`.
- Las clases de los controladores (ambas versiones de cada uno, la privada y la pública) deben llamarse igual que el archivo que las contienen y extender `\controlador`.
- Los controladores tendrán igual nombre de arhivo que el controlador que definen: `.js` para cliente, `.php` para servidor y `.pub.php` para métodos públicos de servidor.
- Cuando los nombres contengan guiones, el nombre real de la clase será el valor sin guiones con la primer letra de cada palabra en mayúsculas, por ejemplo, el controlador de la vista `consulta-productos` será `consultaProductos`.

**Además:**

- Dentro de `/desarrollo/servidor/` puede crearse un enrutador de solicitudes personalizado.
- El archivo `config.php` en el raíz de foxtrot contiene la configuración común a todas las aplicaciones.
- A nivel global, puede crearse un enrutador de aplicación personalizado que determine la aplicación a ejecutar de otra forma distinta a la predeterminada, que es según el dominio.

Nota: Todas las rutas y URLs deben finalizar con `/`.

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0
