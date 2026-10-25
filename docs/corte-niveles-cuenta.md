# Corte de desarrollo: niveles individuales y seguridad de cuenta

25 de octubre de 2026. Corte solicitado por el usuario para commit y push, después de terminar el pulido visual y jugable recomendado para el Sector 01. Se incluyen los incrementos posteriores a `9b954ae`; el despliegue público no forma parte de este corte.

## Cambios incluidos

- Docentes incorporan jugadores por alias/correo exacto compartido en sus grupos, con controles de rol, grupo y frecuencia. Administración conserva acceso global y asignación manual de docentes para soporte. Registro y juego siguen libres de invitaciones.
- Sector 01 con maquinaria diferenciada, conducciones y energía animadas, avatar suavizado sobre movimiento validado, marcador de destino, objetivos interactivos, orientación inicial breve, ayudas visuales y avance de gestos del dron. Sin cambios en las soluciones, recursos, coordenadas ni requisitos de finalización existentes. Ayudas nuevas registradas como consultas, no resolución. Preferencia de movimiento reducido respetada. Hangar enlaza directamente al Sector 02.
- Sector 02 individual con cuatro sistemas y dos situaciones por sistema: escala/porcentaje, pedido/presupuesto, fracción/medida decimal, perímetro/área. Torre final, ayudas y guardado separado con bloqueo y versión. El primer nivel completo se exige en servidor.
- Evidencia observacional nueva de ambos sectores y vista docente adicional, autorizada por grupo; sin reconstrucción de historia ni calificación automática.
- Celular mexicano opcional y privado en ambos registros y desde Mi cuenta, con verificación, reemplazo y retirada. Cambio autenticado de contraseña y recuperación por correo o celular personal verificado desde ambos accesos. Códigos bcrypt de un solo uso, caducidad, límites y revocación de sesiones; sin claves/códigos en logs, URLs o estado del juego.
- Requisitos persistentes actualizados: honestidad, dos niveles, cuatro ejes matemáticos, separación de equipos libres/grupos docentes, chat obligatorio desde el primer modo de equipos y pruebas reales del usuario al cerrar ambos niveles.

## Migraciones y puesta en marcha

Migraciones aditivas `006_sector_two` y `007_account_security`, integradas en `npm run db:setup` y aplicadas localmente después de respaldos privados. Nuevas tablas `player_sector_two`, `learning_evidence`, `account_challenges`, y campos privados de teléfono en `users`. Las cuentas, grupos, estadísticas anteriores y partidas se conservan.

En otra instalación: conservar `.env`, respaldar la base existente, ejecutar `npm run db:setup` con credenciales autorizadas y reiniciar Node. Usar las configuraciones de correo/SMS existentes para códigos personales; los destinos administrativos no se usan para recuperar cuentas. No incluir respaldos, perfiles de navegador ni credenciales en Git. `.htaccess` habilita únicamente los nuevos módulos/estilos públicos necesarios, manteniendo exclusiones del servidor y la configuración.

## Validación realizada

- 15 pruebas automáticas aprobadas contra servidor aislado, con proveedores reales desactivados. Pruebas propias de seguridad usan proveedores simulados; no generan mensajes reales.
- Recorrido completo Sector 01 por interfaz automatizada en Chrome: recoger, construir, repartir, transmitir, guiar dron, abrir hangar y entrar al Sector 02; consulta de ayuda registrada. Capturas de laptop y móvil (390 px), sin desbordamiento horizontal ni excepciones JavaScript.
- Recorrido completo Sector 02 por API: dos situaciones por instalación, torre, persistencia y carrera de versiones; Sector 01 intacto. Comprobación previa de interfaz en una instalación del Sector 02, no de todas.
- Cuenta/recuperación: pruebas de registro de teléfono, destinos personales, verificación, rechazo de códigos caducados/reutilizados y fallidos, carrera de consumo, retiro del celular, cambio de contraseña, revocación de sesiones y conservación de partida. Diálogos comprobados automáticamente en ambos accesos con tamaños laptop/móvil.
- Siete cuentas locales y dos partidas originales completadas conservadas; no se modificaron contraseñas ni celulares de cuentas existentes. Cuentas automáticas eliminadas al terminar.

## Límites del corte

No incluye equipos libres, cooperación ni chat; deben desarrollarse juntos. El pulido del Sector 02, suficiencia de evidencia diagnóstica, validación pedagógica, moderación, pruebas reales de dispositivos y preparación para producción siguen pendientes en `siguiente-sesion.md`.

La entrega real de códigos personales está pendiente: la confirmación anterior de email/SMS fue de avisos docentes. Persisten correo recibido en spam y demora de SMS sin causa verificada. No hay cola durable ni purga automática de desafíos; falta procedimiento de soporte para cuentas sin canales recuperables. Root SQL sigue siendo excepción local temporal. No se afirma que esta versión esté lista para publicar.

## Commit propuesto

```text
feat: ampliar niveles y seguridad de cuentas
```

El commit no incluye `.env`, tokens, contraseñas, teléfonos reales, respaldos ni artefactos del navegador. El push actualiza el repositorio; no publica la aplicación en el dominio.

Revisión previa: 63 archivos candidatos y 93 blobs alcanzables del historial local sin coincidencias con credenciales configuradas/conocidas ni formatos reconocidos de tokens o claves privadas. Verificación de sintaxis JavaScript y `git diff --check` satisfactoria. `.env`, respaldos y capturas confirmados como ignorados. Partidas originales verificadas completas con versiones 93 y 165, sin modificación por las pruebas. Repetir la revisión si se agregan cambios posteriores.
