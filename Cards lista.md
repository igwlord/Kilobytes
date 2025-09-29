¡Listo! Pegá este **prompt** en tu IA de código para que te genere las **flip-cards** con tu info y con el **“Ejemplo práctico”** destacado visualmente.

---

**PROMPT PARA LA IA (copiar/pegar):**

Quiero un módulo en **React + Tailwind CSS** (sin dependencias extra) que muestre **tarjetas flip (front/back)** para tips de nutrición/hábitos.
Requisitos clave:

1. **UX/UI**

* **Front (cara A):** emoji + título + 1 frase breve (máx. 120 caracteres).
* **Back (cara B):** descripción breve (2–4 líneas) y un bloque “**Ejemplo práctico**” **destacado visualmente** (callout con borde izquierdo, fondo sutil y emoji ✅).
* **Flip** al hacer **click** o **Enter/Space** (accesible).
* **Hover** con sombra suave. **Focus ring** claro para teclado.
* **Responsive** (grid 1 col en mobile, 2 en tablet, 3 en desktop).
* **Dark mode** soportado con clases `dark:`.
* Animación del giro con **transform 3D** (rotateY).
* Mantener altura estable para evitar saltos.

2. **Accesibilidad**

* Cada card es `button` con `aria-expanded` que indica si está mostrando el dorso.
* Título en `h3`.
* Texto con buen contraste.
* Navegable por teclado (Tab/Enter/Espacio/Escape para cerrar).

3. **Arquitectura**

* Componente `FlipTipsGrid` que recibe un array de objetos `tips`.
* Componente reutilizable `FlipCard({ tip })`.
* Sin librerías de animación. Solo CSS/Tailwind.
* Extra: filtro por **categoría** con pills arriba (opcional, pero incluir).

4. **Estilos**

* Paleta base:

  * Primario: `#7C3AED` (violeta)
  * Acento: `#F59E0B` (dorado)
  * Fondos callout ejemplo: `bg-amber-50 dark:bg-amber-900/20`, borde `border-amber-400 dark:border-amber-300`.
* Cards con borde `border-white/10 dark:border-white/10`, `rounded-2xl`, `shadow`.
* Tipografía legible y compacta.
* El bloque **“Ejemplo práctico”** lleva título “Ejemplo práctico” con emoji ✅ y tipografía semibold.

5. **Datos (usar exactamente este array):**

```js
export const tips = [
  { emoji: "💡", titulo: "Calorías vacías", categoria: "Alimentación",
    resumen: "Mucha energía, pocos nutrientes. Reducirlas mejora saciedad.",
    descripcion: "Ultraprocesados (gaseosas, golosinas, harinas refinadas) elevan calorías sin aportar micronutrientes.",
    ejemplo: "Cambiá gaseosa por agua con limón/soda. Para el dulce, fruta fresca o yogur natural."
  },
  { emoji: "💡", titulo: "Adherencia > perfección", categoria: "Hábitos",
    resumen: "80–90% constante supera el 100% imposible.",
    descripcion: "Sostener el plan la mayor parte del tiempo genera progreso real sin culpas por deslices puntuales.",
    ejemplo: "Si comiste pizza en una salida, retomá en la siguiente comida sin castigarte."
  },
  { emoji: "🍳", titulo: "Proteína en cada comida", categoria: "Alimentación",
    resumen: "Más saciedad, protege masa muscular.",
    descripcion: "Distribuir proteína en el día ayuda a controlar hambre y cuidar tejido magro.",
    ejemplo: "Huevos al desayuno, pollo/legumbres al almuerzo, yogur griego como colación."
  },
  { emoji: "🌾", titulo: "Fibra soluble", categoria: "Alimentación",
    resumen: "Nutre microbiota y prolonga la saciedad.",
    descripcion: "Avena, chía, lino y legumbres mejoran digestión y control del apetito.",
    ejemplo: "Sumá 1 cda de chía al yogur o avena al desayuno."
  },
  { emoji: "💧", titulo: "Hidratación inteligente", categoria: "Hábitos",
    resumen: "La sed suele camuflarse como hambre.",
    descripcion: "Tomar agua antes y entre comidas ayuda a regular el apetito.",
    ejemplo: "Llevá botella reutilizable y tomá un vaso de agua antes de sentarte a comer."
  },
  { emoji: "🥖", titulo: "Harinas y antojos", categoria: "Alimentación",
    resumen: "Refinadas → más picos, más hambre.",
    descripcion: "Los picos de glucosa disparan apetito. Preferí integrales y reduce frecuencia.",
    ejemplo: "Elegí pan integral y reemplazá galletitas por un puñado de frutos secos."
  },
  { emoji: "📉", titulo: "Índice glucémico", categoria: "Alimentación",
    resumen: "IG bajo/medio = energía más estable.",
    descripcion: "Evita subas y bajones bruscos al priorizar carbos lentos.",
    ejemplo: "Elegí batata, quinoa o avena en lugar de pan blanco o gaseosa."
  },
  { emoji: "🥑", titulo: "Grasas de calidad", categoria: "Alimentación",
    resumen: "Saciedad y salud hormonal.",
    descripcion: "Palta, frutos secos, oliva y pescado azul mejoran perfiles lipídicos.",
    ejemplo: "Agregá 1/2 palta al plato o 1 cda de oliva en ensaladas."
  },
  { emoji: "🧯", titulo: "Plan anti-atracón", categoria: "Hábitos",
    resumen: "Dormí y planificá snacks reales.",
    descripcion: "Sueño + proteína/fibra/grasas buenas reducen atracones.",
    ejemplo: "Tené a mano fruta, yogur natural o frutos secos en vez de galletitas."
  },
  { emoji: "⏱️", titulo: "Ritmo de comidas", categoria: "Hábitos",
    resumen: "Comer lento mejora saciedad.",
    descripcion: "10–20 min por comida favorece señales de plenitud.",
    ejemplo: "Apoyá el tenedor entre bocados y respirá 2–3 veces antes de seguir."
  },
  { emoji: "🕗", titulo: "Ayuno intermitente", categoria: "Organización",
    resumen: "Puede ordenar horarios y apetito.",
    descripcion: "El 16/8 funciona a muchas personas si encaja con su rutina.",
    ejemplo: "Cená 20:00 y primera comida 12:00 del día siguiente (si te resulta cómodo)."
  },
  { emoji: "📈", titulo: "Picos de insulina", categoria: "Alimentación",
    resumen: "Grandes picos → bajones de energía.",
    descripcion: "Combinar carbos con proteína/fibra suaviza la curva.",
    ejemplo: "Si comés pan o arroz, sumá pollo, huevo o ensalada con legumbres."
  },
  { emoji: "🦠", titulo: "Pro-microbiota", categoria: "Alimentación",
    resumen: "Más diversidad bacteriana, mejor salud.",
    descripcion: "Vegetales, frutas, legumbres y fermentados alimentan bacterias buenas.",
    ejemplo: "Agregá chucrut/kéfir/yogur natural y variedad de colores de vegetales."
  },
  { emoji: "🚫", titulo: "Perjudican microbiota", categoria: "Alimentación",
    resumen: "Ultraprocesados y alcohol en exceso.",
    descripcion: "Deterioran la flora intestinal y la barrera mucosa.",
    ejemplo: "Si tomás alcohol, limitá y alterná con agua; evitá golosinas diarias."
  },
  { emoji: "🥗", titulo: "Saciedad práctica", categoria: "Alimentación",
    resumen: "Arrancá con volumen bajo en calorías.",
    descripcion: "Sopa/ensalada + 20–30 g de proteína reduce el total ingerido.",
    ejemplo: "Antes de la pasta, comé una ensalada con atún/huevo/pollo."
  },
  { emoji: "👁️", titulo: "Porciones visuales", categoria: "Organización",
    resumen: "El plato guía tu cerebro.",
    descripcion: "Platos medianos engañan menos la percepción de cantidad.",
    ejemplo: "Serví en plato mediano y evitá llevar la olla/fuente a la mesa."
  },
  { emoji: "🏠", titulo: "Entorno", categoria: "Hábitos",
    resumen: "Lo visible se come.",
    descripcion: "Configurar el ambiente facilita buenas decisiones.",
    ejemplo: "Fruta a la vista; snacks ultraprocesados fuera del alcance."
  },
  { emoji: "😴", titulo: "Dormir mejor", categoria: "Sueño",
    resumen: "Menos sueño = más hambre.",
    descripcion: "Dormir 7–9 h regula apetito y estado de ánimo.",
    ejemplo: "Pantalla off 30 min antes y rutina fija para acostarte."
  },
  { emoji: "🚶", titulo: "Movimiento diario", categoria: "Actividad",
    resumen: "Mejora digestión y energía.",
    descripcion: "Pequeñas dosis suman mucho a la semana.",
    ejemplo: "Caminá 10–15 min después de cada comida o subí escaleras."
  },
  { emoji: "🎯", titulo: "Micrometas", categoria: "Hábitos",
    resumen: "Ganale a la inercia con pasos chicos.",
    descripcion: "Cambios pequeños pero sostenidos vencen a los extremos.",
    ejemplo: "Empezá con +1 vaso de agua o +1 fruta por día durante una semana."
  }
];
```

6. **Entrega esperada**

* Archivo React único (ej. `FlipTipsGrid.jsx`) + ejemplo de uso en `App.jsx`.
* Clases Tailwind listas y comentadas.
* Incluir **pills de filtro por categoría** (todas, Alimentación, Hábitos, Organización, Sueño, Actividad).
* Tests manuales: tabulación, enter/space para flip, escape para volver a cara A.

7. **Detalle visual del “Ejemplo práctico” (obligatorio)**

* Encabezado: `✅ Ejemplo práctico`
* Contenedor: `rounded-xl border-l-4 px-4 py-3 bg-amber-50 border-amber-400 dark:bg-amber-900/20 dark:border-amber-300`
* Tipografía: `font-semibold` en el título, párrafo normal debajo.

Generá el código completo y funcional con los datos provistos, listo para copiar/pegar.
**FIN DEL PROMPT**





nuevas tarjetas

Perfecto 👌 te armo **5 consejos para cada categoría** (Sueño 😴, Actividad 🚶, Organización 📋) con explicación clara y **ejemplo práctico** listo para mostrar en tus tarjetas:

---

## 😴 Sueño

1. **Rutina fija de descanso**
   Acostarte y levantarte a la misma hora regula tu reloj biológico.
   👉 **Ejemplo práctico:** poné alarma no solo para despertarte, sino también para ir a dormir.

2. **Pantallas fuera de la cama**
   La luz azul retrasa la melatonina y el sueño profundo.
   👉 **Ejemplo práctico:** dejá el celular cargando en otro ambiente 30 min antes de dormir.

3. **Entorno oscuro y fresco**
   La oscuridad total y una temperatura fresca facilitan el descanso.
   👉 **Ejemplo práctico:** usá cortinas blackout o antifaz, y mantené la habitación entre 18–21 °C.

4. **Cena ligera**
   Comer pesado a la noche dificulta el sueño reparador.
   👉 **Ejemplo práctico:** preferí una ensalada con proteína magra en lugar de pizza o frituras.

5. **Relajación antes de dormir**
   Reducir estrés mental favorece el descanso profundo.
   👉 **Ejemplo práctico:** hacé 5 min de respiración diafragmática o estiramientos suaves.

---

## 🚶 Actividad

1. **Movimiento acumulado**
   No hace falta entrenar una hora seguida, podés sumar minutos en el día.
   👉 **Ejemplo práctico:** subí escaleras en vez de ascensor y caminá al hablar por teléfono.

2. **Rutina de fuerza**
   Aumentar músculo mejora metabolismo y postura.
   👉 **Ejemplo práctico:** hacé 3 series de flexiones, sentadillas y planchas en casa.

3. **Caminata post-comida**
   Ayuda a regular glucosa y digestión.
   👉 **Ejemplo práctico:** salí 10 minutos a caminar después de almorzar.

4. **Micro-pauses activas**
   Estar mucho tiempo sentado afecta la circulación.
   👉 **Ejemplo práctico:** poné alarma cada 60 min para levantarte, estirarte o hacer 20 sentadillas.

5. **Actividad disfrutable**
   Si te divierte, la vas a sostener más fácil.
   👉 **Ejemplo práctico:** probá bailar, andar en bici o hacer yoga en lugar de solo correr.

---

## 📋 Organización

1. **Prioriza lo importante**
   No todo tiene el mismo peso.
   👉 **Ejemplo práctico:** usá la técnica del 1–3–5: 1 tarea grande, 3 medianas, 5 chicas por día.

2. **Planificación semanal**
   Ver el panorama completo evita improvisar.
   👉 **Ejemplo práctico:** los domingos armá un plan de comidas y entrenos para la semana.

3. **Agrupá tareas similares**
   El “batching” ahorra tiempo y energía.
   👉 **Ejemplo práctico:** respondé todos los mails en un bloque de 30 min en vez de todo el día.

4. **Regla de los 2 minutos**
   Si algo lleva menos de 2 min, hacelo al instante.
   👉 **Ejemplo práctico:** lavar un vaso o mandar un mensaje, no lo dejes para después.

5. **Eliminá lo que no suma**
   Decir “no” es también organizarte mejor.
   👉 **Ejemplo práctico:** si una reunión no tiene objetivo claro, pedí un resumen por chat en lugar de asistir.

---

¿Querés que te los arme ya en el **formato de tarjetas flip** con los estilos que definimos antes (frente = consejo, dorso = explicación + ejemplo práctico resaltado)?
