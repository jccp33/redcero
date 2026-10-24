# Continuidad para la siguiente sesión

Actualizado: 24 de octubre de 2026. El usuario pidió guardar estas tareas para trabajarlas en la siguiente sesión. Este archivo registra pendientes; no indica que ya estén completados.

## Orden acordado

1. Validar el flujo docente completo desde la interfaz:
   - Solicitar una cuenta docente desde otro navegador o sesión privada.
   - Iniciar sesión como administrador `docente_local` y aprobarla.
   - Asignar la cuenta aprobada al grupo de prueba.
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
   - Respaldar y diagnosticar la tabla interna `mysql.db` de XAMPP, que continúa dañada.
   - Reparar los permisos con cuidado de no afectar otras bases o proyectos.
   - Habilitar y verificar la cuenta SQL dedicada `redcero_app`; retirar la conexión temporal mediante root y desactivar `DB_ALLOW_LOCAL_ROOT`.
   - Preparar alojamiento, DNS y HTTPS para `redcero.com.mx`; todavía no hay despliegue público verificado.

## Estado disponible

- Login y registro de jugadores con alias, correo privado y contraseña; bcrypt y sesiones persistentes.
- Avatar y Sector 01 individual: suministros por coordenadas, pasarela, refrigeración, patrones de pulsos, dron por gestos y hangar.
- Observatorio docente: registro por solicitud, consulta del estado, aprobación/rechazo administrativo, asignación de grupos y estadísticas por estudiante.
- Las pruebas automáticas pasaron al terminar la implementación del registro docente. No se hizo validación visual automatizada ni medición de rendimiento en teléfonos reales. El usuario sí completó el sector desde laptop y celular con dos jugadores.
- Grupo «Piloto de desarrollo»: en la última comprobación había tres cuentas de jugador, dos con el sector completado. Volver a consultar el estado real al retomar; estos datos pueden cambiar.
- Migraciones aplicadas: `001_initial`, `002_player_email`, `003_sector_one`, `004_teacher_requests`.

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
