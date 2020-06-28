Trabajo en curso y experimentos para el desarrollo de Foxtrot 7 (https://github.com/foxtrotarg/foxtrot-framework) y otros productos. 

## Qué es Foxtrot Framework

Foxtrot es un framework RAD de PWA con editor visual de vistas, cliente (frontend) en JavaScript y servidor (backend) PHP headless.

Persigue los objetivos de:
- Estandarizar y automatizar la mayor parte del flujo de desarrollo de aplicaciones.
- Permitir la realización con una única herramientas de aplicaciones que en otros frameworks pueden demandar la inclusión de una docena de librerías.
- Ser extremadamente liviano y rápido, especialmente en dispositivos.

Desarrollado en Argentina, con su API en español.

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

**Compilación**

Las aplicaciones se compilan con Closure y comprimen, para garantizar carga y ejecución rápidos, tanto en web como en dispositivos. Es compatible con Cordova y un cliente Windows que se encuentra en desarrollo.

**Intérprete lógico-matemático (js)**

Desarrollamos un intérprete para permitir la inserción de variables, llamados a funciones y expresiones simples en cualquier texto, donde las expresiones se encierran entre `{` y `}`.

[Más información sobre el API](documentacion/api.md).

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0

Íconos por Icons8 - https://icons8.com/icons/material-outlined
