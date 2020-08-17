Trabajo en curso y experimentos para el desarrollo de Foxtrot 7 (https://github.com/foxtrotarg/foxtrot-framework). 

**Nota: No todo lo que se establece en la documentación funciona actualmente. ¡Pero estamos camino a la primer versión (*MVP*)!**

## Qué es Foxtrot Framework

Foxtrot es un framework RAD de PWA con editor visual de vistas, cliente (*frontend*) en JavaScript y servidor (*backend*) _headless_ en PHP.

Persigue los objetivos de:
- Estandarizar y automatizar la mayor parte del flujo de desarrollo de aplicaciones.
- Permitir la realización con una única herramientas de aplicaciones que en otros frameworks pueden demandar la inclusión de una docena de librerías.
- Ser extremadamente liviano y rápido, especialmente en dispositivos.

Desarrollado en Argentina, con su API en español.

**[Mirá el video de demostración](https://youtu.be/J7Ru9Mfumr8).**

**[Accedé a la aplicación de ejemplo](https://demo.f7.foxtrot.net.ar).**
Usuario: admin
contraseña: test

## ¿Por qué?

- Porque creemos que juntar una docena de frameworks y componentes para desarrollar una aplicación es una locura y estamos detrás del _framework-ultra-liviano-multi-plataforma-todo-en-uno_ definitivo.
- Porque creemos que podemos desarrollar una herramienta mejor que las existentes (o, al menos, que las más populares) pensando en las necesidades reales del desarrollador.
- Porque no existe (o no encontramos) una herramienta como nuestro editor que sea de código abierto, libre, gratuita, que no te obligue a almacenar tu código en su _nube_ y que persiga el mismo nivel de integración que Foxtrot.
- Porque buscamos un editor de vistas que no sea un mero diseñador de maquetas, sino que incorpore herramientas de acceso a datos, vinculación automática con los controladores y estructuras de control (bucles, condicionales).
- Porque buscamos un sistema súper-rápido.

La complejidad de Foxtrot está en el diseño de las vistas; durante la ejecución, es tan liviano, que es prácticamente como no usar ningún framework, pero manteniendo disponible la funcionalidad de Foxtrot si el código del usuario lo requiere. Desacoplando la lógica de las vistas del DOM, buscamos también:

- Que el desarrollador tenga que preocuparse casi-nada por la estructura de la vista, como en otras plataformas.
- Que gracias a esta abstracción podamos, en el futuro, buscar mejores formas de representar los componentes, o portar el framework a otras plataformas, sin volver obsoleto tu código.
- El acceso a los elementos de la vista sea más simple y directo, a través de los componentes.

## Estado

![](documentacion/img/tick.jpg) Editor de vistas completamente funcional.

![](documentacion/img/tick.jpg) Integración *vista - controlador JS - controlador PHP* completa.

![](documentacion/img/tick.jpg) Acceso a datos y ORM, completos.

![](documentacion/img/tick.jpg) Ciclo de ejecución de la aplicación y la vista, completos.

![](documentacion/img/tick.jpg) Compilación para producción, funcionando (las aplicaciones ya se pueden ejecutar e implementar).

![](documentacion/img/tick.jpg) Compilación para embeber en Cordova, funcionando (las aplicaciones ya se pueden compilar con Cordova y ejecutar en dispositivos).

#### Pendientes

En líneas generales,

- Implementar más componentes.
- ~~Edición de metadatos de las vistas~~.
- Desarrollar la navegación entre vistas dentro de una sola página (ideal para aplicaciones móviles).
- Completar funcionalidad útil del editor, como ~~copiar, cortar, pegar,~~ deshacer, rehacer y la barra de formato de texto.
- Completar la documentación; revisar y completar JSDOC y PHPDOC.
- Sumar librerías y clases útiles para generación de PDF, lectura y generación de archivos Excel, generación de archivos HTML desde plantillas, etc.

Luego seguirá profundizar el desarrollo del editor, crear el gestor de aplicaciones completo con los asistentes, y las ideas planteadas como funcionalidad futura.

## Primeros pasos

Ver: [Guía de inicio rápido](documentacion/primeros-pasos.md).

#### Aplicación de ejemplo

Se incluye una aplicación de ejemplo demostrando las funciones principales del framework.

[Más información](desarrollo/aplicaciones/ejemplo/README.md).

## Estructura del proyecto

`/fuente/` Código fuente del framework.

`/desarrollo/` Framework compilado + Código fuente de las aplicaciones.

`/produccion/` Framework y aplicaciones compilados.

`/embeber/` Framework y una aplicación específica compilados para embeber en Cordova o el cliente de escritorio.

`/scripts/` Scripts de compilación.

## Qué estamos desarrollando

### Editor

![](documentacion/img/editor.jpg)

Editor de vistas *WYSIWYG* *Drag&drop*. Almacena la vista lista para mostrar en HTML/CSS, pero sin perder la relación entre elementos del DOM y los objetos del framework.

El editor también permite configurar visualmente estructuras de control (bucles, condicionales, etc.), variables (acceso a datos) e integraciones con los controladores JS y PHP de la vista.

En el futuro, no solo será un editor, sino que se desarrollará un gestor interactivo de vistas, controladores, configuración, modelo de datos y demás recursos. Contará, además, con asistentes para creación de vistas y controladaores (por ejemplo, un ABMC en base al modelo de datos.)

[Más información sobre el editor](documentacion/editor.md).

[Listado de componentes](documentacion/componentes.md).

[Estructura y guía de desarrollo de componentes](documentacion/componentes-estructura.md).

### Estructura de las aplicaciones

El framework es multi-aplicación, simplificando el desarrollo y mantenimiento de múltiples proyectos en un servidor, tanto en desarrollo como en producción (una única instalación puede servir múltiples aplicaciones).

[Más información sobre las aplicaciones y su estructura](documentacion/estructura.md).

### API

El framework está dividido en cliente y servidor, pero desacoplados: Ambos pueden residir en la misma ubicación (el cliente se descarga desde el mismo servidor web) o separados (por ejemplo, cliente local en una aplicación móvil o de escritorio).

El lado del servidor está compuesto por controladores de servidor y el modelo de datos (incluye ORM propio).

El lado del cliente está compuesto por controladores de cliente y vistas. Cada vista está compuesta por componentes, los cuales guardan relación con los elementos del DOM y permiten la manipulación de la vista mediante sus métodos y propiedades. Existen componentes que representan estructuras de control (condicionales, bucles, inclusión de una vista dentro de otra, etc.) automatizando la presentación de información y la navegación. Incluye un gestor del DOM propio (reemplaza a jQuery).

**Comunicación cliente<->servidor transparente**

El framework permite una comunicación transparente entre controladores del lado del cliente y controladores del lado del servidor. El desarrollador puede invocar un método desde uno hacia el otro como si se tratara de una misma plataforma.

**Automatización**

(Idea/TODO) Posibilidad de construir controladores vinculados al origen de datos automáticamente mediante programación visual o un lenguaje imperativo simple, incluyendo validaciones y llamados a funciones PHP/JS para procesos específicos más complejos.

**Compilación**

Las aplicaciones se compilan con Closure y comprimen, para garantizar carga y ejecución rápidos, tanto en web como en dispositivos. Es compatible con Cordova y un cliente Windows que se encuentra en desarrollo.

**ORM**

Un ORM propio liviano y fácil de utilizar reduce al mínimo, o elimina en muchos casos, el uso de código SQL, aumentando así la seguridad y mejorando el diseño de los objetos de la aplicación. Se define íntegramente mediante objetos, contribuyendo con el control de errores y el autocompletado al escribir código. El ORM permite crear y mantener actualizada la estructura de la base de datos a partir del código PHP del modelo de datos. Además, como todo en Foxtrot, sus métodos están en español.

[Documentación del ORM](documentacion/api/orm.md).

**Intérprete lógico-matemático (JS)**

Desarrollamos un intérprete para permitir la inserción de variables, llamados a funciones y expresiones simples en cualquier texto, donde las expresiones se encierran entre `{` y `}`. La finalidad del mismo es simplificar el enlace de la UI al código fuente y a los datos, reemplazando código JS por este pequeño lenguaje (por ejemplo, una cadena como `{var}` sería equivalente a agregar código para buscar el elemento del DOM y reemplazar su contenido por la propiedad `var` del controlador de la vista.)

El intérprete deberá portarse a PHP si se ofrece la posibilidad de pre-procesar algunos componentes del lado del servidor.

[Más información sobre el API](documentacion/api.md).

[Documentación](documentacion/api/indice.md).

## Colaboraciones

Foxtrot (como compañía detrás de este repositorio) es un microemprendimiento y los recursos disponibles para este ambicioso proyecto son limitados. Nuestro objetivo es que el framework pertenezca a la comunidad y que todos los desarrolladores, independientes o empresas, puedan sacar provecho de esta herramienta; es decir, no seremos los _dueños_ del framework. Esto responde a un deseo más profundo de levantar la calidad general del software y que la competencia sea por realizar el mejor trabajo de ingeniería y por dar el mejor servicio al cliente.

Por lo tanto, toda colaboración es bienvenida y muy apreciada. Si este proyecto te parece una buena propuesta, sentite libre de colaborar. Solo pedimos código limpio y simple, respetando los estilos del código preexistente en cuanto a formato y nomenclatura (detallaremos estos requisitos próximamente).

Podés ponerte en contacto con nosotros en contacto@foxtrot.ar para conversar y aclarar todas las dudas acerca del proyecto.

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0

Íconos (en su mayoría; algunos son originales) por Icons8 - https://icons8.com/icons/material-outlined
