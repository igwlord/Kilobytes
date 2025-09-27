// Steps for recommended recipes, extracted from "Recetas paso a paso.md"
// We normalize titles to be accent-insensitive and punctuation-insensitive.

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s]/g, ' ') // drop punctuation/symbols
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();

type Steps = string[];

const stepsMap: Record<string, Steps> = {
  // Pérdida de peso - Desayunos
  [normalize('Omelette de claras con espinaca y tomate')]: [
    'Batir 4 claras de huevo con sal y pimienta.',
    'Calentar sartén con una cucharadita de aceite de oliva.',
    'Añadir espinaca fresca picada y tomate en cubos.',
    'Verter las claras y cocinar hasta cuajar.',
    'Doblar y servir caliente.',
  ],
  [normalize('Tostada integral con palta y sésamo')]: [
    'Tostar 1 rebanada de pan integral.',
    'Pisar ½ palta con limón, sal y pimienta.',
    'Untar sobre la tostada.',
    'Espolvorear semillas de sésamo.',
  ],
  [normalize('Smoothie verde detox')]: [
    'En licuadora: 1 taza de espinaca, ½ pepino, 1 manzana verde, jugo de ½ limón y 1 vaso de agua.',
    'Licuar hasta lograr textura suave.',
    'Servir frío.',
  ],
  [normalize('Yogur descremado con arándanos y chía')]: [
    'Colocar 1 pote de yogur descremado en un bowl.',
    'Añadir ½ taza de arándanos frescos.',
    'Espolvorear 1 cda. de semillas de chía.',
    'Mezclar y comer.',
  ],
  [normalize('Pancakes de avena y clara')]: [
    'Mezclar ½ taza de avena, 3 claras y 1 cdita de polvo de hornear.',
    'Cocinar en sartén antiadherente a fuego medio.',
    'Dar vuelta cuando aparezcan burbujas.',
    'Servir con fruta fresca.',
  ],

  // Pérdida de peso - Almuerzos
  [normalize('Ensalada de pollo a la plancha')]: [
    'Cocinar pechuga de pollo a la plancha con sal y pimienta.',
    'Cortar en tiras.',
    'Mezclar con hojas verdes, tomate cherry y zanahoria rallada.',
    'Aliñar con aceite de oliva y limón.',
  ],
  [normalize('Zoodles de zucchini con salsa de tomate')]: [
    'Hacer fideos de zucchini con espiralizador.',
    'Cocinar en sartén 2 min con un toque de aceite.',
    'Calentar salsa de tomate natural.',
    'Servir los zoodles con la salsa por encima.',
  ],
  [normalize('Bowl de quinoa con vegetales al vapor')]: [
    'Cocinar ½ taza de quinoa según paquete.',
    'Al vapor: brócoli, zanahoria y calabacín.',
    'Colocar quinoa en bowl, añadir vegetales.',
    'Aliñar con limón y oliva.',
  ],
  [normalize('Ensalada de atún mediterránea')]: [
    'Escurrir 1 lata de atún al natural.',
    'Mezclar con tomate, pepino, aceitunas y cebolla morada.',
    'Agregar hojas de rúcula.',
    'Aliñar con aceite de oliva y orégano.',
  ],
  [normalize('Revuelto de claras con champiñones y cebolla')]: [
    'Batir 4 claras de huevo.',
    'Saltear cebolla y champiñones en sartén con spray de aceite.',
    'Agregar las claras y revolver hasta cocer.',
  ],

  // Pérdida de peso - Cenas
  [normalize('Salmón al horno con espárragos')]: [
    'Precalentar horno a 180 °C.',
    'Colocar filete de salmón en fuente con limón y pimienta.',
    'Añadir espárragos al costado con un chorrito de aceite.',
    'Hornear 15–20 min.',
  ],
  [normalize('Tortilla de espinaca y cebolla')]: [
    'Batir 3 huevos.',
    'Rehogar cebolla y espinaca en sartén.',
    'Agregar los huevos batidos.',
    'Cocinar hasta dorar de ambos lados.',
  ],
  [normalize('Pechuga de pollo rellena con espinaca y ricotta')]: [
    'Abrir la pechuga al medio en forma de bolsillo.',
    'Rellenar con espinaca salteada y ricotta.',
    'Cerrar con escarbadientes.',
    'Cocinar al horno o plancha hasta dorar.',
  ],
  [normalize('Berenjenas rellenas con lentejas')]: [
    'Cortar berenjena a lo largo y ahuecar.',
    'Hervir lentejas hasta tiernas.',
    'Mezclar lentejas con la pulpa de berenjena, cebolla y tomate.',
    'Rellenar y hornear 20 min.',
  ],
  [normalize('Sopa de calabaza y jengibre')]: [
    'Hervir trozos de calabaza hasta tiernos.',
    'Procesar con un poco de agua de cocción.',
    'Añadir jengibre rallado y sal.',
    'Servir caliente.',
  ],

  // Pérdida de peso - Snacks
  [normalize('Rolls de lechuga con pavo')]: [
    'Lavar hojas grandes de lechuga.',
    'Rellenar con fiambre de pavo, rodajas de pepino y zanahoria.',
    'Enrollar y comer fresco.',
  ],
  [normalize('Bastones de zanahoria y apio con hummus')]: [
    'Cortar zanahoria y apio en bastones.',
    'Servir con hummus como dip.',
  ],
  [normalize('Ensalada de garbanzos estilo griego')]: [
    'Mezclar garbanzos cocidos con tomate, pepino y cebolla.',
    'Agregar cubos de queso feta.',
    'Condimentar con aceite de oliva y orégano.',
  ],
  [normalize('Tostada integral con ricotta y frutillas')]: [
    'Tostar pan integral.',
    'Untar ricotta baja en grasa.',
    'Colocar frutillas en láminas encima.',
  ],
  [normalize('Smoothie de frutos rojos y proteína')]: [
    'En licuadora: 1 taza frutos rojos + 1 scoop proteína en polvo + 1 vaso de leche vegetal.',
    'Licuar hasta homogéneo.',
    'Servir frío.',
  ],

  // Aumento de masa muscular - Desayunos
  [normalize('Omelette de claras y 2 huevos + avena')]: [
    'Batir 2 huevos + 3 claras con sal.',
    'Cocinar en sartén antiadherente.',
    'Servir acompañado de ½ taza de avena cocida en agua o leche.',
  ],
  [normalize('Smoothie de proteína post-entrenamiento')]: [
    'En licuadora: 1 scoop de proteína + 1 banana + 1 vaso de leche o agua.',
    'Añadir hielo si se desea.',
    'Licuar y beber de inmediato.',
  ],
  [normalize('Tostadas integrales con palta y salmón ahumado')]: [
    'Tostar pan integral.',
    'Pisar palta con limón.',
    'Untar sobre el pan y colocar salmón ahumado encima.',
  ],
  [normalize('Panqueques de avena y claras con ricotta y frutillas')]: [
    'Mezclar ½ taza de avena + 3 claras + 1 cdita polvo de hornear.',
    'Cocinar en sartén.',
    'Servir con ricotta baja en grasa y frutillas en rodajas.',
  ],
  [normalize('Bowl de yogur griego con granola y miel')]: [
    'Colocar yogur griego en un bowl.',
    'Agregar 2 cdas. de granola.',
    'Endulzar con un chorrito de miel.',
  ],

  // Aumento - Almuerzos
  [normalize('Pollo grillado con arroz integral y brócoli')]: [
    'Cocinar pechuga de pollo a la plancha.',
    'Hervir arroz integral (½ taza).',
    'Cocinar brócoli al vapor.',
    'Servir todo junto en un plato.',
  ],
  [normalize('Pasta integral con carne magra y salsa casera')]: [
    'Cocinar pasta integral al dente.',
    'Saltear carne magra picada.',
    'Añadir salsa de tomate natural.',
    'Mezclar con la pasta y servir.',
  ],
  [normalize('Wrap integral de pavo y vegetales')]: [
    'Calentar tortilla integral.',
    'Rellenar con fiambre de pavo, lechuga, tomate y zanahoria rallada.',
    'Enrollar y cortar al medio.',
  ],
  [normalize('Bowl de quinoa con atún y verduras salteadas')]: [
    'Cocinar quinoa según paquete.',
    'Saltear verduras (pimiento, cebolla, calabacín).',
    'Mezclar con atún al natural.',
    'Servir todo en un bowl.',
  ],
  [normalize('Hamburguesa casera de garbanzos + huevo + ensalada')]: [
    'Procesar garbanzos cocidos con especias y formar hamburguesa.',
    'Cocinar en sartén antiadherente.',
    'Acompañar con 1 huevo duro y ensalada fresca.',
  ],

  // Aumento - Cenas
  [normalize('Salmón al horno con batata y espárragos')]: [
    'Colocar filete de salmón en fuente de horno.',
    'Agregar rodajas de batata y espárragos.',
    'Condimentar con limón y pimienta.',
    'Hornear 20 min a 180 °C.',
  ],
  [normalize('Tacos de carne magra con guacamole')]: [
    'Cocinar carne magra cortada en tiras.',
    'Preparar guacamole (palta, limón, sal).',
    'Rellenar tortillas con carne y guacamole.',
  ],
  [normalize('Pollo al curry con arroz basmati y verduras')]: [
    'Cortar pollo en cubos y saltear.',
    'Añadir curry en polvo y un poco de leche de coco o crema light.',
    'Servir con arroz basmati cocido y verduras al vapor.',
  ],
  [normalize('Lentejas estofadas con huevo duro y arroz integral')]: [
    'Cocinar lentejas en agua con cebolla, zanahoria y tomate.',
    'Hervir arroz integral.',
    'Servir lentejas con arroz y huevo duro picado encima.',
  ],
  [normalize('Pizza proteica casera')]: [
    'Preparar base con harina integral o de avena.',
    'Agregar salsa de tomate y queso bajo en grasa.',
    'Cubrir con pechuga de pavo o pollo y vegetales.',
    'Hornear hasta gratinar.',
  ],

  // Aumento - Snacks
  [normalize('Sándwich integral de pavo y queso fresco')]: [
    'Rellenar pan integral con fiambre de pavo y queso fresco bajo en grasa.',
    'Agregar tomate y lechuga.',
  ],
  [normalize('Bastones + hummus + 1 huevo duro')]: [
    'Cortar zanahoria y apio en bastones.',
    'Servir con hummus.',
    'Acompañar con 1 huevo duro.',
  ],
  [normalize('Batido leche + avena + proteína + banana')]: [
    'En licuadora: 1 vaso de leche, ½ taza de avena, 1 banana y 1 scoop de proteína.',
    'Licuar hasta homogéneo.',
    'Servir frío.',
  ],
  [normalize('Tostadas con mantequilla de maní + banana')]: [
    'Tostar pan integral.',
    'Untar mantequilla de maní.',
    'Colocar rodajas de banana encima.',
  ],
  [normalize('Ensalada de garbanzos con atún y huevo duro')]: [
    'Mezclar garbanzos cocidos con atún al natural.',
    'Agregar huevo duro picado.',
    'Aliñar con oliva y limón.',
  ],

  // Mantener peso - Desayunos
  [normalize('Omelette de claras + 1 huevo con espinaca')]: [
    'Batir 3 claras + 1 huevo entero.',
    'Saltear espinaca en sartén.',
    'Verter los huevos y cocinar hasta cuajar.',
  ],
  [normalize('Tostadas integrales con palta + huevo duro')]: [
    'Tostar pan integral.',
    'Pisar palta con limón y untar.',
    'Agregar rodajas de huevo duro encima.',
  ],
  [normalize('Smoothie de frutos rojos + chía')]: [
    'Licuar 1 taza de frutos rojos + 1 vaso de agua o leche vegetal.',
    'Añadir 1 cda. de semillas de chía.',
    'Servir frío.',
  ],
  [normalize('Yogur con granola sin azúcar y banana')]: [
    'Colocar yogur natural en un bowl.',
    'Añadir 2 cdas. de granola sin azúcar.',
    'Cortar banana en rodajas y mezclar.',
  ],
  [normalize('Pancakes integrales de avena y claras')]: [
    'Mezclar ½ taza de avena + 3 claras + 1 cdita de polvo de hornear.',
    'Cocinar en sartén antiadherente.',
    'Servir con fruta fresca.',
  ],

  // Mantener - Almuerzos
  [normalize('Ensalada de pollo con palmitos')]: [
    'Cocinar pechuga de pollo a la plancha.',
    'Cortar en tiras y mezclar con palmitos en rodajas.',
    'Agregar hojas verdes y aderezo ligero.',
  ],
  [normalize('Quinoa con vegetales y garbanzos')]: [
    'Cocinar ½ taza de quinoa.',
    'Saltear vegetales (brócoli, calabacín, pimiento).',
    'Mezclar con garbanzos cocidos.',
  ],
  [normalize('Wrap integral de atún y vegetales')]: [
    'Rellenar tortilla integral con atún al natural, lechuga, tomate y pepino.',
    'Enrollar y cortar al medio.',
  ],
  [normalize('Pasta integral con salsa de tomate natural')]: [
    'Cocinar pasta integral.',
    'Preparar salsa con tomate fresco, ajo y orégano.',
    'Mezclar y servir.',
  ],
  [normalize('Bowl de arroz integral con huevo poche y brócoli')]: [
    'Cocinar arroz integral (½ taza).',
    'Cocinar brócoli al vapor.',
    'Preparar huevo poché (hervir en agua con vinagre 3 min).',
    'Servir todo junto.',
  ],

  // Mantener - Cenas
  [normalize('Berenjena gratinada con ricotta y salsa de tomate')]: [
    'Cortar berenjena en láminas y hornear 10 min.',
    'Rellenar con ricotta y salsa de tomate.',
    'Gratinar al horno 5 min más.',
  ],
  [normalize('Merluza a la plancha con puré de calabaza')]: [
    'Cocinar filete de merluza en sartén con limón y pimienta.',
    'Hervir calabaza y hacer puré.',
    'Servir juntos.',
  ],
  [normalize('Pechuga rellena con espinaca + ricotta')]: [
    'Abrir la pechuga al medio.',
    'Rellenar con espinaca y ricotta.',
    'Cocinar al horno hasta dorar.',
  ],
  [normalize('Salmón al vapor con ensalada de kale y palta')]: [
    'Cocinar filete de salmón al vapor.',
    'Mezclar kale con palta en cubos.',
    'Servir junto al salmón.',
  ],
  [normalize('Tortilla de espárragos y champiñones')]: [
    'Batir 3 huevos.',
    'Saltear espárragos y champiñones.',
    'Agregar huevos y cocinar en sartén.',
  ],

  // Mantener - Snacks
  [normalize('Bastones con hummus')]: [
    'Cortar zanahoria y apio en bastones.',
    'Acompañar con hummus como dip.',
  ],
  [normalize('Queso fresco light con tomate y orégano')]: [
    'Cortar tomate en rodajas.',
    'Acomodar sobre queso fresco light.',
    'Espolvorear orégano.',
  ],
  [normalize('Mix frutos secos + 1 manzana')]: [
    'Servir un puñado pequeño de frutos secos.',
    'Acompañar con 1 manzana fresca.',
  ],
  [normalize('Smoothie de kiwi + espinaca + pepino + limón')]: [
    'Licuar 1 kiwi pelado + ½ pepino + 1 taza de espinaca + jugo de ½ limón + agua.',
    'Servir bien frío.',
  ],
};

export function getRecipeSteps(title: string): Steps | null {
  const key = normalize(title);
  if (stepsMap[key]) return stepsMap[key];
  // Attempt a couple of known alias normalizations
  const aliases = [
    key.replace('poche', 'poche'), // no-op placeholder
  ];
  for (const a of aliases) {
    if (stepsMap[a]) return stepsMap[a];
  }
  return null;
}
