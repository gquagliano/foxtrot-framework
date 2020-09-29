## Índice

- [Introducción](../README.md)
- [Primeros pasos](https://github.com/gquagliano/experimental-foxtrot-framework/wiki/Primeros-pasos)
- [Estructura](estructura.md)
- [Descripción y documentación del API](api.md)
- [Componentes](componentes.md)
- [Desarrollo de componentes](componentes-estructura.md)
- [Pendientes](pendientes.md)

## Pendientes

En líneas generales,

- (En curso) Implementar más componentes.
- (En curso) Completar la documentación; revisar y completar JSDOC y PHPDOC; mover la documentación a Wiki.
- (En curso, son los nuevos módulos) Sumar librerías y clases útiles para generación de PDF, lectura y generación de archivos Excel, generación de archivos HTML desde plantillas, etc.
- Completar funcionalidad útil del editor, como deshacer, rehacer y la barra de formato de texto.
- Revisar TODOs en el código.
- Completar la funcionalidad del gestor de aplicaciones: Renombrar, duplicar, ~~eliminar~~ vistas; gestionar controladores (actualmente se pueden crear desde el gestor); gestionar el modelo de datos (actualmente se pueden crear y sincronizar desde el gestor).
- Testing.
- ~~Se deben normalizar los nombres de clases (CSS), algunos tienen prefijo `foxtrot-`, otros no.~~ Todo lo que es estilos internos, temporales o funcionales del editor y del framework debe quedar con prefijo `foxtrot-` (ejemplo `.foxtrot-arrastrable-destino`); las clases útiles y estilos de componentes, sin (ejemplo `.contenedor`).
- ~~Crear el gestor de aplicaciones completo con ingregración en la interfaz web de los scripts y asistentes.~~

Luego seguirá:

- Preprocesamiento de los componentes y expresiones (en PHP).
- Profundizar el desarrollo del editor.
- Plantear las ideas propuestas como funcionalidad futura.

### Errores conocidos

- ~~No es posible arrastrar campos de contraseña.~~

## Más información

contacto@foxtrot.ar
