# Red Cero — plan del MVP

Estado: propuesta técnica ejecutada a partir de `prompt-maestro.md`. No existe todavía una aplicación. La identidad del proyecto es **Red Cero**, con dominio **redcero.com.mx**, registrado por un año para publicar y probar el MVP. El alojamiento, el DNS y HTTPS quedan pendientes de configuración y verificación. La fecha exacta de vencimiento se consultará en el registrador; no se deduce de la fecha de esta documentación.

## Experiencia y alcance

Una estación abandonada despierta cuando llega una tripulación. Sus sistemas están desconectados: los jugadores exploran, recuperan piezas, distribuyen energía y programan un dron para abrir el hangar. La estación se transforma de forma visible con cada reparación. No hay exámenes, calificaciones, pantallas de lecciones ni vocabulario escolar en el juego.

MVP: mapa 2D cenital, partidas privadas de 1 a 4 participantes, una misión de 15–25 minutos, avatares, movimiento, construcción limitada a puntos de conexión, inventario compartido, dron y guardado. Se puede explorar y decorar el refugio después de restaurarlo. Roles intercambiables: constructor, operador de drones y navegante; ninguna capacidad queda bloqueada por rol. En solitario se pueden realizar todas las acciones.

Quedan para después: mundo infinito, comercio, chat abierto, voz, editor público de mundos y ejecución de código escrito libremente. Para comunicarse inicialmente hay marcas en el mapa y mensajes predeterminados.

## Nivel 1: estación a oscuras

| Tramo | Acción dentro del mundo | Regla que descubre el jugador | Evidencia interna |
| --- | --- | --- | --- |
| Baliza | Localizar una batería en la cuadrícula del radar y marcarla para un compañero | Origen, ejes y desplazamientos positivos/negativos; por ejemplo llegar a (-3, 2) | Trayectoria y correcciones tras consultar radar |
| Pasarela | Colocar tres segmentos en una brecha; un tramo recuperado suma material y desmontarlo lo devuelve | Sumas, restas y conservación de inventario | Colocaciones válidas, desmontajes y gasto neto |
| Refrigeración | Repartir 12 unidades: 6 al reactor, 3 al refrigerador y 3 a la antena con válvulas físicas | Mitad, cuartos y proporción 2:1:1 | Distribuciones probadas y estabilización |
| Relé | Observar pulsos de 2, 4 y 6 unidades y ajustar el siguiente a 8 mediante un regulador | Patrón de incremento constante | Ajustes y uso de pistas ambientales |
| Hangar | Armar una secuencia de bloques para que el dron recoja dos celdas y active el relé | Secuencia, repetición y condición de obstáculo | Programa validado, ejecuciones y revisiones |

Cada mecanismo responde de inmediato: luces, sonido, flujo de refrigerante y movimiento. Un error consume unos segundos y permite recuperar recursos; nunca elimina el progreso. El radar muestra coordenadas como instrumento de navegación. Las válvulas muestran depósitos y flujo además de números. Las pistas aparecen como señales del sistema tras varios intentos, sin detener la partida. El orden de exploración es libre; el hangar requiere los sistemas restaurados.

La cuenta de acceso se presenta como credencial de tripulación: alias y contraseña. Una terminal explica de forma opcional que la estación guarda una huella de la contraseña, nunca el texto original; técnicamente bcrypt realiza hashing, no cifrado reversible.

## Arquitectura propuesta

Navegador → Apache (cliente estático) y Node.js (API HTTP + Socket.IO) → MySQL/MariaDB de XAMPP.

- Cliente: TypeScript, Vite y Canvas 2D. Renderizar solamente la zona visible; sprites pequeños, controles táctiles y teclado. No hace falta motor 3D para este alcance.
- Servidor: Node.js en una versión LTS soportada, TypeScript, Express, Socket.IO, mysql2 y bcrypt. Fijar versiones y guardar el lockfile al implementar.
- Apache sirve `dist/` bajo `/kinetika/`. Node escucha inicialmente en `127.0.0.1:3000`. PHP no es necesario para la lógica; XAMPP aporta Apache y la base de datos.
- Dashboard en `/docentes/`, con autorización del servidor por grupo asignado; ocultar enlaces no constituye autorización.
- Un proceso Node y una sala de Socket.IO por partida son suficientes para el piloto. El estado activo reside en memoria; los puntos de control se persisten en la base de datos.

Organización prevista:

```text
client/                 juego y vista docente separada
server/src/auth/        cuentas y sesiones
server/src/game/        simulación, reglas y salas
server/src/persistence/ consultas y transacciones
server/src/telemetry/   eventos y agregados
shared/                 contratos y validadores
database/               migraciones SQL
docs/                   decisiones y operación local
```

## Simulación y red

El cliente envía intenciones, nunca resultados: `move`, `interact`, `place_segment`, `set_valve`, `program_drone`. El servidor comprueba sesión, pertenencia a partida, distancia, recursos, límites y fase. Solo él calcula inventario, posiciones aceptadas y restauración de sistemas.

Objetivo inicial: simulación a 20 pasos/s, difusión de cambios a 10/s e interpolación visual. Son presupuestos a medir en dispositivos reales, no garantías. Movimiento mediante entrada y número de secuencia; no escribir cada posición en SQL. Guardar al resolver mecanismos, salir y cada 15 segundos. Una caída puede perder desde el último guardado; al volver a levantar Node se recupera el último punto de control.

Cada comando discreto lleva `commandId`; deduplicación por partida y respuesta de aceptación o rechazo. Dos jugadores que intentan gastar la última pieza se resuelven en orden en la simulación. El checkpoint y los eventos asociados se escriben en una transacción. Cada snapshot tiene versión monotónica para impedir sobrescrituras atrasadas. Una reconexión autenticada recibe snapshot completo y recupera su avatar; una partida llena rechaza nuevos participantes.

Los bloques del dron forman un AST limitado: mover, girar, recoger, repetir y detectar obstáculo. El servidor interpreta ese AST con máximo de instrucciones y pasos. No usar `eval`, `Function` ni ejecutar Python/JavaScript arbitrario. Una vista opcional puede mostrar pseudocódigo equivalente; la sintaxis editable real requiere una fase posterior con aislamiento diseñado expresamente.

## Identidad y datos

Sesión opaca aleatoria, hash del token en SQL y cookie HttpOnly; expiración y revocación al salir. Usar Secure en HTTPS y SameSite, comprobar origen/CSRF en mutaciones y autenticar también el handshake de Socket.IO. Desarrollo con orígenes explícitos y credenciales; nunca CORS abierto con cookies. Limitar intentos de acceso y frecuencia/tamaño de mensajes. bcrypt con coste inicial 12 sujeto a medición, sal automática y límite de entrada de 72 bytes UTF-8; nunca truncar en silencio.

Las salas se comparten mediante invitaciones aleatorias con caducidad, almacenadas como hash, no mediante identificadores consecutivos. Crear docentes y administradores por un procedimiento administrativo, nunca mediante un campo aceptado del registro público. Usar consultas parametrizadas y una cuenta SQL propia sin privilegios administrativos.

## Modelo de datos

`database/001_initial.sql` contiene una propuesta importable en una base vacía. No crea cuentas SQL ni contiene contraseñas. Relaciones:

- `users` y `auth_sessions`: credenciales, roles globales y sesiones revocables.
- `learning_groups`, `group_members`: grupos y vínculo explícito de docentes y participantes.
- `worlds`, `world_members`: propietario, grupo opcional y acceso persistente al mundo.
- `game_sessions`, `game_participants`: partidas y participación histórica.
- `world_snapshots`: último estado serializado con versión; el estado incluye mapa, mecanismos, inventario y programas de drones.
- `room_invites`: invitaciones temporales, cupo y contador; canje atómico.
- `telemetry_events`: evidencia granular vinculada a un participante real, no puntuación inferida por el navegador.

El estado y los detalles de eventos se serializan como JSON en LONGTEXT, con validación de esquema en Node; así no se depende de particularidades del tipo JSON entre versiones de MySQL y MariaDB. InnoDB, utf8mb4 y claves foráneas. La aplicación valida límites, roles y transiciones antes de persistir.

## Panel y telemetría

El juego emite eventos del servidor: `radar_target_reached`, `segment_placed`, `valve_adjusted`, `relay_stabilized`, `drone_program_executed`, `hint_requested` y `objective_completed`. Campos: identificador único, participante, mecanismo, versión del esquema, instante del servidor y detalles mínimos (intento, resultado, recursos, ayuda). No registrar contraseñas, texto libre ni cada movimiento.

El panel muestra evidencia por mecanismo: intentos, resolución, ayudas, revisiones y colaboración, con fecha y tamaño de muestra. Una reparación compartida no prueba dominio individual; no atribuirla a todo el equipo ni generar calificaciones automáticas. Los docentes ven solo sus grupos; registrar administrativamente sus asignaciones. Recoger alias, evitar datos personales innecesarios y explicar la telemetría fuera del flujo de juego. Propuesta inicial de retención: 90 días para eventos detallados, revisable antes del piloto; ofrecer eliminación de cuenta y datos relacionados. Las políticas para participantes menores deben definirse antes del uso con alumnos reales.

## Configuración local en Windows

1. Iniciar Apache y MySQL desde el panel XAMPP. Comprobar puertos reales; el plan usa 80 y 3306. Ejecutar `C:\xampp\mysql\bin\mysql.exe --version` para identificar si el motor es MySQL o MariaDB.
2. Verificar `node --version` y `npm --version`; utilizar una línea LTS soportada. No instalar dependencias hasta crear los paquetes correspondientes.
3. Crear una base vacía `redcero_dev` con utf8mb4 desde phpMyAdmin. Seleccionarla e importar `database/001_initial.sql`. No ejecutar la migración sobre una base existente con tablas homónimas. Si ya se creó una base siguiendo la versión anterior (`nodo_dev`), mantener su nombre en la configuración hasta planificar una migración; este ajuste documental no renombra bases existentes.
4. Crear un usuario SQL local propio para la base de desarrollo, con SELECT/INSERT/UPDATE/DELETE para ejecución. Reservar DDL a la cuenta de migraciones. Guardar los valores en `.env`, excluido de Git.
5. Al implementar, configurar `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME=redcero_dev` (o el nombre de la base ya existente), usuario y contraseña propios; `PORT=3000`, `CLIENT_ORIGIN=http://localhost:5173` y `SESSION_TTL_HOURS=12`.
6. Desarrollo previsto: Vite en `http://localhost:5173` y API/socket en `http://localhost:3000`. Compilación: configurar base `/kinetika/` y copiar solamente los archivos del cliente a la ubicación pública; no publicar `.env`, SQL ni código del servidor. Configurar Apache para denegar acceso HTTP a esos archivos antes de alojarlos bajo htdocs.
7. Para pruebas con teléfonos, usar la IP LAN de la computadora y actualizar origen, direcciones de escucha y firewall solo para la red privada. `localhost` en el teléfono apunta al propio teléfono. Para jugar fuera de casa será necesario desplegar un servidor accesible con HTTPS/WSS; XAMPP local por sí solo no lo proporciona.

Los comandos npm de arranque se definirán con el primer incremento de código: todavía no existen scripts ejecutables en este proyecto.

## Publicación del piloto en redcero.com.mx

La dirección pública prevista es `https://redcero.com.mx/`, con el panel independiente en `https://redcero.com.mx/docentes/`. El juego y el backend compartirán origen: el servidor web servirá el cliente y enviará `/api/` y `/socket.io/` al proceso Node mediante proxy inverso. Esta es la topología propuesta; aún no está desplegada.

Para publicar: contratar o preparar un alojamiento con proceso Node persistente, soporte de WebSockets y base de datos privada; apuntar los registros DNS al alojamiento; emitir y verificar el certificado TLS; configurar el proxy y el arranque automático de Node. En producción, la base del cliente será `/` y `CLIENT_ORIGIN=https://redcero.com.mx`; la ruta local `/kinetika/` se conserva únicamente para Apache de desarrollo. No exponer MySQL a Internet. Separar las credenciales y los datos de producción de los de desarrollo.

Antes de abrir el piloto, verificar acceso desde una red externa, conexión WSS, registro e inicio de sesión, invitaciones entre dos dispositivos, reconexión, guardado y permisos del panel docente. El dominio está disponible según lo informado por el propietario; no se ha comprobado su resolución ni se han modificado servicios externos.

El año contratado es la ventana inicial de publicación y pruebas. Registrar la fecha exacta de vencimiento y programar recordatorios de renovación con el registrador. Antes del vencimiento, decidir la continuidad del piloto y respaldar la base y los mundos.

## Entrega incremental y verificación

1. Base: inicializar Git, elegir licencia de código abierto, crear paquetes y configuración; conexión SQL, migración y endpoint de salud. Aceptación: arranque limpio documentado y secretos fuera del directorio público.
2. Corte jugable: un jugador explora la estación, recoge una batería y abre una puerta. Aceptación: controles de teclado y táctiles; recursos recuperables y sesión sin bloqueos.
3. Cooperación: registro/acceso, invitación, 2–4 avatares y estado autoritativo. Aceptación: dos navegadores ven las mismas acciones; acceso ajeno rechazado; doble gasto imposible.
4. Misión completa: cuatro mecanismos, dron por bloques y final de hangar. Aceptación: recorrido completo solo o en equipo, sin preguntas escolares y con pistas dentro del mundo.
5. Persistencia y observación: reconexión, checkpoints, telemetría y panel por grupo. Aceptación: reinicio recupera snapshot; eventos no se duplican; docente ajeno no obtiene datos.
6. Piloto: comprobar teléfono de gama media, tablet y computadora; medir FPS, tráfico y latencia. Objetivos iniciales: 30 FPS en móvil de referencia, carga comprimida del juego inferior a 5 MB y respuesta perceptible inferior a 200 ms en LAN. Registrar resultados y ajustar los presupuestos.

Para cada incremento: cambios pequeños, copia de seguridad antes de migrar datos existentes y comprobación del recorrido que ya funcionaba. Las mejoras futuras se añaden mediante módulos y contratos estables; si una corrección exige tocar código existente, se mantiene su comportamiento observable y se verifica la regresión. No prometer que nunca se modificará código: el requisito operativo es conservar lo que funciona.

## Referencias técnicas

- Node recomienda líneas Active LTS o Maintenance LTS para producción: https://nodejs.org/en/about/previous-releases
- Las salas permiten dirigir eventos a los participantes de una partida: https://socket.io/docs/v4/rooms/
- Integridad referencial en MySQL/InnoDB: https://dev.mysql.com/doc/refman/8.0/en/constraint-foreign-key.html

Las decisiones de jugabilidad, límites de rendimiento y estructura de servicios son propuestas de este proyecto; no garantías de las herramientas.
