# Documentación

En desarrollo.

[Índice](indice.md)

## Definición y configuración de una aplicación

## Ciclo de vida de la aplicación

En líneas generales, sin entrar en detalles de los procesos internos del framework:

*Servidor:*

1. Toda solicitud es dirigida a `index.php` donde se inicializa el framework.

2. Se determina la aplicación solicitada, se cargan todos sus archivos y configuración, se instancian las clases principales de la aplicación (privada y pública).

3. Se interpreta la solicitud utilizando el enrutador de la aplicación.

4. Se procesa la solicitud invocando el método correspondiente y devolviendo una orden (valor de retorno u otra acción) o bien la vista solicitada.

*Cliente:*

5. Se procesa el JSON de la aplicación.

6. Se cargan el controlador de la aplicación, el controlador de la vista y los componentes. `inicializar()` e `inicializado()` son invocados en cada uno de ellos, si existen, al crearse la instancia. Nótese que la carga aún no está completa en este punto.

La diferencia entre `inicializar` e `inicializado` es que `inicializar` es un método interno, que se puede sobreescribir pero al hacerlo se debe:
- Invocar `this.inicializarControlador()` o `this.inicializarAplicacion()`, según corresponda, y
- Devolver `this` siempre.
Mientras que `inicializar` es solo un evento, no necesita invocar un método del padre y puede no tener valor de retorno. La función es la misma, pero es más simple de escribir.

7. Se inicia la ejecución de `ui`. La vista es HTML+CSS puros, por lo que ya fue dibujada por el navegador. Esta acción preparará las instancias JS de los componentes, el controlador y el controlador de aplicación.

8. Se ejecuta el método `listo()` en el controlador de la vista, en el controlador de la aplicación y en los componentes, en ese orden, cuando existan.

9. Al modificarse la URL, el método `navegación(nombreVista)` es ejecutado en el controlador de la vista, en el controlador de la aplicación y en los componentes, en ese orden, cuando existan. Al presionarse el botón atrás del dispositivo, se invocarán los métodos `volver()`.

10. En caso de error en la comunicación cliente-servidor, se invocará `errorServidor()` el controlador de la vista y en el controlador de la aplicación.

*Eventos (cliente):*

Ver [Controladores de cliente (JS)](cliente-js.md).