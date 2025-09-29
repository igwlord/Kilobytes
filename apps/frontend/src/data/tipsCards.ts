export type TipCard = {
  emoji: string;
  titulo: string;
  categoria: 'Alimentación' | 'Hábitos' | 'Organización' | 'Sueño' | 'Actividad';
  resumen: string;
  descripcion: string;
  ejemplo: string;
};

export const tipsCards: TipCard[] = [
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
  ,
  // Sueño (nuevas tarjetas)
  { emoji: "🕰️", titulo: "Rutina fija de descanso", categoria: "Sueño",
    resumen: "Horarios constantes regulan el reloj biológico.",
    descripcion: "Acostarte y levantarte a la misma hora ayuda a consolidar un sueño más profundo y reparador.",
    ejemplo: "Poné una alarma no solo para despertarte, sino también para ir a dormir." },
  { emoji: "📵", titulo: "Pantallas fuera de la cama", categoria: "Sueño",
    resumen: "La luz azul retrasa la melatonina.",
    descripcion: "La exposición a pantallas cerca de la hora de dormir dificulta conciliar el sueño profundo.",
    ejemplo: "Dejá el celular cargando en otro ambiente 30 min antes de dormir." },
  { emoji: "🌘", titulo: "Entorno oscuro y fresco", categoria: "Sueño",
    resumen: "Dormitorio oscuro y fresco = mejor descanso.",
    descripcion: "La oscuridad total y una temperatura entre 18–21 °C favorecen el sueño reparador.",
    ejemplo: "Usá cortinas blackout o antifaz y ventilá el cuarto para mantenerlo fresco." },
  { emoji: "🥗", titulo: "Cena ligera", categoria: "Sueño",
    resumen: "Comidas pesadas dificultan el descanso.",
    descripcion: "Cenar liviano reduce reflujo y malestar nocturno, favoreciendo el sueño profundo.",
    ejemplo: "Preferí una ensalada con proteína magra en lugar de pizza o frituras." },
  { emoji: "🧘", titulo: "Relajación antes de dormir", categoria: "Sueño",
    resumen: "Bajar el estrés mejora la calidad del sueño.",
    descripcion: "Rutinas breves de respiración o estiramientos preparan al cuerpo para descansar.",
    ejemplo: "Hacé 5 minutos de respiración diafragmática o estiramientos suaves." },

  // Actividad (nuevas tarjetas)
  { emoji: "⏱️", titulo: "Movimiento acumulado", categoria: "Actividad",
    resumen: "Sumá minutos activos a lo largo del día.",
    descripcion: "No es imprescindible entrenar de corrido; múltiples bloques cortos también suman mucho.",
    ejemplo: "Subí escaleras y caminá mientras hablás por teléfono." },
  { emoji: "🏋️", titulo: "Rutina de fuerza", categoria: "Actividad",
    resumen: "Más músculo = mejor metabolismo y postura.",
    descripcion: "Ejercicios simples de empuje, tracción y core mejoran composición corporal y salud ósea.",
    ejemplo: "Hacé 3 series de flexiones, sentadillas y planchas en casa." },
  { emoji: "🚶", titulo: "Caminata post-comida", categoria: "Actividad",
    resumen: "Ayuda a regular glucosa y digestión.",
    descripcion: "Pequeñas caminatas luego de comer aplanan la curva de glucosa y mejoran la digestión.",
    ejemplo: "Salí 10 minutos a caminar después de almorzar." },
  { emoji: "🔔", titulo: "Micro-pauses activas", categoria: "Actividad",
    resumen: "Evitar estar sentado por largos períodos.",
    descripcion: "Interrumpir el sedentarismo mejora circulación y niveles de energía durante el día.",
    ejemplo: "Poné alarma cada 60 min para levantarte, estirarte o hacer 20 sentadillas." },
  { emoji: "🎵", titulo: "Actividad disfrutable", categoria: "Actividad",
    resumen: "Lo que disfrutás, lo sostenés.",
    descripcion: "Elegir actividades placenteras aumenta la adherencia al movimiento diario.",
    ejemplo: "Probá bailar, andar en bici o hacer yoga en lugar de solo correr." },

  // Organización (nuevas tarjetas)
  { emoji: "📌", titulo: "Priorizá lo importante", categoria: "Organización",
    resumen: "No todo pesa igual en tu día.",
    descripcion: "Focalizar en lo esencial evita dispersión y te hace avanzar en lo que más importa.",
    ejemplo: "Usá la técnica 1–3–5: 1 tarea grande, 3 medianas y 5 chicas por día." },
  { emoji: "🗓️", titulo: "Planificación semanal", categoria: "Organización",
    resumen: "Ver el mapa evita improvisar.",
    descripcion: "Planificar comidas y entrenos reduce fricción y mejora la adherencia.",
    ejemplo: "Los domingos armá un plan de comidas y entrenamientos para la semana." },
  { emoji: "🧩", titulo: "Agrupá tareas similares", categoria: "Organización",
    resumen: "El batching ahorra tiempo y energía.",
    descripcion: "Agrupar tareas del mismo tipo reduce cambios de contexto y acelera la ejecución.",
    ejemplo: "Respondé todos los mails en un bloque de 30 minutos." },
  { emoji: "⏳", titulo: "Regla de los 2 minutos", categoria: "Organización",
    resumen: "Si tarda <2 min, hacelo ahora.",
    descripcion: "Resolver micro-tareas al instante descarga la mente y evita acumulación.",
    ejemplo: "Lavar un vaso o enviar un mensaje breve: no lo dejes para después." },
  { emoji: "🚫", titulo: "Eliminá lo que no suma", categoria: "Organización",
    resumen: "Decir ‘no’ también organiza.",
    descripcion: "Eliminar compromisos de bajo valor libera tiempo y foco para lo importante.",
    ejemplo: "Si una reunión no tiene objetivo claro, pedí un resumen por chat en lugar de asistir." }
];
