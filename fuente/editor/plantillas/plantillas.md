`autonoma.html`

Código fuente para almacenar una vista autónoma o independiente.

`cordova.html`

Código fuente para almacenar una vista para Cordova.

El framework redireccionará a esta vista desde `index-cordova.html`, habiendo establecido en Local Storage la clave `_urlBase` con la url local de la aplicación (ej. `file:///android_asset/www/`.)

Una vista preparada para Cordova cuenta con un mecanismo para cargar los recursos del sistema desde la dirección almacenada en `_urlBase`, ya que la url raíz no puede determinarse de forma fehaciente e independiente de la plataforma.

`escritorio.html`

Código fuente para almacenar una vista para el cliente de escritorio (por el momento, no tiene diferencias con una vista normal para servidor web).

##### Vista embebible

Las vistas embebibles se almacenan en JSON, por lo que no se requiere una plantilla para las mismas.