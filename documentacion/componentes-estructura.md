## Índice

- [Introducción](../README.md)
- [Primeros pasos](primeros-pasos.md)
- [Estructura](estructura.md)
- [Descripción y documentación del API](api.md)
- [Editor](editor.md)
- [Componentes](componentes.md)
- [Desarrollo de componentes](componentes-estructura.md)
- [Scripts de compilación](scripts.md)

## Estructura de los componentes

### JS

Cada componente se define en una función JS que se registra en el framework mediante `ui.registrarComponente()`. Opcionalmente, el componente puede contar con dos archivos de estilos: `componente.css` y `componente.edicion.css`. Este último sólo se incluirá dentro del editor. El archivo JS debe residir en `fuente/cliente/componentes` y los archivos CSS, en `fuente/recursos/componentes/css`. Todos los archivos agregados en ambos directorios serán incluídos automáticamente al compilar el framework.

### PHP

Los componentes pueden ser preprocesados en el servidor. Esto significa que el backend interpretará y reemplazará el código del componente cada vez que se cargue la vista. Para ello, el componente debe definir una clase PHP y el framework se encargará de invocar sus métodos y reemplazar el código HTML. Lógicamente, este mecanismo estará disponible únicamente en aplicaciones implementadas del lado del servidor.

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0
