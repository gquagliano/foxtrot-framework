## Índice

- [Introducción](../README.md)
- [Primeros pasos](https://github.com/gquagliano/experimental-foxtrot-framework/wiki/Primeros-pasos)
- [Estructura](estructura.md)
- [Descripción y documentación del API](api.md)
- [Desarrollo de componentes](componentes-estructura.md)
- [Pendientes](pendientes.md)

## Estructura de los componentes

### JS

Cada componente se define en una función JS que se registra en el framework mediante `ui.registrarComponente()`. Opcionalmente, el componente puede contar con dos archivos de estilos: `componente.css` y `componente.edicion.css`. Este último sólo se incluirá dentro del editor. El archivo JS debe residir en `fuente/cliente/componentes` y los archivos CSS, en `fuente/recursos/componentes/css`. Todos los archivos agregados en ambos directorios serán incluídos automáticamente al compilar el framework.

### PHP

Actualmente, cada componente puede implementar una clase cuyos métodos serán accesibles por HTTP. La clase puede tener cualquier nombre (aunque debería ser igual que el componente), en el espacio `\componentes\publico`, extendiendo `\componente` y en un archivo denominado `clase.pub.php` (donde `clase` es el nombre de la clase).

En el futuro, cada componente también podrá contar con una clase privada que implemente métodos para que pueda ser preprocesado en el servidor. Esto significa que el backend interpretará y reemplazará el código del componente cada vez que se cargue la vista.

## Más información

contacto@foxtrot.ar