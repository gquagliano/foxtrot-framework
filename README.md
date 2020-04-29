Trabajo en curso y experimentos para el desarrollo de Foxtrot 6 (https://github.com/foxtrotarg/foxtrot-framework) y otros productos.

### Qué estamos desarrollando

1. Editor de vistas WYSIWYG: Nuestro editor de vistas actual trabaja íntegramente con objetos y cada vista es dibujada en tiempo de ejecución. Buscamos un editor que "compile" la vista, almacenándola en html, pero sin perder la relación entre elementos del DOM y los objetos del framework.

2. Gestor de acceso al DOM y utilidades que abstraigan el acceso al mismo para abreviar el código (limpieza, reutilización, etc.) y por cuestiones de intercompatibilidad entre navegadores. ¿Por qué esa obsesión por reemplazar los prototipos nativos? En lugar de desarrollar algo similar a jQuery que añada una capa adicional, vamos a extender el DOM para añadir métodos útiles como acceso directo (limpieza de código), para abreviar procedimientos o para resolver diferencias entre navegadores, que hoy día son mínimas. Debe ser compatible con navegadores modernos (descartamos IE y cualquier navegador desactualizado) pero aún así escrito en ES5.

Dicen que [es una mala práctica](http://perfectionkills.com/whats-wrong-with-extending-the-dom/), pero:
- Estamos apuntando únicamente a navegadores modernos.
- No es una librería de propósito general, sino que trabajará en un ambiente controlado.
- Este repositorio se llama experiental por algo.

3. El API de todas las librerías se desarrolla íntegramente en español.

### Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0
