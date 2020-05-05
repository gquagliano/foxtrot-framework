Trabajo en curso y experimentos para el desarrollo de Foxtrot 6 (https://github.com/foxtrotarg/foxtrot-framework) y otros productos. 

### Qué estamos desarrollando

1. Editor de vistas WYSIWYG: Nuestro editor de vistas actual trabaja íntegramente con objetos y cada vista es dibujada en tiempo de ejecución. Buscamos un editor que "compile" la vista, almacenándola en html, pero sin perder la relación entre elementos del DOM y los objetos del framework.

2. Gestor de acceso al DOM y utilidades que abstraigan el acceso al mismo para abreviar el código (limpieza, reutilización, etc.) y por cuestiones de intercompatibilidad entre navegadores. ¿Por qué esa obsesión por agregar capas y capas? En lugar de desarrollar algo similar a jQuery que añada una capa adicional, vamos a extender los prototipos nativos para añadir métodos. Debe ser compatible con navegadores modernos (descartamos IE y cualquier navegador desactualizado) pero aún así escrito en ES5. *

3. El API de todas las librerías se desarrolla totalmente en español. Solo mantenemos los nombres internos (eventos, etc.) y siglas en inglés.

4. Backend.

El backend de Foxtrot tiene las siguientes particularidades:

- Es headless, totalmente desacoplado del frontend
- Es multiaplicación (una instalación puede contener varias aplicaciones y la app solicitada se determina a partir del dominio)
- Permite una comunicación bidireccional PHP<->JS totalmente transparente para el desarrollador
- Permite exponer métodos PHP en forma automática de manera segura

La mejora principal en esta versión viene en el último punto: No era tan automático.

No es posible simplemente asumir que un método público (`public`) lo es en el sentido _hacia afuera_ de la app. La idea para simplificar la apertura de métodos HTTP es crear un nuevo tipo de clase que sólo contenga dichos métodos.

Tipos de clases (se determina en forma automática según espacio de nombres y ascendencia):

- Controlador de vista (backend, también existe el de frontend, en JS).
- Clases de la app.
- Clases de métodos públicos HTTP.
- Modelo de datos.
- Otras clases (enrutamiento, librerías de terceros, módulos, componentes, etc.).

\* Sobre el punto 2, [dicen](http://perfectionkills.com/whats-wrong-with-extending-the-dom/) que es una mala práctica, pero:

- Estamos apuntando únicamente a navegadores modernos.
- No es una librería de propósito general, sino que trabajará en un ambiente controlado.
- Este repositorio se llama experiental por algo.

### Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0

Íconos por Icons8 - https://icons8.com/icons/material-outlined