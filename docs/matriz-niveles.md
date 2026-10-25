# Matriz de los dos niveles iniciales

Matriz actualizada el 25 de octubre de 2026. No es certificación curricular ni validación de eficacia educativa. Sector 01 individual disponible; primera versión individual de las cuatro zonas del Sector 02 implementada, con dos situaciones por zona, torre final y guardado separado. Hay nueva evidencia observacional en ambos sectores, sin reconstrucción histórica ni afirmación de dominio. Quedan pendientes pulido, validación pedagógica y cooperación con chat. No cambiar ni reiniciar partidas existentes para introducirlos.

## Nivel 1 — La estación despierta

Objetivo: entrar sin experiencia previa, aprender controles jugando y reunir evidencia inicial. Conservar baliza, pasarela, refrigeración, pulsos, dron y hangar actuales. No exigir programación ni seleccionar nombres de operaciones. El hangar abierto sigue significando misión terminada, no dominio demostrado.

| Mecanismo actual | Evidencia disponible | Falta para diagnóstico inicial |
| --- | --- | --- |
| Baliza en coordenadas | Intentos de interacción y resultado | Los eventos actuales no registran trayectorias: no inferir orientación espacial de desplazamientos no registrados. |
| Pasarela de tres piezas | Colocar, recuperar y recursos conservados | Separar exploración de intentos de resolución; una secuencia fija no prueba generalización. |
| Refrigeración 6/3/3 | Ajustes, intentos y restauración | Una distribución resuelta no basta para distinguir comprensión de ensayo. Añadir una variante futura sin alterar el mecanismo guardado. |
| Pulsos | Ajustes y señal aceptada/rechazada | Registrar valores y ayudas en futuras evidencias compatibles; no deducir estrategia de un contador. |
| Dron por gestos | Acciones y resultado | Ampliar observación de secuencias sin mostrar código ni atribuir conocimientos de programación textual. |
| Hangar | Estado de misión completo | Mostrar finalización separada de indicadores de aprendizaje. |

Implementado: ayudas visuales opcionales registradas por mecanismo con validación de proximidad; se conservan eventos anteriores. La estación tiene objetivos marcables, orientación inicial no bloqueante y transición al Sector 02. Pendiente: ampliar variantes y criterios diagnósticos, y distinguir suficiencia de evidencia sin atribuir dominio por finalización. Las partidas completadas conservarán su estado y podrán figurar con evidencia diagnóstica insuficiente. No inventar eventos históricos.

## Nivel 2 — Reconstrucción del enlace

Propuesta: recuperar un puesto de enlace mediante cuatro zonas que permiten explorar y corregir decisiones. La misma misión debe ser resoluble por una persona o un equipo. El desarrollo inicial será individual; el modo cooperativo no está implementado y requerirá permisos de sala, sincronización, recursos compartidos y atribución individual.

| Zona y objetivo | Acción visible y ejemplo de balance | Variantes y ayudas | Evidencia y aceptación |
| --- | --- | --- | --- |
| Plano de ruta: proporcionalidad, escalas y porcentajes | Elegir piezas de ruta usando una escala de 1 tramo por 5 m; 4 tramos representan 20 m. Ajustar un consumo al 75 % de una reserva de 20 unidades: 15 usadas y 5 restantes. | Cambiar escala o reserva entre situaciones. Ayuda con referencias visuales y previsualización, sin mostrar una receta obligatoria de regla de tres. | Registrar cantidades elegidas, cambios, ayuda y resultado. Aceptar estrategias equivalentes; verificar distintas relaciones, incluyendo porcentaje y escala, antes de inferir transferencia. |
| Taller: operaciones razonadas de varios pasos | Preparar 3 paneles de coste 4 y 2 conectores de coste 3 con 25 créditos: gasto 18 y saldo 7. El jugador arma el pedido y decide si puede pagarlo. | Variar cantidades y presupuesto; permitir devolver piezas y revisar el desglose. No hay dinero real ni compras dentro de la app. | Registrar pedido, saldo calculado por servidor y decisiones, no solo clics. Conservar créditos y materiales ante reintentos; resolver dos configuraciones distintas sin exigir una expresión escrita. |
| Depósitos: fracciones, decimales y medición | Trasvasar un cuarto de un depósito de 1 L usando un medidor decimal: 0.25 L. Después usar 3/4 de 2 L: 1.5 L. | Cambiar capacidad y escala; mostrar divisiones del recipiente como ayuda. Evitar que una posición memorizada del control siempre resuelva. | Comparar cantidades físicas equivalentes. Distinguir fracción de la unidad y fracción de una capacidad; registrar transferencias y ayudas. Usar unidades enteras pequeñas internamente para evitar errores de coma flotante. |
| Refugio: perímetro y área | Delimitar un rectángulo de 4 por 3 m: 14 m de borde y 12 m² de piso, con paneles de 1 m². | Comparar con un refugio de 6 por 2 m: misma área y distinto perímetro. Permitir mover el diseño antes de gastar. | Registrar diseño y materiales para borde y piso por separado. Verificar que la lógica distinga longitud y superficie, y maneje esquinas sin doble conteo. |

Los valores son ejemplos de diseño verificables, no ejercicios que deban aparecer como preguntas en pantalla. Usar construcción, instrumentos, inventario y consecuencias en el mundo; no formularios de operaciones, exámenes ni opciones de respuesta escolares. Las variantes se configuran desde servidor y quedan asociadas al estado guardado para que recargar no cambie el problema.

## Evidencia y estadísticas

- Para cada decisión relevante: jugador autor, partida/nivel, mecanismo, variante, estado previo y posterior mínimo, resultado, ayuda utilizada, fecha y versión de esquema. No guardar contraseñas, correos en eventos ni cada fotograma/movimiento.
- Separar finalización de misión, acciones observadas y evidencia disponible. No llamar «correctos» a todos los ajustes aceptados por el servidor.
- No fijar aún un umbral de «dominio»: diseñar y validar indicadores con situaciones diferentes y usuarios reales. «Evidencia insuficiente» es un resultado válido.
- En equipo, atribuir acciones al autor. Observar que un compañero resolvió no prueba que los demás sepan resolver. El avance compartido y la evidencia individual deben tener campos distintos.
- Grupos docentes sirven para consultar estadísticas de jugadores autorizados; equipos libres sirven para jugar. No reutilizar el grupo docente como permiso para acceder a salas o chat.

## Entrega y comprobación

1. Instrumentación compatible del Sector 01 y vista docente que distinga avance de evidencia. Verificar regresión de partidas antiguas y nuevas.
2. Primera zona del Sector 02 con estado propio y persistente, sin sobrescribir `player_sectors` del Sector 01. Definir esquema aditivo y contrato de acciones antes de migrar.
3. Completar las otras zonas y validar que se puede terminar y retomar todo el nivel en solitario, sin depender de otro jugador.
4. Equipos libres, invitaciones de sala y cooperación: acceso ajeno rechazado, doble gasto imposible, reconexión y autoría verificadas.
5. Validación de comprensión, accesibilidad y rendimiento en laptop/teléfono; ajustar dificultad y ayudas a observaciones reales. Contrastar cobertura curricular antes de anunciar regularización integral.

El usuario exige chat en tiempo real desde la primera entrega jugable en equipos. Desarrollar cooperación y chat juntos con permisos, moderación y protección; mensajes predeterminados no sustituyen por sí solos el requisito de chat. Las pruebas reales del usuario con sus dispositivos se harán cuando ambos niveles estén completos; continuar verificaciones automáticas mientras tanto.
