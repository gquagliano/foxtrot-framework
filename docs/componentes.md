## Índice

- [Introducción](../README.md)
- [Primeros pasos](https://github.com/gquagliano/experimental-foxtrot-framework/wiki/Primeros-pasos)
- [Estructura](estructura.md)
- [Descripción y documentación del API](api.md)
- [Componentes](componentes.md)
- [Desarrollo de componentes](componentes-estructura.md)
- [Pendientes](pendientes.md)

## Componentes

*Referencias:* Al mencionar propiedades, se utiliza el formato: *Etiqueta* (`nombre`), donde *Etiqueta* es cómo se describe la propiedad en el editor y `nombre` es el nombre real de la propiedad, a utilizar en caso de asignar o leer la misma desde JS (`componente.propiedad()`).

#### ![](img/iconos/agenda.png) Agenda

#### ![](img/iconos/arbol.png) Árbol

#### ![](img/iconos/archivo.png) Archivo (campo de carga de archivo)

Permite realizar la carga de un archivo o múltiples archivos. El componente subirá los archivos automáticamente a un directorio seguro del servidor y su valor, tanto del lado del cliente (`componente.valor()`) como al enviar los datos al servidor, será un array de objetos, cada uno con las siguientes propiedades:

`nombre` Nombre original del archivo.

`archivo` Nombre del archivo almacenado en el directorio de temporales `_temporalesPrivados`.

La propiedad *Multimedia* (`multimedia`) permite configurar el campo para que intente obtener audio, fotos o videos desde el dispositivo del cliente. Normalmente esto sólo funcionará en dispositivos móviles, permitiéndo seleccionar un archivo con normalidad cuando no sea soportado.

El evento *Modificación* (`modificacion`) será invocado cuando el usuario seleccione o deseleccione un archivo. Luego, el evento *Listo* (`listo`) será invocado cuando la subida haya finalizado.

El campo mostrará una barra de progreso durante la subida del archivo y, además, puede utilizarse el método `subiendo()` para consultar si la carga está en curso o no. El método `obtenerBase64()` puede utilizarse para generar una vista previa de los archivos seleccionados.

#### ![](img/iconos/boton.png) Botón (botón o enlace)

Doble click iniciará la edición de texto. Presioná ESC para finalizar la edición (mientras el componente presente borde verde, estará activada la edición de texto).

#### ![](img/iconos/bucle.png) Bucle (estructura de control)

Repetirá el contenido del componente por cada elemento del origen de datos.

Cada elemento autogenerado, al igual que toda su descendencia, tendrá asignado como origen de datos el elemento correspondiente de los datos del bucle. Este objeto contará con el método `obtenerIndice()` que devolverá el índice del elemento. Esto es especialmente útil para procesar eventos en componentes, por ejemplo:

    //Dentro del bucle se ha insertado un botón "Eliminar" con el evento Click = clickEliminar
    this.clickEliminar=function(comp) {
        var datos=comp.obtenerDatos(),
            indice=datos.obtenerIndice();
        componentes.bucle.removerFila(indice);
    };

El valor que se establezca al componente, ya sea mediante `establecerValores()` en la ascendencia o en la vista, o mediante `valor()`, se utilizará como origen de datos.

#### ![](img/iconos/buscador.png) Buscador (campo de búsqueda)

Al modificar el valor del campo, invocará el evento **Buscar**, el cual puede ser del lado del servidor o del cliente.

En el caso de métodos de servidor, recibirán un objeto con las propiedades `buscar` y `componente` (nombre del mismo) como primer argumento. En el caso de métodos de cliente, recibirán los parámetros normales de un evento (instancia del componente, objeto del evento), donde el segundo parámetro tendrá la propiedad adicional `buscar`.

El método debe devolver un listado (array) de objetos.

El campo mostrará las etiquetas de acuerdo a la propiedad **Propiedad a mostrar** (puede ser el nombre de una propiedad o una expresión) y devolverá como valor la propiedad establecida en **Propiedad valor** del item seleccionado. Por defecto, la propiedad a mostrar es `titulo` y la propiedad valor `id`. Al establecer el valor del campo, debe especificarse la propiedad valor.

Cuando sea necesario obtener un item específico (por ejemplo, cuando se establece el valor del campo), la invocación será la misma pero incluyendo la propiedad `valor` (en lugar de `buscar`) y se establecerá como valor del campo el primer elemento del resultado.

#### ![](img/iconos/campo.png) Campo (texto, texto multilínea, numérico, contraseña)

#### ![](img/iconos/codigo.png) Código (HTML)

Doble click abrirá la ventana de edición de código.

#### ![](img/iconos/columna.png) Columna

#### ![](img/iconos/columna.png) Columna de tabla

Una columna de tabla de datos (`<td>`). Debe insertarse dentro del componente Fila de tabla, y puede contener cualquier otro componente.

Cada fila, junto con sus columnas (o celdas), se duplicará por cada uno de los elementos del origen de datos de la tabla. Las expresiones tendrán predefinidas las propiedades del elemento que se esté representando.

Cada celda define también el encabezado de la columna, el cual será generado automáticamente cuando se utilice un origen de datos.

#### ![](img/iconos/condicional.png) Condicional (estructura de control)

Oculta o muestra el contenido del componente de acuerdo a la propiedad *Condición* (`condicion`).

Es posible utilizar como condición cualquier [manejador de evento](api/cliente-js.md), o una expresión la cual será evaluada cuando cambie el orgen de datos, se invoque `actualizar()` o se establezca el valor del componente. En las expresiones, `valor` contendrá el valor asignado.

El valor que se establezca al componente, ya sea mediante `establecerValores()` en la ascendencia o en la vista, o mediante `valor()`, se utilizará como origen de datos.

Cabe aclarar que el efecto es solo visual. Al obtener los valores de la vista o del formulario, no afectará la visibilidad de los campos que contenga.

#### ![](img/iconos/contenedor.png) Contenedor

Permite insertar un bloque, el cual puede ser un contenedor (`container` o `container-fluid`) o bien mantenerse como un mero `<div>`.

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

Permite insertar una imagen cuyo origen es adaptativo, es decir, la URL de la imagen puede variar según el tamaño de pantalla. Admite expresiones en la propiedad Origen.

#### ![](img/iconos/importar.png) Importar (estructura de control)

Permite importar una vista embebible dentro otra vista. Casos de uso son separar una vista en partes más pequeñas, reutilizar partes de la vista, o construir una aplicación de una sola página, ideal para aplicaciones *offline* o sólo JS (como Cordova).

Es posible configurar el componente para que importe automáticamente la vista correspondiente a la URL actual activando la propiedad Escuchar navegación.

Este componente recibe eventos externos con el nombre de la vista a cargar. Es decir, un manejador de evento `nombre:vista`, donde `nombre` es el nombre del componente Importar, desencadenará la carga de la vista `vista` (Ver [Cliente JS](api/cliente-js.md) para información sobre estos).

*Cada vez que se cambie la vista, se creará una nueva instancia del controlador*.

#### ![](img/iconos/item-menu.png) Item de menú

Permite agregar un ítem de menú. Puede utilizarse dentro del componente Menú o dentro del componente Contenedor de menú. Cada Item puede contener, a su vez, componentes Menú para generar submenús.

Dentro del editor, los menús no responderán al paso del cursor sobre ellos (*hover*), sino que debe hacerse un click para desplegar y poder editar sus contenidos. Al deseleccionar el ítem de menú, el submenú se cerrará automáticamente.

Cabe aclarar que el doble click iniciará la edición de texto, al igual que en otros componentes. Presioná ESC para finalizar la edición (mientras el componente presente borde verde, estará activada la edición de texto).

#### ![](img/iconos/menu.png) Menú desplegable o contextual

Genera un menú independiente, inicialmente oculto, el cual puede utilizarse luego como menú desplegable cuando el usario interactúe con otro componente (por ejemplo, un botón) o como menú contextual (click secundario). Admite como hijos componentes Item de menú.

Nota: Los menús quedarán siembre visibles dentro el editor, a fin de poder visualizar y modificar los mismos, a menos que se oculten los elementos invisibles con el comando correspondiente de la barra de herramientas.

#### ![](img/iconos/navegacion.png) Navegación (paginado)

#### ![](img/iconos/opcion.png) Campo de opción

Este componente permite generar diferentes tipos de campos de opción:

- Campo de *alternar*, que permite cambiar entre *encendido* y *apagado*.
- Checkbox.
- Botón de opción (*radio*).

Es posible agruparlos para que solo uno de los campos de opción del grupo pueda estar activo a la vez asignando a todos ellos un mismo valor en la propiedad *Grupo* (`grupo`). Al enviar el formulario o consultar el valor de *cualquiera* de ellos, devolverán la propiedad *Valor* (`valor`) del que esté activo. Al asignar el valor a *cualquiera* de ellos, se activará el componente cuya propiedad *Valor* (`valor`) coincida con el valor que se está asignando, o se desactivarán todos si el valor no existe. Excepto cuando se asigne `true`, caso en el que se activará el componente al que se le está asignando el valor.

Los componentes del grupo pueden tener diferentes nombres, lo cual puede ser útil para acceder a cada uno de ellos individualmente.

*Nota:* Si no se asigna la propiedad *Valor* (`valor`), se utilizará por defecto el nombre del componente.

#### ![](img/iconos/pestana.png) Pestaña

Permite añadir una pestaña al componente Pestañas.

El texto del botón del encabezado se establece en la propiedad *Encabezado* (`encabezado`). Las pestañas pueden activarse desde el código mediante `activar()`, o bien con `activarPestana(pestana)` o `activarPestana(indice)` del componente Pestañas.

#### ![](img/iconos/pestanas.png) Pestañas (contenedor de pestañas)

Permite crear un bloque de pestañas o *tabs*. Dentro del bloque, deben insertarse componentes Pestaña únicamente.

El evento *Pestaña activada* (`pestanaActivada`) será invocado cuando la pestaña activa cambie por cualquier motivo (por igual ya sea por interacción del usuario o por código), incluyendo la propiedad `pestana` en el objeto del evento (segundo parámetro) con la instancia del componente Pestaña que acaba de ser activado.

Cabe mencionar que la pestaña activa en el editor será la pestaña inicial en durante la ejecución de la vista.

#### ![](img/iconos/tabla.png) Tabla

Una tabla de datos. Recibe como hijos componentes Fila de tabla. Cuando se asigne un origen de datos, cada una de las filas se duplicará por cada elemento del mismo.

Cada fila, al igual que toda su descendencia, tendrá asignado como origen de datos el elemento correspondiente de los datos de la tabla. Este objeto contará con el método `obtenerIndice()` que devolverá el índice del elemento. Esto es especialmente útil para procesar eventos en componentes dentro de la fila, por ejemplo:

    //Dentro de la fila se ha insertado un botón "Eliminar" con el evento Click = clickEliminar
    this.clickEliminar=function(comp) {
        var datos=comp.obtenerDatos(),
            indice=datos.obtenerIndice();
        componentes.tabla.removerFila(indice);
    };

*Nota:* Los encabezados se definen en las columnas.

#### ![](img/iconos/texto.png) Texto

Doble click iniciará la edición de texto. Presioná ESC para finalizar la edición (mientras el componente presente borde verde, estará activada la edición de texto).

#### Vista

Este componente es la representación lógica del cuerpo de la vista y no puede insertarse.

## Más información

contacto@foxtrot.ar

Íconos por:  
Icons8 - https://icons8.com/icons/material-outlined  
Heroicons - https://heroicons.com/  
Foxtrot (algunos son originales)
