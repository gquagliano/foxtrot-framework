<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

define('_inc',1);

include(__DIR__.'/gestor.php');

?>
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="../recursos/css/foxtrot.css">
    <link rel="stylesheet" href="editor.css">
    <title>Gestor de aplicaciones</title>
    <link rel="icon" type="image/png" href="../recursos/img/favicon.png">
  </head>
  <body class="foxtrot-gestor">

    <div id="foxtrot-barra-principal" class="foxtrot-editor foxtrot-barra-herramientas">
        <div class="float-left">
            <label>Aplicación:</label>
            <select onchange="gestor.aplicacionSeleccionada(this)" class="custom-select">
<?php
foreach(gestor::obtenerAplicaciones() as $apl) echo '<option value="'.$apl.'" '.(_gestorAplicacion==$apl?'selected':'').'>'.$apl.'</option>';
?>
            </select>
        </div>
        <button class="btn btn-sm separador" onclick="gestor.nuevaAplicacion()" title="Nueva aplicación"><img src="img/aplicacion.png"></button>
        <button class="btn btn-sm" onclick="gestor.nuevaVista()" title="Nueva vista"><img src="img/vista.png"></button>
        <button class="btn btn-sm separador" onclick="gestor.nuevoControlador()"  title="Nuevo controlador de servidor"><img src="img/controlador.png"></button>
        <button class="btn btn-sm" onclick="gestor.nuevoModelo()" title="Nuevo modelo de datos"><img src="img/modelo.png"></button>
        <button class="btn btn-sm separador" onclick="gestor.sincronizar()" title="Sincronizar base de datos"><img src="img/sincronizar.png"></button>
        <button class="btn btn-sm separador" onclick="gestor.asistentes()" title="Asistentes"><img src="img/asistentes.png"></button>
        <button class="btn btn-sm" onclick="gestor.construirEmbebible()" title="Construir embebible"><img src="img/embebible.png"></button>
        <button class="btn btn-sm" onclick="gestor.construirProduccion()" title="Construir para producción"><img src="img/produccion.png"></button>
        <div class="float-right">
            <img src="img/cargando.svg" id="foxtrot-cargando">
        </div>
    </div>

    <main>
        <div class="container">
            <div class="row">
                <div class="col-12 pb-5">

<?php
if(!count(gestor::obtenerAplicaciones())) {
?>                  
                    <h1>No hay aplicaciones</h1>
                    <p>Creá tu primer aplicación haciendo click en <a href="#" onclick="gestor.nuevaAplicacion()" title="Nueva aplicación"><img src="img/aplicacion.png"></a>.</p>
<?php
} else {
?>                
                    <h1>Vistas</h1>

<?php
    //Construir árbol por subdirectorios
    $arbol=[];
    foreach(gestor::obtenerJsonAplicacion()->vistas as $nombre=>$vista) {
        if(strpos($nombre,'/')===false) {
            //Agregar directamente en la raíz
            $arbol[]=(object)['item'=>$nombre,'ruta'=>$nombre,'vista'=>$vista];
        } else {
            $ruta=explode('/',$nombre);
            $vista=array_pop($ruta);

            //Buscar o crear la ruta, comenzando por la raíz del árbol
            $lista=&$arbol;
            foreach($ruta as $parte) {
                $existe=false;

                //Buscar item [directorio=parte]
                foreach($lista as $item) {
                    if($item->directorio==$parte) {
                        //Si lo encontramos, buscaremos la siguiente parte dentro de los hijos
                        $lista=&$item->hijos;
                        $existe=true;
                        break;
                    }
                }

                //Si no existe, se agrega
                if(!$existe) {
                    $item=(object)['directorio'=>$parte,'hijos'=>[]];
                    $lista[]=$item;
                    //E insertamos dentro de hijos
                    $lista=&$item->hijos;
                }
            }

            //Agregar la vista en los hijos
            $lista[]=(object)['item'=>$vista,'ruta'=>$nombre,'vista'=>$vista];
        }
    }

    if(!count($arbol)) {
?>
<p>No hay vistas.</p>
<?php
    } else {
        //Ordenar
        function ordenarArbol(&$lista) {
            usort($lista,'compararArbol');
            //Avanzar recursivamente
            foreach($lista as $item) 
                if($item->directorio) ordenarArbol($item->hijos);
        }
        function compararArbol($a,$b) {
            //Subir los directorios
            if($a->directorio&&!$b->directorio) return -1;
            if(!$a->directorio&&$b->directorio) return 1;
            //Ordenar alfabéticamente tipos iguales
            if($a->directorio&&$b->directorio) return strcmp($a->directorio,$b->directorio);
            return strcmp($a->item,$b->item);
        }
        ordenarArbol($arbol);

        //Construir
?>
                    <ul class="arbol" id="arbol-vistas">
<?php
        function mostrarArbol($lista,$nivel=0) {
            foreach($lista as $item) {
                if($item->directorio) {
?>
                        <li>
                            <label class="directorio" style="padding-left:<?=$nivel*2+.5?>rem"><?=$item->directorio?>/</label>
                            <ul>
<?php
                    mostrarArbol($item->hijos,$nivel+1);
?>
                            </ul>
                        </li>
<?php
                } else {
?>
                        <li class="clearfix">
                            <label class="vista" style="padding-left:<?=$nivel*2+.5?>rem"><?=$item->item?></label>
                            <div class="opciones">
                                <button class="btn btn-sm" onclick="gestor.abrirEditor('<?=$item->ruta?>')" title="Abrir editor"><img src="img/editar.png"></button>
                                <button class="btn btn-sm" onclick="gestor.renombrarVista('<?=$item->ruta?>')" title="Renombrar" disabled><img src="img/renombrar.png"></button>
                                <button class="btn btn-sm" onclick="gestor.duplicarVista('<?=$item->ruta?>')" title="Duplicar" disabled><img src="img/copiar.png"></button>
                                <button class="btn btn-sm" onclick="gestor.eliminarVista('<?=$item->ruta?>')" title="Eliminar"><img src="img/eliminar.png"></button>
                            </div>
                        </li>
<?php
                }
            }
        }
        mostrarArbol($arbol);
?>
                    </ul>
<?php
        }
    }
?>
                </div>
            </div>
        </div>
    </main>

    <div class="dialogo" id="dialogo-nueva-aplicacion">
        <h1>Nueva aplicación</h1>
<?php
//Asistente crear-aplicacion
asistentes::obtenerAsistente('crear-aplicacion')->obtenerFormulario();
?>
        <div class="text-center">
            <button type="button" onclick="gestor.aceptarNuevaAplicacion()" class="btn btn-sm btn-primary">Aceptar</button>
            <button type="button" onclick="gestor.cerrarDialogo(this)" class="btn btn-sm">Cancelar</button>
        </div>
    </div>

    <div class="dialogo" id="dialogo-nueva-vista">
        <h1>Nueva vista</h1>
        <div class="form-group row">
            <label class="col-3 col-form-label">Ruta y nombre</label>
            <div class="col-sm-9">
                <input type="text" class="form-control" name="nombre">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label">Modo</label>
            <div class="col-sm-6">
                <select class="custom-select" name="modo">
                    <option value="independiente">Independiente</option>
                    <option value="embebible">Embebible</option>
                </select>
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label">Cliente</label>
            <div class="col-sm-6">
                <select class="custom-select" name="cliente">
                    <option value="web">Web</option>
                    <option value="cordova">Cordova</option>
                    <option value="escritorio">Escritorio</option>
                </select>
            </div>
        </div>
        <div class="text-center">
            <button type="button" onclick="gestor.aceptarNuevaVista()" class="btn btn-sm btn-primary">Aceptar</button>
            <button type="button" onclick="gestor.cerrarDialogo(this)" class="btn btn-sm">Cancelar</button>
        </div>
    </div>

    <div class="dialogo" id="dialogo-nuevo-controlador"">
        <h1>Nuevo controlador</h1>
<?php
//Asistente crear-controlador
asistentes::obtenerAsistente('crear-controlador')->obtenerFormulario();
?>
        <div class="text-center">
            <button type="button" onclick="gestor.aceptarNuevoControlador()" class="btn btn-sm btn-primary">Aceptar</button>
            <button type="button" onclick="gestor.cerrarDialogo(this)" class="btn btn-sm">Cancelar</button>
        </div>
    </div>

    <div class="dialogo" id="dialogo-nuevo-modelo">
        <h1>Nuevo modelo de datos</h1>
<?php
//Asistente crear-modelo
asistentes::obtenerAsistente('crear-modelo')->obtenerFormulario();
?>
        <div class="text-center">
            <button type="button" onclick="gestor.aceptarNuevoModelo()" class="btn btn-sm btn-primary">Aceptar</button>
            <button type="button" onclick="gestor.cerrarDialogo(this)" class="btn btn-sm">Cancelar</button>
        </div>
    </div>

    <div class="dialogo" id="dialogo-sincronizacion">
        <h1>Sincronizar base de datos</h1>
<?php
//Asistente sincronizar-bd
asistentes::obtenerAsistente('sincronizar-bd')->obtenerFormulario();
?>
        <div class="text-center">
            <button type="button" onclick="gestor.aceptarSincronizacion()" class="btn btn-sm btn-primary">Aceptar</button>
            <button type="button" onclick="gestor.cerrarDialogo(this)" class="btn btn-sm">Cancelar</button>
        </div>
    </div>

    <div class="dialogo" id="dialogo-asistentes">
        <div id="asistentes-seleccion">   
            <h1>Asistentes</h1>
            <div class="form-group row">
                <label class="col-3 col-form-label">Asistente</label>
                <div class="col-sm-9">
                    <select onchange="gestor.seleccionarAsistente(this)" class="custom-select">
                        <option value="">Seleccioná...</option>
<?php
//Otros asistentes
$asistentes=asistentes::obtenerAsistentes();
foreach($asistentes as $asistente) {
    if(!$asistente->visible) continue;
    echo '<option value="'.$asistente->nombre.'">'.$asistente->titulo.'</option>';
}
?>
                    </select>
                </div>
            </div>
            <div class="text-center">
                <button type="button" onclick="gestor.cerrarDialogo(this)" class="btn btn-sm">Cancelar</button>
            </div>
        </div>

<?php
foreach($asistentes as $asistente) {
    if(!$asistente->visible) continue;
?>
        <div class="formulario-asistente d-none" id="asistente-<?=$asistente->nombre?>">
            <h1><?=$asistente->titulo?></h1>
<?php
    asistentes::obtenerAsistente($asistente->nombre)->obtenerFormulario();
?>
            <div class="text-center">
                <button type="button" onclick="gestor.procesarAsistente('<?=$asistente->nombre?>','asistente-<?=$asistente->nombre?>')" class="btn btn-sm btn-primary">Aceptar</button>
                <button type="button" onclick="gestor.cerrarDialogo(this)" class="btn btn-sm">Cancelar</button>
            </div>
        </div>
<?php
}
?>
    </div>

    <div class="dialogo" id="dialogo-construir-embebible">
        <h1>Construir embebible</h1>
<?php
//Asistente construir-cordova
asistentes::obtenerAsistente('construir-cordova')->obtenerFormulario();
?>        
        <div class="text-center">
            <button type="button" onclick="gestor.aceptarConstruirEmbebible()" class="btn btn-sm btn-primary">Aceptar</button>
            <button type="button" onclick="gestor.cerrarDialogo(this)" class="btn btn-sm">Cancelar</button>
        </div>
    </div>

    <div class="dialogo" id="dialogo-construir-produccion">
        <h1>Construir para producción</h1>
<?php
//Asistente construir-produccion
asistentes::obtenerAsistente('construir-produccion')->obtenerFormulario();
?>
        <div class="text-center">
            <button type="button" onclick="gestor.aceptarConstruirProduccion()" class="btn btn-sm btn-primary">Aceptar</button>
            <button type="button" onclick="gestor.cerrarDialogo(this)" class="btn btn-sm">Cancelar</button>
        </div>
    </div>

    
    <script src="../cliente/foxtrot.js"></script>
    <script>
    "use strict";
    var nombreAplicacion="<?=_gestorAplicacion?>";
    </script>
    <script src="gestor.js"></script>
  </body>
</html>