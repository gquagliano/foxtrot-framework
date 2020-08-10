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

6. Se cargan el controlador de la aplicación, el controlador de la vista y los componentes. `inicializar()` es invocado en cada uno de ellos, si existe, al crearse la instancia. Nótese que la carga aún no está completa en este punto.

6. Se inicia la ejecución de `ui`. La vista es HTML+CSS puros, por lo que ya fue dibujada por el navegador. Esta acción preparará las instancias JS de los componentes, el controlador y el controlador de aplicación.

7. Se ejecuta el método `listo()` en el controlador de la aplicación, en el controlador de la vista y en los componentes, en ese orden, cuando exista.

