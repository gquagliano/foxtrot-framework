<!doctype html><html lang="es"><head>
    <meta charset="utf-8">
    <base href="<?=\foxtrot::obtenerUrl()?>">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover, target-densitydpi=device-dpi">
    <link rel="stylesheet" href="recursos/css/foxtrot.css" combinar="foxtrot">
    <link rel="stylesheet" href="recursos/css/tema-sistema.css" combinar="foxtrot" tema="">
    <link rel="stylesheet" href="aplicacion/recursos/css/estilos.css" combinar="aplicacion">
    <link rel="stylesheet" href="aplicacion/cliente/vistas/inicio.css" combinar="aplicacion">
    <meta name="generator" content="Foxtrot 7">
  <title>Foxtrot Framework</title></head>
  <body class="tamano-xl">
    <div id="foxtrot-cuerpo" class="componente vista contenedor inicio-vista-3 d-flex flex-column justify-content-center" data-fxid="inicio-2"><div class="container componente contenedor inicio-contenedor-7 py-5" data-fxid="inicio-4"><h1 class="componente texto inicio-texto-6 mt-0" data-fxid="inicio-5">Hola</h1><p class="texto componente inicio-texto-9 my-0" data-fxid="inicio-8">Estamos trabajando en la aplicación de demostración...</p></div></div>
    <div id="foxtrot-barra-precarga" class="aparece"></div>
    <script src="cliente/foxtrot.js"></script>
    <script src="aplicacion/cliente/controladores/inicio.js" controlador=""></script>
    <script src="aplicacion/cliente/aplicacion.js"></script>
    <script>
    var jsonFoxtrot='{\
    "version": 1,\
    "componentes": [\
        {\
            "id": "inicio-2",\
            "selector": ".inicio-vista-3",\
            "componente": "vista",\
            "propiedades": {\
                "titulo": "Foxtrot Framework",\
                "estructura": {\
                    "g": "flexVertical"\
                },\
                "alineacionItems": {\
                    "g": "centro"\
                }\
            }\
        },\
        {\
            "id": "inicio-4",\
            "selector": ".inicio-contenedor-7",\
            "componente": "contenedor",\
            "propiedades": {\
                "clase": "py-5"\
            }\
        },\
        {\
            "id": "inicio-5",\
            "selector": ".inicio-texto-6",\
            "componente": "texto",\
            "propiedades": {\
                "formato": "h1",\
                "clase": "mt-0"\
            }\
        },\
        {\
            "id": "inicio-8",\
            "selector": ".inicio-texto-9",\
            "componente": "texto",\
            "propiedades": {\
                "clase": "my-0"\
            }\
        }\
    ],\
    "nombre": "inicio"\
}';
    ui.inicializar("inicio")
        .establecerJson(jsonFoxtrot)
        .ejecutar();
    </script>
  
</body></html>