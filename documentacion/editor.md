## Índice

- [Introducción](../README.md)
- [Primeros pasos](primeros-pasos.md)
- [Estructura](estructura.md)
- [API](api.md)
- [Editor](editor.md)
- [Scripts de compilación](scripts.md)

## Editor

![](editor.jpg)

Editor de vistas WYSIWYG: Nuestro editor de vistas viejo trabajaba íntegramente con objetos y cada vista era dibujada en tiempo de ejecución. En esta versión, buscamos un editor que "compile" la vista, almacenándola en html/css, pero sin perder la relación entre elementos del DOM y los objetos del framework. Debe, además, permitir editar en la versión real de la vista, con todos sus estilos y cualquier otra maquetación que se añada externamente.

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

`http://localhost/experimental-foxtrot-framework/desarrollo/editor/?vista=[ruta]&modo=[embebible|independiente]&cordova=[1|0]`

Ejemplo: http://localhost/experimental-foxtrot-framework/desarrollo/editor?vista=aplicaciones/test/cliente/inicio

_ruta:_
Ruta sin extensión relativa a la raíz del sistema.

_modo:_
- `embebible` Almacenará solo el cuerpo de la vista, sin los tags `<html>`, `<head>`, `<body>`, etc., a fin de que sea una vista para insertar dentro de otra.
- `independiente` Almacenará la vista en un archivo html que podrá abrirse en forma independiente (Predeterminado).

_cordova:_
- Establecer a `1` para que, al guardar, genere un archivo html compatible con Cordova (Predeterminado, `0`).

Próximamente, `/desarrollo/editor/` se reemplazará por el gestor y se automatizará el acceso al editor.

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0
