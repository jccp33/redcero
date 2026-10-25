# Cuenta, celular y contraseñas

Implementado localmente el 25 de octubre de 2026. No constituye validación de producción ni prueba de entrega de nuevos códigos por los proveedores reales.

## Experiencia

- Jugadores y docentes pueden registrar un celular mexicano opcional al crear su cuenta. También pueden registrarlo o cambiarlo después desde «Mi cuenta», disponible en el encabezado de juego y observatorio. No se exige teléfono para jugar.
- Solo el titular autenticado consulta su teléfono. No se agrega a listas docentes, búsquedas por grupo, telemetría ni datos visibles entre jugadores. Se aceptan diez dígitos mexicanos o el formato con +52, almacenando 52 seguido de diez dígitos. No se utiliza el teléfono como alias de acceso.
- El teléfono registrado empieza sin verificar. Para habilitarlo para recuperación se solicita la contraseña actual, se envía un SMS y se confirma su código. Si se está reemplazando un número, el anterior permanece vigente hasta verificar el nuevo. Retirarlo también exige contraseña actual.
- «Mi cuenta» permite cambiar la contraseña actual por otra y confirmarla. La sesión actual se renueva y las demás se revocan. Cuentas, roles, grupos, partidas y evidencia se conservan.
- Ambos accesos ofrecen «Olvidé mi contraseña». Se indica alias/correo y canal; el correo se envía a la dirección de esa cuenta y el SMS solo a su celular verificado. Nunca se envía la recuperación a los destinos administrativos ni a un teléfono libre introducido en el login.
- Al completar la recuperación se revocan todas las sesiones y se vuelve a iniciar sesión. Una solicitud de código no cambia la contraseña vigente.

## Implementación

`007_account_security` agrega `users.phone_e164`, `users.phone_verified_at` y `account_challenges`. Es aditiva, conserva cuentas anteriores y fue aplicada tras respaldo local excluido de Git. Los datos del celular y los destinos de códigos son privados: no exportarlos a documentación ni respaldos versionados.

`server/account-security.js` implementa los siguientes endpoints bajo `/api/account`:

| Método y ruta | Uso |
| --- | --- |
| GET `/profile` | Perfil privado del titular autenticado. |
| POST `/phone/request` | Contraseña actual y celular; solicita verificación. |
| POST `/phone/verify` | Confirma el código asociado al titular y al destino pendiente. |
| POST `/phone/remove` | Retira el número e invalida los códigos activos del usuario. |
| POST `/password` | Cambia contraseña con reautenticación y renueva sesión. |
| POST `/recovery/request` | Solicita código por email o SMS sin revelar existencia o disponibilidad de la cuenta. |
| POST `/recovery/complete` | Establece contraseña tras comprobar el código; revoca sesiones y códigos activos. |

Los códigos tienen seis dígitos, caducan en quince minutos, permiten cinco intentos y se guardan con bcrypt; el identificador aleatorio del desafío se guarda como SHA-256. Cada desafío está ligado a cuenta, propósito y versión de credenciales. Verificación y consumo se serializan en transacciones: un mismo código no puede completar dos operaciones simultáneas. Fechas de emisión y caducidad usan UTC explícitamente, sin depender de la hora local de MariaDB.

La emisión se limita a un código por minuto y cinco por hora por cuenta, entre ambos propósitos, además del límite por IP en operaciones sensibles. Una nueva emisión invalida desafíos anteriores del mismo propósito. Cambiar o recuperar la contraseña invalida todos los códigos. Verificar o retirar un teléfono invalida las recuperaciones previas según corresponda. El inicio de sesión también comprueba la versión de contraseña bajo bloqueo para no crear una sesión con credenciales que acaban de cambiar.

`server/account-delivery.js` reutiliza los contratos de las APIs de correo y LabsMobile, con destinos personales y configuración privada existente. No se necesita cambiar tokens ni configurar como destinatario administrativo el celular del usuario. Modos desactivados, simulación y fallos no producen un código utilizable. La recuperación devuelve respuesta genérica antes de preparar y enviar el código; errores y códigos no se devuelven al solicitante ni se imprimen en logs.

`public/account.js` comparte el diálogo entre juego y observatorio. No guarda claves, códigos ni identificadores de desafío en localStorage, URL o estado de partida. Limpiar/cerrar el diálogo elimina esos valores de los formularios; al ocultar la página se limpian los campos de contraseña. Los formularios de registro incorporan teléfono opcional, sin envío automático de SMS al registrar.

## Verificación y pendientes

- Catorce pruebas aprobaron el conjunto de regresión con correo/SMS desactivados en instancia aislada. El módulo de seguridad prueba proveedores simulados con destinos personales, verificación y privacidad, respuesta genérica, cooldown, códigos caducados, límite de intentos, códigos reutilizados y carrera de consumo, cierre de sesiones, retiro de celular y conservación de partida.
- Comprobación automática de navegador en ambos accesos: «Mi cuenta», recuperación, teléfono sin verificar y diálogo adaptado a laptop/móvil, sin excepciones JavaScript. Perfil/cuenta de prueba eliminados; sin SMS ni correos reales para estas pruebas.
- No se solicitaron pruebas reales al usuario, conforme al acuerdo de hacerlas al completar ambos niveles. La entrega real de códigos de recuperación personales sigue pendiente; las pruebas de email/SMS anteriores correspondían a avisos docentes.
- No hay cola durable ni reintentos automáticos. Si Node se apaga tras aceptar una solicitud de recuperación y antes del envío, el usuario debe solicitar otro código pasado el plazo de espera. Los datos de desafíos caducados no se purgan automáticamente todavía: definir retención y limpieza operativa antes del piloto.
- Las cuentas anteriores sin correo ni celular verificado conservan acceso con su contraseña. Pueden asociar celular desde la sesión activa. La recuperación sin canal requiere soporte administrativo con comprobación de identidad por definir; no se concede acceso por conocer un alias o un correo.
