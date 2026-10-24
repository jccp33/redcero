# Red Cero

Videojuego web cooperativo de ciencia ficción para explorar, construir y restaurar una estación. Dominio del proyecto: **redcero.com.mx**.

La identidad visual y las reglas de experiencia están en [estilo.md](docs/estilo.md). Se asume que quienes entran a primero de secundaria nunca han programado: el Nivel 1 usa acciones, objetos e iconos del mundo, sin consolas, scripts, editores de bloques ni pantallas de enseñanza. Las herramientas técnicas de este README son para desarrollar el proyecto; no forman parte del recorrido del jugador.

Disponible localmente: registro con alias, correo privado y contraseña, sesiones persistentes, creación de avatar y primera versión individual jugable del Sector 01. No se ha publicado en el dominio.

## Jugar el Sector 01

### Probar desde móviles en la misma red

La laptop usa `192.168.1.150`. En desarrollo, `.env` configura `HOST=0.0.0.0` y permite los orígenes de esa IP; iniciar Node con `npm start`. Desde un dispositivo conectado a la misma red Wi-Fi, abrir **http://192.168.1.150:3000/**. También se puede usar **http://192.168.1.150/kinetika/** si Apache permite conexiones LAN. La página de Apache dirige su API al puerto 3000 de esa misma IP.

Para habilitar el firewall, abrir PowerShell como administrador en el proyecto y ejecutar `powershell -ExecutionPolicy Bypass -File .\scripts\enable-lan.ps1`. La regla permite exclusivamente Node, TCP 3000, IP local 192.168.1.150 y dispositivos de la subred local. Se aplica también al perfil público porque así está clasificado este Wi-Fi en Windows; no cambia la clasificación de la red ni abre MySQL. Para quitar la regla: `Remove-NetFirewallRule -Name RedCero-Dev-LAN-3000` como administrador.

Si cambia la IP, actualizar `.env`, el origen de desarrollo en `public/app.js`, las fuentes de conexión CSP en `server/index.js` y la regla del firewall. El teléfono debe usar la IP de la laptop, nunca `localhost`; una red de invitados con aislamiento entre dispositivos puede impedir el acceso. La prueba de producción conserva su origen HTTPS y no usa esta configuración LAN.

Iniciar sesión y pulsar **Preparar mi avatar**. Elegir traje, casco y tono de piel; entrar a la estación. Si ya se creó un avatar, se recupera el sector directamente. El botón «Cambiar traje» permite editarlo sin perder el avance.

En móvil: tocar el suelo para caminar o mantener las flechas táctiles; acercarse a un mecanismo y tocar «Explorar». En computadora: flechas/WASD y E. También se puede tocar un mecanismo cercano en el mapa. No hace falta escribir código. La pantalla funciona en vertical y reorganiza los mecanismos debajo del mapa en pantallas pequeñas.

Recorrido: encontrar suministros en (−3, +2), colocar tres piezas de pasarela, repartir 12 depósitos entre reactor/escudo/antena en mitades y cuartos, restaurar el patrón de pulsos y guiar un dron mediante «Ir», «Recoger» y «Volver». El hangar se abre al restaurar los sistemas. Se puede recuperar material y ajustar válvulas para volver a intentar sin reiniciar la partida.

`003_sector_one.sql` agrega `player_sectors` (avatar y estado por jugador) y `sector_events` (acciones de mecanismos y resultado, sin movimientos ni correo). Ya está aplicada en esta instalación. Para otra instalación ejecutar `npm run db:setup`. Cada acción aceptada o intento se procesa con sesión autenticada; posición, recursos y objetivos se validan en el servidor y el estado se guarda en una transacción con control de versión. No hay guardado anónimo ni dependencia de localStorage.

Esta primera versión usa movimientos por casillas y peticiones HTTP, con una partida individual por cuenta. La sincronización WebSocket, invitaciones cooperativas y animaciones avanzadas siguen pendientes. El observatorio docente ya está disponible. No se promete todavía una tasa de FPS o latencia sin mediciones en dispositivos reales. Ante desconexión se recupera el estado guardado; la aplicación requiere conexión con Node y MariaDB.

La migración `002_player_email` agrega `users.email`, único y normalizado a minúsculas. Ejecutar `npm run db:setup` para actualizar una instalación existente sin borrar cuentas. Las cuentas anteriores conservan correo NULL y siguen accediendo; completar sus correos y verificar su propiedad requiere un flujo posterior. Los nuevos registros sí exigen correo. No se envían mensajes ni se verifica propiedad todavía.

El correo permite buscar y relacionar estudiantes en el observatorio docente; los eventos siguen vinculados por `users.id`. El correo no aparece en las respuestas públicas de sesión ni en la identidad visible del jugador. La búsqueda docente se limita a sus grupos autorizados.

## Observatorio docente

Abrir **http://localhost:3000/docentes/** en la laptop o **http://192.168.1.150:3000/docentes/** desde la misma red. Con Apache también funciona `http://localhost/kinetika/docentes/`. Iniciar sesión con una cuenta de rol `teacher` o `admin`; las cuentas de jugador reciben 403 en la API. El observatorio está separado de la experiencia del jugador.

La pantalla ofrece **Iniciar sesión** y **Solicitar cuenta docente**. El registro pide nombre, institución, alias, correo y contraseña; crea la cuenta con privilegios de jugador y una solicitud pendiente, sin acceso a estadísticas. Una cuenta de jugador existente puede iniciar sesión en el observatorio y solicitar acceso sin duplicar su correo ni perder partidas. Una solicitud pendiente o rechazada solo permite consultar su propio estado, nunca datos de estudiantes.

Administración ve **Solicitudes docentes**: revisa nombre, institución y correo y decide aprobar o rechazar. La aprobación cambia el rol a `teacher`, pero no asigna grupos. Después debe usar «Asignar al grupo seleccionado» con el alias/correo y tipo «Docente habilitado». Los cambios se reflejan al pulsar «Actualizar estado», sin necesidad de crear otra sesión. El rechazo conserva la cuenta y su historial; para aclaraciones se indica contactar a administración. No se implementa reenvío automático de solicitudes rechazadas, notificaciones por correo ni verificación de identidad institucional.

`004_teacher_requests.sql` agrega la solicitud, su estado y la fecha/administrador de revisión. `npm run db:setup` aplica la migración sin alterar las cuentas o partidas previas. El registro comparte validaciones, bcrypt, límite de intentos y protección de origen con el acceso existente. El estado enviado por el navegador nunca habilita roles: solo una revisión administrativa autenticada cambia el rol en una transacción. Los registros docentes pendientes no se incorporan automáticamente como alumnos al ejecutar el asistente de grupos de desarrollo.

Incluye grupos, búsqueda por alias/correo dentro del grupo, lista paginada de estudiantes, estado actual de los seis mecanismos, último guardado y detalle de acciones aceptadas/rechazadas por mecanismo. El historial se muestra en páginas de 50 eventos, con fechas en la zona horaria del dispositivo. «Entraron al sector» significa que guardaron avatar y estado inicial; no se infiere tiempo activo ni dominio matemático. Los ajustes de válvulas y reguladores cuentan como acciones aceptadas, no como respuestas correctas. El historial es acumulado por jugador y puede ser anterior a su asignación al grupo.

Se reutilizan `learning_groups`, `group_members`, `player_sectors` y `sector_events`, sin reiniciar partidas ni requerir una migración nueva. Los administradores pueden crear grupos y asignar estudiantes o docentes ya habilitados mediante alias/correo exactos. Un docente ve únicamente sus grupos y alumnos; un administrador puede consultar todos los grupos. Las comprobaciones se realizan en el servidor en cada consulta, incluso si se manipula el ID o se revoca el rol con la sesión abierta.

Para preparar otra instalación local de desarrollo: `npm run teacher:setup`. El asistente crea `docente_local` con rol administrador y una contraseña aleatoria mostrada solo en la primera ejecución. Crea «Piloto de desarrollo» y relaciona los jugadores presentes al ejecutarlo. Una segunda ejecución conserva la contraseña y el avance; también incorpora los jugadores nuevos al grupo de prueba. No usar este asistente para grupos reales: las asignaciones del piloto son deliberadamente globales dentro de la base local `_dev`. Las credenciales no se guardan en el repositorio.

Para habilitar docentes, utilizar el registro/solicitud y la revisión desde el observatorio con `docente_local`; después asignar sus grupos. El registro público nunca acepta roles privilegiados. Un correo coincidente no concede acceso ni crea vínculos automáticamente. La promoción manual en phpMyAdmin se reserva al mantenimiento de cuentas existentes por una persona administradora de la base de datos.

### Estado de esta instalación de XAMPP

La base `redcero_dev` ya está creada. Se detectó corrupción en las tablas internas `mysql.global_priv` y `mysql.db`. Se respaldaron en `backups/` (excluido de Git); `global_priv` pasó la comprobación después de reparar su índice, pero `mysql.db` continúa dañada y bloquea los permisos de `redcero_app`. No se borraron ni recrearon tablas del sistema.

Para poder probar esta entrega, el `.env` local utiliza temporalmente `DB_USER=root`, contraseña vacía y `DB_ALLOW_LOCAL_ROOT=true`. Node admite dispositivos de la LAN; MariaDB se conecta por `DB_HOST=127.0.0.1`. **Esta excepción es únicamente de desarrollo.** El ejemplo de configuración conserva la cuenta dedicada recomendada y la aplicación impide usar root en producción. Reparar XAMPP con respaldo completo antes de habilitar la cuenta dedicada; después cambiar `.env` y ejecutar `npm run db:setup`. No utilizar esta instalación como servidor público.

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

En phpMyAdmin se ven las 11 tablas del dominio y `schema_migrations`. Al crear una cuenta aparecen filas en `users` y `auth_sessions`. No existen cuentas de jugador predeterminadas. La cookie mantiene la sesión durante 12 horas; cerrar sesión revoca el token en SQL. Las sesiones vencidas se rechazan aunque permanezcan en la tabla; su purga periódica queda pendiente.

`npm run dev` reinicia Node al modificar el servidor; los archivos del cliente se sirven directamente, sin compilación. `Ctrl+C` detiene Node.

## Verificación

Con Node y MariaDB en ejecución:

```powershell
npm test
```

La prueba de integración crea un jugador temporal, comprueba registro, duplicado, contraseña incorrecta, sesión, permisos de origen y cierre de sesión. Elimina su propio jugador al terminar. Ejecutarla únicamente contra la base local de desarrollo; usa `TEST_BASE_URL` si el servidor no está en el puerto 3000.

Comprobación manual: crear cuenta, elegir avatar, recorrer el sector y recargar para comprobar persistencia; cerrar sesión e ingresar de nuevo. Probar en un teléfono real la pulsación sostenida de flechas, navegación tocando el mapa, válvulas y desplazamiento vertical hasta los mecanismos. Las pruebas automáticas cubren el recorrido completo por API, restricciones de distancia, recursos, versión y conservación del avance al editar avatar. El panel tiene pruebas de acceso anónimo/jugador/docente/administrador, aislamiento de grupos y correos, conteos y revocación de roles. No se ha realizado validación visual automatizada en navegador ni medición en teléfonos reales. Este incremento no incluye recuperación de contraseña.

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
