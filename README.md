> ### 👋 ¡Hola!
> Si clonás Foxtrot, queremos conocer tu opinión. Escribinos sin compromiso a contacto@foxtrot.ar. ¡Gracias por tu visita!
 
🌎 **English docs:** https://github.com/gquagliano/foxtrot-framework-en

**Nota: El framework se encuentra en pleno desarrollo. ¡Pero estamos *a nada* de la primer versión *MVP*!**

## Qué es Foxtrot Framework

![](https://github.com/gquagliano/foxtrot-framework/wiki/img/editor.jpg)

Foxtrot es un framework de desarrollo rápido de aplicaciones web y móviles, con un **editor visual** de vistas, que integra cliente (*frontend*) en JavaScript y servidor (*backend*) _headless_ en PHP, y que busca ser el *framework-ultra-liviano-multi-plataforma-todo-en-uno* **más fácil** de aprender y de usar.

Tenemos el compromiso de crear **un framework que no sea como todos los demás**, uno que **no sobrecargue** ni al sistema, ni al equipo del usuario, ni la cabeza del programador. Uno que prácticamente **no requiera configuración**, sea **super-fácil** de usar y que esté escrito en **lenguaje casi-humano**.

Es importante también **promover adecuados aprendizaje y escritura de código PHP y (especialmente) JavaScript**, entendiendo y empoderando el correcto uso de clases (PHP) y del prototipo JavScript sobre cualquier otro patrón. Es por eso que en Foxtrot **no hay *pseudo-clases* ni un DOM virtual**, solo *(muchas, muchas)* utilidades para abreviar y automatizar los procesos más frecuentes de la interacción entre el usuario y la interfaz, y entre el cliente y el servidor.

**¿Qué es? ¿Por qué se desarrolla? ¿Dónde está la documentación? 👉 [Accedé al Wiki](https://github.com/gquagliano/foxtrot-framework/wiki)** (en redacción).

**[Primeros pasos](https://github.com/gquagliano/foxtrot-framework/wiki/Primeros-pasos)**

**[Video de introducción](https://youtu.be/j0hDNhlKW3Q)**  
Instalación, descripción del gestor, el editor y la estructura del sistema, y vistazo general a las principales funciones.

☝ ¿Comentarios?  
🤷‍♂️ ¿Dudas?  
🤓 ¿Querés aprender a usar el framework?  
⌨ ¿Te gustaría contribuir?  
**Escribinos:** contacto@foxtrot.ar

[![](https://c5.patreon.com/external/favicon/favicon-16x16.png?v=69kMELnXkB)](https://www.patreon.com/gquagliano) *Apoyá el desarrollo*  
[![](https://static.twitchcdn.net/assets/favicon-16-2d5d1f5ddd489ee10398.png)](https://www.twitch.tv/gquagliano) *Desarrollo en vivo*  
[![](https://www.youtube.com/favicon.ico)](https://www.youtube.com/channel/UCd8V_YL-kL-BbqB_koAbfBg/) *Podcast, tutoriales y más* (en producción)

## Estado

![](https://github.com/gquagliano/foxtrot-framework/wiki/img/tick.jpg) Gestor de aplicaciones (*¡adiós línea de comandos!*).

![](https://github.com/gquagliano/foxtrot-framework/wiki/img/tick.jpg) Editor de vistas completamente funcional.

![](https://github.com/gquagliano/foxtrot-framework/wiki/img/tick.jpg) Integración *vista - controlador JS - controlador PHP* completa.

![](https://github.com/gquagliano/foxtrot-framework/wiki/img/tick.jpg) Acceso a datos y ORM, completos.

![](https://github.com/gquagliano/foxtrot-framework/wiki/img/tick.jpg) Compilación

Ver [Estado del proyecto - Pendientes - Funcionalidad futura](https://github.com/gquagliano/foxtrot-framework/wiki/Estado-del-proyecto).

## Aplicación de ejemplo

Se incluye una aplicación de ejemplo demostrando las funciones principales del framework.

[Más información](desarrollo/aplicaciones/ejemplo/README.md).

## Documentación

#### Wiki

https://github.com/gquagliano/foxtrot-framework/wiki

#### PHP

https://github.com/gquagliano/foxtrot-framework/wiki/phpdoc-indice

#### JS

https://github.com/gquagliano/foxtrot-framework/wiki/jsdoc-indice

#### Estructura del proyecto

`/fuente/` Código fuente del framework.

`/desarrollo/` Framework compilado + Código fuente de las aplicaciones.

`/produccion/` Framework y aplicaciones compilados. No es necesario instalar nada en el servidor, solo copiar el contenido de este directorio.

`/embeber/` Framework y una aplicación específica compilados para embeber en Cordova o el cliente de escritorio.

`/gestor/` Gestor de aplicaciones.

`/construir/` Asistente de construcción o compilación del framework.

## Qué estamos desarrollando

#### Gestor de aplicaciones y editor visual

Un gestor de aplicaciones permite crear vistas, crear controladores, ejecutar los distintos asistentes, gestionar el modelo de datos y acceder al editor en forma interactiva.

El framework cuenta con un editor de vistas *WYSIWYG* *Drag&drop*, que almacena la vista lista para mostrar en HTML/CSS, lo cual lo hace **extremadamente rápido**, pero sin perder la relación entre elementos del DOM y los objetos del framework.

El editor también permite configurar visualmente estructuras de control (bucles, condicionales, etc.), variables (acceso a datos) e integraciones con los controladores JS y PHP de la vista.

[Más información sobre el gestor de aplicaciones](https://github.com/gquagliano/foxtrot-framework/wiki/Gestor-de-aplicaciones).

[Más información sobre el editor de vistas](https://github.com/gquagliano/foxtrot-framework/wiki/Editor-de-vistas).

[Listado de componentes](https://github.com/gquagliano/foxtrot-framework/wiki/Listado-de-componentes).

[Estructura y guía de desarrollo de componentes](https://github.com/gquagliano/foxtrot-framework/wiki/Visi%C3%B3n-general-de-la-estructura-de-los-componentes).

#### Estructura de las aplicaciones

El framework es multi-aplicación, lo que significa que el desarrollador puede trabajar en varias aplicaciones a la vez, y un servidor puede alojar múltiples aplicaciones a la vez, con una única instalación de Foxtrot, simplificando el mantenimiento y las actualizaciones.

[Más información sobre las aplicaciones y su estructura](https://github.com/gquagliano/foxtrot-framework/wiki/Definici%C3%B3n-y-ciclo-de-vida-de-la-aplicaci%C3%B3n).

#### API

El framework está dividido en cliente y servidor, pero desacoplados: Ambos pueden residir en la misma ubicación (el cliente se descarga desde el mismo servidor web) o separados (por ejemplo, cliente local en una aplicación móvil o de escritorio).

El lado del servidor está compuesto por controladores de servidor y el modelo de datos (incluye [ORM propio](https://github.com/gquagliano/foxtrot-framework/wiki/Modelo-de-datos-y-ORM)).

El lado del cliente está compuesto por controladores de cliente y vistas. Cada vista está compuesta por componentes, los cuales guardan relación con los elementos del DOM y permiten la manipulación de la vista mediante sus métodos y propiedades. Existen componentes que representan estructuras de control (condicionales, bucles, inclusión de una vista dentro de otra, etc.) automatizando la presentación de información y la navegación. Incluye un gestor del DOM propio (reemplaza a jQuery).

[Más información en el Wiki](https://github.com/gquagliano/foxtrot-framework/wiki).

**Comunicación cliente<->servidor transparente**

El framework permite una comunicación transparente entre controladores del lado del cliente y controladores del lado del servidor. El desarrollador puede invocar un método desde uno hacia el otro como si se tratara de una misma plataforma.

**Compilación**

Las aplicaciones se compilan con Closure y comprimen, para garantizar carga y ejecución rápidos, tanto en web como en dispositivos. Es compatible con Cordova y un cliente Windows que se encuentra en desarrollo.

**ORM**

Un ORM propio liviano y fácil de utilizar reduce al mínimo, o elimina en muchos casos, el uso de código SQL, aumentando así la seguridad y mejorando el diseño de los objetos de la aplicación. Se define íntegramente mediante objetos, contribuyendo con el control de errores y el autocompletado al escribir código. El ORM permite crear y mantener actualizada la estructura de la base de datos a partir del código PHP del modelo de datos. Además, como todo en Foxtrot, sus métodos están en español.

[Documentación del ORM](https://github.com/gquagliano/foxtrot-framework/wiki/Modelo-de-datos-y-ORM).

**Intérprete de expresiones**

El intérprete de expresiones permite ejecutar código JavaScript en forma segura. La mayoría de las propiedades de los componentes utilizan el intérprete de expresiones, de forma tal que se puedan embeber variables dinámicos entre los valores de las mismas. Las expresiones se definen encerradas entre llaves `{...}` y tienen acceso al ámbito global y a variables locales específicas.

**Módulos**

Existen diferentes utilidades que se pueden incluir del lado del cliente y/o del lado del servidor en forma de módulos o *plug-ins*, para la asistencia en la implementación de servicios de terceros (como reCaptcha o Firebase) y la realización de tareas específicas (como generar PDF o XLS).

[Más información sobre los módulos y listado de módulos existentes](https://github.com/gquagliano/foxtrot-framework/wiki/Módulos).

## Colaboraciones

Toda colaboración es bienvenida. Podés ponerte en contacto con nosotros en contacto@foxtrot.ar para conversar y aclarar todas las dudas acerca del proyecto.

## Más información

contacto@foxtrot.ar  
www.foxtrot.ar

Licencia: Apache 2.0

Íconos por:  
Icons8 - https://icons8.com/icons/material-outlined  
Heroicons - https://heroicons.com/  
Foxtrot (algunos son originales)

