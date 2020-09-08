# Aplicación de ejemplo

Se incluye una aplicación de ejemplo, la cual por el momento consiste en un login y un ABM de usuarios, demostrando:

- Vistas, diseñadas con el editor.
- Componentes básicos. Uso de las funciones de acceso a datos y del intérprete de expresiones.
- Eventos.
- Llamados a métodos del servidor.
- Llamados a métodos del controlador principal de la aplicación.
- Respuestas y redireccionamientos desde el servidor.
- Modelo de datos y ORM.
- Uso del gestor de sesión.

## Configuración

1. Construir el framework, si aún no fue construído.

2. Configurar las credenciales y el nombre de la base de datos en el archivo `config.php` de la aplicación.

3. Configurar el dominio de la aplicación en la configuración global (`/desarrollo/config.php`). Completar la configuración general del framework si aún no fue hecho (ver documentación en el código).

4. Construir la base de datos mediante el script `php sincronizar-bd -a=ejemplo`.

Ver [Scripts de compilación y asistentes](../../../documentacion/scripts.md) para más detalles sobre el uso de los mismos.

Ver [Primeros pasos](../../../documentacion/primeros-pasos.md) para instrucciones detalladas sobre la instalación de Foxtrot.

#### ¿Y el SQL?

¡No hay! El framework creará las tablas de la base de datos y hasta creará datos de ejemplo en forma automática, a partir del código fuente del modelo de datos.