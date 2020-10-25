Trabajo en curso y experimentos para el desarrollo de Foxtrot 7. 

**Nota: No todo lo que se establece en la documentación funciona actualmente. ¡Pero estamos camino a la primer versión *MVP*!**

### Qué es Foxtrot Framework

![](docs/img/editor.jpg)

Foxtrot es un framework de desarrollo rápido de aplicaciones web y móviles, con un **editor visual** de vistas, que integra cliente (*frontend*) en JavaScript y servidor (*backend*) _headless_ en PHP, y que busca ser el *framework-ultra-liviano-multi-plataforma-todo-en-uno* **más fácil** de aprender y de usar.

**¿Qué es? ¿Por qué se desarrolla? ¿Dónde está la documentación? 👉 [Accedé al Wiki](https://github.com/gquagliano/experimental-foxtrot-framework/wiki)** (en redacción).

**[Primeros pasos](https://github.com/gquagliano/experimental-foxtrot-framework/wiki/Primeros-pasos)**

**[Video de introducción](https://youtu.be/j0hDNhlKW3Q)**  
Instalación, descripción del gestor, el editor y la estructura del sistema, y vistazo general a las principales funciones.

**[Aplicación de ejemplo](https://demo.f7.foxtrot.net.ar)**  
Usuario: admin  
Contraseña: test  
*Nota: La aplicación de ejemplo publicada es de código cerrado y solo se incluye en este repositorio una pequeña parte suficiente para demostrar la funcionalidad de Foxtrot y servir de guía para comenzar tu desarrollo.*

### Estado

![](docs/img/tick.jpg) Gestor de aplicaciones (*¡adiós línea de comandos!*).

![](docs/img/tick.jpg) Editor de vistas completamente funcional.

![](docs/img/tick.jpg) Integración *vista - controlador JS - controlador PHP* completa.

![](docs/img/tick.jpg) Acceso a datos y ORM, completos.

![](docs/img/tick.jpg) Ciclo de ejecución de la aplicación y la vista, completos.

![](docs/img/tick.jpg) Integración de múltiples vistas en una sola página.

![](docs/img/tick.jpg) Compilación para producción, funcionando (las aplicaciones ya se pueden ejecutar e implementar).

![](docs/img/tick.jpg) Compilación para embeber en Cordova, funcionando (las aplicaciones ya se pueden compilar con Cordova y ejecutar en dispositivos).

#### Pendientes

Ver [Pendientes](docs/pendientes.md).

### Aplicación de ejemplo

Se incluye una aplicación de ejemplo demostrando las funciones principales del framework.

[Más información](desarrollo/aplicaciones/ejemplo/README.md).

### Documentación del código fuente

#### PHP

https://github.com/gquagliano/experimental-foxtrot-framework/wiki/phpdoc-indice

#### JS

https://github.com/gquagliano/experimental-foxtrot-framework/wiki/jsdoc-indice

### Estructura del proyecto

`/fuente/` Código fuente del framework.

`/desarrollo/` Framework compilado + Código fuente de las aplicaciones.

`/produccion/` Framework y aplicaciones compilados. No es necesario instalar nada en el servidor, solo copiar el contenido de este directorio.

`/embeber/` Framework y una aplicación específica compilados para embeber en Cordova o el cliente de escritorio.

`/gestor/` Gestor de aplicaciones.

`/construir/` Asistente de construcción o compilación del framework.

### Qué estamos desarrollando

### Gestor de aplicaciones y editor visual

Un gestor de aplicaciones permite crear vistas, crear controladores, ejecutar los distintos asistentes, gestionar el modelo de datos y acceder al editor en forma interactiva.

El framework cuenta con un editor de vistas *WYSIWYG* *Drag&drop*, que almacena la vista lista para mostrar en HTML/CSS, lo cual lo hace **extremadamente rápido**, pero sin perder la relación entre elementos del DOM y los objetos del framework.

El editor también permite configurar visualmente estructuras de control (bucles, condicionales, etc.), variables (acceso a datos) e integraciones con los controladores JS y PHP de la vista.

[Más información sobre el gestor de aplicaciones](https://github.com/gquagliano/experimental-foxtrot-framework/wiki/Gestor-de-aplicaciones).

[Más información sobre el editor de vistas](https://github.com/gquagliano/experimental-foxtrot-framework/wiki/Editor-de-vistas).

[Listado de componentes](docs/componentes.md).

[Estructura y guía de desarrollo de componentes](docs/componentes-estructura.md).

### Estructura de las aplicaciones

El framework es multi-aplicación, lo que significa que el desarrollador puede trabajar en varias aplicaciones a la vez, y un servidor puede alojar múltiples aplicaciones a la vez, con una única instalación de Foxtrot, simplificando el mantenimiento y las actualizaciones.

[Más información sobre las aplicaciones y su estructura](docs/estructura.md).

### API

El framework está dividido en cliente y servidor, pero desacoplados: Ambos pueden residir en la misma ubicación (el cliente se descarga desde el mismo servidor web) o separados (por ejemplo, cliente local en una aplicación móvil o de escritorio).

El lado del servidor está compuesto por controladores de servidor y el modelo de datos (incluye ORM propio).

El lado del cliente está compuesto por controladores de cliente y vistas. Cada vista está compuesta por componentes, los cuales guardan relación con los elementos del DOM y permiten la manipulación de la vista mediante sus métodos y propiedades. Existen componentes que representan estructuras de control (condicionales, bucles, inclusión de una vista dentro de otra, etc.) automatizando la presentación de información y la navegación. Incluye un gestor del DOM propio (reemplaza a jQuery).

[Más información sobre el API](docs/api.md).

[Documentación](docs/api/indice.md).

**Comunicación cliente<->servidor transparente**

El framework permite una comunicación transparente entre controladores del lado del cliente y controladores del lado del servidor. El desarrollador puede invocar un método desde uno hacia el otro como si se tratara de una misma plataforma.

**Automatización**

(Idea/TODO) Posibilidad de construir controladores vinculados al origen de datos automáticamente mediante programación visual o un lenguaje imperativo simple, incluyendo validaciones y llamados a funciones PHP/JS para procesos específicos más complejos.

**Compilación**

Las aplicaciones se compilan con Closure y comprimen, para garantizar carga y ejecución rápidos, tanto en web como en dispositivos. Es compatible con Cordova y un cliente Windows que se encuentra en desarrollo.

**ORM**

Un ORM propio liviano y fácil de utilizar reduce al mínimo, o elimina en muchos casos, el uso de código SQL, aumentando así la seguridad y mejorando el diseño de los objetos de la aplicación. Se define íntegramente mediante objetos, contribuyendo con el control de errores y el autocompletado al escribir código. El ORM permite crear y mantener actualizada la estructura de la base de datos a partir del código PHP del modelo de datos. Además, como todo en Foxtrot, sus métodos están en español.

[Documentación del ORM](https://github.com/gquagliano/experimental-foxtrot-framework/wiki/Modelo-de-datos-y-ORM).

**Intérprete lógico-matemático (JS)**

Desarrollamos un intérprete para permitir la inserción de variables, llamados a funciones y expresiones simples en cualquier texto, donde las expresiones se encierran entre `{` y `}`. La finalidad del mismo es simplificar el enlace de la interfaz con el código fuente y los datos.

El intérprete deberá portarse a PHP si se ofrece la posibilidad de pre-procesar algunos componentes del lado del servidor.

**Módulos**

Existen diferentes utilidades que se pueden incluir del lado del cliente y/o del lado del servidor en forma de módulos o *plug-ins*, para la asistencia en la implementación de servicios de terceros (como reCaptcha o Firebase) y la realización de tareas específicas (como generar PDF o XLS).

[Más información sobre los módulos y listado de módulos existentes](https://github.com/gquagliano/experimental-foxtrot-framework/wiki/Módulos).

### Colaboraciones

Toda colaboración es bienvenida. Podés ponerte en contacto con nosotros en contacto@foxtrot.ar para conversar y aclarar todas las dudas acerca del proyecto.

### Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0

Íconos por:  
Icons8 - https://icons8.com/icons/material-outlined  
Heroicons - https://heroicons.com/  
Foxtrot (algunos son originales)

