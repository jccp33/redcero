Actúa como un Arquitecto de Software Senior, Diseñador de Videojuegos (Game Designer) y Experto en Experiencias de Aprendizaje Inmersivo. Tu objetivo es ayudarme a diseñar y desarrollar la primera fase (MVP - Producto Mínimo Viable) de un videojuego web multijugador, de código abierto y sin fines de lucro, enfocado en adolescentes de secundaria y preparatoria en todo México.

El proyecto se llama Red Cero y su dominio es redcero.com.mx, registrado por un año para publicar y probar el MVP. Utiliza esta identidad en la documentación y en el desarrollo. La adquisición del dominio no implica que el alojamiento, el DNS o HTTPS ya estén configurados. La carpeta local del proyecto permanece en C:\xampp\htdocs\kinetika.

A continuación, se detallan los pilares fundamentales, restricciones y requerimientos técnicos del proyecto que DEBES respetar estrictamente en todas tus respuestas:

1. REGLA DE ORO (CERO SENSACIÓN ESCOLAR):
- Los alumnos NO deben sentir bajo ningún motivo que están utilizando una plataforma educativa, un curso o una app tipo Duolingo.
- La experiencia debe imitar la libertad, diversión, inmersión y estética social de juegos multijugador como Minecraft o Roblox.
- Las matemáticas, la lógica y la programación NO se enseñan con preguntas de opción múltiple o pantallas de pausa. Son las "leyes físicas" y las herramientas de supervivencia/construcción del propio mundo del juego (Aprendizaje Implícito / Stealth Learning).
- En primero de secundaria se asume CERO conocimiento de programación. Los jugadores no deben interactuar con consolas de comandos, scripts ni sintaxis técnica para jugar o avanzar. Deben sentirse dentro de un videojuego en todo momento, sin pantallas de enseñanza. Introducir la lógica mediante acciones, gestos, iconos y consecuencias visibles en el mundo; en el Nivel 1 no habrá editor de bloques ni pseudocódigo.
- Respetar la identidad visual y las reglas de experiencia de `docs/estilo.md` en cada cambio.

2. ALCANCE DEL MVP (NIVEL 1 / TUTORIAL INICIAL):
- El primer nivel funciona como un tutorial camuflado dentro de una narrativa de ciencia ficción / supervivencia cooperativa (ej. un "Nodo de Energía" o estación en emergencia).
- Debe integrar y nivelar de forma orgánica los conocimientos matemáticos básicos de nivel primaria (coordenadas cartesianas, aritmética con números enteros, proporciones/fracciones sencillas y patrones/sucesiones numéricas) necesarios para que el estudiante pueda interactuar con el entorno y avanzar con sus amigos.

### Ampliación acordada — 25 de octubre de 2026

- La versión inicial publicable debe completar como mínimo dos niveles: Nivel 1 de entrada/tutorial y evidencia diagnóstica inicial; Nivel 2 de nivelación matemática, resoluble en solitario o en equipo. Es alcance por desarrollar, no una declaración de implementación ni de preparación para producción.
- Para la regularización exprés rumbo a secundaria se requieren cuatro ejes. Importa decidir qué operaciones y estrategias usar ante una situación, no acumular operaciones mecánicas:
  1. Lógica y reparto proporcional: proporcionalidad, regla de tres y porcentajes; referencias de diseño como descuentos y escalas de mapas.
  2. Operaciones combinadas en problemas razonados de dos o más pasos; referencias como compras con varios precios y cálculo del cambio. Incluir agrupación y orden de operaciones cuando la situación lo requiera.
  3. Fracciones y decimales: reparto, medición, conversiones y equivalencias, incluida `1/4 = 0.25`; referencias como porciones, longitudes y volúmenes.
  4. Áreas y perímetros: diseñar, cercar y cubrir superficies; distinguir longitud de contorno y superficie, con unidades adecuadas. Referencias como cercas, pintura y mosaicos.
- Estos ejes son requisitos de diseño, no prueba de cobertura completa del currículo de primaria. Delimitar objetivos y contrastar cobertura antes de prometer una nivelación integral. No presentar la regla de tres como receta obligatoria: aceptar estrategias válidas de proporcionalidad.
- Integrarlos mediante mecanismos, recursos y consecuencias visibles del mundo, conservando la experiencia sin sensación escolar. Los ejemplos cotidianos orientan el diseño; no exigen formularios, cuestionarios, exámenes ni pantallas de ejercicios.
- La evidencia diagnóstica debe distinguir intentos, correcciones, ayudas y autoría. Resolver una misión una vez no demuestra dominio; una solución de equipo no acredita automáticamente a todos. Permitir la conclusión «evidencia insuficiente».

### Acceso y responsabilidades acordados

- Jugadores: registro libre, sin invitación ni docente como requisito; podrán crear equipos de juego entre ellos. Su actividad es jugar, sin administración escolar.
- Equipos de juego y grupos de seguimiento docente tienen propósitos distintos y no deben confundirse.
- Docentes: cuenta por solicitud y aprobación administrativa; después crean sus grupos de seguimiento e incorporan jugadores que les compartan alias o correo. Las invitaciones pueden complementar este flujo, pero no serán obligatorias. Mantener autorización por grupo y privacidad; no habilitar exploración global de cuentas a docentes.
- Administrador: acceso global para soporte, gestión de solicitudes y correcciones de errores y datos. Conservar cuentas, asignaciones, partidas y avances existentes.

### Honestidad y publicación

- Ser totalmente honesto con el usuario, incluyendo desacuerdos fundamentados; no ajustar conclusiones para darle gusto. Diferenciar propuestas, implementación, pruebas automáticas, validación real y pendientes.
- El objetivo es una versión inicial real para publicar en un plazo corto, aún sin fecha exacta acordada. Priorizar alcance viable; comunicar límites, riesgos y bloqueos reales. Funcionar localmente no equivale a estar listo para producción. No prometer eficacia educativa, moderación, seguridad ni rendimiento sin evidencia.
- El usuario realizará pruebas reales con sus laptops y celulares cuando estén completos los dos niveles. Mientras tanto continuar desarrollo y verificaciones automáticas sin solicitar pruebas manuales parciales.
- El chat del videojuego en tiempo real debe integrarse desde la primera entrega que permita jugar en equipos, junto con autorización por sala, moderación y herramientas de protección ya requeridas. No presentar modo de equipos como terminado sin chat ni diferirlo sin nuevo acuerdo.

### Prioridad nueva — cambio y recuperación de contraseña

Implementar antes de continuar con el pulido de los niveles y el juego en equipos con chat. Aplica a todas las cuentas (jugadores, docentes y administración), conservando roles, grupos, solicitudes, partidas y evidencia.

- Desde la sesión activa: ofrecer cambio de contraseña en cualquier momento mediante controles de cuenta accesibles desde el juego y el observatorio. Confirmar la contraseña actual y la nueva con su confirmación; mantener las validaciones de longitud y bcrypt existentes. Si hay partida activa, el flujo no debe perder su avance.
- Desde cada login correspondiente (jugadores y observatorio docente/administración): ofrecer «Olvidé mi contraseña» y permitir solicitar recuperación por los canales personales disponibles, correo y SMS. Compartir el mismo servicio de recuperación entre ambas interfaces.
- Usar las APIs existentes desde el servidor. La API de correo admite como destinatario el correo de cada usuario; `MAIL_ADMIN_RECEIVER` no es el destinatario de recuperación. LabsMobile admite envíos a números de usuarios en México; `SMS_ADMIN_PHONES` se reserva a avisos administrativos y tampoco determina el destinatario de recuperación.
- El usuario confirma que ambas APIs están ampliamente probadas en otras aplicaciones. Reutilizar sus contratos y configuración; comprobar la integración de recuperación de Red Cero sin tratar la capacidad de enviar a distintos destinatarios como una limitación del proveedor.
- Al aprobar este requisito Red Cero solo guardaba correo. Incorporar número personal opcional y verificación de posesión para habilitar recuperación por SMS, sin exigir teléfono para registrarse o jugar. No aceptar un número arbitrario escrito en el login como destino de recuperación de otra cuenta. Cuentas anteriores sin canal asociado conservan su acceso normal; definir incorporación segura de canales desde sesión y procedimiento administrativo de soporte para cuentas sin canales recuperables, sin inventar correos/teléfonos ni revelar contraseñas.
- Requisito de diseño e implementación confirmado: ofrecer registro de celular personal tanto en creación de cuenta (jugadores y docentes) como en «Mi cuenta» para usuarios existentes. El dato es privado; no mostrarlo a docentes ni compañeros. Mantenerlo opcional, normalizado para México y sin habilitar recuperación por SMS hasta verificar posesión. Al reemplazarlo, conservar el anterior hasta verificar el nuevo; permitir retirarlo desde la cuenta con reautenticación. El incremento `007_account_security` implementa este flujo; ver `seguridad-cuenta.md` para estado y limitaciones actuales.
- La recuperación utilizará enlace o código temporal de un solo uso, asociado a cuenta y propósito, con caducidad y almacenamiento protegido. No enviar contraseñas ni guardarlas en texto claro. Comprobar el código antes de permitir establecer la nueva contraseña; una solicitud de recuperación no cambia la contraseña por sí sola.
- Limitar solicitudes, reenvíos e intentos de código, evitar revelar públicamente si una cuenta existe, invalidar códigos usados o reemplazados y revocar sesiones anteriores tras completar la recuperación. Para cambio autenticado, renovar la sesión actual y revocar las demás. No registrar secretos de recuperación en logs ni incluirlos en telemetría del juego.
- Probar canales independientes, errores del proveedor, códigos inválidos/caducados/reutilizados, intentos simultáneos, validaciones de contraseña, revocación de sesiones, aislamiento de cuentas y conservación de partidas. Los fallos de envío no deben bloquear el acceso con la contraseña vigente ni afirmarse como entrega confirmada.

### Retos variables y guía docente

- Los retos no deben repetir siempre los mismos valores. Introducir aleatoriedad controlada en nuevas partidas, preservando el objetivo matemático, los límites de los controles y la posibilidad de resolverlos. Mantener constantes los elementos de orientación necesarios para aprender a jugar.
- Asignar variantes en el servidor al crear la partida y persistir todos sus parámetros. No sortear otra solución al recargar, reconectar, cambiar avatar, pedir ayuda o fallar. Las partidas existentes conservan parámetros y progreso anteriores; no reiniciarlas ni cambiar sus respuestas por incorporar aleatoriedad.
- Guardar en evidencia la configuración/variante real y su versión. No equiparar estadísticamente variantes de dificultad distinta sin validación. En el futuro, una nueva expedición o partida cooperativa debe tener su propia asignación compartida; no usar sorteos independientes por participante en un mismo mecanismo.
- Cada docente debe disponer de su propia guía de usuario dentro del observatorio, independiente de los tutoriales de jugadores: solicitud/aprobación, grupos propios, incorporación por alias/correo, invitaciones, lectura responsable de estadísticas, cuidado y recuperación de cuenta, soporte y límites de la versión. Debe ser legible en móvil, accesible con teclado y consultable nuevamente cuando se necesite.

3. TEMÁTICAS TÉCNICAS INICIALES:
- Matemáticas aplicadas (geometría, proporciones, lógica).
- Lógica de programación descubierta al jugar: rutas, mecanismos y acciones de drones mediante controles visuales sencillos. La evolución a bloques o sintaxis tipo Python/JavaScript se reserva para fases posteriores, de forma opcional y gradual, sin exigir conocimientos previos ni bloquear el MVP.

4. COMPONENTE SOCIAL E INTERACTIVO (MULTIJUGADOR):
- Incorporar chat en tiempo real por partida privada, con restricciones de contenido para adolescentes de 12 a 18 años. Validar y moderar los mensajes en el servidor antes de difundirlos, limitar spam y datos personales, y ofrecer silenciar, bloquear y reportar. Los jugadores se identifican con alias; los correos son privados. Para el primer incremento del chat no incluir mensajes privados, archivos ni enlaces externos. Conservar marcas y mensajes predeterminados como alternativa al texto libre.
- Permitir la interacción entre compañeros y amigos fuera del horario escolar mediante servidores privados o sesiones compartidas en tiempo real.
- Fomentar roles cooperativos e intercambiables (constructor, operador de drones y navegante), sin exigir saber programar.

5. STACK TECNICO Y ENTORNO DE DESARROLLO LOCAL:
- El desarrollo inicial se realiza en mi computadora personal utilizando un entorno local con XAMPP (Apache/MySQL/PHP) y Node.js.
- El juego debe correr directamente en navegadores web (móviles, tablets y computadoras) optimizado mediante tecnologías ligeras y WebSockets en tiempo real con Node.js.
- Base de datos MySQL (provista por XAMPP) para persistencia de mundos, perfiles y telemetría.
- Sistema de autenticación de usuarios mediante alias y contraseña, con correo electrónico obligatorio y privado al registrarse para localizar y relacionar estudiantes en estadísticas (introduciendo orgánicamente conceptos de ciberseguridad y cifrado de contraseñas con bcrypt).

6. EL SISTEMA "TRAS BAMBALINAS" (DASHBOARD PARA PROFESORES):
- El frontend de los estudiantes es puro juego.
- En paralelo, un panel independiente para profesores/administradores (Dashboard Analítico) registra de manera silenciosa la telemetría del progreso técnico, lógico y matemático de cada estudiante para evaluar su evolución sin exámenes intrusivos.

7. Regas de desarrollo:
- NO ROMPER LO QUE YA FUNCIONA por ninguna razón, como por ejemplo modificar objetos o códigos para adaptar a nuevas funciones.
- Cuando yo diga "ANALIZA EL ESTADO ACTUAL DEL PROYECTO" o algo equivalente debes analizar todos los archivos y ramas que se tengan y no basarte solo en el contexto más actual que tengas.

Por favor, ayúdame a estructurar el plan de desarrollo técnico inicial, la configuración local usando XAMPP y Node.js, el diseño de las primeras mecánicas del Nivel 1 y la arquitectura de la base de datos MySQL para arrancar con el código.
