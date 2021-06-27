CREATE TABLE IF NOT EXISTS `comentarios` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `e` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `fecha_alta` int(4) DEFAULT NULL,
  `fecha_actualizacion` int(4) DEFAULT NULL,
  `fecha_baja` int(4) DEFAULT NULL,
  `id_item` int(11) DEFAULT NULL,
  `texto` text,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `e` (`e`) USING BTREE,
  KEY `fecha_alta` (`fecha_alta`) USING BTREE,
  KEY `fecha_actualizacion` (`fecha_actualizacion`) USING BTREE,
  KEY `fecha_baja` (`fecha_baja`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `extras` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `e` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `fecha_alta` int(4) DEFAULT NULL,
  `fecha_actualizacion` int(4) DEFAULT NULL,
  `fecha_baja` int(4) DEFAULT NULL,
  `id_item` int(11) DEFAULT NULL,
  `valor_extra` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `e` (`e`) USING BTREE,
  KEY `fecha_alta` (`fecha_alta`) USING BTREE,
  KEY `fecha_actualizacion` (`fecha_actualizacion`) USING BTREE,
  KEY `fecha_baja` (`fecha_baja`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `imagenes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `e` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `fecha_alta` int(4) DEFAULT NULL,
  `fecha_actualizacion` int(4) DEFAULT NULL,
  `fecha_baja` int(4) DEFAULT NULL,
  `id_item` int(11) DEFAULT NULL,
  `archivo` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `e` (`e`) USING BTREE,
  KEY `fecha_alta` (`fecha_alta`) USING BTREE,
  KEY `fecha_actualizacion` (`fecha_actualizacion`) USING BTREE,
  KEY `fecha_baja` (`fecha_baja`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `e` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `fecha_alta` int(4) DEFAULT NULL,
  `fecha_actualizacion` int(4) DEFAULT NULL,
  `fecha_baja` int(4) DEFAULT NULL,
  `titulo` varchar(200) DEFAULT NULL,
  `texto` text,
  `precio` decimal(10,2) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  `duracion` int(11) DEFAULT NULL,
  `usuario` varchar(20) DEFAULT NULL,
  `contrasena` text,
  `id_tipo` int(11) DEFAULT NULL,
  `id_subtipo` int(11) DEFAULT NULL,
  `secreto` varchar(50) DEFAULT NULL,
  `procesado` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `e` (`e`),
  KEY `fecha_alta` (`fecha_alta`),
  KEY `fecha_actualizacion` (`fecha_actualizacion`),
  KEY `fecha_baja` (`fecha_baja`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `tipos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `e` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `fecha_alta` int(4) DEFAULT NULL,
  `fecha_actualizacion` int(4) DEFAULT NULL,
  `fecha_baja` int(4) DEFAULT NULL,
  `titulo` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `e` (`e`) USING BTREE,
  KEY `fecha_alta` (`fecha_alta`) USING BTREE,
  KEY `fecha_actualizacion` (`fecha_actualizacion`) USING BTREE,
  KEY `fecha_baja` (`fecha_baja`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;