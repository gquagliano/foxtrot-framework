# Documentación

En desarrollo.

[Índice](indice.md)

## Controladores de cliente (JS)

### Eventos

Los manejadores de eventos pueden establecerse directamente desde el editor o desde el código del controlador mediante `componentes.componente.propiedad()`.

Cuando se establece como cadena, los siguientes valores son posibles:

- `ir:...` Navegará a la vista o a la URL especificada.
- `no-ir:...` Cambiará la URL sin navegar.
- `abrir:...` Abrirá la vista o la URL especificada en una nueva ventana.
- `servidor:...` Invocará el método en el controlador de servidor.
- `apl:...` Invocará el método en el controlador de la aplicación.
- `servidor-apl:...` Invocará el método en el controlador de la aplicación del lado del servidor.
- `nombrecomponente:...` Pasará el valor especificado al componente de nombre `nombrecomponente`. Cada tipo de componente determina qué hacer con ese valor (ver [Componentes](../componentes.md) para más información). Esto se denomina **Evento externo**.
- *Expresiones*: Si la expresión resuelve a una función, será ejecutada.
- *Nombre de método*: Intentará invocar el método en el controlador de la vista principal.

Cuando se utiliza `propiedad()`, el valor puede ser una función.

Se suprimirá la difusión del evento (*bubbling*) y la acción predeterminada cuando se encuentre un manejador válido.

Esto no quita que sea posible establecer eventos adicionales en los elementos del DOM mediante `componentes.componente.obtenerElemento()` y `evento()`, aunque no es lo ideal.

Ver [Estructura de los componentes](../componentes-estructura.md) para más información sobre cómo el componente gestiona internamente los eventos.