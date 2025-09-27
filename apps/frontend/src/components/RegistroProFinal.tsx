import React, { useState, useEffect, useRef } from 'react';
// Lazy-load food database utilities on demand to improve initial bundle size
import type { FoodItem } from '../data/foodDatabaseNew';
import './RegistroProFinal.css';

interface FoodEntry {
  id: string;
  foodId: string;
  nombre: string;
  emoji: string;
  grams: number;
  kcal: number;
  prot: number;
  carbs: number;
  grasa: number;
  meal: string;
  units?: number;
  unit_name?: string;
  hora?: string; // HH:MM opcional
}

// Estructuras mínimas usadas por este componente
interface DayTotals { kcal: number; prot: number; carbs: number; grasa: number }
interface DayLog {
  peso_kg?: number;
  agua_ml: number;
  pasos: number;
  ejercicio_min: number;
  comidas: {
    desayuno: LoggedFood[];
    almuerzo: LoggedFood[];
    merienda: LoggedFood[];
    cena: LoggedFood[];
    snack: LoggedFood[];
  };
  totals: DayTotals;
}

interface GoalsMin {
  kcal: number;
  prote_g_dia: number;
  grasa_g_dia: number;
  carbs_g_dia: number;
  agua_ml: number;
  pasos_dia: number;
  peso_objetivo: number;
  ejercicio_min?: number;
  comidas_saludables?: number;
}

interface AppStateLike {
  perfil?: {
    theme?: string;
    nombre?: string;
  };
  metas: GoalsMin;
  log: Record<string, Partial<DayLog> | undefined>;
}

interface RegistroProps {
  appState: AppStateLike;
  updateAppState: (newState: AppStateLike) => void;
  showToast: (message: string) => void;
}

// Forma en la que se guarda cada alimento dentro del log diario (por comida)
interface LoggedFood {
  id: string;
  nombre: string;
  emoji?: string;
  cantidad_g: number;
  kcal: number;
  prot_g: number;
  carbs_g: number;
  grasa_g: number;
  units?: number;
  unit_name?: string;
  hora?: string;
}

const RegistroProFinal: React.FC<RegistroProps> = ({ appState, updateAppState, showToast }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentEntries, setCurrentEntries] = useState<FoodEntry[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string>('desayuno');
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  // Dynamic food DB module
  type FoodDBModule = typeof import('../data/foodDatabaseNew');
  const [foodApi, setFoodApi] = useState<FoodDBModule | null>(null);
  const [loadingFoodApi, setLoadingFoodApi] = useState(false);
  // Entradas personalizadas como strings para permitir vacío mientras se edita
  const [customGrams, setCustomGrams] = useState('');
  const [customUnits, setCustomUnits] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  // Acciones compactas: no se necesita estado de panel
  const [inputMethod, setInputMethod] = useState<'units' | 'grams'>('units');
  const [tooltip, setTooltip] = useState<{ show: boolean; content: string; x: number; y: number }>({
    show: false, content: '', x: 0, y: 0
  });
  const [openMeal, setOpenMeal] = useState<string | null>(null);

  // Mobile detection to apply a two-step flow on phones
  // Use a slightly broader width to include larger phones but avoid tablets
  const mobileQuery = '(max-width: 600px)';
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia(mobileQuery).matches
  );
  useEffect(() => {
    const mq: MediaQueryList = window.matchMedia(mobileQuery);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    if ('addEventListener' in mq) {
      mq.addEventListener('change', onChange as EventListener);
    } else if ('addListener' in mq) {
      // Fallback for older browsers
      (mq as unknown as { addListener: (cb: (e: MediaQueryListEvent) => void) => void }).addListener(onChange);
    }
    setIsMobile(mq.matches);
    return () => {
      if ('removeEventListener' in mq) {
        mq.removeEventListener('change', onChange as EventListener);
      } else if ('removeListener' in mq) {
        (mq as unknown as { removeListener: (cb: (e: MediaQueryListEvent) => void) => void }).removeListener(onChange);
      }
    };
  }, []);

  // Reflect isMobile on the <body> to allow CSS gating even on wider-but-touch devices
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const body = document.body;
      if (isMobile) body.classList.add('is-mobile');
      else body.classList.remove('is-mobile');
    }
  }, [isMobile]);

  // Ref para el selector de porciones
  const portionRef = useRef<HTMLDivElement | null>(null);

  // Cargar el módulo de alimentos cuando se abre el modal de agregar
  useEffect(() => {
    if (activeModal === 'add-food' && !foodApi && !loadingFoodApi) {
      setLoadingFoodApi(true);
      import('../data/foodDatabaseNew')
        .then(mod => setFoodApi(mod))
        .finally(() => setLoadingFoodApi(false));
    }
  }, [activeModal, foodApi, loadingFoodApi]);

  // Al seleccionar un alimento, hacer scroll al selector de porciones (en desktop mantiene visibilidad, en mobile se abre el paso 2)
  useEffect(() => {
    if (selectedFood && !isMobile) {
      setTimeout(() => {
        portionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 0);
    }
  }, [selectedFood, isMobile]);

  // Cargar entradas del día seleccionado
  useEffect(() => {
    const dayLog = appState.log?.[selectedDate];
    if (dayLog?.comidas) {
      const entries: FoodEntry[] = [];
      Object.entries(dayLog.comidas).forEach(([meal, foods]) => {
        if (Array.isArray(foods)) {
          foods.forEach((food: { id: string; nombre: string; emoji?: string; cantidad_g: number; kcal: number; prot_g: number; carbs_g: number; grasa_g: number; units?: number; unit_name?: string; hora?: string; }) => {
            entries.push({
              id: `${meal}-${Date.now()}-${Math.random()}`,
              foodId: food.id,
              nombre: food.nombre,
              emoji: food.emoji || '🍽️',
              grams: food.cantidad_g,
              kcal: food.kcal,
              prot: food.prot_g,
              carbs: food.carbs_g,
              grasa: food.grasa_g,
              meal: meal,
              units: food.units ?? undefined,
              unit_name: food.unit_name ?? undefined,
              hora: food.hora
            });
          });
        }
      });
      setCurrentEntries(entries);
    } else {
      setCurrentEntries([]);
    }
  }, [selectedDate, appState.log]);

  // Calcular totales del día
  const dayTotals = currentEntries.reduce(
    (acc, entry) => ({
      kcal: acc.kcal + entry.kcal,
      prot: acc.prot + entry.prot,
      carbs: acc.carbs + entry.carbs,
      grasa: acc.grasa + entry.grasa
    }),
    { kcal: 0, prot: 0, carbs: 0, grasa: 0 }
  );

  // Agregar alimento por unidades
  const addFoodByUnits = (food: FoodItem, units: number, meal: string) => {
    const nutrition = foodApi?.calculateNutritionFromUnits(food.id, units);
    if (!nutrition) return;

    const newEntry: FoodEntry = {
      id: `${meal}-${Date.now()}-${Math.random()}`,
      foodId: food.id,
      nombre: food.nombre,
      emoji: food.emoji,
      grams: nutrition.gramos_totales,
      kcal: nutrition.kcal,
      prot: nutrition.prot,
      carbs: nutrition.carbs,
      grasa: nutrition.grasa,
      meal: meal,
      units: units,
      unit_name: food.unidad_base.nombre,
      hora: selectedTime
    };

    const newEntries = [...currentEntries, newEntry];
    setCurrentEntries(newEntries);
    saveToAppState(newEntries);
    setActiveModal(null);
    setSelectedFood(null);
    setSearchQuery('');
  // No forzar valor por defecto; dejar vacío tras agregar
  setCustomUnits('');
  };

  // Agregar alimento por gramos
  const addFoodByGrams = (food: FoodItem, grams: number, meal: string) => {
    const nutrition = foodApi?.calculateNutrition(food.id, grams);
    if (!nutrition) return;

    const newEntry: FoodEntry = {
      id: `${meal}-${Date.now()}-${Math.random()}`,
      foodId: food.id,
      nombre: food.nombre,
      emoji: food.emoji,
      grams,
      kcal: nutrition.kcal,
      prot: nutrition.prot,
      carbs: nutrition.carbs,
      grasa: nutrition.grasa,
      meal: meal,
      hora: selectedTime
    };

    const newEntries = [...currentEntries, newEntry];
    setCurrentEntries(newEntries);
    saveToAppState(newEntries);
    setActiveModal(null);
    setSelectedFood(null);
    setSearchQuery('');
  // No forzar valor por defecto; dejar vacío tras agregar
  setCustomGrams('');
  };

  // Eliminar alimento
  const removeFood = (entryId: string) => {
    const newEntries = currentEntries.filter(entry => entry.id !== entryId);
    setCurrentEntries(newEntries);
    saveToAppState(newEntries);
    showToast('🗑️ Alimento eliminado');
  };

  // Guardar en AppState
  const saveToAppState = (entries: FoodEntry[]) => {
    const newLog = { ...appState.log };
    
    if (!newLog[selectedDate]) {
      newLog[selectedDate] = {
        peso_kg: undefined,
        agua_ml: 0,
        pasos: 0,
        ejercicio_min: 0,
        comidas: {
          desayuno: [],
          almuerzo: [],
          merienda: [],
          cena: [],
          snack: []
        },
        totals: { kcal: 0, prot: 0, carbs: 0, grasa: 0 }
      };
    }

    // Organizar por comidas
    const mealGroups: {
      desayuno: LoggedFood[];
      almuerzo: LoggedFood[];
      merienda: LoggedFood[];
      cena: LoggedFood[];
      snack: LoggedFood[];
    } = {
      desayuno: [],
      almuerzo: [],
      merienda: [],
      cena: [],
      snack: []
    };

    entries.forEach(entry => {
      const mealKey = entry.meal as keyof typeof mealGroups;
      if (mealGroups[mealKey]) {
        mealGroups[mealKey].push({
          id: entry.foodId,
          nombre: entry.nombre,
          emoji: entry.emoji,
          cantidad_g: entry.grams,
          kcal: entry.kcal,
          prot_g: entry.prot,
          carbs_g: entry.carbs,
          grasa_g: entry.grasa,
          units: entry.units,
          unit_name: entry.unit_name,
          hora: entry.hora
        });
      }
    });

    newLog[selectedDate].comidas = mealGroups;
    
    // Calcular totales
    const totals = entries.reduce(
      (acc, entry) => ({
        kcal: acc.kcal + entry.kcal,
        prot: acc.prot + entry.prot,
        carbs: acc.carbs + entry.carbs,
        grasa: acc.grasa + entry.grasa
      }),
      { kcal: 0, prot: 0, carbs: 0, grasa: 0 }
    );

    newLog[selectedDate].totals = totals;

    updateAppState({
      ...appState,
      log: newLog
    });
  };

  // Filtrar alimentos combinando categoría + búsqueda sobre lista deduplicada
  const getFilteredFoods = () => {
    if (!foodApi) return [] as FoodItem[];
    let list = foodApi.getAllFoodsDeduped();
    if (selectedCategory !== 'all') {
      list = list.filter(f => f.categoria === selectedCategory);
    }
    if (searchQuery.trim().length > 0) {
      list = foodApi.searchFoods(searchQuery, list);
    }
    return list.slice(0, 50);
  };

  // Copiar día anterior
  const copyPreviousDay = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    
    const prevLog = appState.log?.[prevDateStr];
    if (prevLog?.comidas) {
      const entries: FoodEntry[] = [];
      Object.entries(prevLog.comidas).forEach(([meal, foods]) => {
        if (Array.isArray(foods)) {
          foods.forEach((food: LoggedFood) => {
            entries.push({
              id: `${meal}-${Date.now()}-${Math.random()}`,
              foodId: food.id,
              nombre: food.nombre,
              emoji: food.emoji || '🍽️',
              grams: food.cantidad_g,
              kcal: food.kcal,
              prot: food.prot_g,
              carbs: food.carbs_g,
              grasa: food.grasa_g,
              meal: meal,
              units: food.units,
              unit_name: food.unit_name
            });
          });
        }
      });
      
      setCurrentEntries(entries);
      saveToAppState(entries);
      showToast('📋 Día anterior copiado exitosamente');
    } else {
      showToast('❌ No hay datos del día anterior');
    }
  };

  // Tooltip handlers
  const showTooltip = (e: React.MouseEvent, content: string) => {
    setTooltip({
      show: true,
      content,
      x: e.clientX,
      y: e.clientY
    });
  };

  const hideTooltip = () => {
    setTooltip({ show: false, content: '', x: 0, y: 0 });
  };

  // Comidas por categoría
  const mealGroups = {
    desayuno: currentEntries.filter(e => e.meal === 'desayuno'),
    almuerzo: currentEntries.filter(e => e.meal === 'almuerzo'),
    merienda: currentEntries.filter(e => e.meal === 'merienda'),
    cena: currentEntries.filter(e => e.meal === 'cena'),
    snack: currentEntries.filter(e => e.meal === 'snack')
  };

  const mealInfo = {
    desayuno: { emoji: '🌅', name: 'Desayuno', color: '#FF6B6B', time: '07:00 - 10:00' },
    almuerzo: { emoji: '🌞', name: 'Almuerzo', color: '#4ECDC4', time: '12:00 - 15:00' },
    merienda: { emoji: '🌆', name: 'Merienda', color: '#45B7D1', time: '16:00 - 18:00' },
    cena: { emoji: '🌙', name: 'Cena', color: '#96CEB4', time: '19:00 - 22:00' },
    snack: { emoji: '🍿', name: 'Snack', color: '#FFEAA7', time: 'Cualquier momento' }
  };

  const categories = [
    { id: 'all', name: 'Todos', emoji: '🍽️', desc: 'Ver todos los alimentos' },
    { id: 'proteinas', name: 'Proteínas', emoji: '🥩', desc: 'Carnes, huevos, legumbres' },
    { id: 'carbohidratos', name: 'Carbos', emoji: '🌾', desc: 'Cereales, tubérculos' },
    { id: 'verduras', name: 'Verduras', emoji: '🥦', desc: 'Vegetales y hortalizas' },
    { id: 'frutas', name: 'Frutas', emoji: '🍎', desc: 'Frutas frescas y secas' },
    { id: 'grasas', name: 'Grasas', emoji: '🥜', desc: 'Aceites, frutos secos' },
    { id: 'condimentos', name: 'Condimentos', emoji: '🧂', desc: 'Especias, salsas' },
    { id: 'bebidas', name: 'Bebidas', emoji: '🥤', desc: 'Líquidos y bebidas' },
    { id: 'snacks', name: 'Snacks', emoji: '🍟', desc: 'Snacks y procesados' }
  ];

  const getMealInfo = (meal: string) => {
    const info: Record<string, { emoji: string; name: string; color: string; time: string }>
      = mealInfo as Record<string, { emoji: string; name: string; color: string; time: string }>;
    return info[meal] || { emoji: '🍽️', name: 'Comida', color: '#6C4ED9', time: '' };
  };

  return (
    <div className="registro-pro-final">
      {/* Header mejorado con progress bars */}
      <div className="registro-header-final">
        <div className="date-section">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input-final"
          />
          <div className="date-info">
            <span className="day-name">{new Date(selectedDate).toLocaleDateString('es-AR', { weekday: 'long' })}</span>
          </div>
        </div>

        <div className="progress-section">
          {[
            { key: 'kcal', label: 'Calorías', value: dayTotals.kcal, max: appState.metas?.kcal || 2000, unit: '', color: '#FF6B6B' },
            { key: 'prot', label: 'Proteínas', value: dayTotals.prot, max: appState.metas?.prote_g_dia || 150, unit: 'g', color: '#4ECDC4' },
            { key: 'carbs', label: 'Carbos', value: dayTotals.carbs, max: appState.metas?.carbs_g_dia || 200, unit: 'g', color: '#45B7D1' },
            { key: 'grasa', label: 'Grasas', value: dayTotals.grasa, max: appState.metas?.grasa_g_dia || 65, unit: 'g', color: '#96CEB4' }
          ].map(macro => (
            <div 
              key={macro.key}
              className={`macro-progress macro-${macro.key}`}
              onMouseEnter={(e) => showTooltip(e, `${macro.label}: ${Math.round(macro.value)}${macro.unit} / ${macro.max}${macro.unit}`)}
              onMouseLeave={hideTooltip}
            >
              <div className="macro-label">{macro.label}</div>
              <div className="macro-bar">
                <div 
                  className="macro-fill" 
                  style={{ 
                    width: `${Math.min((macro.value / macro.max) * 100, 100)}%`,
                    backgroundColor: macro.color
                  }}
                />
              </div>
              <div className="macro-values">
                <span className="current">{Math.round(macro.value)}</span>
                <span className="separator">/</span>
                <span className="target">{macro.max}{macro.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="quick-actions-compact" aria-label="Acciones rápidas">
          <button 
            className="qa-btn copy"
            onClick={copyPreviousDay}
            onMouseEnter={(e) => showTooltip(e, 'Copiar comidas del día anterior')}
            onMouseLeave={hideTooltip}
            aria-label="Copiar día anterior"
          >
            <span className="qa-icon">📋</span>
            <span className="qa-text">Anterior</span>
          </button>
          <button 
            className="qa-btn fav"
            onClick={() => showToast('⭐ Próximamente: Comidas favoritas')}
            onMouseEnter={(e) => showTooltip(e, 'Comidas favoritas')}
            onMouseLeave={hideTooltip}
            aria-label="Comidas favoritas"
          >
            <span className="qa-icon">⭐</span>
            <span className="qa-text">Favoritos</span>
          </button>
        </div>
      </div>

      {/* Se eliminaron scanner y sugerencias; acciones compactas arriba */}

      {/* Comidas del día con diseño mejorado */}
      <div className="meals-container-final">
        {Object.entries(mealGroups).map(([meal, entries]) => {
          const info = getMealInfo(meal);
          return (
            <div key={meal} className="meal-section-final">
              <div 
                className="meal-header-final meal-header-collapsible" 
                style={{ 
                  borderLeft: `4px solid ${info.color}`,
                  background: `linear-gradient(135deg, ${info.color}15, ${info.color}05)`
                }}
              >
                <div className="meal-info">
                  <div className="meal-title-row">
                    <span className="meal-emoji">{info.emoji}</span>
                    <span className="meal-name">{info.name}</span>
                    <span className="meal-count">({entries.length})</span>
                    <button
                      className={`meal-toggle-btn ${openMeal === meal ? 'open' : ''}`}
                      aria-label={openMeal === meal ? 'Colapsar' : 'Expandir'}
                      onClick={() => setOpenMeal(prev => (prev === meal ? null : meal))}
                      onMouseEnter={(e) => showTooltip(e, openMeal === meal ? 'Colapsar sección' : 'Expandir sección')}
                      onMouseLeave={hideTooltip}
                    >
                      <span className="chevron">▾</span>
                    </button>
                  </div>
                  <div 
                    className="meal-time"
                    onMouseEnter={(e) => showTooltip(e, `Horario recomendado: ${info.time}`)}
                    onMouseLeave={hideTooltip}
                  >
                    {info.time}
                  </div>
                </div>
                
                <div className="meal-stats">
                  <span className="meal-kcal">
                    {Math.round(entries.reduce((acc, e) => acc + e.kcal, 0))} kcal
                  </span>
                </div>
                
                <button
                  className="add-food-btn-final"
                  onClick={() => {
                    setSelectedMeal(meal);
                    setOpenMeal(meal);
                    setActiveModal('add-food');
                  }}
                  onMouseEnter={(e) => showTooltip(e, `Agregar alimento a ${info.name}`)}
                  onMouseLeave={hideTooltip}
                >
                  <span>+</span>
                </button>
              </div>

              {openMeal === meal && (
              <div className="meal-foods-final">
                {entries.map(entry => (
                  <div key={entry.id} className="food-entry-final">
                    <div className="food-info-final">
                      <span className="food-emoji">{entry.emoji}</span>
                      <div className="food-details-final">
                        <span className="food-name">
                          {entry.nombre}
                          {entry.hora && <span className="entry-time-badge" style={{ marginLeft: 8 }}>{entry.hora}</span>}
                        </span>
                        <div className="food-meta">
                          <span className="food-meta-line">
                            {entry.units && entry.unit_name
                              ? `${entry.units} ${entry.unit_name}${entry.units > 1 ? 's' : ''} • ${entry.grams}g`
                              : `${entry.grams}g`}
                            {` • ${Math.round(entry.kcal)} kcal • ${Math.round(entry.prot)}g prot`}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="food-actions">
                      <button
                        className="duplicate-food-btn"
                        onClick={() => {
                          if (!foodApi) return;
                          if (entry.units) {
                            const food = foodApi.foodDatabase.find((f: FoodItem) => f.id === entry.foodId);
                            if (food) addFoodByUnits(food, entry.units, entry.meal);
                          } else {
                            const food = foodApi.foodDatabase.find((f: FoodItem) => f.id === entry.foodId);
                            if (food) addFoodByGrams(food, entry.grams, entry.meal);
                          }
                        }}
                        onMouseEnter={(e) => showTooltip(e, 'Duplicar este alimento')}
                        onMouseLeave={hideTooltip}
                      >
                        ⎘
                      </button>
                      <button
                        className="remove-food-btn-final"
                        onClick={() => removeFood(entry.id)}
                        onMouseEnter={(e) => showTooltip(e, 'Eliminar este alimento')}
                        onMouseLeave={hideTooltip}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                
                {entries.length === 0 && (
                  <div 
                    className="empty-meal-final" 
                    onClick={() => {
                      setSelectedMeal(meal);
                      setOpenMeal(meal);
                      setActiveModal('add-food');
                    }}
                  >
                    <div className="empty-content">
                      <span className="empty-icon">🍽️</span>
                      <span className="empty-text">Agregar primer alimento</span>
                      <span className="empty-hint">Click para comenzar</span>
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal mejorado para agregar comida */}
      {activeModal === 'add-food' && (
        <div className="modal-overlay-final" onClick={() => setActiveModal(null)}>
          <div className={`modal-content-final ${selectedFood ? 'has-selected' : ''} ${isMobile && selectedFood ? 'mobile-portion' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="modal-header-final">
              <div className="modal-title-section">
                <h3>Agregar a {getMealInfo(selectedMeal).name}</h3>
                <div className="modal-time-control">
                  <label className="time-label" htmlFor="add-time">Hora</label>
                  <input
                    id="add-time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="time-input-final"
                  />
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="modal-close-final">
                <span>×</span>
              </button>
            </div>

            {/* Mobile step header when in portion step */}
            {isMobile && selectedFood && (
              <div className="mobile-step-nav" role="navigation">
                <button className="mobile-back-btn" onClick={() => setSelectedFood(null)} aria-label="Volver a la lista">←</button>
                <div className="mobile-step-title">
                  <span className="selected-food-emoji">{selectedFood.emoji}</span>
                  <span className="selected-food-name">{selectedFood.nombre}</span>
                </div>
              </div>
            )}

            {/* Buscador + categorías (se ocultan en paso 2 móvil) */}
            <div className="food-search-final">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="🔍 Buscar alimento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-final"
                  autoFocus
                />
                {searchQuery && (
                  <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
                )}
              </div>
              
              <div className="category-filters-final">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-btn-final ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    onMouseEnter={(e) => showTooltip(e, cat.desc)}
                    onMouseLeave={hideTooltip}
                  >
                    <span className="cat-emoji">{cat.emoji}</span>
                    <span className="cat-name">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cargando base de alimentos */}
            {(!foodApi || loadingFoodApi) && (
              <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>Cargando base de alimentos…</div>
            )}

            {/* Lista de alimentos (oculta en paso 2 móvil) */}
            <div className="foods-list-final">
              {getFilteredFoods().length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No se encontraron alimentos</div>
              ) : (
                getFilteredFoods().map(food => (
                  <div key={food.id} className="food-item-final" onClick={() => setSelectedFood(food)}>
                    <div className="food-basic-final">
                      <span className="food-emoji-large">{food.emoji}</span>
                      <div className="food-text-final">
                        <span className="food-name-final">{food.nombre}</span>
                        <span className="food-category-final">{food.subcategoria}</span>
                        <div className="food-unit-info">
                          <span className="unit-display">1 {food.unidad_base.nombre} = {food.unidad_base.kcal_unidad} kcal</span>
                        </div>
                      </div>
                    </div>
                    <div className="food-nutrition-final">
                      <div className="nutrition-per-100g">
                        <span>{food.kcal_100g} kcal/100g</span>
                        <span>{food.prot_g_100g}g prot</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Selector de porciones (en móvil reemplaza a la lista) */}
            {selectedFood && (
              <div className="portion-selector-final" ref={portionRef}>
                <div className="portion-header">
                  <h4>
                    <span className="selected-food-emoji">{selectedFood.emoji}</span>
                    {selectedFood.nombre}
                  </h4>
                  <div className="input-method-toggle">
                    <button
                      className={`toggle-btn ${inputMethod === 'units' ? 'active' : ''}`}
                      onClick={() => setInputMethod('units')}
                    >
                      Unidades
                    </button>
                    <button
                      className={`toggle-btn ${inputMethod === 'grams' ? 'active' : ''}`}
                      onClick={() => setInputMethod('grams')}
                    >
                      Gramos
                    </button>
                  </div>
                </div>

                {inputMethod === 'units' ? (
                  <div className="units-input-section">
                    <div className="unit-reference">
                      <span className="unit-info">
                        1 {selectedFood.unidad_base.nombre} = {selectedFood.unidad_base.peso_g}g = {selectedFood.unidad_base.kcal_unidad} kcal
                      </span>
                    </div>
                    
                    <div className="portions-grid-final">
                      {selectedFood.porciones_comunes.map((portion, idx) => (
                        <button
                          key={idx}
                          className="portion-btn-final units"
                          onClick={() => {
                            addFoodByUnits(selectedFood, portion.cantidad, selectedMeal);
                          }}
                          onMouseEnter={(e) => showTooltip(e, 
                            `${portion.cantidad} ${selectedFood.unidad_base.nombre}${portion.cantidad > 1 ? 's' : ''} = ${Math.round(selectedFood.unidad_base.kcal_unidad * portion.cantidad)} kcal`
                          )}
                          onMouseLeave={hideTooltip}
                        >
                          <span className="portion-name">{portion.nombre}</span>
                          <span className="portion-quantity">{portion.cantidad} {selectedFood.unidad_base.nombre}{portion.cantidad > 1 ? 's' : ''}</span>
                          <span className="portion-kcal">
                            {Math.round(selectedFood.unidad_base.kcal_unidad * portion.cantidad)} kcal
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="custom-units-section">
                      <label>Cantidad personalizada:</label>
                      <div className="custom-input-group-final">
                        <input
                          type="number"
                          value={customUnits}
                          onChange={(e) => setCustomUnits(e.target.value)}
                          className="custom-input-final"
                          placeholder="p. ej. 1"
                          min="0.1"
                          step="0.5"
                          max="50"
                        />
                        <span className="input-unit">{selectedFood.unidad_base.nombre}s</span>
                        <button
                          className="add-custom-btn-final"
                          disabled={!(parseFloat(customUnits) > 0)}
                          onClick={() => {
                            const units = parseFloat(customUnits);
                            if (units > 0) {
                              addFoodByUnits(selectedFood, units, selectedMeal);
                            }
                          }}
                        >
                          Agregar
                        </button>
                      </div>
                      <div className="custom-nutrition-final">
                        {parseFloat(customUnits) > 0 && (
                          <span>
                            = {Math.round(selectedFood.unidad_base.peso_g * parseFloat(customUnits))}g, {' '}
                            {Math.round(selectedFood.unidad_base.kcal_unidad * parseFloat(customUnits))} kcal, {' '}
                            {Math.round((selectedFood.prot_g_100g * selectedFood.unidad_base.peso_g * parseFloat(customUnits)) / 100)}g prot
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grams-input-section">
                    <div className="portions-grid-final">
                      {selectedFood.porciones_comunes.map((portion, idx) => (
                        <button
                          key={idx}
                          className="portion-btn-final grams"
                          onClick={() => {
                            addFoodByGrams(selectedFood, portion.gramos, selectedMeal);
                          }}
                        >
                          <span className="portion-name">{portion.nombre}</span>
                          <span className="portion-weight">{portion.gramos}g</span>
                          <span className="portion-kcal">
                            {Math.round((selectedFood.kcal_100g * portion.gramos) / 100)} kcal
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="custom-grams-section">
                      <label>Cantidad en gramos:</label>
                      <div className="custom-input-group-final">
                        <input
                          type="number"
                          value={customGrams}
                          onChange={(e) => setCustomGrams(e.target.value)}
                          className="custom-input-final"
                          placeholder="p. ej. 100"
                          min="1"
                          max="2000"
                        />
                        <span className="input-unit">gramos</span>
                        <button
                          className="add-custom-btn-final"
                          disabled={!(parseInt(customGrams) > 0)}
                          onClick={() => {
                            const grams = parseInt(customGrams);
                            if (grams > 0) {
                              addFoodByGrams(selectedFood, grams, selectedMeal);
                            }
                          }}
                        >
                          Agregar
                        </button>
                      </div>
                      <div className="custom-nutrition-final">
                        {parseInt(customGrams) > 0 && (
                          <span>
                            = {Math.round((selectedFood.kcal_100g * parseInt(customGrams)) / 100)} kcal, 
                            {Math.round((selectedFood.prot_g_100g * parseInt(customGrams)) / 100)}g prot
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip.show && (
        <div 
          className="tooltip-final"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default RegistroProFinal;