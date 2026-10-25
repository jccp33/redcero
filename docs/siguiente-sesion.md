# Continuidad para la siguiente sesión

Actualizado: 25 de octubre de 2026. Corte solicitado por el usuario tras terminar el pulido visual y jugable del Sector 01. Este archivo describe el estado actual; para historia anterior consultar registro-2026-10-25.md y corte-niveles-cuenta.md. Verificar Git, servicios y base al retomar.

## Acuerdos que se conservan

- Experiencia de videojuego atractiva, sin cursos, cuestionarios ni programación textual para entrar. Cero conocimientos previos. Matemáticas mediante decisiones y consecuencias del mundo.
- Jugadores se registran y juegan libremente; equipos de juego independientes de los grupos docentes. Docentes aprobados crean grupos e incorporan jugadores por alias/correo exacto compartido. Administración conserva acceso global para soporte y correcciones.
- Primera versión publicable con dos niveles: entrada/tutorial y evidencia diagnóstica inicial; nivelación con proporcionalidad/porcentajes, operaciones razonadas de varios pasos, fracciones/decimales y áreas/perímetros. No prometer cobertura integral de primaria ni dominio por completar misiones.
- El primer modo jugable en equipos debe incluir chat en tiempo real, permisos por sala, moderación y herramientas de protección. No posponerlo unilateralmente.
- El usuario hará pruebas reales con sus laptops y celulares cuando estén completos ambos niveles; no solicitar pruebas manuales parciales. Continuar verificaciones automáticas.
- Honestidad explícita sobre implementación, pruebas y pendientes. No confundir desarrollo local con preparación para producción. No hay fecha exacta de lanzamiento acordada.
- Conservar cuentas, claves, grupos, partidas y evidencia existentes. No versionar secretos ni respaldos. No hacer commits o despliegues solo por retomar: este corte sí fue solicitado con commit y push.

## Disponible al cerrar este corte

- Registro/login de jugadores y solicitud/aprobación/rechazo de docentes; estadísticas por grupo y acceso administrativo de soporte. Cuenta local admin_local conservada junto con docente_local; contraseñas fuera del repositorio. Mi cuenta muestra datos privados del titular; destinatarios administrativos de avisos son independientes.
- Docentes crean sus grupos, agregan jugadores por alias/correo exacto, comparten invitaciones de siete días, las reemplazan/revocan y retiran integrantes sin borrar cuentas ni partidas. No hay búsqueda global de jugadores ni asignación de docentes por otros docentes.
- Correo automático de solicitudes y resoluciones; SMS administrativo al recibir solicitud nueva. Usuario confirmó recepción real de ambos, con correo inicialmente en spam y SMS demorado. No se determinó la causa de esas incidencias.
- Sector 01 individual con seis sistemas, avatar persistente, mapa Canvas con maquinaria y señales animadas, movimiento suavizado, objetivos marcables, orientación inicial no bloqueante y ayudas visuales contextualizadas. Ayudas validadas por proximidad y registradas, sin resolver mecanismos ni consumir recursos. Gestos del dron se habilitan progresivamente. Hangar completado permite viajar directamente al Sector 02. Preferencia de movimiento reducido respetada.
- Primera versión individual Sector 02: cuatro instalaciones, dos situaciones por instalación, torre final, ayudas y persistencia separada. Requiere Sector 01 completo. No están implementados equipos libres, cooperación ni chat.
- Evidencia nueva en ambos niveles con resultados y estados de mecanismos; detalle docente del Sector 02 y consultas de ayuda. No se reconstruyen eventos históricos ni se generan calificaciones de dominio.
- Celular mexicano opcional en ambos registros y Mi cuenta, privado, con verificación SMS, reemplazo y retirada. Cambio autenticado de contraseña y recuperación por correo o celular personal verificado desde ambos accesos. Códigos temporales de un solo uso, límites de intentos/emisión, revocación de sesiones y conservación de partidas. Ver seguridad-cuenta.md.

## Verificación de este corte

- 15 pruebas automáticas aprobadas en instancia aislada con proveedores de correo/SMS desactivados; cubren autenticación, celulares, cambios/recuperación, códigos, revocación de sesiones, Sector 01, ayudas, recorrido completo Sector 02, carreras de versiones, preservación de partidas, permisos y grupos.
- Chrome automatizado: Sector 01 completo por la interfaz, ayuda registrada, gestos del dron, transición al Sector 02 y vista móvil de 390 px sin desbordamiento horizontal; sin excepciones JavaScript. Revisadas capturas locales, excluidas de Git.
- Comprobaciones anteriores de interfaz: entrada y un control de la ruta del Sector 02; Mi cuenta y recuperación en ambos accesos, tamaños laptop/móvil. Cuentas de prueba eliminadas.
- No se completó automáticamente por interfaz cada mecanismo del Sector 02. Su recorrido completo sí se probó por API. No hay mediciones en teléfonos reales ni validación educativa de la dificultad.
- Entrega real de nuevos códigos personales de verificación/recuperación pendiente; las pruebas reales anteriores de proveedores eran avisos docentes. No enviar mensajes solo para documentar.

## Pendientes, en orden para retomar

1. Pulir el Sector 02: controles menos repetitivos, demostraciones y consecuencias más visibles en el mundo, recorrido y cierre narrativo. Verificar todas las instalaciones mediante interfaz, teclado, tacto emulado y movimiento reducido.
2. Completar evidencia diagnóstica y observatorio: separar avance/ayudas/evidencia suficiente, variantes y decisiones individuales; no inferir trayectorias no registradas ni dominio del grupo por una solución compartida. Confirmar cobertura curricular antes de publicitar nivelación integral.
3. Implementar equipos de juego libres, acceso privado y cooperación en ambos niveles junto con chat en tiempo real desde su primera entrega. Servidor autoritativo, permisos, deduplicación, inventario compartido, reconexión y atribución por participante. No reutilizar grupos docentes como autorización de salas.
4. Para el chat: moderación servidor en español, spam y datos personales, silenciar/bloquear/reportar, revisión administrativa y retención definida; sin privados, enlaces ni archivos en el primer incremento. Probar evasiones y acceso ajeno a salas; conservar mensajes predeterminados como alternativa.
5. Al completar los dos niveles y la entrega cooperativa acordada: pruebas reales del usuario en laptops y celulares del recorrido, guardado, reconexión, equipos/chat y flujo docente; incluir verificación y recuperación personales por email/SMS y aislamiento visual entre grupos.
6. Antes del piloto: cuenta SQL dedicada y retirar root temporal; rotar credenciales compartidas durante la sesión; resolver spam del correo a partir de cabeceras; definir retención/purga de desafíos, soporte para cuentas sin canal recuperable y cola durable de notificaciones/recuperación. Alojamiento, DNS, HTTPS/WSS, seguridad, privacidad y moderación para adolescentes. No exponer XAMPP públicamente.

## Entorno y preservación

- Carpeta C:/xampp/htdocs/kinetika. IP local 192.168.1.150; Node 0.0.0.0:3000. Juego http://192.168.1.150:3000/ y observatorio /docentes/. Apache también sirve /kinetika/ y /kinetika/docentes/.
- Iniciar Apache/MariaDB con XAMPP y Node con npm start si están detenidos. Revisar procesos antes de levantar otro Node. Ver README para pruebas aisladas sin envíos reales.
- MariaDB redcero_dev por 127.0.0.1. Migraciones aplicadas 001_initial a 007_account_security. No volver a importar esquemas sobre datos ni borrar partidas para probar.
- XAMPP reparado: mysql.db tenía datos/índice corruptos; se restauraron solo db.MAD/db.MAI desde la copia original después de respaldo físico verificado. global_priv y bases se conservaron. Permisos personalizados de mysql.db no recuperables. No sigue pendiente reparar el arranque; sí restablecer permisos requeridos y habilitar redcero_app.
- Respaldo previo al Sector 02: backups/before-sector-two.sql. Previo a seguridad de cuentas: backups/before-account-security.sql. Respaldo físico de XAMPP: backups/xampp-mysql-20261025-012841/. Excluidos de Git, con datos sensibles.
- Última comprobación: siete cuentas, tres partidas Sector 01 y dos completadas. jccp3033 y ccardenas conservan su final; jccp33 es otra cuenta, no transferir avances entre alias parecidos. Ningún número ni contraseña de cuentas existentes fue cambiado en las pruebas.
