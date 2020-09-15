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

![](img/editor.jpg)

## Gestor

El gestor de aplicaciones permite:

- Crear una aplicación en blanco
- Crear y editar vistas
- Crear controladores de servidor
- Crear y sincronizar el modelo de datos
- Ejecutar los asistentes
- Construir la aplicación para embeber (Cordova) o producción

Para acceder al mismo se debe ingresar a la URL:

`http://localhost/experimental-foxtrot-framework/desarrollo/editor/` (reemplazando `http://localhost/experimental-foxtrot-framework/desarrollo/` por la URL del servidor de desarrollo).

*Nota:* Debe haberse construido el framework antes de poder acceder al gestor.

### ¡Muy importante!

Actualmente, el gestor está en desarrollo y está pensado para uso personal en un servidor local, por lo que no presenta ningún tipo de seguridad. **Implementar el directorio `/editor/` en un servidor público o compartido deja abierta la posibilidad de cargar código arbitrario**.

En el futuro, el gestor de aplicaciones puede llegar a contar con autenticación de usuarios y mecanismos de seguridad para trabajo en equipo en servidores de desarrollo en línea o en intranet.

## Comandos del gestor

#### ![](img/gestor/aplicacion.jpg) Nueva aplicación

Crea una aplicación en blanco con sus archivos y elementos básicos, y configurará Foxtrot para que la misma se ejecute en el dominio especificado. Los archivos serán creados en `/desarrollo/aplicaciones/nombre/`.

Es posible que sea necesario editar el archivo `config.php` de la aplicación para establecer una base de datos diferente u otros ajustes; el asistente creará un archivo de configuración en blanco.

Ver [Primeros pasos](primeros-pasos.md) para más información.

#### ![](img/gestor/vista.jpg) Nueva vista

Abre el editor con los parámetros correspondientes para crear una nueva vista.

Al crear una vista, será necesario especificar las siguientes configuraciones:

Modo:
- *Embebible*: Almacenará solo el cuerpo de la vista, sin los tags `<html>`, `<head>`, `<body>`, scripts ni estilos, a fin de que sea una vista para insertar dentro de otra en tiempo de ejecución.
- *Independiente*: Almacenará la vista en un archivo HTML que podrá abrirse en forma independiente (Predeterminado).

Cliente:
- *Web*: Almacenará la vista para funcionar en un servidor web (Predeterminado).
- *Cordova*: Al guardar, generará un archivo HTML compatible con Cordova.
- *Escritorio*: Al guardar, generará un archivo HTML compatible con el cliente de escritorio de Foxtrot.

#### ![](img/gestor/editar.jpg) Editar una vista

Se puede acceder al editor mediante el comando ubicado a la derecha de cada vista

#### ![](img/gestor/controlador.jpg) Nuevo controlador de servidor

Crea un nuevo controlador de servidor (PHP).

#### ![](img/gestor/modelo.jpg) Nuevo modelo de datos

Crea las clases para un nuevo modelo de datos con su entidad.

*Nota:* Luego de agregar las propiedades a la clase de la entidad, se puede crear la tabla correspondiente en la base de datos mediante el comando Sincronizar.

[Más información sobre la estrcutrura de las clases del ORM](api/orm.md).

#### ![](img/gestor/sincronizar.jpg) Sincronizar base de datos

Crea o actualiza las tablas a partir de la estructura del modelo de datos de la aplicación. Utiliza la base de datos y credenciales presentes en la configuración de la aplicación.

#### ![](img/gestor/asistentes.jpg) Asistentes

Asistentes de creación de vistas y controladores.

##### Asistente de creación de ABMC

El asistente creará vistas, controladores JS y un controlador PHP, y agregará métodos a la clase del modelo que permitan consultar, dar de alta, modificar y eliminar registros para el modelo especificado. No se sobreescribirán archivos si ya existen.

Las siguientes etiquetas adicionales compatibles con este asistente pueden utilizarse en las entidades (ver [ORM](api/orm.md)):

`@etiqueta` Etiqueta del campo. Por defecto, se utilizará el nombre de la propiedad.

`@requerido` Campo requerido (etiqueta sin valor).

`@tamano` Ancho del campo en unidades de la grilla de columnas (1 a 10). Por defecto, será `10`.

Por defecto, todos los campos serán de ingreso de texto (en el futuro, variará según el tipo de columna y se añadirá la etiqueta `@tipo` para mayor precisión).

*Nota:* Siempre será necesario realizar algunos ajustes manuales al código generado, es solo una plantilla.

#### ![](img/gestor/embebible.jpg) Construir embebible

Construye y compila todos los archivos cliente (JS, HTML y CSS) de la aplicación, generando los archivos para embeber en Cordova o el cliente de escritorio (`/embeber/`).

Es posible especificar la ruta al directorio `www` de la aplicación Cordova, en cuyo caso intentará copiar los archivos, y preparar y ejecutar la aplicación.

*Nota:* No hace falta construir la aplicación antes de construir la versión embebible.

#### ![](img/gestor/produccion.jpg) Construir para producción

Construye y compila todos los archivos cliente (JS, HTML y CSS) de la aplicación, generando el entorno de producción (`/produccion/`).

*Nota:* Los archivos `/produccion/config.php` y `/produccion/.htaccess` no son reemplazados a fin de preservar la configuración. Es muy probable que se requieran modificaciones en estos archivos para completar la implementación.

## Editor

El editor de vistas *WYSIWYG Drag&Drop* trabaja con el HTML/CSS de la vista, sin perder la relación entre elementos del DOM y los objetos del framework. Permite editar la versión real de la vista, con todos sus estilos y preservando cualquier modificación que se realice externamente.

El editor también permite configurar visualmente estructuras de control (bucles, condicionales, etc)., variables (acceso a datos) e integraciones con los controladores JS y PHP de la vista.

**Importante:** Es necesario deshabilitar todas las extensiones del navegador que puedan alterar el cuerpo de la página, como bloqueadores de publicidad y *trackers*.

(Idea/TODO) El el futuro, debe también ofrecer la posibilidad de construir controladores vinculados al origen de datos automáticamente mediante programación visual o un lenguaje imperativo simple, incluyendo validaciones y llamados a funciones PHP/JS para procesos específicos más complejos.

El editor se acerca a su versión final. En líneas generales, falta (entre otros detalles y TODOs):
- Barra de formatos (negrita, cursiva, etc.) al editar textos.
- Determinar si un elemento puede ser hijo o no de otro al arrastrar y soltar (actualmente cualquier componente puede soltarse dentro de cualquier componente).

La siguiente etapa consistirá en:
- Definición de nuevas propiedades comunes a todos los componentes.
- Completar el desarrollo de componentes concretos (ya están planteados los componentes básicos).

### Consejos útiles

- Al arrastrar un componente sobre otro, tanto si se trata de uno nuevo o se está moviendo uno existente, esperando 1 segundo aparecerán áreas alrededor del componente para poder soltarlo antes/arriba o después/debajo del componente de destino.

- Para seleccionar un componente sobre el cual no se puede hacer click, haciendo click secundario sobre uno de sus hijos se desplegará un menú contextual con opciones para seleccionar cualquier componente en su ascendencia.

- Pueden seleccionarse múltiples componetes manteniendo presionada la tecla Shift.

- Cuando se seleccionen múltiples componentes, la barra de propiedades mostrará las propiedades combinadas de *todos* ellos, pero no mostrará ningún valor. Cualquier modificación en las propiedades, será aplicada por igual a todos los componentes seleccionados.

- Para **copiar o cortar** los componentes seleccionados puede presionarse Ctrl+C / Ctrl+X. Asimismo, para **pegar** los componentes copiados, luego de seleccionar el destino o el cuerpo de la vista, se debe presionar Ctrl+V. **Es posible copiar y pegar entre distintas ventanas**.

*Nota:* El editor solo está probado en la última versión de Opera.

## Más información

contacto@foxtrot.ar