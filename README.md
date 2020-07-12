Trabajo en curso y experimentos para el desarrollo de Foxtrot 7 (https://github.com/foxtrotarg/foxtrot-framework). 

**Nota: No todo lo que se establece en la documentación funciona actualmente.**

**Nota: A raiz de unas modificaciones en curso, el guardado de vistas desde el editor no está en funcionamiento.**

## Qué es Foxtrot Framework

Foxtrot es un framework RAD de PWA con editor visual de vistas, cliente (frontend) en JavaScript y servidor (backend) PHP headless.

Persigue los objetivos de:
- Estandarizar y automatizar la mayor parte del flujo de desarrollo de aplicaciones.
- Permitir la realización con una única herramientas de aplicaciones que en otros frameworks pueden demandar la inclusión de una docena de librerías.
- Ser extremadamente liviano y rápido, especialmente en dispositivos.

Desarrollado en Argentina, con su API en español (¡no _spanglish_!).

## ¿Por qué?

- Porque creemos que juntar una docena de frameworks y componentes para desarrollar una aplicación es una locura y estamos hace años detrás del _framework-ultra-liviano-multi-plataforma-todo-en-uno_ definitivo.
- Porque creemos que podemos desarrollar una herramienta mejor que las existentes (o, al menos, que las más populares) pensando en las necesidades reales del desarrollador.
- Porque no existe (o no encontramos) una herramienta como nuestro editor que sea de código abierto, libre y gratuita (es cierto que existen editores para Bootstrap muy buenos, pero de código cerrado e incluso algunos te obligan a almacenar tu proyecto en su servidor 🤢).

## Primeros pasos

[Guía de inicio rápido](documentacion/primeros-pasos.md).

## Estructura del proyecto

`/fuente/` Código fuente del framework.

`/desarrollo/` Framework compilado + Código fuente de las aplicaciones.

`/produccion/` Framework y aplicaciones compilados.

`/embeber/` Framework y una aplicación específica compilados para embeber en Cordova o el cliente de escritorio.

`/scripts/` Scripts de compilación.

## Qué estamos desarrollando

### Editor

![](documentacion/editor.jpg)

Editor de vistas WYSIWYG. Almacena la vista lista para mostrar en html/css, pero sin perder la relación entre elementos del DOM y los objetos del framework.

Próximamente, no solo será un editor, sino que se desarrollará un gestor interactivo de vistas, controladores, configuración, modelo de datos y demás recursos.

[Más información sobre el editor](documentacion/editor.md).

### Estructura de las aplicaciones

El framework es multi-aplicación, simplificando el desarrollo y mantenimiento de múltiples proyectos en un servidor, tanto en desarrollo como en producción (una única instalación puede servir múltiples aplicaciones).

[Más información sobre las aplicaciones y su estructura](documentacion/estructura.md).

### API

El framework está dividido en cliente y servidor, pero desacoplados. Ambos pueden residir en la misma ubicación (el cliente se descarga desde el mismo servidor web) o separados (por ejemplo, cliente local en una aplicación móvil o de escritorio).

El lado del servidor está compuesto por controladores de servidor y el modelo de datos (incluye ORM propio).

El lado del cliente está compuesto por controladores de cliente y vistas. Cada vista está compuesta por componentes, los cuales guardan relación con los elementos del DOM y permiten la manipulación de la vista mediante sus métodos y propiedades. Existen componentes que representan estructuras de control (condicionales, bucles, inclusión de una vista dentro de otra, etc.) automatizando la presentación de información y la navegación. Incluye un gestor del DOM propio (reemplaza a jQuery).

**Comunicación cliente<->servidor transparente**

El framework permite una comunicación transparente entre controladores del lado del cliente y controladores del lado del servidor. El desarrollador puede invocar un método desde uno hacia el otro como si se tratara de un mismo lenguaje.

**Automatización**

(Idea/TODO) Posibilidad de construir controladores vinculados al origen de datos automáticamente mediante programación visual o un lenguaje imperativo simple, incluyendo validaciones y llamados a funciones php/js para procesos específicos más complejos.

**Compilación**

Las aplicaciones se compilan con Closure y comprimen, para garantizar carga y ejecución rápidos, tanto en web como en dispositivos. Es compatible con Cordova y un cliente Windows que se encuentra en desarrollo.

**Intérprete lógico-matemático (js)**

Desarrollamos un intérprete para permitir la inserción de variables, llamados a funciones y expresiones simples en cualquier texto, donde las expresiones se encierran entre `{` y `}`. La finalidad del mismo es simplificar el enlace de la UI al código fuente y a los datos, reemplazando código JavaScript por este pequeño lenguaje (por ejemplo, una cadena como `{var}` sería equivalente a agregar código para buscar el elemento del DOM y reemplazar su contenido por la propiedad `var` del controlador de la vista.)

**Intérprete lógico-matemático (php)**

(TODO) El intérprete deberá portarse a php si se ofrece la posibilidad de pre-procesar algunos componentes del lado del servidor.

[Más información sobre el API](documentacion/api.md).

## Colaboraciones

Foxtrot (como compañía detrás de este framework) es solo un microemprendimiento y los recursos disponibles para este ambicioso proyecto son limitados. Nuestro objetivo es que el framework pertenezca a la comunidad toda; es decir, seremos _usuarios_, no _dueños_, de Foxtrot Framework.

Por lo tanto, toda colaboración es bienvenida y muy apreciada. Si este proyecto te parece una buena propuesta, sentite libre de colaborar. Solo pedimos código limpio y simple, respetando los estilos del código preexistente en cuanto a formato y nomenclatura (detallaremos estos requisitos próximamente).

Podés ponerte en contacto con nosotros en contacto@foxtrot.ar para conversar y aclarar todas las dudas acerca del proyecto.

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0

Íconos por Icons8 - https://icons8.com/icons/material-outlined
