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

  

![](img/editor.jpg)

## Gestor de aplicaciones

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

*Nota:* El gestor y el editor están diseñados para uso en escritorio exclusivamente, y están probados en la última versión de Opera (WebKit).

### ¡Muy importante!

Actualmente, el gestor está en desarrollo y está pensado para uso personal en un servidor local, por lo que no presenta ningún tipo de seguridad. **Implementar el directorio `/editor/` en un servidor público o compartido deja abierta la posibilidad de cargar código arbitrario**. Por el mismo motivo, por el momento no presenta demasiadas validaciones ni control de errores, y debe usarse con precaución.

En el futuro, el gestor de aplicaciones debe evolucionar y llegar a contar con autenticación de usuarios y mecanismos de seguridad para trabajo en equipo en servidores de desarrollo, ya sea en la nube o en intranet.

## Comandos del gestor

#### ![](img/gestor/aplicacion.png) Nueva aplicación

Crea una aplicación en blanco con sus archivos y elementos básicos, y configurará Foxtrot para que la misma se ejecute en el dominio especificado. Los archivos serán creados en `/desarrollo/aplicaciones/nombre/`.

Es posible que sea necesario editar el archivo `config.php` de la aplicación para establecer una base de datos diferente u otros ajustes; el asistente creará un archivo de configuración en blanco.

Si se ingresa un nombre de dominio, el asistente intentará editar el archivo `desarrollo/config.php`. Esto solo funciona con el enrutador de aplicaciones predeterminado y el formato de configuración de ejemplo. *Debe omitirse el dominio cuando se haya realizado una configuración diferente*.

Ver [Primeros pasos](primeros-pasos.md) para más información.

#### ![](img/gestor/vista.png) Nueva vista

Abre el editor con los parámetros correspondientes para crear una nueva vista.

Al crear una vista, será necesario especificar las siguientes configuraciones:

Modo:
- *Embebible*: Almacenará solo el cuerpo de la vista, sin los tags `<html>`, `<head>`, `<body>`, scripts ni estilos, a fin de que sea una vista para insertar dentro de otra en tiempo de ejecución.
- *Independiente*: Almacenará la vista en un archivo HTML que podrá abrirse en forma independiente (Predeterminado).

Cliente:
- *Web*: Almacenará la vista para funcionar en un servidor web (Predeterminado).
- *Cordova*: Al guardar, generará un archivo HTML compatible con Cordova.
- *Escritorio*: Al guardar, generará un archivo HTML compatible con el cliente de escritorio de Foxtrot.

#### ![](img/gestor/editar.png) Editar una vista

Se puede acceder al editor mediante el comando ubicado a la derecha de cada vista

#### ![](img/gestor/controlador.png) Nuevo controlador de servidor

Crea un nuevo controlador de servidor (PHP).

#### ![](img/gestor/modelo.png) Nuevo modelo de datos

Crea las clases para un nuevo modelo de datos con su entidad.

*Nota:* Luego de agregar las propiedades a la clase de la entidad, se puede crear la tabla correspondiente en la base de datos mediante el comando Sincronizar.

[Más información sobre la estrcutrura de las clases del ORM](api/orm.md).

#### ![](img/gestor/sincronizar.png) Sincronizar base de datos

Crea o actualiza las tablas a partir de la estructura del modelo de datos de la aplicación. Utiliza la base de datos y credenciales presentes en la configuración de la aplicación.

#### ![](img/gestor/asistentes.png) Asistentes

Asistentes de creación de vistas y controladores.

##### Asistente de creación de ABMC

El asistente creará vistas, controladores JS y un controlador PHP, y agregará métodos a la clase del modelo que permitan consultar, dar de alta, modificar y eliminar registros para el modelo especificado. No se sobreescribirán archivos si ya existen.

El asistente soporta algunas etiquetas adicionales en las propiedades de la entidad; ver: [ORM](api/orm.md).

Por defecto, todos los campos serán de ingreso de texto (en el futuro, variará según el tipo de columna y se añadirá la etiqueta `@tipo` para mayor precisión).

*Nota:* Usualmente será necesario realizar algunos ajustes manuales al código generado, esto genera solo una plantilla.

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

## Desarrollo de asistentes

Es posible crear nuevos asistentes, los cuales se mostrarán en el diálogo de Asistentes del gestor de aplicaciones, simplemente agregando un archivo en `/fuente/editor/asistentes`, el cual contenga una clase del mismo nombre extendiendo `asistente`.

*Nota:* Cuando el nombre de archivo contenga guiones, serán removidos y la primer letra de cada palabra será convertida a mayúscula, por ejemplo `crear-aplicacion` => `crearAplicacion`.

    defined('_inc') or exit;

    /**
    * Asistente concreto.
    */
    class miAsistente extends asistente {
        /**
        * Devuelve los parámetros del asistente. Debe devolver un objeto con las propiedades [titulo,visible=>bool].
        * @return object
        */
        public static function obtenerParametros() {
            return (object)[
                'titulo'=>'Nombre del asistente'
            ];
        }

        /**
        * Imprime el formulario de configuración del asistente.
        */
        public function obtenerFormulario() {
    ?>
    <div class="form-group row">
        <label class="col-3 col-form-label">Parámetro</label>
        <div class="col-sm-9">
            <input type="text" class="form-control" name="param">
        </div>
    </div>
    <?php
        }

        /**
        * Ejecuta el asistente.
        * @var object $parametros Parámetros recibidos desde el formulario.
        */
        public function ejecutar($parametros) {
            //Recibido $parametros->param desde el formulario
            
            //Lógica del asistente
        }
    }

## Más información

contacto@foxtrot.ar