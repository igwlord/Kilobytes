// Base de datos completa de alimentos con información nutricional
export interface FoodItem {
  id: string;
  nombre: string;
  categoria: 'proteinas' | 'carbohidratos' | 'verduras' | 'frutas' | 'grasas' | 'condimentos' | 'extras';
  subcategoria: string;
  kcal_100g: number;
  prot_g_100g: number;
  carbs_g_100g: number;
  grasa_g_100g: number;
  fibra_g_100g?: number;
  emoji: string;
  // Nueva estructura para unidades específicas
  unidad_base?: {
    nombre: string; // ej: "unidad", "taza", "medallón"
    peso_g: number; // peso en gramos de esa unidad
    kcal_unidad: number; // calorías por unidad
  };
  porciones_comunes: {
    nombre: string;
    cantidad?: number; // cantidad de unidades base (opcional si no aplica)
    gramos: number;
  }[];
}

export const foodDatabase: FoodItem[] = [
  // 🥩 PROTEÍNAS MAGRAS
  {
    id: 'pollo_pechuga',
    nombre: 'Pechuga de pollo',
    categoria: 'proteinas',
    subcategoria: 'Aves',
    kcal_100g: 165,
    prot_g_100g: 31,
    carbs_g_100g: 0,
    grasa_g_100g: 3.6,
    emoji: '🐔',
    porciones_comunes: [
      { nombre: 'Pechuga mediana', gramos: 150 },
      { nombre: '100g cocida', gramos: 100 },
      { nombre: 'Tira grande', gramos: 200 }
    ]
  },
  {
    id: 'pollo_muslo',
    nombre: 'Muslo de pollo deshuesado',
    categoria: 'proteinas',
    subcategoria: 'Aves',
    kcal_100g: 209,
    prot_g_100g: 26,
    carbs_g_100g: 0,
    grasa_g_100g: 11,
    emoji: '🍗',
    porciones_comunes: [
      { nombre: 'Muslo mediano', gramos: 120 },
      { nombre: '100g cocido', gramos: 100 }
    ]
  },
  {
    id: 'carne_cuadril',
    nombre: 'Cuadril',
    categoria: 'proteinas',
    subcategoria: 'Carnes rojas',
    kcal_100g: 158,
    prot_g_100g: 30,
    carbs_g_100g: 0,
    grasa_g_100g: 4,
    emoji: '🥩',
    porciones_comunes: [
      { nombre: 'Bife mediano', gramos: 150 },
      { nombre: '100g a la plancha', gramos: 100 },
      { nombre: 'Porción grande', gramos: 200 }
    ]
  },
  {
    id: 'carne_nalga',
    nombre: 'Nalga',
    categoria: 'proteinas',
    subcategoria: 'Carnes rojas',
    kcal_100g: 144,
    prot_g_100g: 28,
    carbs_g_100g: 0,
    grasa_g_100g: 3,
    emoji: '🥩',
    porciones_comunes: [
      { nombre: 'Milanesa', gramos: 120 },
      { nombre: '100g cocida', gramos: 100 }
    ]
  },
  {
    id: 'carne_bola_lomo',
    nombre: 'Bola de lomo',
    categoria: 'proteinas',
    subcategoria: 'Carnes rojas',
    kcal_100g: 150,
    prot_g_100g: 29,
    carbs_g_100g: 0,
    grasa_g_100g: 3.5,
    emoji: '🥩',
    porciones_comunes: [
      { nombre: 'Medallón', gramos: 150 },
      { nombre: '100g grillado', gramos: 100 }
    ]
  },
  {
    id: 'cerdo_solomillo',
    nombre: 'Solomillo de cerdo',
    categoria: 'proteinas',
    subcategoria: 'Cerdo',
    kcal_100g: 154,
    prot_g_100g: 26,
    carbs_g_100g: 0,
    grasa_g_100g: 5,
    emoji: '🐷',
    porciones_comunes: [
      { nombre: 'Medallón', gramos: 120 },
      { nombre: '100g cocido', gramos: 100 }
    ]
  },
  {
    id: 'pavo_pechuga',
    nombre: 'Pechuga de pavo',
    categoria: 'proteinas',
    subcategoria: 'Aves',
    kcal_100g: 135,
    prot_g_100g: 30,
    carbs_g_100g: 0,
    grasa_g_100g: 1,
    emoji: '🦃',
    porciones_comunes: [
      { nombre: 'Pechuga mediana', gramos: 150 },
      { nombre: '100g cocida', gramos: 100 }
    ]
  },
  {
    id: 'huevo_entero',
    nombre: 'Huevo entero',
    categoria: 'proteinas',
    subcategoria: 'Huevos',
    kcal_100g: 155,
    prot_g_100g: 13,
    carbs_g_100g: 1,
    grasa_g_100g: 11,
    emoji: '🥚',
    porciones_comunes: [
      { nombre: '1 huevo mediano', gramos: 60 },
      { nombre: '2 huevos', gramos: 120 },
      { nombre: '3 huevos', gramos: 180 }
    ]
  },
  {
    id: 'clara_huevo',
    nombre: 'Clara de huevo',
    categoria: 'proteinas',
    subcategoria: 'Huevos',
    kcal_100g: 52,
    prot_g_100g: 11,
    carbs_g_100g: 0.7,
    grasa_g_100g: 0.2,
    emoji: '🤍',
    porciones_comunes: [
      { nombre: '3 claras', gramos: 100 },
      { nombre: '5 claras', gramos: 165 }
    ]
  },
  {
    id: 'jamon_cocido',
    nombre: 'Jamón cocido natural',
    categoria: 'proteinas',
    subcategoria: 'Fiambres',
    kcal_100g: 145,
    prot_g_100g: 20,
    carbs_g_100g: 1,
    grasa_g_100g: 6,
    emoji: '🍖',
    porciones_comunes: [
      { nombre: '2 fetas', gramos: 40 },
      { nombre: '4 fetas', gramos: 80 }
    ]
  },
  {
    id: 'queso_port_salut_light',
    nombre: 'Port Salut light',
    categoria: 'proteinas',
    subcategoria: 'Quesos',
    kcal_100g: 280,
    prot_g_100g: 24,
    carbs_g_100g: 2,
    grasa_g_100g: 19,
    emoji: '🧀',
    porciones_comunes: [
      { nombre: '1 feta', gramos: 25 },
      { nombre: '2 fetas', gramos: 50 }
    ]
  },
  {
    id: 'queso_fresco_magro',
    nombre: 'Queso fresco magro',
    categoria: 'proteinas',
    subcategoria: 'Quesos',
    kcal_100g: 98,
    prot_g_100g: 11,
    carbs_g_100g: 4,
    grasa_g_100g: 4,
    emoji: '🧀',
    porciones_comunes: [
      { nombre: '2 cucharadas', gramos: 50 },
      { nombre: '100g', gramos: 100 }
    ]
  },
  {
    id: 'lentejas',
    nombre: 'Lentejas',
    categoria: 'proteinas',
    subcategoria: 'Legumbres',
    kcal_100g: 116,
    prot_g_100g: 9,
    carbs_g_100g: 20,
    grasa_g_100g: 0.4,
    fibra_g_100g: 8,
    emoji: '🟫',
    porciones_comunes: [
      { nombre: '1 taza cocidas', gramos: 200 },
      { nombre: '1/2 taza cocidas', gramos: 100 }
    ]
  },
  {
    id: 'garbanzos',
    nombre: 'Garbanzos',
    categoria: 'proteinas',
    subcategoria: 'Legumbres',
    kcal_100g: 164,
    prot_g_100g: 8,
    carbs_g_100g: 27,
    grasa_g_100g: 2.6,
    fibra_g_100g: 8,
    emoji: '🟡',
    porciones_comunes: [
      { nombre: '1 taza cocidos', gramos: 200 },
      { nombre: '1/2 taza cocidos', gramos: 100 }
    ]
  },
  {
    id: 'porotos_blancos',
    nombre: 'Porotos blancos',
    categoria: 'proteinas',
    subcategoria: 'Legumbres',
    kcal_100g: 140,
    prot_g_100g: 9,
    carbs_g_100g: 25,
    grasa_g_100g: 0.5,
    fibra_g_100g: 6,
    emoji: '⚪',
    porciones_comunes: [
      { nombre: '1 taza cocidos', gramos: 200 },
      { nombre: '1/2 taza cocidos', gramos: 100 }
    ]
  },
  {
    id: 'tofu',
    nombre: 'Tofu',
    categoria: 'proteinas',
    subcategoria: 'Soja',
    kcal_100g: 76,
    prot_g_100g: 8,
    carbs_g_100g: 2,
    grasa_g_100g: 4.8,
    emoji: '🟦',
    porciones_comunes: [
      { nombre: '1 tajada', gramos: 100 },
      { nombre: 'Cubos (1/2 taza)', gramos: 80 }
    ]
  },

  // 🌾 CARBOHIDRATOS DE CALIDAD
  {
    id: 'arroz_integral',
    nombre: 'Arroz integral',
    categoria: 'carbohidratos',
    subcategoria: 'Cereales',
    kcal_100g: 123,
    prot_g_100g: 2.6,
    carbs_g_100g: 23,
    grasa_g_100g: 1,
    fibra_g_100g: 2,
    emoji: '🍚',
    porciones_comunes: [
      { nombre: '1 taza cocido', gramos: 200 },
      { nombre: '1/2 taza cocido', gramos: 100 },
      { nombre: '3/4 taza cocido', gramos: 150 }
    ]
  },
  {
    id: 'quinoa',
    nombre: 'Quinoa',
    categoria: 'carbohidratos',
    subcategoria: 'Pseudocereales',
    kcal_100g: 120,
    prot_g_100g: 4.4,
    carbs_g_100g: 22,
    grasa_g_100g: 1.9,
    fibra_g_100g: 2.8,
    emoji: '🌾',
    porciones_comunes: [
      { nombre: '1 taza cocida', gramos: 185 },
      { nombre: '1/2 taza cocida', gramos: 90 }
    ]
  },
  {
    id: 'avena',
    nombre: 'Avena sin TACC',
    categoria: 'carbohidratos',
    subcategoria: 'Cereales',
    kcal_100g: 68,
    prot_g_100g: 2.4,
    carbs_g_100g: 12,
    grasa_g_100g: 1.4,
    fibra_g_100g: 1.7,
    emoji: '🥣',
    porciones_comunes: [
      { nombre: '1/2 taza cocida', gramos: 120 },
      { nombre: '1 taza cocida', gramos: 240 }
    ]
  },
  {
    id: 'papa',
    nombre: 'Papa',
    categoria: 'carbohidratos',
    subcategoria: 'Tubérculos',
    kcal_100g: 87,
    prot_g_100g: 2,
    carbs_g_100g: 20,
    grasa_g_100g: 0.1,
    fibra_g_100g: 2.2,
    emoji: '🥔',
    porciones_comunes: [
      { nombre: '1 papa mediana', gramos: 150 },
      { nombre: '1 papa grande', gramos: 250 },
      { nombre: 'Papa chica', gramos: 100 }
    ]
  },
  {
    id: 'batata',
    nombre: 'Batata',
    categoria: 'carbohidratos',
    subcategoria: 'Tubérculos',
    kcal_100g: 86,
    prot_g_100g: 2,
    carbs_g_100g: 20,
    grasa_g_100g: 0.1,
    fibra_g_100g: 3,
    emoji: '🍠',
    porciones_comunes: [
      { nombre: '1 batata mediana', gramos: 130 },
      { nombre: '1 batata grande', gramos: 200 }
    ]
  },
  {
    id: 'zapallo',
    nombre: 'Zapallo/Calabaza',
    categoria: 'carbohidratos',
    subcategoria: 'Calabazas',
    kcal_100g: 26,
    prot_g_100g: 1,
    carbs_g_100g: 7,
    grasa_g_100g: 0.1,
    fibra_g_100g: 0.5,
    emoji: '🎃',
    porciones_comunes: [
      { nombre: '1 taza cubos', gramos: 120 },
      { nombre: '1 porción', gramos: 150 }
    ]
  },

  // 🥦 VERDURAS
  {
    id: 'espinaca',
    nombre: 'Espinaca',
    categoria: 'verduras',
    subcategoria: 'Hojas verdes',
    kcal_100g: 23,
    prot_g_100g: 2.9,
    carbs_g_100g: 3.6,
    grasa_g_100g: 0.4,
    fibra_g_100g: 2.2,
    emoji: '🥬',
    porciones_comunes: [
      { nombre: '1 taza cruda', gramos: 30 },
      { nombre: '1 taza cocida', gramos: 180 }
    ]
  },
  {
    id: 'brocoli',
    nombre: 'Brócoli',
    categoria: 'verduras',
    subcategoria: 'Crucíferas',
    kcal_100g: 25,
    prot_g_100g: 3,
    carbs_g_100g: 5,
    grasa_g_100g: 0.4,
    fibra_g_100g: 3,
    emoji: '🥦',
    porciones_comunes: [
      { nombre: '1 taza cocido', gramos: 150 },
      { nombre: '1 porción', gramos: 100 }
    ]
  },
  {
    id: 'zanahoria',
    nombre: 'Zanahoria',
    categoria: 'verduras',
    subcategoria: 'Raíces',
    kcal_100g: 41,
    prot_g_100g: 0.9,
    carbs_g_100g: 10,
    grasa_g_100g: 0.2,
    fibra_g_100g: 2.8,
    emoji: '🥕',
    porciones_comunes: [
      { nombre: '1 zanahoria mediana', gramos: 70 },
      { nombre: '1 taza rallada', gramos: 110 }
    ]
  },
  {
    id: 'tomate',
    nombre: 'Tomate',
    categoria: 'verduras',
    subcategoria: 'Fruto-verduras',
    kcal_100g: 18,
    prot_g_100g: 0.9,
    carbs_g_100g: 3.9,
    grasa_g_100g: 0.2,
    fibra_g_100g: 1.2,
    emoji: '🍅',
    porciones_comunes: [
      { nombre: '1 tomate mediano', gramos: 120 },
      { nombre: '1 tomate cherry (5 u)', gramos: 75 }
    ]
  },
  {
    id: 'lechuga',
    nombre: 'Lechuga',
    categoria: 'verduras',
    subcategoria: 'Hojas verdes',
    kcal_100g: 15,
    prot_g_100g: 1.4,
    carbs_g_100g: 2.9,
    grasa_g_100g: 0.1,
    fibra_g_100g: 1.3,
    emoji: '🥬',
    porciones_comunes: [
      { nombre: '1 taza', gramos: 50 },
      { nombre: 'Ensalada base', gramos: 100 }
    ]
  },
  {
    id: 'pepino',
    nombre: 'Pepino',
    categoria: 'verduras',
    subcategoria: 'Fruto-verduras',
    kcal_100g: 12,
    prot_g_100g: 0.7,
    carbs_g_100g: 2.2,
    grasa_g_100g: 0.1,
    fibra_g_100g: 0.5,
    emoji: '🥒',
    porciones_comunes: [
      { nombre: '1/2 pepino', gramos: 150 },
      { nombre: '1 taza rodajas', gramos: 120 }
    ]
  },

  // 🍎 FRUTAS
  {
    id: 'manzana',
    nombre: 'Manzana',
    categoria: 'frutas',
    subcategoria: 'Frutas de pepita',
    kcal_100g: 52,
    prot_g_100g: 0.3,
    carbs_g_100g: 14,
    grasa_g_100g: 0.2,
    fibra_g_100g: 2.4,
    emoji: '🍎',
    porciones_comunes: [
      { nombre: '1 manzana mediana', gramos: 180 },
      { nombre: '1 manzana chica', gramos: 130 }
    ]
  },
  {
    id: 'banana',
    nombre: 'Banana',
    categoria: 'frutas',
    subcategoria: 'Frutas tropicales',
    kcal_100g: 89,
    prot_g_100g: 1.1,
    carbs_g_100g: 23,
    grasa_g_100g: 0.3,
    fibra_g_100g: 2.6,
    emoji: '🍌',
    porciones_comunes: [
      { nombre: '1 banana mediana', gramos: 120 },
      { nombre: '1 banana grande', gramos: 150 }
    ]
  },
  {
    id: 'frutillas',
    nombre: 'Frutillas',
    categoria: 'frutas',
    subcategoria: 'Frutos rojos',
    kcal_100g: 32,
    prot_g_100g: 0.7,
    carbs_g_100g: 8,
    grasa_g_100g: 0.3,
    fibra_g_100g: 2,
    emoji: '🍓',
    porciones_comunes: [
      { nombre: '1 taza', gramos: 150 },
      { nombre: '10 unidades', gramos: 140 }
    ]
  },
  {
    id: 'naranja',
    nombre: 'Naranja',
    categoria: 'frutas',
    subcategoria: 'Cítricos',
    kcal_100g: 47,
    prot_g_100g: 0.9,
    carbs_g_100g: 12,
    grasa_g_100g: 0.1,
    fibra_g_100g: 2.4,
    emoji: '🍊',
    porciones_comunes: [
      { nombre: '1 naranja mediana', gramos: 150 },
      { nombre: '1 naranja grande', gramos: 200 }
    ]
  },
  {
    id: 'palta',
    nombre: 'Palta',
    categoria: 'grasas',
    subcategoria: 'Frutas oleosas',
    kcal_100g: 160,
    prot_g_100g: 2,
    carbs_g_100g: 9,
    grasa_g_100g: 15,
    fibra_g_100g: 7,
    emoji: '🥑',
    porciones_comunes: [
      { nombre: '1/2 palta mediana', gramos: 75 },
      { nombre: '1 palta chica', gramos: 120 }
    ]
  },

  // 🥜 GRASAS SALUDABLES
  {
    id: 'aceite_oliva',
    nombre: 'Aceite de oliva extra virgen',
    categoria: 'grasas',
    subcategoria: 'Aceites',
    kcal_100g: 884,
    prot_g_100g: 0,
    carbs_g_100g: 0,
    grasa_g_100g: 100,
    emoji: '🫒',
    porciones_comunes: [
      { nombre: '1 cucharada', gramos: 14 },
      { nombre: '1 cucharadita', gramos: 5 },
      { nombre: '2 cucharadas', gramos: 28 }
    ]
  },
  {
    id: 'almendras',
    nombre: 'Almendras',
    categoria: 'grasas',
    subcategoria: 'Frutos secos',
    kcal_100g: 576,
    prot_g_100g: 21,
    carbs_g_100g: 22,
    grasa_g_100g: 49,
    fibra_g_100g: 12,
    emoji: '🌰',
    porciones_comunes: [
      { nombre: '1 puñado (20 u)', gramos: 25 },
      { nombre: '30g', gramos: 30 }
    ]
  },
  {
    id: 'nueces',
    nombre: 'Nueces',
    categoria: 'grasas',
    subcategoria: 'Frutos secos',
    kcal_100g: 654,
    prot_g_100g: 15,
    carbs_g_100g: 14,
    grasa_g_100g: 65,
    fibra_g_100g: 7,
    emoji: '🥜',
    porciones_comunes: [
      { nombre: '1 puñado (6 mitades)', gramos: 25 },
      { nombre: '30g', gramos: 30 }
    ]
  },
  {
    id: 'semillas_chia',
    nombre: 'Semillas de chía',
    categoria: 'grasas',
    subcategoria: 'Semillas',
    kcal_100g: 486,
    prot_g_100g: 17,
    carbs_g_100g: 42,
    grasa_g_100g: 31,
    fibra_g_100g: 34,
    emoji: '⚫',
    porciones_comunes: [
      { nombre: '1 cucharada', gramos: 12 },
      { nombre: '2 cucharadas', gramos: 24 }
    ]
  },
  {
    id: 'mantequilla_mani',
    nombre: 'Mantequilla de maní sin azúcar',
    categoria: 'grasas',
    subcategoria: 'Mantequillas de frutos secos',
    kcal_100g: 588,
    prot_g_100g: 25,
    carbs_g_100g: 20,
    grasa_g_100g: 50,
    fibra_g_100g: 8,
    emoji: '🥜',
    porciones_comunes: [
      { nombre: '1 cucharada', gramos: 16 },
      { nombre: '2 cucharadas', gramos: 32 }
    ]
  }
];

// Funciones auxiliares para filtrar alimentos
export const getFoodsByCategory = (categoria: string) => {
  return foodDatabase.filter(food => food.categoria === categoria);
};

export const searchFoods = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return foodDatabase.filter(food => 
    food.nombre.toLowerCase().includes(lowercaseQuery) ||
    food.subcategoria.toLowerCase().includes(lowercaseQuery)
  );
};

export const getFoodById = (id: string) => {
  return foodDatabase.find(food => food.id === id);
};

export const calculateNutrition = (foodId: string, grams: number) => {
  const food = getFoodById(foodId);
  if (!food) return null;
  
  const factor = grams / 100;
  return {
    kcal: Math.round(food.kcal_100g * factor * 10) / 10,
    prot: Math.round(food.prot_g_100g * factor * 10) / 10,
    carbs: Math.round(food.carbs_g_100g * factor * 10) / 10,
    grasa: Math.round(food.grasa_g_100g * factor * 10) / 10,
    fibra: food.fibra_g_100g ? Math.round(food.fibra_g_100g * factor * 10) / 10 : 0
  };
};