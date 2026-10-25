# Continuidad para la siguiente sesión

Resumen consolidado del incremento y texto propuesto para commit: [registro del 25 de octubre](registro-2026-10-25.md). Las notas históricas de esta sesión no sustituyen la comprobación del estado real.

## Reparación de XAMPP — 25 de octubre de 2026

- MariaDB se cerraba al iniciar por corrupción de `mysql.db`, confirmada en eventos de Windows. El archivo `db.MAD` contenía texto de registros, no páginas de datos recuperables.
- Respaldo físico completo, con hashes verificados antes de intervenir: `backups/xampp-mysql-20261025-012841/` (excluido de Git; contiene datos sensibles).
- La reparación aislada no recuperó filas. Se restauraron únicamente `mysql/db.MAD` y `mysql/db.MAI` desde `C:/xampp/mysql/backup/mysql/`; la definición `db.frm` coincide por SHA-256. Se conservaron las cuentas de `global_priv` y las bases de proyectos. Los permisos personalizados por base de la tabla dañada deben volver a configurarse si se necesitan.
- `CHECK TABLE mysql.db, mysql.global_priv` y la comprobación de todas las tablas de `redcero_dev` dieron OK. Reinicio limpio verificado y `/api/health` responde `ok`. Se comprobaron 4 usuarios, 2 partidas y 91 eventos del sector. MariaDB quedó encendido.
- Esto sustituye las notas anteriores sobre `mysql.db` todavía dañada. Sigue pendiente habilitar y verificar `redcero_app` y retirar la conexión temporal root; no se modificó `.env` en esta reparación.

Actualizado: 25 de octubre de 2026. El usuario pidió continuar estas tareas. Este archivo distingue comprobaciones realizadas de pendientes.

## Reanudación — 25 de octubre de 2026

- Nuevo reparto autorizado: docentes aprobados crean y gestionan sus grupos e invitaciones; administración conserva acceso global para soporte y asignación manual. Alumnos aceptan la invitación en la bienvenida y siguen jugando, sin tareas de administración. Migración `005_group_invites` aplicada tras respaldo `backups/before-group-invites.sql`. No modifica partidas existentes. Invitaciones de siete días, revocables/reemplazables, almacenadas como hash; retirar integrantes conserva sus cuentas y partidas. Ocho pruebas aprobadas contra instancia aislada con proveedores desactivados; cubren creación docente, aislamiento, canje repetido, revocación, caducidad, acceso administrativo y conservación de avance. Pendiente validar visualmente el nuevo flujo en laptop/teléfono.

- Panel docente muestra alias y correo de la cuenta conectada junto a «Cerrar sesión», también para solicitudes pendientes. La identidad se limpia al salir o expirar sesión. `admin_local` no tiene correo registrado: mostrarlo explícitamente, sin inferirlo del destinatario de notificaciones. Respuestas autenticadas de estado y grupos verificadas con la nueva información.

- Validación final del usuario: «ya recibí el SMS, todo el flujo funcionó bien con email y SMS». Entrega real de ambos canales confirmada; el SMS llegó con demora y no se reenvió. Los correos inicialmente llegaron a spam: sigue pendiente revisar autenticación/reputación del remitente sin atribuir una causa hasta inspeccionar cabeceras. La confirmación no detalla la consulta de las dos partidas ni la prueba visual de aislamiento entre grupos; mantener esas comprobaciones pendientes.

- SMS LabsMobile integrado para avisar a administración de nuevas solicitudes, remitente `RedCero`. Teléfono y credenciales en `.env`, excluido de Git. Correo y SMS activos en instancia local. Panel administrativo consulta solicitudes cada 10 segundos estando visible.
- Prueba real: cuenta `docente_aviso_mvnlppi5`, id 84, con correo administrativo proporcionado por el usuario, institución «Validación local de notificaciones». Registro HTTP 201; proveedor de correo aceptó los avisos y LabsMobile aceptó SMS real, referencia `6addc610d60a5`. Cuenta de prueba conservada para gestión visual; no es docente real. En la última consulta las dos solicitudes existentes estaban aprobadas. No se guardó su contraseña ni quedó sesión de prueba abierta. Recepción física confirmada por el usuario posteriormente. Ocho pruebas aprobadas en instancia aislada con envíos desactivados.

- Integrados avisos por API de correo para nueva solicitud (docente y administración), aprobación y rechazo (docente), con estado de notificación en la interfaz. Destinatario administrativo confirmado por el usuario: `admin@appsevolution.com.mx`. Configuración local en `.env`; sin cambios de esquema. Sin cola/reintentos persistentes; recepción real ya confirmada por el usuario. Seis pruebas aprobadas en instancia aislada, con envíos externos desactivados y proveedor simulado en tests de correo.

- `npm test`: 4 pruebas aprobadas, 0 fallos, después de reparar MariaDB. Incluyen autenticación, reglas del sector y flujo docente por API con aislamiento y limpieza de cuentas temporales.
- Las partidas de `jccp3033` y `ccardenas` conservan `complete:true`; `jccp33` es otra cuenta y tiene una partida inicial. No confundir los alias ni trasladar avances entre cuentas.
- El grupo «Piloto de desarrollo» conserva tres jugadores y `docente_local` como administrador asignado. La validación visual del punto 1 sigue pendiente; las pruebas API no la sustituyen.
- El usuario indicó que no dispone de la contraseña de `docente_local`. No se ha restablecido. Resolver el acceso administrativo antes de validar su inicio de sesión en la interfaz.
- A petición del usuario se creó `admin_local` con rol administrador, conservando `docente_local`. Inicio de sesión y acceso a solicitudes y grupos verificados por API; sesión de comprobación cerrada. Contraseña entregada al usuario, no guardada en archivos. Usar `admin_local` para la validación visual pendiente desde la otra laptop en `http://192.168.1.150:3000/docentes/`.

## Orden acordado

### Prioridades y aclaraciones nuevas — 25 de octubre de 2026

- Requisitos persistentes actualizados en `prompt-maestro.md`: honestidad explícita, publicación inicial real con dos niveles y separación entre equipos de juego libres y grupos de seguimiento docente. Los docentes deben poder incorporar jugadores por alias/correo compartido; la implementación actual sigue reservando esa asignación manual a administración, por lo que requiere ampliación con autorización por grupo. No considerar ese flujo completado.
- Incorporados cuatro ejes de nivelación: proporcionalidad/porcentajes; operaciones razonadas de varios pasos; fracciones/decimales y sus conversiones; áreas/perímetros contextualizados. Aplicarlos como decisiones del juego, no ejercicios mecánicos ni cuestionarios. Ver propuestas en `plan-inicial.md`.
- Próximo entregable de diseño: matriz de los niveles 1 y 2 con objetivos, mecanismos, variantes, ayudas y evidencia individual. No prometer que estos cuatro ejes agotan primaria ni que completar la misión acredita dominio. No hay fecha exacta de publicación acordada.
- La recomendación de posponer chat libre fue una propuesta del asistente, no una autorización explícita del usuario para quitar ese requisito. Acordar su alcance de lanzamiento antes de tratarlo como diferido.

1. Validar el flujo docente completo desde la interfaz:
   - Solicitar una cuenta docente desde otro navegador o sesión privada.
   - Iniciar sesión como administrador `admin_local` y aprobarla. El usuario confirmó el flujo de notificaciones; no repetir envíos solo para documentar.
   - El docente aprobado puede crear su grupo o recibir asignación administrativa al grupo de prueba. Validar las nuevas invitaciones desde otro dispositivo.
   - Confirmar que puede consultar las dos partidas completadas del Sector 01.
   - Comprobar que no ve grupos ni estudiantes ajenos. Usar un grupo separado para verificar el aislamiento sin alterar las partidas existentes.
   - Registrar resultados y corregir cualquier fallo. Las pruebas automáticas ya cubren permisos y aprobación; queda pendiente esta validación de la interfaz.
2. Desarrollar la primera partida cooperativa del Sector 01:
   - Invitación privada para compartir una misma partida entre laptop y celular.
   - Dos avatares visibles y movimiento sincronizado en tiempo real con WebSockets.
   - Mecanismos, inventario y avance compartidos, validados por el servidor.
   - Resolver acciones simultáneas, reconexión, permisos de sala y persistencia sin duplicar recursos.
   - Mantener las partidas individuales y sus avances existentes; preparar migraciones compatibles.
   - Conservar la atribución de acciones a cada participante en las estadísticas, sin atribuir dominio individual por resolver un objetivo en equipo.
   - Incorporar chat en tiempo real dentro de cada partida privada, con restricciones de contenido para adolescentes de 12 a 18 años. Es un requisito del multijugador, todavía no implementado.
   - Validar mensajes en el servidor antes de difundirlos: limitar longitud y frecuencia, normalizar texto y filtrar insultos, acoso, amenazas, contenido sexual inapropiado y solicitudes o difusión de datos personales. Considerar variantes de escritura en español de México; un filtro de palabras por sí solo no garantiza la moderación.
   - Permitir mensajes solo entre integrantes autorizados de la sala, mostrando alias, sin correos ni datos reales. Dejar fuera del primer incremento los mensajes privados, archivos y enlaces externos.
   - Añadir silenciar, bloquear y reportar, con revisión por administración/moderación y consecuencias proporcionales. Definir permisos de revisión y una retención mínima para reportes antes de habilitar el chat con participantes reales.
   - Probar evasiones del filtro, spam, acceso ajeno a salas y funcionamiento en móvil; los rechazos deben usar mensajes claros y permitir continuar jugando. Mantener marcas y mensajes predeterminados para quienes no quieran usar texto libre.
3. Antes de publicar el piloto:
   - Respaldo y restauración de `mysql.db` realizados el 25 de octubre; ver detalle arriba. Revisar permisos personalizados requeridos por otros proyectos, ya que no fueron recuperables de la tabla dañada.
   - Habilitar y verificar la cuenta SQL dedicada `redcero_app`; retirar la conexión temporal mediante root y desactivar `DB_ALLOW_LOCAL_ROOT`.
   - Preparar alojamiento, DNS y HTTPS para `redcero.com.mx`; todavía no hay despliegue público verificado.

## Última comprobación al preparar el commit

- API saludable, siete cuentas, tres partidas individuales y dos completadas. Dos solicitudes docentes aprobadas. Cinco migraciones aplicadas. Los datos locales pueden cambiar.
- Documentación preparada sin crear commit ni modificar el índice de Git. Secretos y respaldos permanecen excluidos.

## Estado disponible

- Login y registro de jugadores con alias, correo privado y contraseña; bcrypt y sesiones persistentes.
- Avatar y Sector 01 individual: suministros por coordenadas, pasarela, refrigeración, patrones de pulsos, dron por gestos y hangar.
- Observatorio docente: registro por solicitud, consulta del estado, aprobación/rechazo administrativo, asignación de grupos y estadísticas por estudiante.
- Las pruebas automáticas pasaron al terminar la implementación del registro docente. No se hizo validación visual automatizada ni medición de rendimiento en teléfonos reales. El usuario sí completó el sector desde laptop y celular con dos jugadores.
- Grupo «Piloto de desarrollo»: en la última comprobación había tres cuentas de jugador, dos con el sector completado. Volver a consultar el estado real al retomar; estos datos pueden cambiar.
- Migraciones aplicadas: `001_initial`, `002_player_email`, `003_sector_one`, `004_teacher_requests`, `005_group_invites`.

## Entorno para retomar

- Carpeta: `C:\xampp\htdocs\kinetika`.
- Laptop con IP estática `192.168.1.150`; Node escucha en `0.0.0.0:3000` en desarrollo.
- Juego: `http://192.168.1.150:3000/`. Observatorio: `http://192.168.1.150:3000/docentes/`.
- También disponibles desde Apache bajo `http://localhost/kinetika/` y `http://localhost/kinetika/docentes/`.
- Iniciar Apache/MariaDB en XAMPP y Node con `npm start` si están detenidos. Base `redcero_dev`; conexión SQL por `127.0.0.1`.
- La regla `RedCero-Dev-LAN-3000` permite Node en TCP 3000 desde la subred local. El Wi-Fi estaba clasificado como público; no se cambió su categoría.
- Credenciales en `.env` y en el gestor del usuario/conversación previa; no copiar contraseñas, tokens ni respaldos sensibles a archivos versionados. La cuenta administrativa existente es `docente_local`; no cambiar su contraseña al retomar sin necesidad.
- `npm test` verifica autenticación, recorrido completo del sector, aislamiento docente y registro/aprobación/rechazo de solicitudes. Las pruebas eliminan sus propias cuentas temporales.

## Restricciones que se conservan

Leer `prompt-maestro.md`, `estilo.md` y `plan-inicial.md` antes de implementar. Asumir cero conocimientos de programación: el jugador interactúa con objetos, iconos y gestos, sin consolas, scripts, editores de bloques ni pantallas de enseñanza en el Nivel 1. Mantener controles móviles, identidad nacional Red Cero y assets existentes. No romper registro, sesiones, partidas o estadísticas que ya funcionan. Revisar el árbol de trabajo antes de editar y conservar cambios existentes; no hacer commits o despliegues por el solo hecho de retomar estas notas.
