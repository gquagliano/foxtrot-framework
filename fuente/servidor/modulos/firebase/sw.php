<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Service worker para recepción de notificaciones FCM.

define('_inc',1);

include(__DIR__.'/../../foxtrot.php');
foxtrot::inicializar();

$config=foxtrot::fabricarModulo('firebase',true)->obtenerConfiguracion();

header('Content-Type: application/javascript',true);
?>
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * @version 1.0
 */
importScripts('https://www.gstatic.com/firebasejs/7.15.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.15.0/firebase-messaging.js');
firebase.initializeApp(<?=json_encode($config)?>);
if(firebase.messaging.isSupported()) firebase.messaging();