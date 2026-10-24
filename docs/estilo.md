## 1. Identidad de Marca y Diseño (`redcero.com.mx`)
* **Arquetipo Visual:** Ciberpunk accesible / Sci-Fi retro-moderno.
* **Paleta de Colores Oficial:**
  * **Negro Abisal:** `#0B0F19` (Fondo principal)
  * **Gris Estructural:** `#1E293B` (Paneles y contenedores)
  * **Azul Ciber:** `#00F0FF` (Botones, enlaces y energía)
  * **Verde Terminal:** `#10B981` (Éxito, conexión y mecanismos activados; el nombre del color no implica mostrar una consola)
  * **Blanco Radiante:** `#F8FAFC` (Tipografías y textos)
* **Tipografías Recomendadas:**
  * Títulos y Logotipo: **Orbitron** o **Rajdhani**
  * Interfaz y Código: **JetBrains Mono** o **Inter**

## 2. Regla de experiencia: jugar desde cero

- En primero de secundaria se asume que los jugadores no tienen conocimientos de programación. Ninguna acción inicial debe exigir escribir comandos, scripts, sintaxis, usar consolas o entender términos técnicos.
- Deben sentir que están en un videojuego en todo momento: explorar, construir, experimentar y cooperar dentro del mundo. No presentar cursos, lecciones, ejercicios, cuestionarios, exámenes o pantallas con apariencia de aplicación de enseñanza.
- La lógica se descubre mediante acciones visibles: marcar un recorrido, colocar piezas, conectar energía y dar indicaciones a un compañero o dron con gestos e iconos. Las pistas se muestran en el entorno y permiten probar de nuevo sin interrumpir la partida.
- Para el primer dron: señalar un destino, recoger una celda y volver. Introducir acciones nuevas de una en una mediante animación y demostración. No mostrar un editor de bloques ni pseudocódigo en el Nivel 1.
- La programación textual podrá explorarse en fases posteriores, de forma opcional y tras progresión jugable; nunca será un requisito de entrada ni un bloqueo para avanzar con amigos en el MVP.
- La documentación técnica, los comandos npm y las herramientas de desarrollo son para desarrolladores. El jugador no debe necesitarlos ni ver errores internos, nombres de endpoints, bases de datos o mensajes de depuración.
- Usar palabras del mundo y acciones claras: «Ir», «Recoger», «Volver», «Abrir», «Reparar». Evitar «ejecutar script», «compilar», «AST» o «variable» en la interfaz del jugador.

## 3. Aplicación visual

- Títulos y marca: Rajdhani; interfaz: Inter, servidas localmente con sus licencias. Usar fuentes de sistema como respaldo.
- Mantener contraste y legibilidad en móvil. Azul para acciones y energía; verde para éxito. Acompañar siempre los estados con texto o iconos, sin depender solo del color.
- La estética de ciencia ficción se expresa mediante el mundo, la iluminación y los objetos, sin convertir la interfaz en una consola técnica. Los formularios de acceso deben seguir siendo simples y reconocibles.
- Validar cada mecánica con esta pregunta: ¿una persona que nunca ha programado puede entender qué intentar viendo el mundo y sus controles?

## 4. Assets de marca

- `public/assets/logotipo.svg`: firma completa en el encabezado de escritorio.
- `public/assets/isotipo.svg`: encabezado compacto en móvil, favicon y emblema de bienvenida de la tripulación.
- Mantener los originales SVG, su proporción y colores; no sustituir la marca por caracteres tipográficos ni estirar las imágenes.
- El enlace de inicio conserva su nombre accesible. El emblema de bienvenida es decorativo y usa texto alternativo vacío para evitar lecturas repetidas.
