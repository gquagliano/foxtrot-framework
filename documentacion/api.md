## Índice

- [Introducción](../README.md)
- [Primeros pasos](primeros-pasos.md)
- [Estructura](estructura.md)
- [Descripción y documentación del API](api.md)
- [Editor](editor.md)
- [Componentes](componentes.md)
- [Desarrollo de componentes](componentes-estructura.md)
- [Scripts de compilación](scripts.md)

## Documentación

Acceder al [índice de la documentación](api/indice.md).

## API Cliente / JS

El cliente de Foxtrot tiene las siguientes particularidades:

- Editor de vistas WYSIWYG - Drag&Drop.
- La interfaz está formada por componentes, cada uno con propiedades y métodos. Abstrae por completo la maquetación de la vista.
- Cuenta con componentes que cumplen la función de estructuras de control (condicional, bucle), y con la posibilidad de insertar valores de variables en cualquier ubicación y en cualquier propiedad de componente, y con la posibilidad de configurar llamados a métodos del controlador desde el editor (tanto del cliente y como del servidor agregando el prefijo `servidor:` al nombre del método).
- Las vistas pueden cargarse dentro de una única página (con transición entre las mismas) o compilarse en archivos HTML independientes.
- Permite una comunicación cliente-servidor bidireccional totalmente transparente para el desarrollador.
- Debe estar desacoplado del servidor y ser extremadamente liviano y optimizado para dispositivos / Cordova.
- Sin embargo, estamos considerando introducir algún mecanismo que permita que la vista sea preprocesada en el servidor (PHP), en lugar de la carga normal por ajax, solo disponible para aquellas aplicaciones que se implementen junto con el servidor en el mismo servidor web.
- Permite implementar fácilmente sitios de una página (vista inicial + vistas embebibles), opcionalmente con carga progresiva (las vistas y controladores pueden descargarse combinadas en un solo archivo, o progresivamente a medida que se navega la aplicación).
- Gestor del DOM propio (adiós jQuery).
- El API se desarrolla totalmente en español. Solo mantendremos los nombres internos del lenguaje (eventos, etc.) y siglas en inglés.
- Estamos evaluando posibilidad crear un lenguaje de programación visual para los controladores de ambos lados.

### Comunicación cliente<->servidor transparente

Cada vista cuenta con dos controladores: Uno de servidor (PHP) y otro de cliente (JS). Podría decirse que es un modelo MVCC.

Es posible invocar métodos desde uno a otro en forma transparente para el desarrollador. El servidor solo puede hacerlo como respuesta a una solicitud y es asincrónico. Por ejemplo: (`ctl` es el nombre del controlador para la vista actual)

**JS:**

    ctl.servidor.foo(function(respuesta) {           //Invocará ctl::foo(1,2,3) en PHP y devolverá el retorno de la misma al callback
        ...
    },1,2,3);

    ctl.servidor.bar(1,2,3);                         //Invocará ctl::bar(1,2,3) en PHP

**PHP:**

    function foo($a,$b,$c) {                         //El retorno de la función volverá automáticamente al callback JS
        return 'Hola';
    }

    $ctl->cliente::bar(1,2,3);                       //Invocará ctl.bar(1,2,3) en JS

### Intérprete lógico-matemático (JS)

Desarrollamos un intérprete para permitir la inserción de variables, llamados a funciones y expresiones simples en cualquier texto, donde las expresiones se encierran entre `{` y `}`.

Sintaxis:

- `+ - * / % ^` Operaciones aritméticas.
- `== != < > <= >=` Igualdad/desigualdad.
- `! y o ox` Operaciones lógicas (en español).
- `?:` Operador ternario.
- `foo[bar] foo.bar` Acceso a elementos de arreglos y propiedades de objetos.
- `foo(a,b,c)` Llamado a funciones.
- `v verdadero f falso nulo` Constantes lógicas y otras (en español).
- Variables sin prefijo.

Ejemplo:

    new expresion("{a(b?'Hola':'Adios')}")
        .establecerFunciones({
            a:function(m) { alert(m); }
        })
        .establecerVariables({
            b:true
        })
        .ejecutar();
    
`ejecutar()` devolverá como resultado el valor final de la expresión, o `null`.

Se implementará de forma que tenga acceso en forma predefinida a las propiedades del controlador (por ejemplo, `{test}` hará referencia a la propiedad `test` del controlador de la vista actual) y a múltiples propiedades y funciones utiles del framework (ejemplo, `{ui.obtenerTamano()...}`). Se utilizará en propiedades, eventos y otros contenidos (como ser el componente Etiqueta) en forma automática.

El intérprete deberá portarse a PHP si se ofrece la posibilidad de pre-procesar algunos componentes del lado del servidor.

#### Valores predefinidos

En las propiedades de componentes que admiten expresiones, como así también al utilizar el método `ui.evaluarExpresion()`, los siguientes objetos estarán disponibles:

- `ui`
- `util`
- `aplicacion` Instancia del controlador de la aplicación
- `componentes`

Cada componente [puede definir otras variables o fuciones específicas](componentes.md).

### Compilación

Cada aplicación debe poder compliarse de una de las siguientes formas:

- Un único archivo HTML + Un único archivo JS (contiene tódo el HTML, JS y JSON de todas las vistas y de todo el framework) + Un único archivo CSS
- Un archivo HTML por vista + Un único archivo JS para todos los archivos del framework + Un único archivo JS de la aplicación (contiene todo el HTML, JS y JSON de todas las vistas) + Un único archivo CSS
- Un archivo HTML por vista + Un único archivo JS para todos los archivos del framework + Un archivo JS por vista (carga progresiva) + Un único archivo CSS

En todos los casos, los archivos JS serán compilados con Closure. Debe limpiarse el código HTML y CSS que use almacena dentro de los datos JSON, que están allí solo para el editor.

El editor realizará este proceso automáticemente.

Nota: En algunos casos, cuando hablamos de _archivo HTML_, puede que su extensión sea en realidad `.php` si se va a implementar en servidor web. De esa forma pueden aprovecharse características del servidor, como el acceso a la configuración, evitando que algunos parámetros queden fijos en el código HTML (ejemplo, `<base>`).

Ver: [Scripts de compilación](scripts.md).

**Cordova:**

Luego de ejecutar `php scripts/construir-embebible.php apl` (donde `apl` es el nombre de la aplicación), los archivos de `/embebible/` deben copiarse al directorio `www` de la aplicación Cordova.

Debe configurarse el `config.xml` para apuntar al archivo `index-cordova.html`. La aplicación puede probarse localmente accediendo al mismo archivo.

Algunos parámetros deben ser configurados dentro de `index-cordova.html` antes de construir la aplicación Cordova:

    var _nombreApl="test",              //Nombre de la aplicación
        _vistaInicial="inicio.HTML";    //Nombre de archivo de la vista inicial

Nota: El script `construir-embebible` realizará esta configuración automáticamente (ver [Scripts de compilación](scripts.md)).

La vista inicial debe ser independiente (no embebible).

Eventualmente, el editor realizará este proceso automáticemente.

**Desktop (Windows):**

Se encuentra en desarrollo un cliente para Windows basado en CEFSharp (Chromium). Su funcionamiento e implementación será igual a Cordova (no así a nivel API).

## API Servidor / PHP

El servidor de Foxtrot tiene las siguientes particularidades:

- Es _headless_, totalmente desacoplado del cliente.
- Es multiaplicación (una instalación puede contener varias aplicaciones y la aplicación solicitada se determina a partir del dominio).
- Permite una comunicación cliente-servidor bidireccional totalmente transparente para el desarrollador.
- Permite exponer métodos PHP en forma automática de manera segura.
- El API se desarrolla totalmente en español. Solo mantendremos los nombres internos del lenguaje y siglas en inglés.
- ORM.
- Estamos evaluando posibilidad crear un lenguaje de programación visual para el controlador.

No es posible simplemente asumir que un método público (`public`) lo es en el sentido _hacia afuera_ de la aplicación (normalmente, un método será público porque debe ser accesible por otras clases, _no_ por el usuario). La idea para simplificar la apertura de métodos HTTP es crear un nuevo tipo de clase que sólo contenga dichos métodos (todos expuestos).

Tipos de clases (se determina en forma automática según espacio de nombres y ascendencia):

- Controlador de vista (controlador de servidor--también existe el de cliente, en JS).
- Clases de la aplicación.
- Clases de métodos públicos http.
- Modelo de datos.
- Otras clases del del framework (enrutamiento, librerías de terceros, módulos, componentes, etc.).

**ORM**

Si bien en PHP, PDO suele ser suficiente como ORM, el ORM de Foxtrot persigue los siguientes objetivos:

- Abstracción: Mediante el uso de métodos en lugar de cadenas de texto, eliminar o reducir al mínimo el código SQL haciéndolo más abstracto flexible, permitiendo, en el futuro, implementar otros orígenes de datos, ya sean otros motores de bases de datos como cualquier otra fuente (APIs, archivos, etc.).
- Realizar consultas en español.
- Convertir las entidades a clases para poder extenderlas, modificando o agregando métodos o verbos que resuelvan tareas comunes, como validaciones.
- Al definirse íntegramente mediante objetos, contribuye con el control de errores y el autocompletado al escribir código.
- Permite crear y mantener actualizada la estructura de la base de datos a partir del código PHP del modelo de datos.

[Documentación del ORM](api/orm.md).

**Automatización**

- Asistentes para creación de vistas y controladaores (por ejemplo, un ABMC en base al modelo de datos.)

- (Idea) Posibilidad de construir controladores vinculados al origen de datos automáticamente mediante programación visual o un lenguaje imperativo simple, incluyendo validaciones y llamados a funciones PHP/JS para procesos específicos más complejos.

## Más información

contacto@foxtrot.ar

www.foxtrot.ar

Licencia: Apache 2.0
