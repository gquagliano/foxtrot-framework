## Índice

- [Introducción](../README.md)
- [Primeros pasos](primeros-pasos.md)
- [Estructura](estructura.md)
- [Descripción y documentación del API](api.md)
- [Editor](editor.md)
- [Componentes](componentes.md)
- [Desarrollo de componentes](componentes-estructura.md)
- [Scripts de compilación y asistentes](scripts.md)

## Componentes

#### ![](img/iconos/agenda.png) Agenda

#### ![](img/iconos/alternar.png) Alternar (campo Si-No)

#### ![](img/iconos/arbol.png) Árbol

#### ![](img/iconos/archivo.png) Archivo (campo de carga de archivo)

#### ![](img/iconos/boton.png) Botón (botón o enlace)

Doble click iniciará la edición de texto. Presioná ESC para finalizar la edición (mientras el componente presente borde verde, estará activada la edición de texto).

#### ![](img/iconos/bucle.png) Bucle (estructura de control)

#### ![](img/iconos/buscador.png) Buscador (campo de búsqueda)

#### ![](img/iconos/campo.png) Campo (texto, texto multilínea, numérico, contraseña)

#### ![](img/iconos/checkbox.png) Checkbox (campo de opción única o múltiple)

#### ![](img/iconos/codigo.png) Código (HTML)

Doble click abrirá la ventana de edición de código.

#### ![](img/iconos/columna.png) Columna

#### ![](img/iconos/columna.png) Columna de tabla

Una columna de tabla de datos (`<td>`). Debe insertarse dentro del componente Fila de tabla, y puede contener cualquier otro componente.

Cada fila, junto con sus columnas (o celdas), se duplicará por cada uno de los elementos del origen de datos de la tabla. Las expresiones tendrán predefinidas las propiedades del elemento que se esté representando.

Cada celda define también el encabezado de la columna, el cual será generado automáticamente cuando se utilice un origen de datos.

#### ![](img/iconos/condicional.png) Condicional (estructura de control)

#### ![](img/iconos/contenedor.png) Contenedor

#### ![](img/iconos/contenedor-menu.png) Contenedor de menú: Barra de navegación o menú lateral (deslizable)

Genera un menú de navegación, el cual puede utilizarse como barra de navegación (fija o flotante) o como menú lateral (deslizable). Admite como hijos componentes Item de menú (*no componentes Menú*).

#### ![](img/iconos/deslizable.png) Deslizable (*slider*)

#### ![](img/iconos/desplegable.png) Desplegable (campo)

#### ![](img/iconos/dialogo.png) Diálogo (modal)

#### ![](img/iconos/espaciador.png) Espaciador

#### ![](img/iconos/etiqueta.png) Etiqueta (estructura de control)

Este componente permite insertar valores del origen de datos. Presenta dos posibles comportamientos: Puede especificarse una propiedad (o una ruta con formato `foo.bar`) en la propiedad Propiedad, o bien una expresión en la propiedad Contenido. Todas las propiedades del origen de datos estarán disponibles en las expresiones, además de los valores estándar ([más información sobre las expresiones](api.md)).

#### ![](img/iconos/fecha.png) Fecha (campo de selección de fecha)

#### ![](img/iconos/fila.png) Fila 

#### ![](img/iconos/fila.png) Fila de tabla

Representación lógica de una fila (`<tr>`) de una tabla de datos (componente Tabla). Recibe como hijos componentes Columna de tabla.

*Nota:* Los encabezados se definen en las columnas. No es necesario agregar una fila para los encabezados cuando se vaya a utilizar un origen de datos.

#### ![](img/iconos/form.png) Formulario

Este componente es solo una representación lógica de un formulario, sin otra funcionalidad que la de un contenedor.

#### ![](img/iconos/hora.png) Hora (campo de selección de hora)

#### ![](img/iconos/icono.png) Ícono (¿FontAwesome?)

#### ![](img/iconos/imagen.png) Imagen

Permite insertar una imagen cuyo origen es adaptativo, es decir, la URL de la imagen puede variar según el tamaño de pantalla.

#### ![](img/iconos/importar.png) Importar (estructura de control)

Permite importar una vista embebible dentro otra vista. Casos de uso son separar una vista en partes más pequeñas, reutilizar partes de la vista, o construir una aplicación de una sola página, ideal para aplicaciones *offline* o sólo JS (como Cordova).

Es posible configurar el componente para que importe automáticamente la vista correspondiente a la URL actual activando la propiedad Escuchar navegación.

Este componente recibe eventos externos con el nombre de la vista a cargar. Es decir, un manejador de evento `nombre:vista`, donde `nombre` es el nombre del componente Importar, desencadenará la carga de la vista `vista` (Ver [Cliente JS](api/cliente-js.md) para información sobre estos).

#### ![](img/iconos/item-menu.png) Item de menú

Permite agregar un ítem de menú. Puede utilizarse dentro del componente Menú o dentro del componente Contenedor de menú. Cada Item puede contener, a su vez, componentes Menú para generar submenús.

Dentro del editor, los menús no responderán al paso del cursor sobre ellos (*hover*), sino que debe hacerse un click para desplegar y poder editar sus contenidos. Al deseleccionar el ítem de menú, el submenú se cerrará automáticamente.

Cabe aclarar que el doble click iniciará la edición de texto, al igual que en otros componentes. Presioná ESC para finalizar la edición (mientras el componente presente borde verde, estará activada la edición de texto).

#### ![](img/iconos/menu.png) Menú desplegable o contextual

Genera un menú independiente, inicialmente oculto, el cual puede utilizarse luego como menú desplegable cuando el usario interactúe con otro componente (por ejemplo, un botón) o como menú contextual (click secundario). Admite como hijos componentes Item de menú.

Nota: Los menús quedarán siembre visibles dentro el editor, a fin de poder visualizar y modificar los mismos, a menos que se oculten los elementos invisibles con el comando correspondiente de la barra de herramientas.

#### ![](img/iconos/navegacion.png) Navegación (paginado)

#### ![](img/iconos/opciones.png) Opciones (grupo de botones de opción)

#### ![](img/iconos/pestana.png) Pestaña

#### ![](img/iconos/pestanas.png) Pestañas (contenedor de pestañas)

#### ![](img/iconos/tabla.png) Tabla

Una tabla de datos. Recibe como hijos componentes Fila de tabla. Cuando se asigne un origen de datos, cada una de las filas se duplicará por cada elemento del mismo.

*Nota:* Los encabezados se definen en las columnas.

#### ![](img/iconos/texto.png) Texto

Doble click iniciará la edición de texto. Presioná ESC para finalizar la edición (mientras el componente presente borde verde, estará activada la edición de texto).

#### Vista

Este componente es la representación lógica del cuerpo de la vista y no puede insertarse.

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0

Íconos (en su mayoría) por Icons8 - https://icons8.com/icons/material-outlined
