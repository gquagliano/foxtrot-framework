## Índice

- [Introducción](../README.md)
- [Primeros pasos](primeros-pasos.md)
- [Estructura](estructura.md)
- [API](api.md)
- [Editor](editor.md)
- [Scripts de compilación](scripts.md)

## Editor

![](editor.jpg)

Editor de vistas WYSIWYG: Nuestro editor de vistas viejo trabajaba íntegramente con objetos y cada vista era dibujada en tiempo de ejecución. En esta versión, buscamos un editor que "compile" la vista, almacenándola en HTML/CSS, pero sin perder la relación entre elementos del DOM y los objetos del framework. Debe, además, permitir editar en la versión real de la vista, con todos sus estilos y cualquier otra maquetación que se añada externamente.

El editor también permite configurar visualmente estructuras de control (bucles, condicionales, etc.), variables (acceso a datos) e integraciones con los controladores JS y PHP de la vista.

El el futuro, debe también ofrecer la posibilidad de construir controladores vinculados al origen de datos automáticamente mediante programación visual o un lenguaje imperativo simple, incluyendo validaciones y llamados a funciones PHP/JS para procesos específicos más complejos. Contará, además, con asistentes para creación de vistas y controladaores (por ejemplo, un ABMC en base al modelo de datos.)

El editor se acerca a su versión final. En líneas generales, falta (entre otros detalles y TODOs):
- Cortar, copiar, pegar, deshacer, rehacer.
- Al arrastrar sobre un componente, deben aparecer las áreas a su alrededor para poder soltar arriba/a la izquierda o abajo/a la derecha del mismo.
- Selección múltiple.
- Barra de formatos (negrita, cursiva, etc.) al editar textos.
- Determinar si un elemento puede ser hijo o no de otro al arrastrar y soltar (actualmente cualquier componente puede soltarse dentro de cualquier componente).

La siguiente etapa consistirá en:
- Definición de propiedades comunes a todos los componentes.
- Desarrollo de componentes concretos (ya están planteados los componentes básicos).
- Integración con un gestor de aplicaciones vistas, controladores, base de datos y configuración; finalización de los métodos de guardado/apertura (previsualización posiblemente se remueva, abrir y guardar, si se realiza el gestor externo, también).

**Acceso al editor**

`http://localhost/experimental-foxtrot-framework/desarrollo/editor/?vista=[ruta]&modo=[embebible|independiente]&cliente=[web|cordova|escritorio]`

Ejemplo: http://localhost/experimental-foxtrot-framework/desarrollo/editor?vista=aplicaciones/test/cliente/inicio

_ruta:_
Ruta sin extensión relativa a la raíz del sistema.

_modo:_
- `embebible` Almacenará solo el cuerpo de la vista, sin los tags `<html>`, `<head>`, `<body>`, scripts ni estilos, a fin de que sea una vista para insertar dentro de otra en tiempo de ejecución.
- `independiente` Almacenará la vista en un archivo HTML que podrá abrirse en forma independiente (Predeterminado).

_cliente:_
- `web` Almacenará la vista para funcionar en un servidor web (Predeterminado).
- `cordova` Al guardar, generará un archivo HTML compatible con Cordova.
- `escritorio` Al guardar, generará un archivo HTML compatible con el cliente de escritorio de Foxtrot.

En el futuro, `/desarrollo/editor/` se reemplazará por el gestor completo y se automatizará el acceso al editor (acceso directo desde el listado de vistas).

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0
