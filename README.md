# AlertaOax

[![Pruebas](https://github.com/JoseJose7520-dev/AlertaOax/actions/workflows/ci.yml/badge.svg)](https://github.com/JoseJose7520-dev/AlertaOax/actions/workflows/ci.yml)

**AlertaOax es una página web que ayuda a las personas de Oaxaca a estar preparadas ante sismos, huracanes, inundaciones y deslaves.**

En Oaxaca tiembla seguido y cada año llegan huracanes a la costa. Cuando pasa algo, la información oficial suele estar repartida entre redes sociales, radio y grupos de WhatsApp, y no siempre llega a tiempo ni es confiable. AlertaOax junta en un solo lugar lo que una familia necesita saber antes, durante y después de una emergencia.

👉 **Pruébala aquí:** https://alertaoax.duckdns.org

> AlertaOax es un apoyo, no un sustituto de los servicios de emergencia. **Si tu vida corre peligro, llama primero al 911.**

## ¿Qué puedes hacer en AlertaOax?

**Si eres ciudadano:**
- Recibir las alertas oficiales de tu región, dentro de la página y, cuando el riesgo es alto o crítico, también en tu correo.
- Ver en un mapa los refugios temporales oficiales de Protección Civil y cómo llegar a ellos.
- Prepararte con guías sencillas, una lista para armar tu mochila de emergencia y un plan familiar.
- Avisar a la autoridad si ves un árbol caído, una inundación o un deslave, y ver cuándo lo atienden.

**Si eres autoridad de Protección Civil:**
- Publicar alertas para una región y avisar a las personas que viven ahí.
- Atender los reportes que envía la población.

**Si eres el administrador:**
- Aprobar a las autoridades antes de que puedan publicar alertas, para que solo se difunda información verificada.
- Consultar cuántas alertas, reportes y personas registradas hay.

Puedes crear tu cuenta con tu correo o entrar con tu cuenta de Google. La página funciona en celular y en computadora, y tiene modo oscuro.

## ¿Por qué lo hicimos?

AlertaOax es nuestro proyecto integrador de **Gestión de Proyectos de Software** en el Instituto Tecnológico de Oaxaca. Lo pensamos para contribuir a dos Objetivos de Desarrollo Sostenible de la ONU: **comunidades más seguras (ODS 11)** y **acción ante el cambio climático (ODS 13)**. Una comunidad que sabe qué hacer ante un desastre se recupera más rápido.

## Equipo 9

| Integrante | Qué hizo |
|---|---|
| José José Osvaldo ([@JoseJose7520-dev](https://github.com/JoseJose7520-dev)) | Product Owner. Diseño y pantallas de la página, mapa, módulo de preparación, documentación y publicación en internet. |
| Ortiz Bautista Josue Ahuitz ([@Mammal117](https://github.com/Mammal117)) | Scrum Master. Servidor y base de datos, alertas, correos, acceso con Google y pruebas automáticas. |

Docente: Martínez Nieto Adelina.

## Cómo trabajamos

Organizamos el proyecto con **Scrum**, en cinco etapas cortas (sprints): preparar el proyecto, construir la base, las alertas, el mapa y la preparación, y al final el panel de administración, el diseño final y la publicación. Repartimos las tareas en el tablero de GitHub, y cada cambio lo revisaba el otro integrante antes de agregarlo al proyecto. Además, cada vez que alguien propone un cambio, GitHub revisa automáticamente que todo siga funcionando (la insignia verde de arriba).

## Documentación

- [Manual de usuario](docs/manual/Manual_de_Usuario_AlertaOax.pdf): cómo usar la página paso a paso, con capturas.
- [Diseño en Figma](docs/diseno/figma/README.md): las pantallas del diseño final.
- [Guía para colaborar](CONTRIBUTING.md): cómo trabajamos con Git y GitHub.
- Para el equipo técnico: [cómo correrlo en tu computadora](backend/README.md), [pruebas con Postman](docs/postman/README.md) y [cómo publicar una nueva versión](deploy/README.md).

## Lo que sigue

Algunas ideas quedaron para una siguiente versión:
- Consultar las guías y el plan familiar aunque no haya internet.
- Mostrar los refugios oficiales de otras regiones cuando Protección Civil los publique (por ahora están los de la Costa).
- Que cada persona pueda borrar su cuenta y sus datos cuando quiera.
- Respaldos automáticos de la información y más funciones para el administrador, como descargar los reportes.

## ¿Con qué está hecho?

Para quien tenga curiosidad: la página está hecha con React, el servidor con Node.js y la información se guarda en PostgreSQL. Está publicada en un servidor de Amazon Web Services con conexión segura (HTTPS), y los mapas son de OpenStreetMap.
