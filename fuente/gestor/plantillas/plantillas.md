`independiente.html`, `independiente.php`

Código fuente para almacenar una vista autónoma o independiente.

`cordova.html`

Código fuente para almacenar una vista para Cordova.

El framework redireccionará a esta vista desde `index-cordova.html`, habiendo establecido en Local Storage la clave `_urlBase` con la url local de la aplicación (ej. `file:///android_asset/www/`).

Una vista preparada para Cordova cuenta con un mecanismo para cargar los recursos del sistema desde la dirección almacenada en `_urlBase`, ya que la url raiz no puede determinarse de forma fehaciente e independiente de la plataforma.

`escritorio.html`

Código fuente para almacenar una vista para el cliente de escritorio.

`controlador.js`

Código predeterminado de nuevos controladores de cliente.

`embebible.html`, `embebible.php`

Código fuente para almacenar una vista embebible.

#### Compilación de archivos CSS

Durante la compilación para producción, los archivos CSS enlazados con etiquetas `<link ... combinar>` se combinarán en dos: Uno del sistema y otro de la aplicación. En el caso de la integración con Cordova, todo los archivos CSS importados precedidos del comentario `/*combinar*/` se combinarán en uno solo.

#### Reemplazo del JSON de la vista

La variable `jsonFoxtrot` será reemplazada al guardar.

#### Reemplazo del tema de la aplicación

El archivo CSS del tema se enlaza con un etiqueta `<link ... tema>`, o en Cordova precedido del comentario `/*tema*/`, a fin de que el gestor pueda reemplazar el mismo en las vistas existentes cuando se modifique el tema de la aplicación.

#### Compilación de los controladores

Todos los controladores se combinarán en el archivo `aplicacion.js`. Por ello, se incluyen con el etiqueta `<script ... controlador>`, o en Cordova precedidos del comentario `/*controlador*/`, a fin de que el script de compilación pueda removerlos.