// Base de datos completa de alimentos con información nutricional actualizada
export interface FoodItem {
  id: string;
  nombre: string;
  categoria: 'proteinas' | 'carbohidratos' | 'verduras' | 'frutas' | 'grasas' | 'condimentos' | 'extras' | 'bebidas' | 'snacks';
  subcategoria: string;
  kcal_100g: number;
  prot_g_100g: number;
  carbs_g_100g: number;
  grasa_g_100g: number;
  fibra_g_100g?: number;
  emoji: string;
  // Nueva estructura para unidades específicas
  unidad_base: {
    nombre: string; // ej: "unidad", "taza", "medallón"
    peso_g: number; // peso en gramos de esa unidad
    kcal_unidad: number; // calorías por unidad
  };
  porciones_comunes: {
    nombre: string;
    cantidad: number; // cantidad de unidades base
    gramos: number;
  }[];
}

export const foodDatabase: FoodItem[] = [
  // 🥩 PROTEÍNAS MAGRAS - Con valores exactos de la tabla
  {
    id: 'huevo_entero',
    nombre: 'Huevo entero',
    categoria: 'proteinas',
    subcategoria: 'Huevos',
    kcal_100g: 142, // Calculado: 78 kcal / 55g * 100
    prot_g_100g: 13,
    carbs_g_100g: 1,
    grasa_g_100g: 10,
    emoji: '🥚',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 55,
      kcal_unidad: 78
    },
    porciones_comunes: [
      { nombre: '1 huevo', cantidad: 1, gramos: 55 },
      { nombre: '2 huevos', cantidad: 2, gramos: 110 },
      { nombre: '3 huevos', cantidad: 3, gramos: 165 }
    ]
  },
  {
    id: 'clara_huevo',
    nombre: 'Clara de huevo',
    categoria: 'proteinas',
    subcategoria: 'Huevos',
    kcal_100g: 52, // Calculado: 17 kcal / 33g * 100
    prot_g_100g: 11,
    carbs_g_100g: 0.7,
    grasa_g_100g: 0.2,
    emoji: '🤍',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 33,
      kcal_unidad: 17
    },
    porciones_comunes: [
      { nombre: '1 clara', cantidad: 1, gramos: 33 },
      { nombre: '3 claras', cantidad: 3, gramos: 99 },
      { nombre: '5 claras', cantidad: 5, gramos: 165 }
    ]
  },
  {
    id: 'pechuga_pollo',
    nombre: 'Pechuga de pollo',
    categoria: 'proteinas',
    subcategoria: 'Aves',
    kcal_100g: 120, // Calculado: 180 kcal / 150g * 100
    prot_g_100g: 23,
    carbs_g_100g: 0,
    grasa_g_100g: 2.6,
    emoji: '🐔',
    unidad_base: {
      nombre: 'filet mediano',
      peso_g: 150,
      kcal_unidad: 180
    },
    porciones_comunes: [
      { nombre: '1 filet mediano', cantidad: 1, gramos: 150 },
      { nombre: '1/2 filet', cantidad: 0.5, gramos: 75 },
      { nombre: '1 filet grande', cantidad: 1.3, gramos: 195 }
    ]
  },
  {
    id: 'carne_magra_vacuna',
    nombre: 'Carne magra vacuna',
    categoria: 'proteinas',
    subcategoria: 'Carnes rojas',
    kcal_100g: 142, // Calculado: 170 kcal / 120g * 100
    prot_g_100g: 26,
    carbs_g_100g: 0,
    grasa_g_100g: 4,
    emoji: '🥩',
    unidad_base: {
      nombre: 'porción',
      peso_g: 120,
      kcal_unidad: 170
    },
    porciones_comunes: [
      { nombre: '1 porción', cantidad: 1, gramos: 120 },
      { nombre: '1 bife grande', cantidad: 1.5, gramos: 180 },
      { nombre: '1/2 porción', cantidad: 0.5, gramos: 60 }
    ]
  },
  {
    id: 'cerdo_solomillo',
    nombre: 'Cerdo (solomillo)',
    categoria: 'proteinas',
    subcategoria: 'Cerdo',
    kcal_100g: 133, // Calculado: 160 kcal / 120g * 100
    prot_g_100g: 24,
    carbs_g_100g: 0,
    grasa_g_100g: 4,
    emoji: '🐷',
    unidad_base: {
      nombre: 'medallón',
      peso_g: 120,
      kcal_unidad: 160
    },
    porciones_comunes: [
      { nombre: '1 medallón', cantidad: 1, gramos: 120 },
      { nombre: '2 medallones', cantidad: 2, gramos: 240 },
      { nombre: '1/2 medallón', cantidad: 0.5, gramos: 60 }
    ]
  },
  {
    id: 'pavo_pechuga',
    nombre: 'Pavo (pechuga)',
    categoria: 'proteinas',
    subcategoria: 'Aves',
    kcal_100g: 110, // Calculado: 165 kcal / 150g * 100
    prot_g_100g: 22,
    carbs_g_100g: 0,
    grasa_g_100g: 2,
    emoji: '🦃',
    unidad_base: {
      nombre: 'filet mediano',
      peso_g: 150,
      kcal_unidad: 165
    },
    porciones_comunes: [
      { nombre: '1 filet mediano', cantidad: 1, gramos: 150 },
      { nombre: '1/2 filet', cantidad: 0.5, gramos: 75 },
      { nombre: '1 filet grande', cantidad: 1.3, gramos: 195 }
    ]
  },
  {
    id: 'jamon_cocido_magro',
    nombre: 'Jamón cocido magro',
    categoria: 'proteinas',
    subcategoria: 'Fiambres',
    kcal_100g: 110, // Calculado: 33 kcal / 30g * 100
    prot_g_100g: 18,
    carbs_g_100g: 1,
    grasa_g_100g: 3,
    emoji: '🍖',
    unidad_base: {
      nombre: 'feta',
      peso_g: 30,
      kcal_unidad: 33
    },
    porciones_comunes: [
      { nombre: '1 feta', cantidad: 1, gramos: 30 },
      { nombre: '2 fetas', cantidad: 2, gramos: 60 },
      { nombre: '4 fetas', cantidad: 4, gramos: 120 }
    ]
  },
  {
    id: 'queso_fresco_light',
    nombre: 'Queso fresco light',
    categoria: 'proteinas',
    subcategoria: 'Quesos',
    kcal_100g: 200, // Calculado: 60 kcal / 30g * 100
    prot_g_100g: 15,
    carbs_g_100g: 4,
    grasa_g_100g: 14,
    emoji: '🧀',
    unidad_base: {
      nombre: 'feta',
      peso_g: 30,
      kcal_unidad: 60
    },
    porciones_comunes: [
      { nombre: '1 feta', cantidad: 1, gramos: 30 },
      { nombre: '2 fetas', cantidad: 2, gramos: 60 },
      { nombre: '3 fetas', cantidad: 3, gramos: 90 }
    ]
  },
  {
    id: 'lentejas_cocidas',
    nombre: 'Lentejas cocidas',
    categoria: 'proteinas',
    subcategoria: 'Legumbres',
    kcal_100g: 115, // Calculado: 230 kcal / 200g * 100
    prot_g_100g: 9,
    carbs_g_100g: 20,
    grasa_g_100g: 0.4,
    fibra_g_100g: 8,
    emoji: '🟫',
    unidad_base: {
      nombre: 'taza',
      peso_g: 200,
      kcal_unidad: 230
    },
    porciones_comunes: [
      { nombre: '1 taza', cantidad: 1, gramos: 200 },
      { nombre: '1/2 taza', cantidad: 0.5, gramos: 100 },
      { nombre: '1.5 tazas', cantidad: 1.5, gramos: 300 }
    ]
  },
  {
    id: 'garbanzos_cocidos',
    nombre: 'Garbanzos cocidos',
    categoria: 'proteinas',
    subcategoria: 'Legumbres',
    kcal_100g: 160, // Calculado: 320 kcal / 200g * 100
    prot_g_100g: 8,
    carbs_g_100g: 27,
    grasa_g_100g: 2.6,
    fibra_g_100g: 8,
    emoji: '🟡',
    unidad_base: {
      nombre: 'taza',
      peso_g: 200,
      kcal_unidad: 320
    },
    porciones_comunes: [
      { nombre: '1 taza', cantidad: 1, gramos: 200 },
      { nombre: '1/2 taza', cantidad: 0.5, gramos: 100 },
      { nombre: '1.5 tazas', cantidad: 1.5, gramos: 300 }
    ]
  },
  {
    id: 'tofu_firme',
    nombre: 'Tofu firme',
    categoria: 'proteinas',
    subcategoria: 'Soja',
    kcal_100g: 80, // Igual: 80 kcal / 100g
    prot_g_100g: 8,
    carbs_g_100g: 2,
    grasa_g_100g: 4.8,
    emoji: '🟦',
    unidad_base: {
      nombre: 'bloque',
      peso_g: 100,
      kcal_unidad: 80
    },
    porciones_comunes: [
      { nombre: '1 bloque', cantidad: 1, gramos: 100 },
      { nombre: '1/2 bloque', cantidad: 0.5, gramos: 50 },
      { nombre: 'Cubos (1/3)', cantidad: 0.33, gramos: 33 }
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
    unidad_base: {
      nombre: 'taza cocida',
      peso_g: 200,
      kcal_unidad: 246
    },
    porciones_comunes: [
      { nombre: '1 taza cocida', cantidad: 1, gramos: 200 },
      { nombre: '1/2 taza cocida', cantidad: 0.5, gramos: 100 },
      { nombre: '3/4 taza cocida', cantidad: 0.75, gramos: 150 }
    ]
  },

  // 🥦 VERDURAS
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
    unidad_base: {
      nombre: 'taza cocida',
      peso_g: 150,
      kcal_unidad: 37
    },
    porciones_comunes: [
      { nombre: '1 taza cocida', cantidad: 1, gramos: 150 },
      { nombre: '1 porción', cantidad: 0.67, gramos: 100 }
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
    unidad_base: {
      nombre: 'unidad mediana',
      peso_g: 180,
      kcal_unidad: 94
    },
    porciones_comunes: [
      { nombre: '1 manzana mediana', cantidad: 1, gramos: 180 },
      { nombre: '1 manzana chica', cantidad: 0.72, gramos: 130 }
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
    unidad_base: {
      nombre: 'cucharada',
      peso_g: 14,
      kcal_unidad: 124
    },
    porciones_comunes: [
      { nombre: '1 cucharada', cantidad: 1, gramos: 14 },
      { nombre: '1 cucharadita', cantidad: 0.33, gramos: 5 },
      { nombre: '2 cucharadas', cantidad: 2, gramos: 28 }
    ]
  },

  // 🍝 CARBOHIDRATOS ADICIONALES - Pastas y tubérculos
  {
    id: 'fideos_trigo_cocidos',
    nombre: 'Fideos de trigo cocidos',
    categoria: 'carbohidratos',
    subcategoria: 'Pastas',
    kcal_100g: 157, // 220 kcal / 140g * 100
    prot_g_100g: 5.8,
    carbs_g_100g: 30.9,
    grasa_g_100g: 1.4,
    fibra_g_100g: 1.8,
    emoji: '🍝',
    unidad_base: {
      nombre: 'taza',
      peso_g: 140,
      kcal_unidad: 220
    },
    porciones_comunes: [
      { nombre: '1 taza', cantidad: 1, gramos: 140 },
      { nombre: '1/2 taza', cantidad: 0.5, gramos: 70 },
      { nombre: '2 tazas', cantidad: 2, gramos: 280 }
    ]
  },
  {
    id: 'fideos_arroz_cocidos',
    nombre: 'Fideos de arroz cocidos',
    categoria: 'carbohidratos',
    subcategoria: 'Pastas',
    kcal_100g: 127, // 190 kcal / 150g * 100
    prot_g_100g: 2.8,
    carbs_g_100g: 25.8,
    grasa_g_100g: 0.5,
    fibra_g_100g: 1.2,
    emoji: '🍜',
    unidad_base: {
      nombre: 'taza',
      peso_g: 150,
      kcal_unidad: 190
    },
    porciones_comunes: [
      { nombre: '1 taza', cantidad: 1, gramos: 150 },
      { nombre: '1/2 taza', cantidad: 0.5, gramos: 75 },
      { nombre: '2 tazas', cantidad: 2, gramos: 300 }
    ]
  },
  {
    id: 'tallarines_cocidos',
    nombre: 'Tallarines cocidos',
    categoria: 'carbohidratos',
    subcategoria: 'Pastas',
    kcal_100g: 150, // 210 kcal / 140g * 100
    prot_g_100g: 5.5,
    carbs_g_100g: 29.5,
    grasa_g_100g: 1.3,
    fibra_g_100g: 2.1,
    emoji: '🍝',
    unidad_base: {
      nombre: 'taza',
      peso_g: 140,
      kcal_unidad: 210
    },
    porciones_comunes: [
      { nombre: '1 taza', cantidad: 1, gramos: 140 },
      { nombre: '1/2 taza', cantidad: 0.5, gramos: 70 },
      { nombre: '2 tazas', cantidad: 2, gramos: 280 }
    ]
  },
  {
    id: 'noquis_papa',
    nombre: 'Ñoquis de papa',
    categoria: 'carbohidratos',
    subcategoria: 'Pastas',
    kcal_100g: 167, // 250 kcal / 150g * 100
    prot_g_100g: 4.2,
    carbs_g_100g: 33.8,
    grasa_g_100g: 1.8,
    fibra_g_100g: 2.5,
    emoji: '🥟',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 15, // 150g / 10 unidades
      kcal_unidad: 25 // 250 kcal / 10 unidades
    },
    porciones_comunes: [
      { nombre: '5 ñoquis', cantidad: 5, gramos: 75 },
      { nombre: '10 ñoquis', cantidad: 10, gramos: 150 },
      { nombre: '15 ñoquis', cantidad: 15, gramos: 225 }
    ]
  },
  {
    id: 'ravioles_ricotta',
    nombre: 'Ravioles de ricotta',
    categoria: 'carbohidratos',
    subcategoria: 'Pastas',
    kcal_100g: 161, // 290 kcal / 180g * 100
    prot_g_100g: 8.5,
    carbs_g_100g: 24.2,
    grasa_g_100g: 3.8,
    fibra_g_100g: 1.8,
    emoji: '🥟',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 18, // 180g / 10 unidades
      kcal_unidad: 29 // 290 kcal / 10 unidades
    },
    porciones_comunes: [
      { nombre: '5 ravioles', cantidad: 5, gramos: 90 },
      { nombre: '10 ravioles', cantidad: 10, gramos: 180 },
      { nombre: '8 ravioles', cantidad: 8, gramos: 144 }
    ]
  },
  {
    id: 'sorrentinos',
    nombre: 'Sorrentinos',
    categoria: 'carbohidratos',
    subcategoria: 'Pastas',
    kcal_100g: 150, // 300 kcal / 200g * 100
    prot_g_100g: 9.2,
    carbs_g_100g: 22.5,
    grasa_g_100g: 3.5,
    fibra_g_100g: 2.0,
    emoji: '🥟',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 50, // 200g / 4 unidades
      kcal_unidad: 75 // 300 kcal / 4 unidades
    },
    porciones_comunes: [
      { nombre: '2 sorrentinos', cantidad: 2, gramos: 100 },
      { nombre: '4 sorrentinos', cantidad: 4, gramos: 200 },
      { nombre: '6 sorrentinos', cantidad: 6, gramos: 300 }
    ]
  },
  {
    id: 'lasagna_pasta',
    nombre: 'Lasagna (pasta sola)',
    categoria: 'carbohidratos',
    subcategoria: 'Pastas',
    kcal_100g: 160,
    prot_g_100g: 5.8,
    carbs_g_100g: 30.0,
    grasa_g_100g: 1.5,
    fibra_g_100g: 1.8,
    emoji: '🍝',
    unidad_base: {
      nombre: 'placa',
      peso_g: 50, // 100g / 2 placas
      kcal_unidad: 80 // 160 kcal / 2 placas
    },
    porciones_comunes: [
      { nombre: '1 placa', cantidad: 1, gramos: 50 },
      { nombre: '2 placas', cantidad: 2, gramos: 100 },
      { nombre: '3 placas', cantidad: 3, gramos: 150 }
    ]
  },
  {
    id: 'canelones_pasta',
    nombre: 'Canelones (pasta)',
    categoria: 'carbohidratos',
    subcategoria: 'Pastas',
    kcal_100g: 150,
    prot_g_100g: 5.5,
    carbs_g_100g: 28.8,
    grasa_g_100g: 1.4,
    fibra_g_100g: 1.6,
    emoji: '🌯',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 50, // 100g / 2 unidades
      kcal_unidad: 75 // 150 kcal / 2 unidades
    },
    porciones_comunes: [
      { nombre: '1 canelón', cantidad: 1, gramos: 50 },
      { nombre: '2 canelones', cantidad: 2, gramos: 100 },
      { nombre: '3 canelones', cantidad: 3, gramos: 150 }
    ]
  },
  {
    id: 'pan_integral',
    nombre: 'Pan integral',
    categoria: 'carbohidratos',
    subcategoria: 'Panes',
    kcal_100g: 267, // 80 kcal / 30g * 100
    prot_g_100g: 8.5,
    carbs_g_100g: 48.5,
    grasa_g_100g: 4.2,
    fibra_g_100g: 6.8,
    emoji: '🍞',
    unidad_base: {
      nombre: 'rebanada',
      peso_g: 30,
      kcal_unidad: 80
    },
    porciones_comunes: [
      { nombre: '1 rebanada', cantidad: 1, gramos: 30 },
      { nombre: '2 rebanadas', cantidad: 2, gramos: 60 },
      { nombre: '3 rebanadas', cantidad: 3, gramos: 90 }
    ]
  },
  {
    id: 'galleta_arroz',
    nombre: 'Galleta de arroz',
    categoria: 'carbohidratos',
    subcategoria: 'Snacks',
    kcal_100g: 389, // 35 kcal / 9g * 100
    prot_g_100g: 8.2,
    carbs_g_100g: 81.5,
    grasa_g_100g: 2.8,
    fibra_g_100g: 4.2,
    emoji: '🍘',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 9,
      kcal_unidad: 35
    },
    porciones_comunes: [
      { nombre: '1 galleta', cantidad: 1, gramos: 9 },
      { nombre: '2 galletas', cantidad: 2, gramos: 18 },
      { nombre: '5 galletas', cantidad: 5, gramos: 45 }
    ]
  },
  {
    id: 'quinoa_cocida',
    nombre: 'Quinoa cocida',
    categoria: 'carbohidratos',
    subcategoria: 'Cereales',
    kcal_100g: 119, // 220 kcal / 185g * 100
    prot_g_100g: 4.4,
    carbs_g_100g: 21.9,
    grasa_g_100g: 1.9,
    fibra_g_100g: 2.8,
    emoji: '🌾',
    unidad_base: {
      nombre: 'taza',
      peso_g: 185,
      kcal_unidad: 220
    },
    porciones_comunes: [
      { nombre: '1/2 taza', cantidad: 0.5, gramos: 92 },
      { nombre: '1 taza', cantidad: 1, gramos: 185 },
      { nombre: '1 1/2 taza', cantidad: 1.5, gramos: 277 }
    ]
  },
  {
    id: 'papa_mediana',
    nombre: 'Papa mediana',
    categoria: 'carbohidratos',
    subcategoria: 'Tubérculos',
    kcal_100g: 73, // 110 kcal / 150g * 100
    prot_g_100g: 2.0,
    carbs_g_100g: 17.0,
    grasa_g_100g: 0.1,
    fibra_g_100g: 2.2,
    emoji: '🥔',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 150,
      kcal_unidad: 110
    },
    porciones_comunes: [
      { nombre: '1/2 papa', cantidad: 0.5, gramos: 75 },
      { nombre: '1 papa', cantidad: 1, gramos: 150 },
      { nombre: '2 papas', cantidad: 2, gramos: 300 }
    ]
  },
  {
    id: 'batata_mediana',
    nombre: 'Batata mediana',
    categoria: 'carbohidratos',
    subcategoria: 'Tubérculos',
    kcal_100g: 87, // 130 kcal / 150g * 100
    prot_g_100g: 2.0,
    carbs_g_100g: 20.1,
    grasa_g_100g: 0.1,
    fibra_g_100g: 3.0,
    emoji: '🍠',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 150,
      kcal_unidad: 130
    },
    porciones_comunes: [
      { nombre: '1/2 batata', cantidad: 0.5, gramos: 75 },
      { nombre: '1 batata', cantidad: 1, gramos: 150 },
      { nombre: '2 batatas', cantidad: 2, gramos: 300 }
    ]
  },
  {
    id: 'calabaza_cocida',
    nombre: 'Calabaza cocida',
    categoria: 'verduras',
    subcategoria: 'Verduras cocidas',
    kcal_100g: 35, // 70 kcal / 200g * 100
    prot_g_100g: 1.2,
    carbs_g_100g: 8.5,
    grasa_g_100g: 0.1,
    fibra_g_100g: 2.8,
    emoji: '🎃',
    unidad_base: {
      nombre: 'taza',
      peso_g: 200,
      kcal_unidad: 70
    },
    porciones_comunes: [
      { nombre: '1/2 taza', cantidad: 0.5, gramos: 100 },
      { nombre: '1 taza', cantidad: 1, gramos: 200 },
      { nombre: '2 tazas', cantidad: 2, gramos: 400 }
    ]
  },

  // 🥑 GRASAS SALUDABLES ADICIONALES
  {
    id: 'palta_aguacate',
    nombre: 'Palta (aguacate)',
    categoria: 'grasas',
    subcategoria: 'Frutas oleosas',
    kcal_100g: 160, // 320 kcal / 200g * 100
    prot_g_100g: 2.0,
    carbs_g_100g: 8.5,
    grasa_g_100g: 14.7,
    fibra_g_100g: 6.7,
    emoji: '🥑',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 200,
      kcal_unidad: 320
    },
    porciones_comunes: [
      { nombre: '1/4 palta', cantidad: 0.25, gramos: 50 },
      { nombre: '1/2 palta', cantidad: 0.5, gramos: 100 },
      { nombre: '1 palta', cantidad: 1, gramos: 200 }
    ]
  },
  {
    id: 'aceite_coco',
    nombre: 'Aceite de coco',
    categoria: 'grasas',
    subcategoria: 'Aceites',
    kcal_100g: 900, // 90 kcal / 10g * 100
    prot_g_100g: 0,
    carbs_g_100g: 0,
    grasa_g_100g: 100,
    emoji: '🥥',
    unidad_base: {
      nombre: 'cucharada',
      peso_g: 10,
      kcal_unidad: 90
    },
    porciones_comunes: [
      { nombre: '1/2 cucharada', cantidad: 0.5, gramos: 5 },
      { nombre: '1 cucharada', cantidad: 1, gramos: 10 },
      { nombre: '2 cucharadas', cantidad: 2, gramos: 20 }
    ]
  },
  {
    id: 'nueces',
    nombre: 'Nueces',
    categoria: 'grasas',
    subcategoria: 'Frutos secos',
    kcal_100g: 600, // 30 kcal / 5g * 100
    prot_g_100g: 14.2,
    carbs_g_100g: 13.8,
    grasa_g_100g: 60.3,
    fibra_g_100g: 6.7,
    emoji: '🌰',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 5,
      kcal_unidad: 30
    },
    porciones_comunes: [
      { nombre: '5 nueces', cantidad: 5, gramos: 25 },
      { nombre: '10 nueces', cantidad: 10, gramos: 50 },
      { nombre: '15 nueces', cantidad: 15, gramos: 75 }
    ]
  },
  {
    id: 'almendras',
    nombre: 'Almendras',
    categoria: 'grasas',
    subcategoria: 'Frutos secos',
    kcal_100g: 583, // 70 kcal / 12g * 100
    prot_g_100g: 21.2,
    carbs_g_100g: 21.6,
    grasa_g_100g: 49.9,
    fibra_g_100g: 12.5,
    emoji: '🌰',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 1.2, // 12g / 10 unidades
      kcal_unidad: 7 // 70 kcal / 10 unidades
    },
    porciones_comunes: [
      { nombre: '5 almendras', cantidad: 5, gramos: 6 },
      { nombre: '10 almendras', cantidad: 10, gramos: 12 },
      { nombre: '20 almendras', cantidad: 20, gramos: 24 }
    ]
  },
  {
    id: 'castanas_caju',
    nombre: 'Castañas de cajú',
    categoria: 'grasas',
    subcategoria: 'Frutos secos',
    kcal_100g: 528, // 95 kcal / 18g * 100
    prot_g_100g: 18.2,
    carbs_g_100g: 30.2,
    grasa_g_100g: 43.8,
    fibra_g_100g: 3.3,
    emoji: '🥜',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 1.8, // 18g / 10 unidades
      kcal_unidad: 9.5 // 95 kcal / 10 unidades
    },
    porciones_comunes: [
      { nombre: '5 castañas', cantidad: 5, gramos: 9 },
      { nombre: '10 castañas', cantidad: 10, gramos: 18 },
      { nombre: '15 castañas', cantidad: 15, gramos: 27 }
    ]
  },
  {
    id: 'avellanas',
    nombre: 'Avellanas',
    categoria: 'grasas',
    subcategoria: 'Frutos secos',
    kcal_100g: 625, // 75 kcal / 12g * 100
    prot_g_100g: 15.0,
    carbs_g_100g: 16.7,
    grasa_g_100g: 60.8,
    fibra_g_100g: 9.7,
    emoji: '🌰',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 1.2, // 12g / 10 unidades
      kcal_unidad: 7.5 // 75 kcal / 10 unidades
    },
    porciones_comunes: [
      { nombre: '5 avellanas', cantidad: 5, gramos: 6 },
      { nombre: '10 avellanas', cantidad: 10, gramos: 12 },
      { nombre: '20 avellanas', cantidad: 20, gramos: 24 }
    ]
  },
  {
    id: 'semillas_chia',
    nombre: 'Semillas de chía',
    categoria: 'grasas',
    subcategoria: 'Semillas',
    kcal_100g: 500, // 50 kcal / 10g * 100
    prot_g_100g: 17.0,
    carbs_g_100g: 42.1,
    grasa_g_100g: 31.6,
    fibra_g_100g: 34.4,
    emoji: '🌱',
    unidad_base: {
      nombre: 'cucharada',
      peso_g: 10,
      kcal_unidad: 50
    },
    porciones_comunes: [
      { nombre: '1/2 cucharada', cantidad: 0.5, gramos: 5 },
      { nombre: '1 cucharada', cantidad: 1, gramos: 10 },
      { nombre: '2 cucharadas', cantidad: 2, gramos: 20 }
    ]
  },
  {
    id: 'semillas_lino',
    nombre: 'Semillas de lino',
    categoria: 'grasas',
    subcategoria: 'Semillas',
    kcal_100g: 550, // 55 kcal / 10g * 100
    prot_g_100g: 18.3,
    carbs_g_100g: 28.9,
    grasa_g_100g: 42.2,
    fibra_g_100g: 27.3,
    emoji: '🌱',
    unidad_base: {
      nombre: 'cucharada',
      peso_g: 10,
      kcal_unidad: 55
    },
    porciones_comunes: [
      { nombre: '1/2 cucharada', cantidad: 0.5, gramos: 5 },
      { nombre: '1 cucharada', cantidad: 1, gramos: 10 },
      { nombre: '2 cucharadas', cantidad: 2, gramos: 20 }
    ]
  },
  {
    id: 'semillas_girasol',
    nombre: 'Semillas de girasol',
    categoria: 'grasas',
    subcategoria: 'Semillas',
    kcal_100g: 600, // 60 kcal / 10g * 100
    prot_g_100g: 20.8,
    carbs_g_100g: 20.0,
    grasa_g_100g: 51.5,
    fibra_g_100g: 8.6,
    emoji: '🌻',
    unidad_base: {
      nombre: 'cucharada',
      peso_g: 10,
      kcal_unidad: 60
    },
    porciones_comunes: [
      { nombre: '1/2 cucharada', cantidad: 0.5, gramos: 5 },
      { nombre: '1 cucharada', cantidad: 1, gramos: 10 },
      { nombre: '2 cucharadas', cantidad: 2, gramos: 20 }
    ]
  },
  {
    id: 'semillas_zapallo',
    nombre: 'Semillas de zapallo',
    categoria: 'grasas',
    subcategoria: 'Semillas',
    kcal_100g: 550, // 55 kcal / 10g * 100
    prot_g_100g: 30.2,
    carbs_g_100g: 10.7,
    grasa_g_100g: 49.0,
    fibra_g_100g: 6.0,
    emoji: '🎃',
    unidad_base: {
      nombre: 'cucharada',
      peso_g: 10,
      kcal_unidad: 55
    },
    porciones_comunes: [
      { nombre: '1/2 cucharada', cantidad: 0.5, gramos: 5 },
      { nombre: '1 cucharada', cantidad: 1, gramos: 10 },
      { nombre: '2 cucharadas', cantidad: 2, gramos: 20 }
    ]
  },
  {
    id: 'mantequilla_mani',
    nombre: 'Mantequilla de maní',
    categoria: 'grasas',
    subcategoria: 'Untables',
    kcal_100g: 594, // 95 kcal / 16g * 100
    prot_g_100g: 25.1,
    carbs_g_100g: 19.6,
    grasa_g_100g: 50.4,
    fibra_g_100g: 6.2,
    emoji: '🥜',
    unidad_base: {
      nombre: 'cucharada',
      peso_g: 16,
      kcal_unidad: 95
    },
    porciones_comunes: [
      { nombre: '1/2 cucharada', cantidad: 0.5, gramos: 8 },
      { nombre: '1 cucharada', cantidad: 1, gramos: 16 },
      { nombre: '2 cucharadas', cantidad: 2, gramos: 32 }
    ]
  },

  // 🐟 PESCADOS Y MARISCOS
  {
    id: 'salmon_atlantico',
    nombre: 'Salmón atlántico',
    categoria: 'proteinas',
    subcategoria: 'Pescados',
    kcal_100g: 151, // 226 kcal / 150g * 100
    prot_g_100g: 22.1,
    carbs_g_100g: 0,
    grasa_g_100g: 6.3,
    emoji: '🐟',
    unidad_base: {
      nombre: 'filet',
      peso_g: 150,
      kcal_unidad: 226
    },
    porciones_comunes: [
      { nombre: '1 filet', cantidad: 1, gramos: 150 },
      { nombre: '1/2 filet', cantidad: 0.5, gramos: 75 },
      { nombre: '1 porción grande', cantidad: 1.3, gramos: 195 }
    ]
  },
  {
    id: 'merluza_filet',
    nombre: 'Merluza (filete)',
    categoria: 'proteinas',
    subcategoria: 'Pescados',
    kcal_100g: 90, // 135 kcal / 150g * 100
    prot_g_100g: 18.6,
    carbs_g_100g: 0,
    grasa_g_100g: 1.4,
    emoji: '🐟',
    unidad_base: {
      nombre: 'filet',
      peso_g: 150,
      kcal_unidad: 135
    },
    porciones_comunes: [
      { nombre: '1 filet', cantidad: 1, gramos: 150 },
      { nombre: '1/2 filet', cantidad: 0.5, gramos: 75 },
      { nombre: '2 filetes', cantidad: 2, gramos: 300 }
    ]
  },
  {
    id: 'caballa',
    nombre: 'Caballa',
    categoria: 'proteinas',
    subcategoria: 'Pescados',
    kcal_100g: 162, // 243 kcal / 150g * 100
    prot_g_100g: 23.9,
    carbs_g_100g: 0,
    grasa_g_100g: 6.8,
    emoji: '🐟',
    unidad_base: {
      nombre: 'porción',
      peso_g: 150,
      kcal_unidad: 243
    },
    porciones_comunes: [
      { nombre: '1 porción', cantidad: 1, gramos: 150 },
      { nombre: '1/2 porción', cantidad: 0.5, gramos: 75 },
      { nombre: '1 porción grande', cantidad: 1.3, gramos: 195 }
    ]
  },
  {
    id: 'sardinas_lata',
    nombre: 'Sardinas en lata',
    categoria: 'proteinas',
    subcategoria: 'Pescados',
    kcal_100g: 173, // 138 kcal / 80g * 100
    prot_g_100g: 24.6,
    carbs_g_100g: 0,
    grasa_g_100g: 7.9,
    emoji: '🐟',
    unidad_base: {
      nombre: 'lata',
      peso_g: 80,
      kcal_unidad: 138
    },
    porciones_comunes: [
      { nombre: '1/2 lata', cantidad: 0.5, gramos: 40 },
      { nombre: '1 lata', cantidad: 1, gramos: 80 },
      { nombre: '1.5 latas', cantidad: 1.5, gramos: 120 }
    ]
  },
  {
    id: 'atun_lata_agua',
    nombre: 'Atún en lata (agua)',
    categoria: 'proteinas',
    subcategoria: 'Pescados',
    kcal_100g: 109, // 87 kcal / 80g * 100
    prot_g_100g: 25.5,
    carbs_g_100g: 0,
    grasa_g_100g: 0.8,
    emoji: '🐟',
    unidad_base: {
      nombre: 'lata',
      peso_g: 80,
      kcal_unidad: 87
    },
    porciones_comunes: [
      { nombre: '1/2 lata', cantidad: 0.5, gramos: 40 },
      { nombre: '1 lata', cantidad: 1, gramos: 80 },
      { nombre: '1.5 latas', cantidad: 1.5, gramos: 120 }
    ]
  },
  {
    id: 'camarones',
    nombre: 'Camarones',
    categoria: 'proteinas',
    subcategoria: 'Mariscos',
    kcal_100g: 85, // 127 kcal / 150g * 100
    prot_g_100g: 20.3,
    carbs_g_100g: 0,
    grasa_g_100g: 0.5,
    emoji: '🦐',
    unidad_base: {
      nombre: 'porción',
      peso_g: 150,
      kcal_unidad: 127
    },
    porciones_comunes: [
      { nombre: '1 porción', cantidad: 1, gramos: 150 },
      { nombre: '1/2 porción', cantidad: 0.5, gramos: 75 },
      { nombre: '10 camarones', cantidad: 0.67, gramos: 100 }
    ]
  },

  // 🥛 LÁCTEOS ADICIONALES
  {
    id: 'yogur_griego_natural',
    nombre: 'Yogur griego natural',
    categoria: 'proteinas',
    subcategoria: 'Lácteos',
    kcal_100g: 90, // 135 kcal / 150g * 100
    prot_g_100g: 10,
    carbs_g_100g: 3.6,
    grasa_g_100g: 5,
    emoji: '🥛',
    unidad_base: {
      nombre: 'pote',
      peso_g: 150,
      kcal_unidad: 135
    },
    porciones_comunes: [
      { nombre: '1/2 pote', cantidad: 0.5, gramos: 75 },
      { nombre: '1 pote', cantidad: 1, gramos: 150 },
      { nombre: '2 cucharadas', cantidad: 0.2, gramos: 30 }
    ]
  },
  {
    id: 'leche_descremada',
    nombre: 'Leche descremada',
    categoria: 'proteinas',
    subcategoria: 'Lácteos',
    kcal_100g: 33, // 82 kcal / 250ml * 100
    prot_g_100g: 3.4,
    carbs_g_100g: 5,
    grasa_g_100g: 0.1,
    emoji: '🥛',
    unidad_base: {
      nombre: 'vaso',
      peso_g: 250,
      kcal_unidad: 82
    },
    porciones_comunes: [
      { nombre: '1/2 vaso', cantidad: 0.5, gramos: 125 },
      { nombre: '1 vaso', cantidad: 1, gramos: 250 },
      { nombre: '1 taza', cantidad: 0.8, gramos: 200 }
    ]
  },
  {
    id: 'queso_cottage',
    nombre: 'Queso cottage',
    categoria: 'proteinas',
    subcategoria: 'Quesos',
    kcal_100g: 98, // 98 kcal / 100g
    prot_g_100g: 11.1,
    carbs_g_100g: 3.4,
    grasa_g_100g: 4.3,
    emoji: '🧀',
    unidad_base: {
      nombre: 'porción',
      peso_g: 100,
      kcal_unidad: 98
    },
    porciones_comunes: [
      { nombre: '1/2 porción', cantidad: 0.5, gramos: 50 },
      { nombre: '1 porción', cantidad: 1, gramos: 100 },
      { nombre: '2 cucharadas', cantidad: 0.3, gramos: 30 }
    ]
  },
  {
    id: 'ricotta_descremada',
    nombre: 'Ricotta descremada',
    categoria: 'proteinas',
    subcategoria: 'Quesos',
    kcal_100g: 138, // 138 kcal / 100g
    prot_g_100g: 11.4,
    carbs_g_100g: 5.1,
    grasa_g_100g: 8,
    emoji: '🧀',
    unidad_base: {
      nombre: 'porción',
      peso_g: 100,
      kcal_unidad: 138
    },
    porciones_comunes: [
      { nombre: '1/2 porción', cantidad: 0.5, gramos: 50 },
      { nombre: '1 porción', cantidad: 1, gramos: 100 },
      { nombre: '2 cucharadas', cantidad: 0.3, gramos: 30 }
    ]
  },

  // 🌿 LEGUMBRES ADICIONALES
  {
    id: 'porotos_negros',
    nombre: 'Porotos negros cocidos',
    categoria: 'proteinas',
    subcategoria: 'Legumbres',
    kcal_100g: 130, // 260 kcal / 200g * 100
    prot_g_100g: 8.9,
    carbs_g_100g: 23,
    grasa_g_100g: 0.5,
    fibra_g_100g: 8.7,
    emoji: '⚫',
    unidad_base: {
      nombre: 'taza',
      peso_g: 200,
      kcal_unidad: 260
    },
    porciones_comunes: [
      { nombre: '1/2 taza', cantidad: 0.5, gramos: 100 },
      { nombre: '1 taza', cantidad: 1, gramos: 200 },
      { nombre: '1.5 tazas', cantidad: 1.5, gramos: 300 }
    ]
  },
  {
    id: 'arvejas_cocidas',
    nombre: 'Arvejas cocidas',
    categoria: 'proteinas',
    subcategoria: 'Legumbres',
    kcal_100g: 125, // 250 kcal / 200g * 100
    prot_g_100g: 8.2,
    carbs_g_100g: 22.5,
    grasa_g_100g: 0.4,
    fibra_g_100g: 8.3,
    emoji: '🟢',
    unidad_base: {
      nombre: 'taza',
      peso_g: 200,
      kcal_unidad: 250
    },
    porciones_comunes: [
      { nombre: '1/2 taza', cantidad: 0.5, gramos: 100 },
      { nombre: '1 taza', cantidad: 1, gramos: 200 },
      { nombre: '1.5 tazas', cantidad: 1.5, gramos: 300 }
    ]
  },

  // 🥒 VERDURAS ADICIONALES
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
    unidad_base: {
      nombre: 'taza picada',
      peso_g: 50,
      kcal_unidad: 7.5
    },
    porciones_comunes: [
      { nombre: '1 taza picada', cantidad: 1, gramos: 50 },
      { nombre: '2 tazas picadas', cantidad: 2, gramos: 100 },
      { nombre: 'Ensalada', cantidad: 3, gramos: 150 }
    ]
  },
  {
    id: 'tomate',
    nombre: 'Tomate',
    categoria: 'verduras',
    subcategoria: 'Frutos',
    kcal_100g: 22, // 33 kcal / 150g * 100
    prot_g_100g: 1.1,
    carbs_g_100g: 4.8,
    grasa_g_100g: 0.2,
    fibra_g_100g: 1.2,
    emoji: '🍅',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 150,
      kcal_unidad: 33
    },
    porciones_comunes: [
      { nombre: '1/2 tomate', cantidad: 0.5, gramos: 75 },
      { nombre: '1 tomate', cantidad: 1, gramos: 150 },
      { nombre: '2 tomates', cantidad: 2, gramos: 300 }
    ]
  },
  {
    id: 'pepino',
    nombre: 'Pepino',
    categoria: 'verduras',
    subcategoria: 'Frutos',
    kcal_100g: 16,
    prot_g_100g: 0.7,
    carbs_g_100g: 3.6,
    grasa_g_100g: 0.1,
    fibra_g_100g: 0.5,
    emoji: '🥒',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 200,
      kcal_unidad: 32
    },
    porciones_comunes: [
      { nombre: '1/2 pepino', cantidad: 0.5, gramos: 100 },
      { nombre: '1 pepino', cantidad: 1, gramos: 200 },
      { nombre: 'Rodajas (1/4)', cantidad: 0.25, gramos: 50 }
    ]
  },
  {
    id: 'zanahoria',
    nombre: 'Zanahoria',
    categoria: 'verduras',
    subcategoria: 'Raíces',
    kcal_100g: 35, // 35 kcal / 100g
    prot_g_100g: 0.9,
    carbs_g_100g: 8.2,
    grasa_g_100g: 0.2,
    fibra_g_100g: 2.8,
    emoji: '🥕',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 100,
      kcal_unidad: 35
    },
    porciones_comunes: [
      { nombre: '1/2 zanahoria', cantidad: 0.5, gramos: 50 },
      { nombre: '1 zanahoria', cantidad: 1, gramos: 100 },
      { nombre: '2 zanahorias', cantidad: 2, gramos: 200 }
    ]
  },
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
    unidad_base: {
      nombre: 'taza cocida',
      peso_g: 180,
      kcal_unidad: 41
    },
    porciones_comunes: [
      { nombre: '1/2 taza cocida', cantidad: 0.5, gramos: 90 },
      { nombre: '1 taza cocida', cantidad: 1, gramos: 180 },
      { nombre: '2 tazas frescas', cantidad: 0.3, gramos: 60 }
    ]
  },
  {
    id: 'acelga',
    nombre: 'Acelga',
    categoria: 'verduras',
    subcategoria: 'Hojas verdes',
    kcal_100g: 19,
    prot_g_100g: 1.8,
    carbs_g_100g: 3.7,
    grasa_g_100g: 0.2,
    fibra_g_100g: 1.6,
    emoji: '🥬',
    unidad_base: {
      nombre: 'taza cocida',
      peso_g: 175,
      kcal_unidad: 33
    },
    porciones_comunes: [
      { nombre: '1/2 taza cocida', cantidad: 0.5, gramos: 87 },
      { nombre: '1 taza cocida', cantidad: 1, gramos: 175 },
      { nombre: '1 porción', cantidad: 0.6, gramos: 105 }
    ]
  },
  {
    id: 'pimiento_rojo',
    nombre: 'Pimiento rojo',
    categoria: 'verduras',
    subcategoria: 'Frutos',
    kcal_100g: 31,
    prot_g_100g: 1,
    carbs_g_100g: 7.3,
    grasa_g_100g: 0.3,
    fibra_g_100g: 2.5,
    emoji: '🫑',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 120,
      kcal_unidad: 37
    },
    porciones_comunes: [
      { nombre: '1/2 pimiento', cantidad: 0.5, gramos: 60 },
      { nombre: '1 pimiento', cantidad: 1, gramos: 120 },
      { nombre: 'Tiras (1/4)', cantidad: 0.25, gramos: 30 }
    ]
  },
  {
    id: 'cebolla',
    nombre: 'Cebolla',
    categoria: 'verduras',
    subcategoria: 'Bulbos',
    kcal_100g: 40,
    prot_g_100g: 1.1,
    carbs_g_100g: 9.3,
    grasa_g_100g: 0.1,
    fibra_g_100g: 1.7,
    emoji: '🧅',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 110,
      kcal_unidad: 44
    },
    porciones_comunes: [
      { nombre: '1/2 cebolla', cantidad: 0.5, gramos: 55 },
      { nombre: '1 cebolla', cantidad: 1, gramos: 110 },
      { nombre: '1/4 cebolla', cantidad: 0.25, gramos: 27 }
    ]
  },
  {
    id: 'apio',
    nombre: 'Apio',
    categoria: 'verduras',
    subcategoria: 'Tallos',
    kcal_100g: 16,
    prot_g_100g: 0.7,
    carbs_g_100g: 3,
    grasa_g_100g: 0.2,
    fibra_g_100g: 1.6,
    emoji: '🥬',
    unidad_base: {
      nombre: 'tallo',
      peso_g: 40,
      kcal_unidad: 6.4
    },
    porciones_comunes: [
      { nombre: '1 tallo', cantidad: 1, gramos: 40 },
      { nombre: '2 tallos', cantidad: 2, gramos: 80 },
      { nombre: 'Picado (1/2 taza)', cantidad: 3, gramos: 120 }
    ]
  },
  {
    id: 'berenjena',
    nombre: 'Berenjena',
    categoria: 'verduras',
    subcategoria: 'Frutos',
    kcal_100g: 25,
    prot_g_100g: 1,
    carbs_g_100g: 5.9,
    grasa_g_100g: 0.2,
    fibra_g_100g: 3,
    emoji: '🍆',
    unidad_base: {
      nombre: 'taza cubos',
      peso_g: 82,
      kcal_unidad: 20.5
    },
    porciones_comunes: [
      { nombre: '1/2 taza cubos', cantidad: 0.5, gramos: 41 },
      { nombre: '1 taza cubos', cantidad: 1, gramos: 82 },
      { nombre: '2 tazas cubos', cantidad: 2, gramos: 164 }
    ]
  },
  {
    id: 'zapallito',
    nombre: 'Zapallito',
    categoria: 'verduras',
    subcategoria: 'Calabazas',
    kcal_100g: 17,
    prot_g_100g: 1.2,
    carbs_g_100g: 3.1,
    grasa_g_100g: 0.3,
    fibra_g_100g: 1,
    emoji: '🥒',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 196,
      kcal_unidad: 33
    },
    porciones_comunes: [
      { nombre: '1/2 zapallito', cantidad: 0.5, gramos: 98 },
      { nombre: '1 zapallito', cantidad: 1, gramos: 196 },
      { nombre: 'Rodajas (1 taza)', cantidad: 0.5, gramos: 113 }
    ]
  },

  // 🍓 FRUTAS ADICIONALES
  {
    id: 'banana',
    nombre: 'Banana',
    categoria: 'frutas',
    subcategoria: 'Frutas tropicales',
    kcal_100g: 89,
    prot_g_100g: 1.1,
    carbs_g_100g: 22.8,
    grasa_g_100g: 0.3,
    fibra_g_100g: 2.6,
    emoji: '🍌',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 120,
      kcal_unidad: 107
    },
    porciones_comunes: [
      { nombre: '1/2 banana', cantidad: 0.5, gramos: 60 },
      { nombre: '1 banana', cantidad: 1, gramos: 120 },
      { nombre: '1 banana grande', cantidad: 1.3, gramos: 156 }
    ]
  },
  {
    id: 'naranja',
    nombre: 'Naranja',
    categoria: 'frutas',
    subcategoria: 'Cítricos',
    kcal_100g: 47,
    prot_g_100g: 0.9,
    carbs_g_100g: 11.8,
    grasa_g_100g: 0.1,
    fibra_g_100g: 2.4,
    emoji: '🍊',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 154,
      kcal_unidad: 72
    },
    porciones_comunes: [
      { nombre: '1/2 naranja', cantidad: 0.5, gramos: 77 },
      { nombre: '1 naranja', cantidad: 1, gramos: 154 },
      { nombre: 'Gajos (1/3)', cantidad: 0.33, gramos: 51 }
    ]
  },
  {
    id: 'pera',
    nombre: 'Pera',
    categoria: 'frutas',
    subcategoria: 'Frutas de pepita',
    kcal_100g: 57,
    prot_g_100g: 0.4,
    carbs_g_100g: 15.2,
    grasa_g_100g: 0.1,
    fibra_g_100g: 3.1,
    emoji: '🍐',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 178,
      kcal_unidad: 101
    },
    porciones_comunes: [
      { nombre: '1/2 pera', cantidad: 0.5, gramos: 89 },
      { nombre: '1 pera', cantidad: 1, gramos: 178 },
      { nombre: 'Cubos (1/3)', cantidad: 0.33, gramos: 59 }
    ]
  },
  {
    id: 'frutillas',
    nombre: 'Frutillas',
    categoria: 'frutas',
    subcategoria: 'Berries',
    kcal_100g: 32,
    prot_g_100g: 0.7,
    carbs_g_100g: 7.7,
    grasa_g_100g: 0.3,
    fibra_g_100g: 2,
    emoji: '🍓',
    unidad_base: {
      nombre: 'taza',
      peso_g: 150,
      kcal_unidad: 48
    },
    porciones_comunes: [
      { nombre: '1/2 taza', cantidad: 0.5, gramos: 75 },
      { nombre: '1 taza', cantidad: 1, gramos: 150 },
      { nombre: '5 frutillas', cantidad: 0.33, gramos: 50 }
    ]
  },
  {
    id: 'kiwi',
    nombre: 'Kiwi',
    categoria: 'frutas',
    subcategoria: 'Frutas exóticas',
    kcal_100g: 64, // 64 kcal / 100g
    prot_g_100g: 1.1,
    carbs_g_100g: 15.6,
    grasa_g_100g: 0.5,
    fibra_g_100g: 3,
    emoji: '🥝',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 100,
      kcal_unidad: 64
    },
    porciones_comunes: [
      { nombre: '1/2 kiwi', cantidad: 0.5, gramos: 50 },
      { nombre: '1 kiwi', cantidad: 1, gramos: 100 },
      { nombre: '2 kiwis', cantidad: 2, gramos: 200 }
    ]
  },
  {
    id: 'durazno',
    nombre: 'Durazno',
    categoria: 'frutas',
    subcategoria: 'Frutas de carozo',
    kcal_100g: 39,
    prot_g_100g: 0.9,
    carbs_g_100g: 9.5,
    grasa_g_100g: 0.3,
    fibra_g_100g: 1.5,
    emoji: '🍑',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 150,
      kcal_unidad: 58.5
    },
    porciones_comunes: [
      { nombre: '1/2 durazno', cantidad: 0.5, gramos: 75 },
      { nombre: '1 durazno', cantidad: 1, gramos: 150 },
      { nombre: '2 duraznos', cantidad: 2, gramos: 300 }
    ]
  },
  {
    id: 'ciruela',
    nombre: 'Ciruela',
    categoria: 'frutas',
    subcategoria: 'Frutas de carozo',
    kcal_100g: 46,
    prot_g_100g: 0.7,
    carbs_g_100g: 11.4,
    grasa_g_100g: 0.3,
    fibra_g_100g: 1.4,
    emoji: '🟣',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 66,
      kcal_unidad: 30
    },
    porciones_comunes: [
      { nombre: '1 ciruela', cantidad: 1, gramos: 66 },
      { nombre: '2 ciruelas', cantidad: 2, gramos: 132 },
      { nombre: '3 ciruelas', cantidad: 3, gramos: 198 }
    ]
  },
  {
    id: 'mandarina',
    nombre: 'Mandarina',
    categoria: 'frutas',
    subcategoria: 'Cítricos',
    kcal_100g: 53,
    prot_g_100g: 0.8,
    carbs_g_100g: 13.3,
    grasa_g_100g: 0.3,
    fibra_g_100g: 1.8,
    emoji: '🍊',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 88,
      kcal_unidad: 47
    },
    porciones_comunes: [
      { nombre: '1 mandarina', cantidad: 1, gramos: 88 },
      { nombre: '2 mandarinas', cantidad: 2, gramos: 176 },
      { nombre: '3 mandarinas', cantidad: 3, gramos: 264 }
    ]
  },
  {
    id: 'uvas',
    nombre: 'Uvas',
    categoria: 'frutas',
    subcategoria: 'Frutas de racimo',
    kcal_100g: 62,
    prot_g_100g: 0.6,
    carbs_g_100g: 16.8,
    grasa_g_100g: 0.2,
    fibra_g_100g: 0.9,
    emoji: '🍇',
    unidad_base: {
      nombre: 'taza',
      peso_g: 92,
      kcal_unidad: 57
    },
    porciones_comunes: [
      { nombre: '1/2 taza', cantidad: 0.5, gramos: 46 },
      { nombre: '1 taza', cantidad: 1, gramos: 92 },
      { nombre: '15 uvas', cantidad: 0.8, gramos: 75 }
    ]
  },
  {
    id: 'melon',
    nombre: 'Melón',
    categoria: 'frutas',
    subcategoria: 'Melones',
    kcal_100g: 34,
    prot_g_100g: 0.8,
    carbs_g_100g: 8.6,
    grasa_g_100g: 0.2,
    fibra_g_100g: 0.9,
    emoji: '🍈',
    unidad_base: {
      nombre: 'taza cubos',
      peso_g: 160,
      kcal_unidad: 54
    },
    porciones_comunes: [
      { nombre: '1/2 taza cubos', cantidad: 0.5, gramos: 80 },
      { nombre: '1 taza cubos', cantidad: 1, gramos: 160 },
      { nombre: '2 tazas cubos', cantidad: 2, gramos: 320 }
    ]
  },
  {
    id: 'sandia',
    nombre: 'Sandía',
    categoria: 'frutas',
    subcategoria: 'Melones',
    kcal_100g: 30,
    prot_g_100g: 0.6,
    carbs_g_100g: 7.6,
    grasa_g_100g: 0.2,
    fibra_g_100g: 0.4,
    emoji: '🍉',
    unidad_base: {
      nombre: 'taza cubos',
      peso_g: 152,
      kcal_unidad: 46
    },
    porciones_comunes: [
      { nombre: '1/2 taza cubos', cantidad: 0.5, gramos: 76 },
      { nombre: '1 taza cubos', cantidad: 1, gramos: 152 },
      { nombre: '1 rodaja', cantidad: 1.8, gramos: 280 }
    ]
  },

  // 🍬 CONDIMENTOS Y SALSAS
  {
    id: 'sal_comun',
    nombre: 'Sal común',
    categoria: 'condimentos',
    subcategoria: 'Condimentos básicos',
    kcal_100g: 0,
    prot_g_100g: 0,
    carbs_g_100g: 0,
    grasa_g_100g: 0,
    emoji: '🧂',
    unidad_base: {
      nombre: 'cucharadita',
      peso_g: 6,
      kcal_unidad: 0
    },
    porciones_comunes: [
      { nombre: '1/2 cucharadita', cantidad: 0.5, gramos: 3 },
      { nombre: '1 cucharadita', cantidad: 1, gramos: 6 },
      { nombre: 'pizca', cantidad: 0.1, gramos: 0.6 }
    ]
  },
  {
    id: 'pimienta_negra',
    nombre: 'Pimienta negra',
    categoria: 'condimentos',
    subcategoria: 'Especias',
    kcal_100g: 251,
    prot_g_100g: 10.4,
    carbs_g_100g: 64.8,
    grasa_g_100g: 3.3,
    emoji: '🌶️',
    unidad_base: {
      nombre: 'cucharadita',
      peso_g: 2,
      kcal_unidad: 5
    },
    porciones_comunes: [
      { nombre: '1/2 cucharadita', cantidad: 0.5, gramos: 1 },
      { nombre: '1 cucharadita', cantidad: 1, gramos: 2 },
      { nombre: 'pizca', cantidad: 0.25, gramos: 0.5 }
    ]
  },
  {
    id: 'oregano_seco',
    nombre: 'Orégano seco',
    categoria: 'condimentos',
    subcategoria: 'Hierbas',
    kcal_100g: 265,
    prot_g_100g: 9,
    carbs_g_100g: 68.9,
    grasa_g_100g: 4.3,
    emoji: '🌿',
    unidad_base: {
      nombre: 'cucharadita',
      peso_g: 1,
      kcal_unidad: 2.7
    },
    porciones_comunes: [
      { nombre: '1/2 cucharadita', cantidad: 0.5, gramos: 0.5 },
      { nombre: '1 cucharadita', cantidad: 1, gramos: 1 },
      { nombre: 'pizca', cantidad: 0.25, gramos: 0.25 }
    ]
  },
  {
    id: 'ajo_en_polvo',
    nombre: 'Ajo en polvo',
    categoria: 'condimentos',
    subcategoria: 'Especias',
    kcal_100g: 331,
    prot_g_100g: 16.6,
    carbs_g_100g: 72.7,
    grasa_g_100g: 0.7,
    emoji: '🧄',
    unidad_base: {
      nombre: 'cucharadita',
      peso_g: 3,
      kcal_unidad: 10
    },
    porciones_comunes: [
      { nombre: '1/2 cucharadita', cantidad: 0.5, gramos: 1.5 },
      { nombre: '1 cucharadita', cantidad: 1, gramos: 3 },
      { nombre: 'pizca', cantidad: 0.33, gramos: 1 }
    ]
  },
  {
    id: 'limon_jugo',
    nombre: 'Jugo de limón',
    categoria: 'condimentos',
    subcategoria: 'Jugos',
    kcal_100g: 22,
    prot_g_100g: 0.4,
    carbs_g_100g: 6.9,
    grasa_g_100g: 0.2,
    emoji: '🍋',
    unidad_base: {
      nombre: 'cucharada',
      peso_g: 15,
      kcal_unidad: 3.3
    },
    porciones_comunes: [
      { nombre: '1/2 cucharada', cantidad: 0.5, gramos: 7.5 },
      { nombre: '1 cucharada', cantidad: 1, gramos: 15 },
      { nombre: '2 cucharadas', cantidad: 2, gramos: 30 }
    ]
  },
  {
    id: 'vinagre_blanco',
    nombre: 'Vinagre blanco',
    categoria: 'condimentos',
    subcategoria: 'Vinagres',
    kcal_100g: 18,
    prot_g_100g: 0,
    carbs_g_100g: 0.04,
    grasa_g_100g: 0,
    emoji: '🧴',
    unidad_base: {
      nombre: 'cucharada',
      peso_g: 15,
      kcal_unidad: 2.7
    },
    porciones_comunes: [
      { nombre: '1/2 cucharada', cantidad: 0.5, gramos: 7.5 },
      { nombre: '1 cucharada', cantidad: 1, gramos: 15 },
      { nombre: '2 cucharadas', cantidad: 2, gramos: 30 }
    ]
  },
  {
    id: 'salsa_tomate',
    nombre: 'Salsa de tomate',
    categoria: 'condimentos',
    subcategoria: 'Salsas',
    kcal_100g: 29,
    prot_g_100g: 1.6,
    carbs_g_100g: 7,
    grasa_g_100g: 0.2,
    fibra_g_100g: 1.4,
    emoji: '🥫',
    unidad_base: {
      nombre: 'cucharada',
      peso_g: 15,
      kcal_unidad: 4.4
    },
    porciones_comunes: [
      { nombre: '1 cucharada', cantidad: 1, gramos: 15 },
      { nombre: '2 cucharadas', cantidad: 2, gramos: 30 },
      { nombre: '1/4 taza', cantidad: 2.7, gramos: 40 }
    ]
  },

  // 🥤 BEBIDAS
  {
    id: 'agua',
    nombre: 'Agua',
    categoria: 'bebidas',
    subcategoria: 'Sin calorías',
    kcal_100g: 0,
    prot_g_100g: 0,
    carbs_g_100g: 0,
    grasa_g_100g: 0,
    emoji: '💧',
    unidad_base: {
      nombre: 'vaso',
      peso_g: 250,
      kcal_unidad: 0
    },
    porciones_comunes: [
      { nombre: '1 vaso', cantidad: 1, gramos: 250 },
      { nombre: '1 botella 500ml', cantidad: 2, gramos: 500 },
      { nombre: '1 litro', cantidad: 4, gramos: 1000 }
    ]
  },
  {
    id: 'cafe_negro',
    nombre: 'Café negro',
    categoria: 'bebidas',
    subcategoria: 'Sin calorías',
    kcal_100g: 2,
    prot_g_100g: 0.1,
    carbs_g_100g: 0.5,
    grasa_g_100g: 0,
    emoji: '☕',
    unidad_base: {
      nombre: 'taza',
      peso_g: 240,
      kcal_unidad: 5
    },
    porciones_comunes: [
      { nombre: '1 taza', cantidad: 1, gramos: 240 },
      { nombre: '1 cortado', cantidad: 0.5, gramos: 120 },
      { nombre: '1 espresso', cantidad: 0.25, gramos: 60 }
    ]
  },
  {
    id: 'te_verde',
    nombre: 'Té verde',
    categoria: 'bebidas',
    subcategoria: 'Sin calorías',
    kcal_100g: 1,
    prot_g_100g: 0,
    carbs_g_100g: 0,
    grasa_g_100g: 0,
    emoji: '🍵',
    unidad_base: {
      nombre: 'taza',
      peso_g: 240,
      kcal_unidad: 2.4
    },
    porciones_comunes: [
      { nombre: '1 taza', cantidad: 1, gramos: 240 },
      { nombre: '1 taza grande', cantidad: 1.5, gramos: 360 },
      { nombre: 'Saquito', cantidad: 1, gramos: 240 }
    ]
  },
  {
    id: 'jugo_naranja_natural',
    nombre: 'Jugo de naranja natural',
    categoria: 'bebidas',
    subcategoria: 'Con calorías',
    kcal_100g: 45,
    prot_g_100g: 0.7,
    carbs_g_100g: 10.4,
    grasa_g_100g: 0.2,
    emoji: '🍊',
    unidad_base: {
      nombre: 'vaso',
      peso_g: 240,
      kcal_unidad: 108
    },
    porciones_comunes: [
      { nombre: '1/2 vaso', cantidad: 0.5, gramos: 120 },
      { nombre: '1 vaso', cantidad: 1, gramos: 240 },
      { nombre: '1 vaso grande', cantidad: 1.3, gramos: 310 }
    ]
  },
  {
    id: 'gaseosa_cola',
    nombre: 'Gaseosa cola',
    categoria: 'bebidas',
    subcategoria: 'Ultraprocesadas',
    kcal_100g: 42,
    prot_g_100g: 0,
    carbs_g_100g: 10.6,
    grasa_g_100g: 0,
    emoji: '🥤',
    unidad_base: {
      nombre: 'lata 350ml',
      peso_g: 350,
      kcal_unidad: 147
    },
    porciones_comunes: [
      { nombre: '1/2 lata', cantidad: 0.5, gramos: 175 },
      { nombre: '1 lata', cantidad: 1, gramos: 350 },
      { nombre: '1 botella 500ml', cantidad: 1.4, gramos: 500 }
    ]
  },
  {
    id: 'vino_tinto',
    nombre: 'Vino tinto',
    categoria: 'bebidas',
    subcategoria: 'Alcohólicas',
    kcal_100g: 85,
    prot_g_100g: 0.1,
    carbs_g_100g: 2.6,
    grasa_g_100g: 0,
    emoji: '🍷',
    unidad_base: {
      nombre: 'copa',
      peso_g: 150,
      kcal_unidad: 127
    },
    porciones_comunes: [
      { nombre: '1/2 copa', cantidad: 0.5, gramos: 75 },
      { nombre: '1 copa', cantidad: 1, gramos: 150 },
      { nombre: '1 botella', cantidad: 5, gramos: 750 }
    ]
  },
  {
    id: 'cerveza',
    nombre: 'Cerveza',
    categoria: 'bebidas',
    subcategoria: 'Alcohólicas',
    kcal_100g: 43,
    prot_g_100g: 0.5,
    carbs_g_100g: 3.6,
    grasa_g_100g: 0,
    emoji: '🍺',
    unidad_base: {
      nombre: 'botella 330ml',
      peso_g: 330,
      kcal_unidad: 142
    },
    porciones_comunes: [
      { nombre: '1/2 botella', cantidad: 0.5, gramos: 165 },
      { nombre: '1 botella', cantidad: 1, gramos: 330 },
      { nombre: '1 pinta 500ml', cantidad: 1.5, gramos: 500 }
    ]
  },

  // 🍟 SNACKS Y ULTRAPROCESADOS
  {
    id: 'papas_fritas_bolsa',
    nombre: 'Papas fritas (bolsa)',
    categoria: 'snacks',
    subcategoria: 'Ultraprocesados',
    kcal_100g: 536,
    prot_g_100g: 6.6,
    carbs_g_100g: 53.0,
    grasa_g_100g: 34.6,
    fibra_g_100g: 4.2,
    emoji: '🍟',
    unidad_base: {
      nombre: 'paquete chico',
      peso_g: 50,
      kcal_unidad: 268
    },
    porciones_comunes: [
      { nombre: '1/2 paquete', cantidad: 0.5, gramos: 25 },
      { nombre: '1 paquete chico', cantidad: 1, gramos: 50 },
      { nombre: '1 paquete grande', cantidad: 3, gramos: 150 }
    ]
  },
  {
    id: 'chocolate_leche',
    nombre: 'Chocolate con leche',
    categoria: 'snacks',
    subcategoria: 'Dulces',
    kcal_100g: 534,
    prot_g_100g: 7.6,
    carbs_g_100g: 59.4,
    grasa_g_100g: 29.7,
    fibra_g_100g: 3.4,
    emoji: '🍫',
    unidad_base: {
      nombre: 'cuadrito',
      peso_g: 5,
      kcal_unidad: 26.7
    },
    porciones_comunes: [
      { nombre: '2 cuadritos', cantidad: 2, gramos: 10 },
      { nombre: '4 cuadritos', cantidad: 4, gramos: 20 },
      { nombre: '1 barra chica', cantidad: 10, gramos: 50 }
    ]
  },
  {
    id: 'galletas_dulces',
    nombre: 'Galletas dulces',
    categoria: 'snacks',
    subcategoria: 'Ultraprocesados',
    kcal_100g: 502,
    prot_g_100g: 5.9,
    carbs_g_100g: 67.3,
    grasa_g_100g: 23.0,
    fibra_g_100g: 2.1,
    emoji: '🍪',
    unidad_base: {
      nombre: 'galleta',
      peso_g: 12,
      kcal_unidad: 60
    },
    porciones_comunes: [
      { nombre: '1 galleta', cantidad: 1, gramos: 12 },
      { nombre: '2 galletas', cantidad: 2, gramos: 24 },
      { nombre: '4 galletas', cantidad: 4, gramos: 48 }
    ]
  },
  {
    id: 'pizza_muzza',
    nombre: 'Pizza muzzarella',
    categoria: 'snacks',
    subcategoria: 'Comida rápida',
    kcal_100g: 266,
    prot_g_100g: 11.0,
    carbs_g_100g: 33.0,
    grasa_g_100g: 10.1,
    fibra_g_100g: 2.3,
    emoji: '🍕',
    unidad_base: {
      nombre: 'porción',
      peso_g: 125,
      kcal_unidad: 332
    },
    porciones_comunes: [
      { nombre: '1 porción', cantidad: 1, gramos: 125 },
      { nombre: '2 porciones', cantidad: 2, gramos: 250 },
      { nombre: '1/2 porción', cantidad: 0.5, gramos: 62 }
    ]
  },
  {
    id: 'hamburguesa_simple',
    nombre: 'Hamburguesa simple',
    categoria: 'snacks',
    subcategoria: 'Comida rápida',
    kcal_100g: 254,
    prot_g_100g: 13.0,
    carbs_g_100g: 31.0,
    grasa_g_100g: 10.4,
    fibra_g_100g: 2.2,
    emoji: '🍔',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 150,
      kcal_unidad: 381
    },
    porciones_comunes: [
      { nombre: '1/2 hamburguesa', cantidad: 0.5, gramos: 75 },
      { nombre: '1 hamburguesa', cantidad: 1, gramos: 150 },
      { nombre: '1 hamburguesa doble', cantidad: 1.7, gramos: 255 }
    ]
  },
  {
    id: 'empanada_carne',
    nombre: 'Empanada de carne',
    categoria: 'snacks',
    subcategoria: 'Comida rápida',
    kcal_100g: 280,
    prot_g_100g: 12.0,
    carbs_g_100g: 28.0,
    grasa_g_100g: 13.2,
    fibra_g_100g: 1.8,
    emoji: '🥟',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 120,
      kcal_unidad: 336
    },
    porciones_comunes: [
      { nombre: '1/2 empanada', cantidad: 0.5, gramos: 60 },
      { nombre: '1 empanada', cantidad: 1, gramos: 120 },
      { nombre: '2 empanadas', cantidad: 2, gramos: 240 }
    ]
  },
  {
    id: 'helado_crema',
    nombre: 'Helado de crema',
    categoria: 'snacks',
    subcategoria: 'Dulces',
    kcal_100g: 207,
    prot_g_100g: 3.5,
    carbs_g_100g: 23.6,
    grasa_g_100g: 11.0,
    emoji: '🍦',
    unidad_base: {
      nombre: 'bocha',
      peso_g: 50,
      kcal_unidad: 103
    },
    porciones_comunes: [
      { nombre: '1 bocha', cantidad: 1, gramos: 50 },
      { nombre: '2 bochas', cantidad: 2, gramos: 100 },
      { nombre: '1 cucurucho', cantidad: 3, gramos: 150 }
    ]
  },

  // 🥯 CEREALES Y DESAYUNO
  {
    id: 'avena_cocida',
    nombre: 'Avena cocida',
    categoria: 'carbohidratos',
    subcategoria: 'Cereales',
    kcal_100g: 68, // 170 kcal / 250g * 100
    prot_g_100g: 2.4,
    carbs_g_100g: 12.0,
    grasa_g_100g: 1.4,
    fibra_g_100g: 1.7,
    emoji: '🥣',
    unidad_base: {
      nombre: 'taza',
      peso_g: 250,
      kcal_unidad: 170
    },
    porciones_comunes: [
      { nombre: '1/2 taza', cantidad: 0.5, gramos: 125 },
      { nombre: '1 taza', cantidad: 1, gramos: 250 },
      { nombre: '1.5 tazas', cantidad: 1.5, gramos: 375 }
    ]
  },
  {
    id: 'granola',
    nombre: 'Granola',
    categoria: 'carbohidratos',
    subcategoria: 'Cereales',
    kcal_100g: 471, // 141 kcal / 30g * 100
    prot_g_100g: 10.1,
    carbs_g_100g: 64.3,
    grasa_g_100g: 20.3,
    fibra_g_100g: 6.0,
    emoji: '🥣',
    unidad_base: {
      nombre: 'porción',
      peso_g: 30,
      kcal_unidad: 141
    },
    porciones_comunes: [
      { nombre: '1/2 porción', cantidad: 0.5, gramos: 15 },
      { nombre: '1 porción', cantidad: 1, gramos: 30 },
      { nombre: '2 porciones', cantidad: 2, gramos: 60 }
    ]
  },
  {
    id: 'cereales_desayuno',
    nombre: 'Cereales de desayuno',
    categoria: 'carbohidratos',
    subcategoria: 'Cereales',
    kcal_100g: 379,
    prot_g_100g: 7.5,
    carbs_g_100g: 84.0,
    grasa_g_100g: 2.7,
    fibra_g_100g: 3.0,
    emoji: '🥣',
    unidad_base: {
      nombre: 'taza',
      peso_g: 30,
      kcal_unidad: 114
    },
    porciones_comunes: [
      { nombre: '1/2 taza', cantidad: 0.5, gramos: 15 },
      { nombre: '1 taza', cantidad: 1, gramos: 30 },
      { nombre: '1.5 tazas', cantidad: 1.5, gramos: 45 }
    ]
  },
  {
    id: 'tostadas_integrales',
    nombre: 'Tostadas integrales',
    categoria: 'carbohidratos',
    subcategoria: 'Panes',
    kcal_100g: 395, // 32 kcal / 8g * 100
    prot_g_100g: 13.4,
    carbs_g_100g: 71.2,
    grasa_g_100g: 6.6,
    fibra_g_100g: 9.7,
    emoji: '🍞',
    unidad_base: {
      nombre: 'unidad',
      peso_g: 8,
      kcal_unidad: 32
    },
    porciones_comunes: [
      { nombre: '1 tostada', cantidad: 1, gramos: 8 },
      { nombre: '2 tostadas', cantidad: 2, gramos: 16 },
      { nombre: '3 tostadas', cantidad: 3, gramos: 24 }
    ]
  },

  // 🥗 ENSALADAS Y VEGETALES PREPARADOS
  {
    id: 'ensalada_mixta',
    nombre: 'Ensalada mixta',
    categoria: 'verduras',
    subcategoria: 'Ensaladas',
    kcal_100g: 20, // Promedio de verduras mixtas
    prot_g_100g: 1.5,
    carbs_g_100g: 4.0,
    grasa_g_100g: 0.2,
    fibra_g_100g: 2.0,
    emoji: '🥗',
    unidad_base: {
      nombre: 'plato',
      peso_g: 200,
      kcal_unidad: 40
    },
    porciones_comunes: [
      { nombre: '1 plato chico', cantidad: 0.5, gramos: 100 },
      { nombre: '1 plato', cantidad: 1, gramos: 200 },
      { nombre: '1 bowl grande', cantidad: 1.5, gramos: 300 }
    ]
  }
];

// Funciones auxiliares actualizadas
// Utilidad para normalizar texto (sin acentos, minúsculas)
export const normalizeText = (str: string) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

// Lista deduplicada por nombre+subcategoría+categoría (evita duplicados visuales)
export const getAllFoodsDeduped = (): FoodItem[] => {
  const map = new Map<string, FoodItem>();
  for (const f of foodDatabase) {
    const key = `${normalizeText(f.nombre)}|${normalizeText(f.subcategoria)}|${f.categoria}`;
    if (!map.has(key)) map.set(key, f);
  }
  return Array.from(map.values());
};

export const getFoodsByCategory = (categoria: string) => {
  const all = getAllFoodsDeduped();
  return all.filter(food => food.categoria === categoria);
};

// Búsqueda tolerante a acentos y por tokens; admite lista base opcional
export const searchFoods = (query: string, baseList?: FoodItem[]) => {
  const list = baseList ?? getAllFoodsDeduped();
  const nq = normalizeText(query);
  if (!nq) return list;
  const tokens = nq.split(/\s+/).filter(Boolean);
  return list.filter(food => {
    const haystack = [
      food.id,
      food.nombre,
      food.subcategoria,
      food.categoria,
      food.unidad_base?.nombre || ''
    ]
      .map(normalizeText)
      .join(' ');
    return tokens.every(t => haystack.includes(t));
  });
};

export const getFoodById = (id: string) => {
  return foodDatabase.find(food => food.id === id);
};

// Nueva función para calcular basado en unidades
export const calculateNutritionFromUnits = (foodId: string, units: number) => {
  const food = getFoodById(foodId);
  if (!food) return null;
  
  const totalKcal = food.unidad_base.kcal_unidad * units;
  const totalGrams = food.unidad_base.peso_g * units;
  const factor = totalGrams / 100;
  
  return {
    kcal: Math.round(totalKcal * 10) / 10,
    prot: Math.round(food.prot_g_100g * factor * 10) / 10,
    carbs: Math.round(food.carbs_g_100g * factor * 10) / 10,
    grasa: Math.round(food.grasa_g_100g * factor * 10) / 10,
    fibra: food.fibra_g_100g ? Math.round(food.fibra_g_100g * factor * 10) / 10 : 0,
    gramos_totales: Math.round(totalGrams * 10) / 10
  };
};

// Función original mantenida para compatibilidad
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