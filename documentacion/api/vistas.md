# Documentación

En desarrollo.

[Índice](indice.md)

## Vistas

### Eventos de usuario (Componentes)

Los componentes producen diferentes eventos según la interacción del usuario (distintos a los eventos nativos del DOM). Existen eventos comunes a todos los componentes y eventos específicos de cada componente concreto.

Los manejadores de estos eventos se asignan como propiedades y pueden configurarse en tiempo de ejecución o desde el editor, como cadenas.

#### En tiempo de ejecución, desde el controlador:

    componentes.nombreComponente.propiedad(null,"click",function(componente,evento) {
        console.log("Hola");
    });

Nota: El primer parámetro es `null` ya que se trata del tamaño de pantalla, mientras que las propiedades correspondientes a eventos son globales.

`componente` es la instancia del componente en el cual se produjo el evento.

`evento` es el objeto nativo del evento más las siguientes propiedades:

- `nombre` Nombre del componente.
- `componente` Instancia del componente.
- `noDetener` Función que evita que se detenga la propagación del evento (`stopPropagation`).
- `noPrevenirPredeterminado` Función que evita que se suspenda la acción predeterminada (`preventDefault`).

Cuando, durante la propagación del evento, se encuentre un manejador válido, el framework detendrá tanto la propagación como la acción predeterminada, a menos que se invoquen las funciones `evento.noDetener()` o `evento.noPrevenirPredeterminado()`.

#### Desde el editor:

Durante el diseño de la vista, pueden establecerse los manejadores de eventos como cadenas en las distintas propiedades del componente. Admite los siguientes formatos:

- `ir:URL` Navega a una URL arbitraria.
- `ir:nombreDeVista` Navega a una vista, dado su nombre.
- `popup:URL` Abre una ventana emergente con una URL arbitraria.
- `popup:nombreDeVista` Abre una ventana emergente con una vista, dado su nombre.
- `servidor:metodo` Invoca el método `metodo` en el controlador del lado del servidor (clase pública del mismo nombre que el controlador de la vista, ver [Controladores de servidor](cliente-php.md)).
- `nombreDeComponente:valor` Envía el valor `valor` al componente de nombre `nombreDeComponente`. Cada componente interpreta este suceso en forma específica, pero su función principal es la de implementar la navegación a vistas secundarias con el componente Importar (ver [Componentes](../componentes.md)).
- `metodo` Invoca el método `metodo` en el controlador JS de la vista.

Las expresiones presentes en la cadena serán ejecutadas previo a la evaluación anterior (ver descripción del intérprete en la [Descripción y documentación del API](../api.md)). El valor puede contener una o múltiples expresiones, cada una encerrada entre `{` y `}`.

Cuando la cadena contenga una única expresión y la misma resuelva a una función, dicha función será invocada.

Todas los llamados a funciones tendrán los mismos dos parámetros `componente` y `evento` descriptos anteriormente.

