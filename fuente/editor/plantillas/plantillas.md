`independiente.html`, `independiente.php`

Código fuente para almacenar una vista autónoma o independiente.

`cordova.html`

Código fuente para almacenar una vista para Cordova.

El framework redireccionará a esta vista desde `index-cordova.html`, habiendo establecido en Local Storage la clave `_urlBase` con la url local de la aplicación (ej. `file:///android_asset/www/`.)

Una vista preparada para Cordova cuenta con un mecanismo para cargar los recursos del sistema desde la dirección almacenada en `_urlBase`, ya que la url raíz no puede determinarse de forma fehaciente e independiente de la plataforma.

`escritorio.html`

Código fuente para almacenar una vista para el cliente de escritorio (por el momento, no tiene diferencias con una vista normal para servidor web).

`controlador.js`

Código predeterminado de nuevos controladores de cliente.

`embebible.html`, `embebible.php`

Código fuente para almacenar una vista embebible.

#### Compilación de archivos CSS

Durante la compilación para producción o integración con Cordova, los archivos CSS enlazados con tags `<link ... combinar>` y los archivos CSS importados en páginas para Cordova se combinarán en uno solo.

#### Reemplazo del tema de la aplicación

El archivo CSS del tema se enlaza con un tag `<link ... tema>`, o en Cordova seguido del comentario `//tema` a fin de que el editor pueda reemplazar el mismo en las vistas preexistentes cuando se modifique el tema de la aplicación.