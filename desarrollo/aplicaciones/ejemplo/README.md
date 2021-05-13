# Aplicación de demostración

## Configuración

1. Si aún no fue construído, construir el framework. Ver [Primeros pasos](https://github.com/gquagliano/foxtrot-framework/wiki/Primeros-pasos)

2. Configurar las credenciales y el nombre de la base de datos en el archivo `config.php` de esta aplicación (`/desarrollo/aplicaciones/ejemplo/config.php`).

3. Completar la configuración general del framework, si aún no fue hecho (`/desarrollo/config.php`; ver documentación en el mismo código), y establecer el dominio a utilizar para esta aplicación, por ejemplo:

    $dominios=[
        'localhost'=>'ejemplo'
    ];

4. Ingresar al gestor de aplicaciones, seleccionar la aplicación `ejemplo` y construir la base de datos mediante el comando ![](img/gestor/sincronizar.png) *Sincronizar base de datos*. Ver [Gestor de aplicaciones](https://github.com/gquagliano/foxtrot-framework/wiki/Gestor-de-aplicaciones).

## Qué ver

### Ejemplos de uso del ORM

Ver código fuente de los archivos en `servidor/modelo/` de esta aplicación.

### Demostración de un API REST

Ingresar en `http://localhost/foxtrot-framework/desarrollo/api/pruebas/demostracionORM` (ajustar la URL según corresponda a la instalación de Foxtrot).

Este *endpoint* (método) ejecuta diferentes procesos en la base de datos, como ejemplo y demostración. Puede verse el código fuente en el archivo `servidor/controladores/api/pruebas.pub.php` de esta aplicación.

### Acceso a la aplicación web

***Esto aún no se ha publicado***

Ingresar a la URL del framework. Por ejemplo, http://localhost/foxtrot-framework/desarrollo/.

Usuario: `admin`  
Contraseña: `admin`

### Ejemplos de vistas y controladores del lado del cliente (JS)

***Esto aún no se ha publicado***

Puede utilizarse el [Gestor de aplicaciones](https://github.com/gquagliano/foxtrot-framework/wiki/Gestor-de-aplicaciones) para visualizar y editar las vistas. El código JS puede encontrarse en el archivo `cliente/aplicacion.js` y los archivos dentro de `cliente/controladores/` de esta aplicación.

### Ejemplos de controladores del lado del servidor (PHP)

***Esto aún no se ha publicado***

El código PHP que responde a las diferentes solicitudes AJAX desde la aplicación web puede encontrarse en el archivo `servidor/aplicacion.pub.php` y los archivos `.pub.php` dentro de `servidor/controladores/` de esta aplicación.

 > Nota: Los archivos `.pub.php` contienen clases con métodos que pueden ser invocados desde el cliente (siempre que, además, sean públicos--`public`), mientras que los archivos simplemente `.php` contienen clases con las cuales únicamente se puede trabajar dentro del servidor. Ver [Comunicación cliente servidor](https://github.com/gquagliano/foxtrot-framework/wiki/Comunicación-cliente-servidor).

## Dudas, comentarios, consultas

Escribinos 🙃 contacto@foxtrot.ar o en [Discussions](https://github.com/gquagliano/foxtrot-framework/discussions).

O, si se trata de problemas o errores, abrí tu caso en [Issues](https://github.com/gquagliano/foxtrot-framework/issues).

