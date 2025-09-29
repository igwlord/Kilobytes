import React, { useEffect, useMemo, useState } from 'react';
import './Progreso.css';
import { getRecipeSteps } from '../data/recetasPasoAPaso';
import { tipsCards } from '../data/tipsCards';
import type { AppState } from '../interfaces/AppState';
import {
  getDayLog,
  getDayTotals,
  getFastingHours,
  getHydrationMl,
  getSleepHours,
  getTargets,
} from '../utils/appStateSelectors';

type Objetivo = 'bajar' | 'mantener' | 'subir';

interface ProgresoProps {
  appState: AppState;
}

type Section = 'resumen' | 'peso' | 'tendencias' | 'recetas' | 'tips' | 'glosario' | null;
type KPIKey = 'kcal' | 'prot' | 'carbs' | 'grasa' | 'agua' | 'sueno' | 'ayuno';

const Progreso: React.FC<ProgresoProps> = ({ appState }) => {
  const [openSection, setOpenSection] = useState<Section>('resumen');
  const [rangeDays, setRangeDays] = useState<number>(() => {
    const saved = Number(localStorage.getItem('kiloByteProgressRange') || '7');
    return [7, 14, 30].includes(saved) ? saved : 7;
  });

  const generateWeightData = () => {
    // Simulamos datos de peso para mostrar la gráfica
    // En una implementación real, estos datos vendrían del estado de la app
    const currentWeight = appState.perfil?.peso ?? 70;
    const baseWeight = currentWeight + 3; // Peso inicial simulado
    
    const data = [];
    for (let i = 0; i < 12; i++) {
      const week = i + 1;
      const weightLoss = (i * 0.3) + Math.random() * 0.4 - 0.2; // Simulamos pérdida gradual
      const weight = Math.max(baseWeight - weightLoss, currentWeight - 2);
      data.push({ week, weight: Math.round(weight * 10) / 10 });
    }
    
    return data;
  };

  const generateSVGPath = (data: Array<{ week: number; weight: number }>) => {
    if (data.length === 0) return '';
    
    const width = 280;
    const height = 120;
    const padding = 20;
    
    const minWeight = Math.min(...data.map(d => d.weight)) - 1;
    const maxWeight = Math.max(...data.map(d => d.weight)) + 1;
    const weightRange = maxWeight - minWeight;
    
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = padding + ((maxWeight - d.weight) / weightRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');
    
    return points;
  };

  const weightData = generateWeightData();
  const svgPath = generateSVGPath(weightData);
  const currentWeight = weightData[weightData.length - 1]?.weight || 70;
  const initialWeight = weightData[0]?.weight || 73;
  const weightLoss = Math.round((initialWeight - currentWeight) * 10) / 10;

  const getRangeDays = (n: number) => {
    const days: { key: string; label: string }[] = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('es-AR', { weekday: 'short' });
      days.push({ key, label });
    }
    return days;
  };

  const trends = useMemo(() => {
    const days = getRangeDays(rangeDays);
    const targets = getTargets(appState);
    return days.map(({ key, label }) => {
      const log = getDayLog(appState, key);
      const totals = getDayTotals(log);
      const agua = getHydrationMl(log);
      const sueno = getSleepHours(log);
      const ayuno = getFastingHours(log);
      return {
        date: label,
        kcal: totals.kcal,
        prot: totals.prot,
        carbs: totals.carbs,
        grasa: totals.grasa,
        agua,
        sueno,
        ayuno,
        pct: {
          kcal: targets.kcal > 0 ? Math.round((totals.kcal / targets.kcal) * 100) : 0,
          prot: targets.prot > 0 ? Math.round((totals.prot / targets.prot) * 100) : 0,
          carbs: targets.carbs > 0 ? Math.round((totals.carbs / targets.carbs) * 100) : 0,
          grasa: targets.grasa > 0 ? Math.round((totals.grasa / targets.grasa) * 100) : 0,
          agua: targets.agua > 0 ? Math.round((agua / targets.agua) * 100) : 0,
          sueno: Math.round((sueno / 8) * 100),
          ayuno: targets.ayuno > 0 ? Math.round((ayuno / targets.ayuno) * 100) : 0,
        }
      };
    });
  }, [appState, rangeDays]);

  const avg = useMemo(() => {
    const base = { kcal:0, prot:0, carbs:0, grasa:0, agua:0, sueno:0, ayuno:0 };
    const sum = trends.reduce((acc, d)=> ({
      kcal: acc.kcal + d.pct.kcal,
      prot: acc.prot + d.pct.prot,
      carbs: acc.carbs + d.pct.carbs,
      grasa: acc.grasa + d.pct.grasa,
      agua: acc.agua + d.pct.agua,
      sueno: acc.sueno + d.pct.sueno,
      ayuno: acc.ayuno + d.pct.ayuno,
    }), base);
    const div = Math.max(1, trends.length);
    return {
      kcal: Math.round(sum.kcal / div),
      prot: Math.round(sum.prot / div),
      agua: Math.round(sum.agua / div),
      carbs: Math.round(sum.carbs / div),
      grasa: Math.round(sum.grasa / div),
      sueno: Math.round(sum.sueno / div),
      ayuno: Math.round(sum.ayuno / div),
    };
  }, [trends]);

  // Recetas por objetivo (extraídas de Recetas.md)
  type Recipe = { title: string; group: 'Desayuno' | 'Almuerzo' | 'Cena' | 'Snack' };
  const recetas: Record<Objetivo, Recipe[]> = {
    bajar: [
      { title: 'Omelette de claras con espinaca y tomate', group: 'Desayuno' },
      { title: 'Tostada integral con palta y sésamo', group: 'Desayuno' },
      { title: 'Smoothie verde detox', group: 'Desayuno' },
      { title: 'Yogur descremado con arándanos y chía', group: 'Desayuno' },
      { title: 'Pancakes de avena y clara', group: 'Desayuno' },
      { title: 'Ensalada de pollo a la plancha', group: 'Almuerzo' },
      { title: 'Zoodles de zucchini con salsa de tomate', group: 'Almuerzo' },
      { title: 'Bowl de quinoa con vegetales al vapor', group: 'Almuerzo' },
      { title: 'Ensalada de atún mediterránea', group: 'Almuerzo' },
      { title: 'Revuelto de claras con champiñones y cebolla', group: 'Almuerzo' },
      { title: 'Salmón al horno con espárragos', group: 'Cena' },
      { title: 'Tortilla de espinaca y cebolla', group: 'Cena' },
      { title: 'Pechuga de pollo rellena con espinaca y ricotta', group: 'Cena' },
      { title: 'Berenjenas rellenas con lentejas', group: 'Cena' },
      { title: 'Sopa de calabaza y jengibre', group: 'Cena' },
      { title: 'Rolls de lechuga con pavo', group: 'Snack' },
      { title: 'Bastones de zanahoria y apio con hummus', group: 'Snack' },
      { title: 'Ensalada de garbanzos estilo griego', group: 'Snack' },
      { title: 'Tostada integral con ricotta y frutillas', group: 'Snack' },
      { title: 'Smoothie de frutos rojos y proteína', group: 'Snack' },
    ],
    subir: [
      { title: 'Omelette de claras y 2 huevos + avena', group: 'Desayuno' },
      { title: 'Smoothie de proteína post-entrenamiento', group: 'Desayuno' },
      { title: 'Tostadas integrales con palta y salmón ahumado', group: 'Desayuno' },
      { title: 'Panqueques de avena y claras con ricotta y frutillas', group: 'Desayuno' },
      { title: 'Bowl de yogur griego con granola y miel', group: 'Desayuno' },
      { title: 'Pollo grillado con arroz integral y brócoli', group: 'Almuerzo' },
      { title: 'Pasta integral con carne magra y salsa casera', group: 'Almuerzo' },
      { title: 'Wrap integral de pavo y vegetales', group: 'Almuerzo' },
      { title: 'Bowl de quinoa con atún y verduras salteadas', group: 'Almuerzo' },
      { title: 'Hamburguesa casera de garbanzos + huevo + ensalada', group: 'Almuerzo' },
      { title: 'Salmón al horno con batata y espárragos', group: 'Cena' },
      { title: 'Tacos de carne magra con guacamole', group: 'Cena' },
      { title: 'Pollo al curry con arroz basmati y verduras', group: 'Cena' },
      { title: 'Lentejas estofadas con huevo duro y arroz integral', group: 'Cena' },
      { title: 'Pizza proteica casera', group: 'Cena' },
      { title: 'Sándwich integral de pavo y queso fresco', group: 'Snack' },
      { title: 'Bastones + hummus + 1 huevo duro', group: 'Snack' },
      { title: 'Batido leche + avena + proteína + banana', group: 'Snack' },
      { title: 'Tostadas con mantequilla de maní + banana', group: 'Snack' },
      { title: 'Ensalada de garbanzos con atún y huevo duro', group: 'Snack' },
    ],
    mantener: [
      { title: 'Omelette de claras + 1 huevo con espinaca', group: 'Desayuno' },
      { title: 'Tostadas integrales con palta + huevo duro', group: 'Desayuno' },
      { title: 'Smoothie de frutos rojos + chía', group: 'Desayuno' },
      { title: 'Yogur con granola sin azúcar y banana', group: 'Desayuno' },
      { title: 'Pancakes integrales de avena y claras', group: 'Desayuno' },
      { title: 'Ensalada de pollo con palmitos', group: 'Almuerzo' },
      { title: 'Quinoa con vegetales y garbanzos', group: 'Almuerzo' },
      { title: 'Wrap integral de atún y vegetales', group: 'Almuerzo' },
      { title: 'Pasta integral con salsa de tomate natural', group: 'Almuerzo' },
      { title: 'Bowl de arroz integral con huevo pochê y brócoli', group: 'Almuerzo' },
      { title: 'Merluza a la plancha con puré de calabaza', group: 'Cena' },
      { title: 'Pechuga rellena con espinaca + ricotta', group: 'Cena' },
      { title: 'Salmón al vapor con ensalada de kale y palta', group: 'Cena' },
      { title: 'Tortilla de espárragos y champiñones', group: 'Cena' },
      { title: 'Berenjena gratinada con ricotta y salsa de tomate', group: 'Cena' },
      { title: 'Bastones con hummus', group: 'Snack' },
      { title: 'Queso fresco light con tomate y orégano', group: 'Snack' },
      { title: 'Tostada integral con ricotta y frutillas', group: 'Snack' },
      { title: 'Mix frutos secos + 1 manzana', group: 'Snack' },
      { title: 'Smoothie de kiwi + espinaca + pepino + limón', group: 'Snack' },
    ],
  };

  const objetivoRaw = (appState.perfil?.objetivo || 'mantener').toLowerCase();
  const objetivoActual: Objetivo = objetivoRaw === 'bajar' ? 'bajar' : objetivoRaw === 'subir' ? 'subir' : 'mantener';
  const grupos: Array<{ key: Objetivo; label: string; colorClass: string }> = [
    { key: 'bajar', label: 'Pérdida de peso', colorClass: 'goal-lose' },
    { key: 'subir', label: 'Aumento de masa muscular', colorClass: 'goal-gain' },
    { key: 'mantener', label: 'Mantener peso', colorClass: 'goal-maintain' },
  ];

  // Modal de receta
  const [openRecipe, setOpenRecipe] = useState<{ title: string; steps: string[] } | null>(null);
  const [openMealGroups, setOpenMealGroups] = useState<Record<string, boolean>>({ Desayuno: true, Almuerzo: false, Cena: false, Snack: false });
  const toggleMeal = (k: string) => setOpenMealGroups(s => ({ ...s, [k]: !s[k] }));
  const [search, setSearch] = useState('');
  // Flip tips state
  const tipCats = ['Alimentación','Hábitos','Organización','Sueño','Actividad'] as const;
  type TipCat = typeof tipCats[number];
  const [tipCat, setTipCat] = useState<TipCat | null>(null);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const toggleFlip = (idx: number) => setFlipped(s => ({ ...s, [idx]: !s[idx] }));
  // Forzar que el usuario elija siempre una categoría al abrir la sección de tips
  useEffect(() => {
    if (openSection === 'tips') {
      setTipCat(null);
      setFlipped({});
    }
  }, [openSection]);
  type GlossCat = 'macros' | 'hábitos' | 'microbiota' | 'entrenamiento' | 'metabólico' | 'planificación';
  type GlossaryTerm = { t: string; d: string; cat: GlossCat };
  const glossaryCats: Array<{key: GlossCat; label: string}> = [
    { key: 'macros', label: 'Macros' },
    { key: 'hábitos', label: 'Hábitos' },
    { key: 'microbiota', label: 'Microbiota' },
    { key: 'entrenamiento', label: 'Entrenamiento' },
    { key: 'metabólico', label: 'Metabólico' },
    { key: 'planificación', label: 'Planificación' },
  ];
  const [gQuery, setGQuery] = useState('');
  const [gCat, setGCat] = useState<'todos' | GlossCat>('todos');
  const GLOSSARY: GlossaryTerm[] = [
    {t:'Calorías vacías',d:'Energía con pocos nutrientes (azúcar, harinas refinadas). Mejor limitar.',cat:'macros'},
    {t:'Proteína completa',d:'Aporta todos los aminoácidos esenciales (huevo, lácteos, soja, quinoa).',cat:'macros'},
    {t:'Índice glucémico (IG)',d:'Qué tan rápido sube la glucosa un alimento. IG bajo/medio evita picos.',cat:'macros'},
    {t:'Carga glucémica (CG)',d:'IG + porción. Evalúa el impacto real en glucosa.',cat:'macros'},
    {t:'Fibra soluble',d:'Se disuelve en agua, retrasa vaciamiento y alimenta microbiota.',cat:'macros'},
    {t:'Fibra insoluble',d:'Aumenta volumen y acelera tránsito (salvado, verduras).',cat:'macros'},
    {t:'Grasas saludables',d:'Oliva, palta, frutos secos, pescado azul; ayudan a saciedad y salud.',cat:'macros'},
    {t:'Omega-3',d:'Ácidos grasos antiinflamatorios (pescado azul, chía, lino).',cat:'macros'},
    {t:'Densidad nutricional',d:'Nutrientes por caloría. Priorizá alimentos densos en nutrientes.',cat:'macros'},
    {t:'Densidad calórica',d:'Calorías por gramo; baja densidad ayuda a perder peso.',cat:'macros'},

    {t:'Adherencia',d:'Sostener el plan en el tiempo; más importante que la perfección.',cat:'hábitos'},
    {t:'Mindful eating',d:'Comer con atención plena; ayuda a la saciedad y disfrute.',cat:'hábitos'},
    {t:'Ritmo de comidas',d:'Comer lento mejora señales de saciedad (10–20 min por comida).',cat:'hábitos'},
    {t:'Entorno alimentario',d:'Dejá a la vista opciones saludables; lo que está a mano, se come.',cat:'hábitos'},
    {t:'Micrometas',d:'Cambios pequeños sostenibles (agua +500 ml, 1 fruta/día).',cat:'hábitos'},
    {t:'Volumetría',d:'Más volumen con pocas calorías (verduras, sopas, ensaladas).',cat:'hábitos'},
    {t:'Plan anti-antojos',d:'Dormí, proteína, fibra, grasas buenas; tené snacks reales listos.',cat:'hábitos'},
    {t:'Ayuno intermitente',d:'Ventana sin calorías; útil si mejora tu adherencia y orden.',cat:'hábitos'},

    {t:'Microbiota',d:'Microbios del intestino; impacta digestión, inmunidad y saciedad.',cat:'microbiota'},
    {t:'Prebióticos',d:'Fibras que nutren bacterias buenas (inulina, avena, banana verde).',cat:'microbiota'},
    {t:'Probióticos',d:'Microorganismos vivos beneficiosos (yogur, kéfir, chucrut).',cat:'microbiota'},
    {t:'Polifenoles',d:'Compuestos vegetales que apoyan una microbiota diversa.',cat:'microbiota'},
    {t:'Harinas refinadas',d:'Pueden empobrecer la microbiota si desplazan fibra vegetal.',cat:'microbiota'},

    {t:'NEAT',d:'Gasto no asociado a ejercicio (caminar, moverse). Suma mucho.',cat:'entrenamiento'},
    {t:'HIIT',d:'Entrenamiento interválico de alta intensidad; eficiente.',cat:'entrenamiento'},
    {t:'Fuerza progresiva',d:'Aumentar cargas/volumen para ganar/retener músculo.',cat:'entrenamiento'},
    {t:'Refeed',d:'Día con más calorías/carbohidratos para sostener adherencia.',cat:'entrenamiento'},
    {t:'Steps post comida',d:'Caminatas cortas tras comer ayudan a la glucosa.',cat:'entrenamiento'},

    {t:'Resistencia a la insulina',d:'Células responden menos a la insulina; mejora con peso y actividad.',cat:'metabólico'},
    {t:'HbA1c',d:'Glucosa promedio 3 meses; útil para seguimiento metabólico.',cat:'metabólico'},
    {t:'Hígado graso',d:'Grasa en hígado; mejora con pérdida de peso y movimiento.',cat:'metabólico'},
    {t:'TMB (BMR)',d:'Energía mínima para funciones vitales en reposo.',cat:'metabólico'},
    {t:'TEF',d:'Energía de la digestión/metabolismo de alimentos.',cat:'metabólico'},
    {t:'Balance energético',d:'Calorías que entran vs. salen.',cat:'metabólico'},
    {t:'Déficit calórico',d:'Consumir menos de lo que gastás para perder peso.',cat:'metabólico'},
    {t:'Superávit calórico',d:'Consumir más de lo que gastás para ganar masa.',cat:'metabólico'},
    {t:'Plateau',d:'Meseta de progreso; ajustar calorías, actividad o sueño.',cat:'metabólico'},

    {t:'Porción',d:'Cantidad estandarizada para medir y comparar.',cat:'planificación'},
    {t:'Granola casera',d:'Versión sin azúcar añadida; controlás ingredientes.',cat:'planificación'},
    {t:'Batch cooking',d:'Cocinar en tandas para ahorrar tiempo y cumplir el plan.',cat:'planificación'},
    {t:'Lista de compras',d:'Guía concreta para evitar compras impulsivas.',cat:'planificación'},
    {t:'Mise en place',d:'Dejar todo listo antes de cocinar; fluidez y menos estrés.',cat:'planificación'},
  ];

  const onChangeRange = (n: number) => { setRangeDays(n); localStorage.setItem('kiloByteProgressRange', String(n)); };

  return (
    <div className="progreso-container">
      <h1 className="progreso-title">Mi Progreso</h1>
      
      {/* Preferencias rápidas (solo rango) */}
      <div className="progress-prefs">
        <div className="prefs-range" role="group" aria-label="Rango de días">
          <button className={`chip ${rangeDays===7?'active':''}`} onClick={()=>onChangeRange(7)}>7d</button>
          <button className={`chip ${rangeDays===14?'active':''}`} onClick={()=>onChangeRange(14)}>14d</button>
          <button className={`chip ${rangeDays===30?'active':''}`} onClick={()=>onChangeRange(30)}>30d</button>
        </div>
      </div>

      {/* Resumen impactante */}
      <div className="progress-card collapsible">
        <div className="collapsible-header">
          <h2 className="card-title">Resumen 📊</h2>
          <button className={`collapse-toggle ${openSection==='resumen'?'open':''}`} onClick={()=> setOpenSection(s=> s==='resumen'? null : 'resumen')} aria-label="Alternar">
            ▾
          </button>
        </div>
        {openSection==='resumen' && (
          <p className="card-help">Promedio de adherencia a tus metas clave en los últimos {rangeDays} días. Te muestra qué tan cerca estuviste de tus objetivos de calorías, proteínas e hidratación.</p>
        )}
        {openSection==='resumen' && (
          <div className="kpi-grid-impact">
            <div className="kpi-card-impact">
              <div className="kpi-ring" data-pct={avg.kcal}><div style={{ ['--pct' as string]: `${Math.min(100, avg.kcal)}%` } as React.CSSProperties} /></div>
              <div className="kpi-info"><div className="kpi-label">Adherencia kcal</div><div className="kpi-value">{avg.kcal}%</div></div>
            </div>
            <div className="kpi-card-impact">
              <div className="kpi-ring" data-pct={avg.prot}><div style={{ ['--pct' as string]: `${Math.min(100, avg.prot)}%` } as React.CSSProperties} /></div>
              <div className="kpi-info"><div className="kpi-label">Adherencia proteínas</div><div className="kpi-value">{avg.prot}%</div></div>
            </div>
            <div className="kpi-card-impact">
              <div className="kpi-ring" data-pct={avg.agua}><div style={{ ['--pct' as string]: `${Math.min(100, avg.agua)}%` } as React.CSSProperties} /></div>
              <div className="kpi-info"><div className="kpi-label">Hidratación</div><div className="kpi-value">{avg.agua}%</div></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Panel de KPIs eliminado por pedido */}

      {/* Gráfico de peso (colapsable) */}
      <div className="progress-card collapsible">
        <div className="collapsible-header">
          <h2 className="card-title">Peso corporal⚖️</h2>
          <button
            className={`collapse-toggle ${openSection === 'peso' ? 'open' : ''}`}
            onClick={() => setOpenSection(prev => (prev === 'peso' ? null : 'peso'))}
            aria-label={openSection === 'peso' ? 'Colapsar' : 'Expandir'}
          >
            ▾
          </button>
        </div>
        {openSection === 'peso' && (
        <>
        <p className="card-help">Tu trayectoria de peso. Si aún no registraste, mostramos un ejemplo. Pronto tomará tus mediciones reales.</p>
        <div className="weight-chart">
          <svg width="100%" height="150" viewBox="0 0 300 150" className="chart-svg">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="30" height="15" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 15" fill="none" stroke="var(--border-color)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="300" height="150" fill="url(#grid)" />
            
            {/* Trend line */}
            <polyline
              points={svgPath}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Data points */}
            {weightData.map((point, index) => {
              const x = 20 + (index / (weightData.length - 1)) * 260;
              const minWeight = Math.min(...weightData.map(d => d.weight)) - 1;
              const maxWeight = Math.max(...weightData.map(d => d.weight)) + 1;
              const y = 20 + ((maxWeight - point.weight) / (maxWeight - minWeight)) * 110;
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="var(--color-primary)"
                />
              );
            })}
            
            {/* Current point highlight */}
            {weightData.length > 0 && (
              <circle
                cx={20 + ((weightData.length - 1) / (weightData.length - 1)) * 260}
                cy={20 + ((Math.max(...weightData.map(d => d.weight)) + 1 - currentWeight) / 
                    (Math.max(...weightData.map(d => d.weight)) + 1 - Math.min(...weightData.map(d => d.weight)) + 1)) * 110}
                r="5"
                fill="var(--color-secondary)"
                stroke="white"
                strokeWidth="2"
              />
            )}
          </svg>
        </div>
        </>
        )}
        
        {openSection === 'peso' && (
        <div className="weight-summary">
          <div className="weight-stat">
            <span className="stat-label">Peso actual</span>
            <span className="stat-value primary">{currentWeight} kg</span>
          </div>
          <div className="weight-stat">
            <span className="stat-label">Cambio total</span>
            <span className={`stat-value ${weightLoss >= 0 ? 'success' : 'warning'}`}>
              {weightLoss >= 0 ? '-' : '+'}{Math.abs(weightLoss)} kg
            </span>
          </div>
          <div className="weight-stat">
            <span className="stat-label">Semanas</span>
            <span className="stat-value secondary">{weightData.length}</span>
          </div>
        </div>
        )}
      </div>

      {/* Tendencias detalladas (dinámicas por selección) */}
      <div className="progress-card collapsible">
        <div className="collapsible-header">
          <h2 className="card-title">Tendencias 📈</h2>
          <button
            className={`collapse-toggle ${openSection === 'tendencias' ? 'open' : ''}`}
            onClick={() => setOpenSection(prev => (prev === 'tendencias' ? null : 'tendencias'))}
            aria-label={openSection === 'tendencias' ? 'Colapsar' : 'Expandir'}
          >
            ▾
          </button>
        </div>
        {openSection === 'tendencias' && (
        <>
        <p className="card-help">Barras diarias (últimos {rangeDays} días) comparadas con tus metas. Verde = dentro del rango ideal (90–110%). Amarillo = aceptable (70–130%).</p>
        <div className="trends-summary">
          {(['kcal','prot'] as KPIKey[]).map(k => (
            <div key={k} className="trend-stat">
              <span className="trend-label">{k==='kcal'?'Adherencia promedio - Calorías':'Adherencia promedio - Proteínas'}</span>
              <span className={`trend-value ${ (k==='kcal'?avg.kcal:avg.prot) >= 90 ? 'success' : (k==='kcal'?avg.kcal:avg.prot) >= 70 ? 'warning' : 'error'}`}>
                {k==='kcal'?avg.kcal:avg.prot}%
              </span>
            </div>
          ))}
        </div>

        <div className="daily-trends">
          {trends.map((day, index) => (
            <div key={index} className="daily-trend">
              <div className="day-label">{day.date}</div>
              <div className="trend-bars">
                {(['kcal','prot'] as KPIKey[]).map(k => {
                    const label = ({kcal:'Calorías',prot:'Proteínas',carbs:'Carbs',grasa:'Grasa',agua:'Agua',sueno:'Sueño',ayuno:'Ayuno'})[k];
                    const pct = day.pct[k];
                    const cls = pct >= 90 && pct <= 110 ? 'success' : pct >= 70 && pct <= 130 ? 'warning' : 'error';
                    return (
                      <div key={k} className="trend-bar-container">
                        <label>{label}</label>
                        <div className="trend-bar">
                          <div className={`trend-bar-fill ${cls}`} style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                        <span className="trend-bar-value">{pct}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
        </>
        )}
      </div>

      {/* Recetas según plan */}
      <div className="progress-card collapsible">
        <div className="collapsible-header">
          <h2 className="card-title">Recetas 🍳</h2>
          <button
            className={`collapse-toggle ${openSection === 'recetas' ? 'open' : ''}`}
            onClick={() => setOpenSection(prev => (prev === 'recetas' ? null : 'recetas'))}
            aria-label={openSection === 'recetas' ? 'Colapsar' : 'Expandir'}
          >
            ▾
          </button>
        </div>
        {openSection === 'recetas' && (
        <div className="recipes">
          <p className="card-help">Todas las recetas están visibles. Tu plan actual se resalta como recomendado.</p>
          <div className="recipes-toolbar">
            <input className="recipes-search" placeholder="Buscar receta..." value={search} onChange={(e)=> setSearch(e.target.value)} />
          </div>
          {grupos.map((g) => {
            return (
              <div key={g.key} className={`recipe-group ${g.colorClass} enabled ${g.key===objetivoActual ? 'selected' : ''}`}>
                <div className="recipe-group-header">
                  <h3>{g.label}</h3>
                  {g.key===objetivoActual && <span className="plan-badge" title="Plan recomendado">Tu plan</span>}
                </div>
                {(['Desayuno','Almuerzo','Cena','Snack'] as const).map(meal => {
                  const items = recetas[g.key].filter(r => r.group === meal && (!search || r.title.toLowerCase().includes(search.toLowerCase())));
                  if (!items.length) return null;
                  const open = openMealGroups[meal];
                  return (
                    <div key={meal} className="recipe-sub-accordion">
                      <button className={`sub-acc-header ${open?'open':''}`} onClick={()=> toggleMeal(meal)}>
                        <span>{meal}</span>
                        <span className="chev">▾</span>
                      </button>
                      {open && (
                        <div className="recipe-grid">
                          {items.map((r, idx) => (
                            <div
                              key={idx}
                              className={`recipe-card`}
                              title={r.title}
                              onClick={() => {
                                const steps = getRecipeSteps(r.title);
                                if (steps && steps.length) setOpenRecipe({ title: r.title, steps });
                              }}
                              aria-disabled={false}
                              role="button"
                            >
                              <div className="recipe-title">{r.title}</div>
                              <div className="recipe-meta">{r.group}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        )}

        {openSection === 'recetas' && openRecipe && (
          <div className="recipe-modal-overlay" onClick={() => setOpenRecipe(null)}>
            <div className="recipe-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <div className="recipe-modal-header">
                <h3>{openRecipe.title}</h3>
                <button className="close-btn" onClick={() => setOpenRecipe(null)} aria-label="Cerrar">×</button>
              </div>
              <div className="recipe-modal-body">
                <ol className="recipe-steps">
                  {openRecipe.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Consejos e información */}
      <div className="progress-card collapsible">
        <div className="collapsible-header">
          <h2 className="card-title">tips/Info💡</h2>
          <button
            className={`collapse-toggle ${openSection === 'tips' ? 'open' : ''}`}
            onClick={() => setOpenSection(prev => (prev === 'tips' ? null : 'tips'))}
            aria-label={openSection === 'tips' ? 'Colapsar' : 'Expandir'}
          >
            ▾
          </button>
        </div>
        {openSection === 'tips' && (
          <div className="tips-content tips-content--tips">
            <p className="card-help tip-intro">Ideas prácticas y conceptos clave para mejorar adherencia, saciedad y salud digestiva. Leelos de a poco y elegí 1–2 para aplicar esta semana.</p>
            {/* Pills de categoría */}
            <div className="g-filters" role="tablist" aria-label="Categorías de tips">
              {tipCats.map(c => (
                <button key={c} className={`g-pill ${tipCat===c?'active':''}`} role="tab" aria-selected={tipCat===c} onClick={()=> setTipCat(c)}>{c}</button>
              ))}
            </div>

            {/* Grid de flip-cards */}
            {tipCat === null ? (
              <p className="card-help" style={{ marginTop: 8 }}>Elegí una categoría para ver tarjetas con ejemplos prácticos.</p>
            ) : (
              <div className="tips-grid">
                {tipsCards
                  .filter(t => t.categoria===tipCat)
                  .map((tip, idx) => {
                    const isFlipped = !!flipped[idx];
                    return (
                      <button
                        key={`${tip.titulo}-${idx}`}
                        className={`flip-card ${isFlipped?'flipped':''}`}
                        onClick={()=> toggleFlip(idx)}
                        onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ' || e.key==='Spacebar'){ e.preventDefault(); toggleFlip(idx);} if(e.key==='Escape'){ e.preventDefault(); setFlipped(s=> ({...s,[idx]:false})); } }}
                        aria-expanded={isFlipped}
                      >
                        <div className="flip-inner">
                          <div className="flip-face flip-front">
                            <div className="flip-emoji" aria-hidden>{tip.emoji}</div>
                            <h3 className="flip-title">{tip.titulo}</h3>
                            <p className="flip-summary">{tip.resumen}</p>
                            <div className="flip-meta">{tip.categoria}</div>
                          </div>
                          <div className="flip-face flip-back">
                            <p className="flip-desc">{tip.descripcion}</p>
                            <div className="flip-example" aria-label="Ejemplo práctico">
                              <div className="flip-example-title">✅ Ejemplo práctico</div>
                              <div className="flip-example-body">{tip.ejemplo}</div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Glosario como sección propia */}
      <div className="progress-card collapsible">
        <div className="collapsible-header">
          <h2 className="card-title">Glosario 📝</h2>
          <button
            className={`collapse-toggle ${openSection === 'glosario' ? 'open' : ''}`}
            onClick={() => setOpenSection(prev => (prev === 'glosario' ? null : 'glosario'))}
            aria-label={openSection === 'glosario' ? 'Colapsar' : 'Expandir'}
          >
            ▾
          </button>
        </div>
        {openSection === 'glosario' && (
          <div className="tips-content">
            <p className="card-help">Buscá términos y filtrá por categoría para entender mejor los conceptos clave de nutrición, hábitos y entrenamiento.</p>
            <div className="glossary-controls">
              <input className="g-search" placeholder="Buscar término…" value={gQuery} onChange={e=> setGQuery(e.target.value)} />
              <div className="g-filters" role="tablist" aria-label="Categorías del glosario">
                <button className={`g-pill ${gCat==='todos'?'active':''}`} role="tab" aria-selected={gCat==='todos'} onClick={()=> setGCat('todos')}>Todos</button>
                {glossaryCats.map(c => (
                  <button key={c.key} className={`g-pill ${gCat===c.key?'active':''}`} role="tab" aria-selected={gCat===c.key} onClick={()=> setGCat(c.key)}>{c.label}</button>
                ))}
              </div>
            </div>

            {(() => {
              const search = (gQuery||'').toLowerCase();
              const match = (x: GlossaryTerm) => !search || x.t.toLowerCase().includes(search) || x.d.toLowerCase().includes(search);
              const base = GLOSSARY.filter(match);
              if (gCat !== 'todos') {
                const list = base.filter(x=> x.cat===gCat);
                return (
                  <div className="glossary-grid">
                    {list.map((g,i)=> (
                      <div key={i} className="glossary-item">
                        <div className="g-term">{g.t}</div>
                        <div className="g-desc">{g.d}</div>
                      </div>
                    ))}
                  </div>
                );
              }
              const byCat = glossaryCats.map(c => ({ cat: c, items: base.filter(x=> x.cat===c.key) })).filter(section=> section.items.length);
              return (
                <div>
                  {byCat.map(section => (
                    <div key={section.cat.key} className="g-section">
                      <h4 className="g-section-title">{section.cat.label}</h4>
                      <div className="glossary-grid">
                        {section.items.map((g,i)=> (
                          <div key={i} className="glossary-item">
                            <div className="g-term">{g.t}</div>
                            <div className="g-desc">{g.d}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progreso;