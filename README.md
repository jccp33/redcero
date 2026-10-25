# Red Cero

Videojuego web cooperativo de ciencia ficción para explorar, construir y restaurar una estación. Dominio del proyecto: **redcero.com.mx**.

La identidad visual y las reglas de experiencia están en [estilo.md](docs/estilo.md). Se asume que quienes entran a primero de secundaria nunca han programado: el Nivel 1 usa acciones, objetos e iconos del mundo, sin consolas, scripts, editores de bloques ni pantallas de enseñanza. Las herramientas técnicas de este README son para desarrollar el proyecto; no forman parte del recorrido del jugador.

Disponible localmente: registro con alias, correo privado y contraseña, sesiones persistentes, creación de avatar y primera versión individual jugable del Sector 01. No se ha publicado en el dominio.

## Jugar el Sector 01

### Variantes de retos

Las partidas nuevas reciben una configuración aleatoria del servidor, guardada con su estado. El Sector 01 varía la reserva de refrigeración (12, 16 o 20) y la secuencia de pulsos; baliza, pasarela y gestos iniciales mantienen su orientación. El Sector 02 sortea dos situaciones diferentes por cada instalación, con escalas, porcentajes, pedidos, presupuestos, capacidades, fracciones y dimensiones dentro de límites resolubles. Las instrucciones y validaciones usan esos parámetros, no números fijos.

Recargar, cambiar traje, pedir ayuda o volver a entrar no cambia la variante. Las partidas anteriores sin configuración explícita siguen usando sus valores originales, sin migración ni reescritura de sus estados. Se guarda la configuración real en la evidencia nueva; no se certifica equivalencia pedagógica entre variantes. Todavía no hay una función de reinicio/nueva expedición: este cambio no borra ni vuelve a sortear una partida existente.

La estación muestra maquinaria y conducciones que se iluminan al restaurar sistemas. Los objetivos se pueden marcar en el mapa sin bloquear el orden de exploración. La orientación inicial se retira al caminar; «Ver señal de ayuda» proyecta una demostración y registra la consulta sin resolver el mecanismo. Los gestos del dron se habilitan según su estado. El hangar completado ofrece viaje directo al Sector 02. Movimiento visual suavizado sobre posiciones aceptadas por servidor y animaciones con preferencia de movimiento reducido.

Resumen del corte y pendientes: [corte de niveles y cuenta](docs/corte-niveles-cuenta.md).

### Sector 02 — Reconstrucción del enlace

Primera versión individual disponible con la migración compatible `006_sector_two`. El botón de bienvenida «Sector 02 · Reconstruir el enlace» se habilita en el servidor solo después de completar el Sector 01; las partidas anteriores completadas pueden acceder sin repetirlo. Ambos sectores conservan estados separados y usan el mismo avatar.

El puesto exterior se recorre tocando el mapa o usando flechas/WASD y E. Cuatro instalaciones necesitan dos conexiones cada una: ruta con escala y carga porcentual, taller con pedido y presupuesto/sobrante, depósitos con fracciones y medida decimal, y refugio con huella, perímetro y piso. Los controles actúan sobre materiales e instrumentos; «Consultar la baliza» ofrece ayuda registrada. Tras las ocho conexiones se activa la torre. El estado se guarda después de cada acción validada; volver a entrar no reinicia los mecanismos.

`player_sector_two` almacena el segundo nivel con versión; `learning_evidence` registra decisiones y estados mínimos de mecanismos, resultados y ayudas sin movimientos ni correo. Las acciones nuevas del Sector 01 también generan evidencia, conservando `sector_events` y sus estadísticas previas. No se inventa evidencia para partidas antiguas. El detalle docente muestra avance del Sector 02 y resúmenes de activaciones/ayudas con autorización por grupo; estos datos no son calificaciones ni prueba de dominio.

La versión actual sigue siendo individual: equipos libres, cooperación y chat no están disponibles. El chat en tiempo real es requisito de la primera entrega que permita jugar en equipos. Las pruebas reales del usuario se harán al completar y pulir ambos niveles. Ver [matriz de niveles](docs/matriz-niveles.md).

### Probar desde móviles en la misma red

La laptop usa `192.168.1.150`. En desarrollo, `.env` configura `HOST=0.0.0.0` y permite los orígenes de esa IP; iniciar Node con `npm start`. Desde un dispositivo conectado a la misma red Wi-Fi, abrir **http://192.168.1.150:3000/**. También se puede usar **http://192.168.1.150/kinetika/** si Apache permite conexiones LAN. La página de Apache dirige su API al puerto 3000 de esa misma IP.

Para habilitar el firewall, abrir PowerShell como administrador en el proyecto y ejecutar `powershell -ExecutionPolicy Bypass -File .\scripts\enable-lan.ps1`. La regla permite exclusivamente Node, TCP 3000, IP local 192.168.1.150 y dispositivos de la subred local. Se aplica también al perfil público porque así está clasificado este Wi-Fi en Windows; no cambia la clasificación de la red ni abre MySQL. Para quitar la regla: `Remove-NetFirewallRule -Name RedCero-Dev-LAN-3000` como administrador.

Si cambia la IP, actualizar `.env`, el origen de desarrollo en `public/app.js`, las fuentes de conexión CSP en `server/index.js` y la regla del firewall. El teléfono debe usar la IP de la laptop, nunca `localhost`; una red de invitados con aislamiento entre dispositivos puede impedir el acceso. La prueba de producción conserva su origen HTTPS y no usa esta configuración LAN.

Iniciar sesión y pulsar **Preparar mi avatar**. Elegir traje, casco y tono de piel; entrar a la estación. Si ya se creó un avatar, se recupera el sector directamente. El botón «Cambiar traje» permite editarlo sin perder el avance.

En móvil: tocar el suelo para caminar o mantener las flechas táctiles; acercarse a un mecanismo y tocar «Explorar». En computadora: flechas/WASD y E. También se puede tocar un mecanismo cercano en el mapa. No hace falta escribir código. La pantalla funciona en vertical y reorganiza los mecanismos debajo del mapa en pantallas pequeñas.

Recorrido: encontrar suministros en (−3, +2), colocar tres piezas de pasarela, repartir la reserva indicada entre reactor/escudo/antena en mitades y cuartos, restaurar el patrón de pulsos asignado y guiar un dron mediante «Ir», «Recoger» y «Volver». El hangar se abre al restaurar los sistemas. Se puede recuperar material y ajustar válvulas para volver a intentar sin reiniciar la partida. En partidas antiguas, la reserva sigue siendo 12 y el patrón 2/4/6/8.

`003_sector_one.sql` agrega `player_sectors` (avatar y estado por jugador) y `sector_events` (acciones de mecanismos y resultado, sin movimientos ni correo). Ya está aplicada en esta instalación. Para otra instalación ejecutar `npm run db:setup`. Cada acción aceptada o intento se procesa con sesión autenticada; posición, recursos y objetivos se validan en el servidor y el estado se guarda en una transacción con control de versión. No hay guardado anónimo ni dependencia de localStorage.

Esta primera versión usa movimientos por casillas y peticiones HTTP, con una partida individual por cuenta. La sincronización WebSocket, invitaciones cooperativas y animaciones avanzadas siguen pendientes. El observatorio docente ya está disponible. No se promete todavía una tasa de FPS o latencia sin mediciones en dispositivos reales. Ante desconexión se recupera el estado guardado; la aplicación requiere conexión con Node y MariaDB.

La migración `002_player_email` agrega `users.email`, único y normalizado a minúsculas. Ejecutar `npm run db:setup` para actualizar una instalación existente sin borrar cuentas. Las cuentas anteriores conservan correo NULL y siguen accediendo; completar sus correos y verificar su propiedad requiere un flujo posterior. Los nuevos registros sí exigen correo. No se envían mensajes ni se verifica propiedad todavía.

El correo permite buscar y relacionar estudiantes en el observatorio docente; los eventos siguen vinculados por `users.id`. El correo no aparece en las respuestas públicas de sesión ni en la identidad visible del jugador. La búsqueda docente se limita a sus grupos autorizados.

## Observatorio docente

Abrir **http://localhost:3000/docentes/** en la laptop o **http://192.168.1.150:3000/docentes/** desde la misma red. Con Apache también funciona `http://localhost/kinetika/docentes/`. Iniciar sesión con una cuenta de rol `teacher` o `admin`; las cuentas de jugador reciben 403 en la API. El observatorio está separado de la experiencia del jugador.

La pantalla ofrece **Iniciar sesión** y **Solicitar cuenta docente**. El registro pide nombre, institución, alias, correo y contraseña; crea la cuenta con privilegios de jugador y una solicitud pendiente, sin acceso a estadísticas. Una cuenta de jugador existente puede iniciar sesión en el observatorio y solicitar acceso sin duplicar su correo ni perder partidas. Una solicitud pendiente o rechazada solo permite consultar su propio estado, nunca datos de estudiantes.

Administración ve **Solicitudes docentes**: revisa nombre, institución y correo y decide aprobar o rechazar. La aprobación cambia el rol a `teacher`, pero no asigna grupos. El docente aprobado puede crear sus propios grupos y compartir invitaciones. Administración conserva «Asignar al grupo seleccionado» con alias/correo para soporte. Los cambios se reflejan al pulsar «Actualizar estado», sin necesidad de crear otra sesión. El rechazo conserva la cuenta y su historial; para aclaraciones se indica contactar a administración. Hay notificaciones por correo y SMS según configuración; no se implementa reenvío automático de solicitudes rechazadas ni verificación de identidad institucional.

`004_teacher_requests.sql` agrega la solicitud, su estado y la fecha/administrador de revisión. `npm run db:setup` aplica la migración sin alterar las cuentas o partidas previas. El registro comparte validaciones, bcrypt, límite de intentos y protección de origen con el acceso existente. El estado enviado por el navegador nunca habilita roles: solo una revisión administrativa autenticada cambia el rol en una transacción. Los registros docentes pendientes no se incorporan automáticamente como alumnos al ejecutar el asistente de grupos de desarrollo.

Incluye grupos, búsqueda por alias/correo dentro del grupo, lista paginada de estudiantes, estado actual de los seis mecanismos, último guardado y detalle de acciones aceptadas/rechazadas por mecanismo. El historial se muestra en páginas de 50 eventos, con fechas en la zona horaria del dispositivo. «Entraron al sector» significa que guardaron avatar y estado inicial; no se infiere tiempo activo ni dominio matemático. Los ajustes de válvulas y reguladores cuentan como acciones aceptadas, no como respuestas correctas. El historial es acumulado por jugador y puede ser anterior a su asignación al grupo.

Se reutilizan `learning_groups`, `group_members`, `player_sectors` y `sector_events`, sin reiniciar partidas. La migración `005_group_invites` agrega las invitaciones de grupos. Los administradores pueden crear grupos y asignar estudiantes o docentes ya habilitados mediante alias/correo exactos. Un docente ve únicamente sus grupos y alumnos; un administrador puede consultar todos los grupos. Las comprobaciones se realizan en el servidor en cada consulta, incluso si se manipula el ID o se revoca el rol con la sesión abierta.

Para preparar otra instalación local de desarrollo: `npm run teacher:setup`. El asistente crea `docente_local` con rol administrador y una contraseña aleatoria mostrada solo en la primera ejecución. Crea «Piloto de desarrollo» y relaciona los jugadores presentes al ejecutarlo. Una segunda ejecución conserva la contraseña y el avance; también incorpora los jugadores nuevos al grupo de prueba. No usar este asistente para grupos reales: las asignaciones del piloto son deliberadamente globales dentro de la base local `_dev`. Las credenciales no se guardan en el repositorio.

Para habilitar docentes, utilizar el registro/solicitud y la revisión desde el observatorio con una cuenta administradora (`admin_local` en esta instalación). El docente aprobado puede crear grupos; administración puede asignarlo a grupos existentes para soporte. El registro público nunca acepta roles privilegiados. Un correo coincidente no concede acceso ni crea vínculos automáticamente. La promoción manual en phpMyAdmin se reserva al mantenimiento de cuentas existentes por una persona administradora de la base de datos.

### Estado de esta instalación de XAMPP

La base `redcero_dev` está creada. El 25 de octubre de 2026 se respaldó el directorio de datos y se restauraron únicamente los archivos de datos e índice de `mysql.db` desde la copia original de XAMPP: el archivo dañado contenía texto de registros y no permitió recuperar sus permisos. Se conservaron las cuentas de `mysql.global_priv` y las bases de proyectos. Las comprobaciones de tablas y la conexión de Red Cero pasaron. Los permisos personalizados por base deben restablecerse si se necesitan; los respaldos están en `backups/`, excluido de Git.

Para poder probar esta entrega, el `.env` local utiliza temporalmente `DB_USER=root`, contraseña vacía y `DB_ALLOW_LOCAL_ROOT=true`. Node admite dispositivos de la LAN; MariaDB se conecta por `DB_HOST=127.0.0.1`. **Esta excepción es únicamente de desarrollo.** El ejemplo de configuración conserva la cuenta dedicada recomendada y la aplicación impide usar root en producción. La corrupción que impedía el arranque ya fue resuelta; sigue pendiente habilitar y verificar la cuenta dedicada y retirar esta excepción. No utilizar esta instalación como servidor público.

## Entorno local

- Windows con XAMPP (Apache y MySQL/MariaDB encendidos).
- Node.js 24 LTS y npm.
- Proyecto en `C:\xampp\htdocs\kinetika`.

```powershell
npm ci
Copy-Item .env.example .env
```

Si `.env` ya existe, conservarlo. Configurar `DB_PASSWORD` con una contraseña propia y mantener `DB_USER=redcero_app`. La cuenta de ejecución no utiliza root. Configurar host/puerto si difieren de XAMPP.

```powershell
npm run db:setup
npm start
```

El instalador usa la cuenta administrativa local `root` sin contraseña de XAMPP como valor inicial. Si tiene contraseña u otro usuario, definir `DB_ADMIN_USER` y `DB_ADMIN_PASSWORD` en el entorno antes de ejecutar `db:setup`; no almacenarlos en Git. Crea `redcero_dev`, aplica `001_initial.sql`, registra la migración y crea la cuenta de ejecución con permisos de datos solamente. Una segunda ejecución omite la migración aplicada; si encuentra tablas sin historial, se detiene para no alterar un esquema desconocido. DDL de MariaDB no es transaccional: ante una interrupción de la primera importación, inspeccionar las tablas antes de reintentar. No borrar una base con datos para repetir la instalación.

Si `redcero_app` ya existe, su contraseña debe coincidir con `.env`: el instalador no modifica contraseñas de cuentas existentes.

- Aplicación: **http://localhost:3000/**.
- También desde Apache: **http://localhost/kinetika/** (Node debe seguir encendido).
- phpMyAdmin: **http://localhost/phpmyadmin/** → base **redcero_dev**.
- Estado del backend y SQL: `http://localhost:3000/api/health`.

El esquema incluye las migraciones `001_initial` a `005_group_invites`; consultar `schema_migrations` para comprobar su aplicación. Al crear una cuenta aparecen filas en `users` y `auth_sessions`. No existen cuentas de jugador predeterminadas. La cookie mantiene la sesión durante 12 horas; cerrar sesión revoca el token en SQL. Las sesiones vencidas se rechazan aunque permanezcan en la tabla; su purga periódica queda pendiente.

`npm run dev` reinicia Node al modificar el servidor; los archivos del cliente se sirven directamente, sin compilación. `Ctrl+C` detiene Node.

## Verificación

### Cambio, recuperación de contraseña y celular personal

Implementado con la migración aditiva `007_account_security`: teléfono mexicano opcional en ambos registros y «Mi cuenta», verificación por SMS con contraseña actual, cambio/retirada del celular, cambio autenticado de contraseña y recuperación mediante código desde ambos logins. Los destinos son el correo o celular verificado del titular; los destinos administrativos permanecen independientes. El registro no dispara SMS y un teléfono sin verificar no sirve para recuperación. Ver [seguridad de cuenta](docs/seguridad-cuenta.md) para uso, rutas, controles, pruebas y pendientes.

El resumen del incremento preparado para commit está en [registro de la sesión](docs/registro-2026-10-25.md). El alcance aprobado de dos niveles y la separación entre equipos de juego y grupos docentes están en [requisitos](docs/prompt-maestro.md); no todo ese alcance está implementado.

### Gestión de grupos por docentes

El observatorio incluye «Guía docente · empieza aquí», desplegable accesible y disponible antes/después de iniciar sesión. Explica registro y aprobación, creación y asignación de grupos, alias/correo, invitaciones, estadísticas y recuperación de cuenta. La versión documental está en [guia-docente.md](docs/guia-docente.md). Consultar la guía no concede permisos ni acceso a datos.

La migración compatible `005_group_invites` agrega invitaciones sin modificar partidas ni asignaciones previas. Docentes aprobados crean grupos y quedan vinculados a ellos en una transacción. Pueden generar un enlace de invitación válido por siete días, reemplazarlo o revocarlo, y quitar estudiantes de sus grupos sin borrar cuentas, eventos ni partidas. El código aleatorio se guarda solo como hash. Revocar no expulsa a integrantes actuales. Al abrir el enlace del docente, el jugador conecta su cuenta y acepta la invitación desde la bienvenida; su progreso individual se conserva. Los docentes también pueden agregar estudiantes por alias o correo exacto compartido por el jugador, solo a sus grupos. No hay búsqueda global ni autocompletado de cuentas. La asignación de docentes permanece reservada a administración; agregar un jugador conserva sus otras pertenencias y partidas.

Administración conserva consulta de todos los grupos y estadísticas y la asignación manual por alias/correo para soporte, incluida la asignación de docentes a grupos existentes. Los docentes solo consultan y gestionan grupos donde están asignados. El canje comprueba sesión, rol, caducidad, revocación y que el emisor siga habilitado y vinculado al grupo. Las invitaciones se pueden compartir con varios alumnos; tratarlas como enlaces privados y revocarlas al terminar la incorporación. Las correcciones directas de datos siguen siendo mantenimiento administrativo, sin editor SQL en la interfaz.

### Correos de solicitudes docentes

Los avisos administrativos de nuevas solicitudes también admiten SMS de LabsMobile. Configurar `SMS_NOTIFICATIONS_ENABLED`, `LABSMOBILE_USERNAME`, `LABSMOBILE_API_TOKEN`, `LABSMOBILE_SENDER_ID` (predeterminado `RedCero`), `LABSMOBILE_TEST_MODE`, `SMS_DEFAULT_COUNTRY_CODE` (52) y `SMS_ADMIN_PHONES` (lista separada por comas). Guardar credenciales y teléfonos únicamente en `.env`. En modo simulado se envía `test:1`; en real, `test:0`. Solo HTTP exitoso y código `0` se consideran aceptados, sin garantizar entrega al dispositivo. Estos avisos administrativos no consultan teléfonos personales; los usuarios pueden asociar un celular privado por separado en Mi cuenta. El SMS no incluye sus datos personales. Sin reintentos automáticos para evitar cargos duplicados ante respuestas ambiguas.

Las solicitudes del administrador se consultan automáticamente cada 10 segundos mientras el panel está visible. Las decisiones siguen siendo manuales. Para pruebas automáticas iniciar una instancia aislada con **ambos** `MAIL_ENABLED=false` y `SMS_NOTIFICATIONS_ENABLED=false`.

El servidor envía JSON (`receiver`, `subject`, `message`) a `https://appsevolution.com.mx/email.php` con el tipo `application/x-www-form-urlencoded` requerido por esta API. Configurar `MAIL_ENABLED=true` y `MAIL_ADMIN_RECEIVER` en `.env` y reiniciar Node. El ejemplo mantiene el envío desactivado. No se llama a la API desde el navegador.

Una solicitud nueva avisa al docente y al correo administrativo configurado; una aprobación o rechazo avisa al docente. Aplica también a solicitudes desde cuentas existentes. Los avisos se envían después de guardar la operación y no incluyen contraseñas ni sesiones. La aprobación sigue requiriendo asignación de grupo.

El envío tiene un límite de cinco segundos, no sigue redirecciones y exige HTTP exitoso y `response: true`. La interfaz diferencia la operación guardada de la aceptación del correo por el proveedor; no garantiza recepción en la bandeja. Un fallo no revierte solicitudes ni decisiones. No hay cola persistente ni reintentos automáticos todavía. Los tests de correo simulan el proveedor; para ejecutar la integración sin enviar correos reales, iniciar una instancia separada con `MAIL_ENABLED=false` y apuntar `TEST_BASE_URL` a ella.

Con Node y MariaDB en ejecución:

```powershell
npm test
```

La prueba de integración crea un jugador temporal, comprueba registro, duplicado, contraseña incorrecta, sesión, permisos de origen y cierre de sesión. Elimina su propio jugador al terminar. Ejecutarla únicamente contra la base local de desarrollo; usa `TEST_BASE_URL` si el servidor no está en el puerto 3000.

Comprobación manual: crear cuenta, elegir avatar, recorrer el sector y recargar para comprobar persistencia; cerrar sesión e ingresar de nuevo. Probar en un teléfono real la pulsación sostenida de flechas, navegación tocando el mapa, válvulas y desplazamiento vertical hasta los mecanismos. Las pruebas automáticas cubren el recorrido completo por API, restricciones de distancia, recursos, versión y conservación del avance al editar avatar. El panel tiene pruebas de acceso anónimo/jugador/docente/administrador, aislamiento de grupos y correos, conteos y revocación de roles. Hay comprobaciones automatizadas de navegador del Sector 01 completo y de partes del Sector 02 y de Mi cuenta, con tamaños laptop/móvil; no sustituyen pruebas con teléfonos reales ni mediciones de rendimiento. La recuperación de contraseña ya está implementada; su entrega real de códigos personales sigue pendiente de validación con el usuario.

## Estructura

```text
index.html             pantalla de acceso y bienvenida
public/                estilos e interacción del cliente
public/assets/         logotipo e isotipo SVG de Red Cero
server/index.js        API, autenticación y archivos públicos
scripts/setup-db.js    instalación local del esquema
database/              migraciones SQL
test/                  prueba de integración
docs/                  requisitos y plan de desarrollo
```

La API ofrece `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` y `POST /api/auth/logout`. Registro acepta alias, correo y contraseña; asigna siempre el rol `player`. SQL parametrizado, bcrypt coste 12, token aleatorio con hash SHA-256 en SQL, cookie HttpOnly/SameSite, límite de intentos por IP y orígenes explícitos. No se permite contraseña superior a 72 bytes UTF-8, por el límite de bcrypt. La interfaz expresa ese límite con un mensaje sencillo, sin exigir entender bytes.

Las fuentes Rajdhani e Inter se sirven desde `public/fonts/` para funcionar sin conexiones externas. Sus licencias OFL se incluyen junto a los archivos; los paquetes `@fontsource` permiten recuperar los originales.

Los assets de marca originales están en `public/assets/`: logotipo completo en escritorio e isotipo en móvil, favicon y bienvenida. Apache permite explícitamente ambos SVG; Node los sirve bajo `/public/assets/`. Los SVG se usan como imágenes y conservan sus fuentes de respaldo internas, independientes de las fuentes CSS de la página.

La aplicación comprueba el origen en peticiones de escritura. Para probar herramientas HTTP, enviar `Origin: http://localhost:3000` y `Content-Type: application/json`. Las credenciales SQL y `.env` no se sirven desde Node. `.htaccess` limita Apache a las páginas de juego/docentes y los assets públicos declarados; mantener `AllowOverride` y `mod_rewrite` habilitados. Comprobar respuestas 403 para `.env`, `server/` y `database/` antes de usar Apache.

## Publicación y continuidad

El desarrollo está habilitado para la LAN. Para producción: configurar proxy inverso con HTTPS, `NODE_ENV=production`, `APP_ORIGINS=https://redcero.com.mx`, credenciales independientes y una base de datos privada. La cookie Secure requiere HTTPS. La limitación de intentos actual es en memoria para un proceso; revisar IP del proxy y almacenamiento compartido al escalar. No publicar XAMPP directamente en Internet.

El dominio está contratado por un año; la fecha de vencimiento y renovación se administran con el registrador. La carpeta local conserva el nombre `kinetika`.

El proyecto tiene intención de ser de código abierto y sin fines de lucro. La licencia aún está pendiente de elección; no se ha asignado una licencia por defecto.

Detalles: [plan inicial](docs/plan-inicial.md), [prompt maestro](docs/prompt-maestro.md) e [identidad visual](docs/estilo.md).
