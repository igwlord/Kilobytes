import React, { useState, useEffect, useRef, useCallback } from 'react';
// Lazy-load food database utilities on demand to improve initial bundle size
import type { FoodItem } from '../data/foodDatabaseNew';
import './RegistroProFinal.css';
import Spinner from './Spinner';

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
  ayuno_h_iniciado?: string; // timestamp de inicio del ayuno
  ayuno_h_completado?: number; // horas de ayuno completadas
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
  ayuno_h_dia?: number;
}

interface AppStateLike {
  perfil?: {
    theme?: string;
    nombre?: string;
    mostrarAlertasMacros?: boolean;
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

// Local date helpers to avoid UTC shifts when using YYYY-MM-DD
const parseLocalDate = (s: string) => {
  // expect YYYY-MM-DD
  const [y, m, d] = s.split('-').map(n => parseInt(n, 10));
  return new Date(y, (m || 1) - 1, d || 1);
};
const formatLocalDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const RegistroProFinal: React.FC<RegistroProps> = ({ appState, updateAppState, showToast }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      const saved = localStorage.getItem('kiloByteSelectedDate');
      if (saved) return saved;
    } catch { /* ignore */ }
    return formatLocalDate(new Date());
  });
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
  // Edición de entrada existente
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
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
  
  // Estados para ayuno intermitente
  const [ayunoIniciado, setAyunoIniciado] = useState<string | null>(null);
  const [horasAyuno, setHorasAyuno] = useState<number>(0);
  
  // Estados para editor manual de ayuno
  const [showAyunoModal, setShowAyunoModal] = useState<boolean>(false);
  const [editingHours, setEditingHours] = useState<string>('');
  // Macro/field alerts deshabilitadas globalmente
  const alertsOn = false;

  // Navegación por fecha
  const shiftDate = useCallback((days: number) => {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() + days);
    const next = formatLocalDate(d);
    setSelectedDate(next);
    try { localStorage.setItem('kiloByteSelectedDate', next); } catch { /* ignore */ }
  }, [selectedDate]);
  const goToday = useCallback(() => {
    const today = formatLocalDate(new Date());
    setSelectedDate(today);
    try { localStorage.setItem('kiloByteSelectedDate', today); } catch { /* ignore */ }
  }, []);

  // Funciones de ayuno intermitente
  const iniciarAyuno = useCallback(() => {
    const timestamp = new Date().toISOString();
    setAyunoIniciado(timestamp);
    
    // Actualizar en appState
    const currentLog = appState.log[selectedDate] || {};
    const newLog = {
      ...currentLog,
      ayuno_h_iniciado: timestamp,
      ayuno_h_completado: undefined // resetear si había uno previo
    };
    
    updateAppState({
      ...appState,
      log: { ...appState.log, [selectedDate]: newLog }
    });
    
    showToast('⏰ Ayuno iniciado!');
  }, [selectedDate, appState, updateAppState, showToast]);

  const terminarAyuno = useCallback(() => {
    if (!ayunoIniciado) return;
    
    const ahora = new Date();
    const inicio = new Date(ayunoIniciado);
    const horasCompletadas = (ahora.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    
    setAyunoIniciado(null);
    setHorasAyuno(horasCompletadas);
    
    // Actualizar en appState
    const currentLog = appState.log[selectedDate] || {};
    const newLog = {
      ...currentLog,
      ayuno_h_iniciado: undefined,
      ayuno_h_completado: horasCompletadas
    };
    
    updateAppState({
      ...appState,
      log: { ...appState.log, [selectedDate]: newLog }
    });
    
    const metaAyuno = appState.metas?.ayuno_h_dia || 14;
    const emoji = horasCompletadas >= metaAyuno ? '🎉' : '⏰';
    showToast(`${emoji} Ayuno completado: ${horasCompletadas.toFixed(1)}h`);
  }, [ayunoIniciado, selectedDate, appState, updateAppState, showToast]);

  // Efecto para cargar estado de ayuno del día seleccionado
  useEffect(() => {
    const dayLog = appState.log[selectedDate];
    if (dayLog?.ayuno_h_iniciado) {
      setAyunoIniciado(dayLog.ayuno_h_iniciado);
      setHorasAyuno(0);
    } else {
      setAyunoIniciado(null);
      setHorasAyuno(dayLog?.ayuno_h_completado || 0);
    }
  }, [selectedDate, appState.log]);

  // Calcular horas transcurridas en tiempo real
  useEffect(() => {
    if (!ayunoIniciado) return;
    
    const interval = setInterval(() => {
      const ahora = new Date();
      const inicio = new Date(ayunoIniciado);
      const horasTranscurridas = (ahora.getTime() - inicio.getTime()) / (1000 * 60 * 60);
      setHorasAyuno(horasTranscurridas);
    }, 60000); // actualizar cada minuto
    
    return () => clearInterval(interval);
  }, [ayunoIniciado]);

  // Funciones para editor manual de ayuno
  const abrirEditorAyuno = useCallback(() => {
    setEditingHours(String(horasAyuno.toFixed(1)));
    setShowAyunoModal(true);
  }, [horasAyuno]);

  const cancelarAyuno = useCallback(() => {
    // Resetear todo a 0
    setAyunoIniciado(null);
    setHorasAyuno(0);
    setShowAyunoModal(false);
    
    // Actualizar en appState
    const currentLog = appState.log[selectedDate] || {};
    const newLog = {
      ...currentLog,
      ayuno_h_iniciado: undefined,
      ayuno_h_completado: 0
    };
    
    updateAppState({
      ...appState,
      log: { ...appState.log, [selectedDate]: newLog }
    });
    
    showToast('❌ Ayuno cancelado');
  }, [selectedDate, appState, updateAppState, showToast]);

  const guardarAyunoManual = useCallback(() => {
    const horas = parseFloat(editingHours);
    
    if (isNaN(horas) || horas < 0 || horas > 48) {
      showToast('⚠️ Ingresa un valor entre 0 y 48 horas');
      return;
    }
    
    setAyunoIniciado(null);
    setHorasAyuno(horas);
    setShowAyunoModal(false);
    
    // Actualizar en appState
    const currentLog = appState.log[selectedDate] || {};
    const newLog = {
      ...currentLog,
      ayuno_h_iniciado: undefined,
      ayuno_h_completado: horas
    };
    
    updateAppState({
      ...appState,
      log: { ...appState.log, [selectedDate]: newLog }
    });
    
    const metaAyuno = appState.metas?.ayuno_h_dia || 14;
    const emoji = horas >= metaAyuno ? '🎉' : '✅';
    showToast(`${emoji} Ayuno registrado: ${horas.toFixed(1)}h`);
  }, [editingHours, selectedDate, appState, updateAppState, showToast]);

  // Nota: el flujo manual ahora se edita desde el botón "Editar" (abrirEditorAyuno)

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

  // Cargar el módulo de alimentos cuando se abre el modal de agregar/editar
  useEffect(() => {
    if ((activeModal === 'add-food' || activeModal === 'edit-food') && !foodApi && !loadingFoodApi) {
      setLoadingFoodApi(true);
      import('../data/foodDatabaseNew')
        .then(mod => setFoodApi(mod))
        .finally(() => setLoadingFoodApi(false));
    }
  }, [activeModal, foodApi, loadingFoodApi]);

  // Cerrar modal con ESC (si hay alimento seleccionado en mobile, primero volver atrás)
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (activeModal === 'add-food' || activeModal === 'edit-food') {
        if (selectedFood) setSelectedFood(null);
        else setActiveModal(null);
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [activeModal, selectedFood]);

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

  // Persist date on manual picker change
  useEffect(() => {
    try { localStorage.setItem('kiloByteSelectedDate', selectedDate); } catch { /* ignore */ }
  }, [selectedDate]);

  // Keyboard shortcuts for date nav: Left/Right arrows and H key for today
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return; // don't steal focus from inputs
      if (e.key === 'ArrowLeft') { e.preventDefault(); shiftDate(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); shiftDate(1); }
      else if (e.key.toLowerCase() === 'h') { e.preventDefault(); goToday(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shiftDate, goToday]);

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

  // Helpers para proyecciones y alertas (una sola versión)
  type MacroTotals = { kcal: number; prot: number; carbs: number; grasa: number };
  const getGoals = () => ({
    kcal: appState.metas?.kcal || 2000,
    prot: appState.metas?.prote_g_dia || 150,
    carbs: appState.metas?.carbs_g_dia || 200,
    grasa: appState.metas?.grasa_g_dia || 65,
  });
  const calcProjectedFromAdd = (add: MacroTotals): MacroTotals => ({
    kcal: dayTotals.kcal + add.kcal,
    prot: dayTotals.prot + add.prot,
    carbs: dayTotals.carbs + add.carbs,
    grasa: dayTotals.grasa + add.grasa,
  });
  const projectedWithUnits = (food: FoodItem, units: number) => {
    if (!foodApi || !(units > 0)) return null;
    const add = foodApi.calculateNutritionFromUnits(food.id, units);
    if (!add) return null;
    return calcProjectedFromAdd(add);
  };
  const projectedWithGrams = (food: FoodItem, grams: number) => {
    if (!foodApi || !(grams > 0)) return null;
    const add = foodApi.calculateNutrition(food.id, grams);
    if (!add) return null;
    return calcProjectedFromAdd(add);
  };
  const exceedsAny = (proj: MacroTotals, goals: MacroTotals) =>
    proj.kcal > goals.kcal || proj.prot > goals.prot || proj.carbs > goals.carbs || proj.grasa > goals.grasa;
  const listExceeded = (proj: MacroTotals, goals: MacroTotals) => {
    const over: string[] = [];
    if (proj.kcal > goals.kcal) over.push('calorías');
    if (proj.prot > goals.prot) over.push('proteínas');
    if (proj.carbs > goals.carbs) over.push('carbos');
    if (proj.grasa > goals.grasa) over.push('grasas');
    return over;
  };

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

  // Editar: abrir modal precargado
  const openEditEntry = (entry: FoodEntry) => {
    setEditingEntry(entry);
    setSelectedMeal(entry.meal);
    setSelectedTime(entry.hora || selectedTime);
    setInputMethod(entry.units ? 'units' : 'grams');
    setCustomUnits(entry.units ? String(entry.units) : '');
    setCustomGrams(!entry.units ? String(entry.grams) : '');
    // Si el módulo ya está, setear el alimento; si no, un efecto abajo lo hará
    if (foodApi) {
      const food = foodApi.foodDatabase.find((f: FoodItem) => f.id === entry.foodId) || null;
      setSelectedFood(food);
    } else {
      setSelectedFood(null);
    }
    setActiveModal('edit-food');
  };

  // Cuando tengamos foodApi disponible durante edición, resolver selectedFood
  useEffect(() => {
    if (activeModal === 'edit-food' && editingEntry && foodApi && !selectedFood) {
      const food = foodApi.foodDatabase.find((f: FoodItem) => f.id === editingEntry.foodId) || null;
      setSelectedFood(food);
    }
  }, [activeModal, editingEntry, foodApi, selectedFood]);

  // Aplicadores genéricos: agregar o actualizar
  const applyUnits = (food: FoodItem, units: number, meal: string) => {
    if (activeModal === 'edit-food' && editingEntry) {
      const nutrition = foodApi?.calculateNutritionFromUnits(food.id, units);
      if (!nutrition) return;
      const newEntries = currentEntries.map(e => e.id === editingEntry.id
        ? {
            ...e,
            grams: nutrition.gramos_totales,
            kcal: nutrition.kcal,
            prot: nutrition.prot,
            carbs: nutrition.carbs,
            grasa: nutrition.grasa,
            units,
            unit_name: food.unidad_base.nombre,
            hora: selectedTime
          }
        : e);
      setCurrentEntries(newEntries);
      saveToAppState(newEntries);
      setActiveModal(null);
      setEditingEntry(null);
      setSelectedFood(null);
      setSearchQuery('');
      setCustomUnits('');
      return;
    }
    // modo agregar
    addFoodByUnits(food, units, meal);
  };

  const applyGrams = (food: FoodItem, grams: number, meal: string) => {
    if (activeModal === 'edit-food' && editingEntry) {
      const nutrition = foodApi?.calculateNutrition(food.id, grams);
      if (!nutrition) return;
      const newEntries = currentEntries.map(e => e.id === editingEntry.id
        ? {
            ...e,
            grams,
            kcal: nutrition.kcal,
            prot: nutrition.prot,
            carbs: nutrition.carbs,
            grasa: nutrition.grasa,
            units: undefined,
            unit_name: undefined,
            hora: selectedTime
          }
        : e);
      setCurrentEntries(newEntries);
      saveToAppState(newEntries);
      setActiveModal(null);
      setEditingEntry(null);
      setSelectedFood(null);
      setSearchQuery('');
      setCustomGrams('');
      return;
    }
    // modo agregar
    addFoodByGrams(food, grams, meal);
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
    console.log('[registro] saveToAppState called with', entries.length, 'entries');
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

    console.log('[registro] About to call updateAppState with log for date:', selectedDate);
    updateAppState({
      ...appState,
      log: newLog
    });
    console.log('[registro] updateAppState called successfully');
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

  

  // Copiar solo una comida (desayuno/almuerzo/merienda/cena/snack) desde día anterior o siguiente
  const copyMealByDelta = (meal: string, delta: number) => {
    const srcDate = parseLocalDate(selectedDate);
    srcDate.setDate(srcDate.getDate() + delta);
    const srcKey = formatLocalDate(srcDate);
    const srcLog = appState.log?.[srcKey];
    if (!srcLog?.comidas) {
      showToast('✖️ No hay datos del día seleccionado');
      return;
    }
  const mealKey = meal as keyof DayLog['comidas'];
  const foods = srcLog.comidas?.[mealKey] as LoggedFood[] | undefined;
    if (!foods || foods.length === 0) {
      showToast('ℹ️ Esa comida no existe en el día elegido');
      return;
    }
    // Reemplazar la comida actual por la copiada, manteniendo el resto igual
    const kept = currentEntries.filter(e => e.meal !== meal);
    const copied: FoodEntry[] = foods.map((food) => ({
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
    }));
    const newEntries = [...kept, ...copied];
    setCurrentEntries(newEntries);
    saveToAppState(newEntries);
    showToast(`${getMealInfo(meal).name} copiado del ${delta < 0 ? 'día anterior' : 'día siguiente'}`);
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

  // Comidas por categoría (definidas antes del render)
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
  } as const;

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
      = mealInfo as unknown as Record<string, { emoji: string; name: string; color: string; time: string }>;
    return info[meal] || { emoji: '🍽️', name: 'Comida', color: '#6C4ED9', time: '' };
  };

  // Copiar día anterior (eliminado en favor de copiar por comida)

  return (
    <div className="registro-pro-final">
      <div className="registro-header-final">
        <div className="date-section">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="wb-btn" title="Día anterior" onClick={() => shiftDate(-1)} aria-label="Día anterior">←</button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input-final"
            />
            <button className="wb-btn" title="Día siguiente" onClick={() => shiftDate(1)} aria-label="Día siguiente">→</button>
            <button className="wb-btn ghost" title="Ir a hoy" onClick={goToday} aria-label="Ir a hoy">Hoy</button>
          </div>
          <div className="date-info">
            <span className="day-name">{parseLocalDate(selectedDate).toLocaleDateString('es-AR', { weekday: 'long' })}</span>
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
              className={`macro-progress macro-${macro.key} ${alertsOn && macro.value > macro.max ? 'over-target' : ''}`}
              aria-live="polite"
              aria-label={`${macro.label} ${Math.round(macro.value)} de ${macro.max}${macro.unit}${macro.value > macro.max ? ' (superado)' : ''}`}
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

        {/* Sección de ayuno intermitente */}
        <div className={`ayuno-section ${horasAyuno >= (appState.metas?.ayuno_h_dia || 14) ? 'meta-achieved' : ''}`}>
          <div className="ayuno-header">
            <span className="ayuno-emoji">⏰</span>
            <span className="ayuno-title">Ayuno Intermitente</span>
            <span className={`ayuno-meta ${horasAyuno >= (appState.metas?.ayuno_h_dia || 14) ? 'meta-achieved' : ''}`}>
              Meta: {appState.metas?.ayuno_h_dia || 14}h
              {horasAyuno >= (appState.metas?.ayuno_h_dia || 14) && ' ✨'}
            </span>
          </div>
          
          <div className="ayuno-controls">
            {!ayunoIniciado && horasAyuno === 0 && (
              // Estado: Sin ayuno
              <div className="ayuno-empty">
                <button 
                  className="ayuno-btn ayuno-start"
                  onClick={iniciarAyuno}
                  aria-label="Comenzar ayuno intermitente"
                >
                  <span>▶️ Comenzar ayuno</span>
                </button>
                <button 
                  className="ayuno-btn ayuno-edit"
                  onClick={abrirEditorAyuno}
                  aria-label="Editar horas de ayuno"
                >
                  <span>✏️ Editar</span>
                </button>
              </div>
            )}
            
            {!ayunoIniciado && horasAyuno > 0 && (
              // Estado: Ayuno completado
              <div className="ayuno-completed-state">
                <div className="ayuno-completed">
                  <span className="ayuno-result">
                    Completado hoy: {horasAyuno.toFixed(1)}h
                    {horasAyuno >= (appState.metas?.ayuno_h_dia || 14) && ' 🎉'}
                  </span>
                </div>
                <div className="ayuno-actions">
                  <button 
                    className="ayuno-btn ayuno-start"
                    onClick={iniciarAyuno}
                    aria-label="Comenzar nuevo ayuno"
                  >
                    <span>▶️ Comenzar ayuno</span>
                  </button>
                  <button 
                    className="ayuno-btn ayuno-edit"
                    onClick={abrirEditorAyuno}
                    aria-label="Editar horas de ayuno"
                  >
                    <span>✏️ Editar</span>
                  </button>
                </div>
              </div>
            )}
            
            {ayunoIniciado && (
              // Estado: Ayuno en curso
              <div className="ayuno-active">
                <div className="ayuno-status">
                  <span className="ayuno-current">
                    En curso: {horasAyuno.toFixed(1)}h
                  </span>
                  <div className="ayuno-progress-bar">
                    <div 
                      className="ayuno-progress-fill"
                      style={{ 
                        width: `${Math.min((horasAyuno / (appState.metas?.ayuno_h_dia || 14)) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className="ayuno-actions">
                  <button 
                    className="ayuno-btn ayuno-stop"
                    onClick={terminarAyuno}
                    aria-label="Terminar ayuno intermitente"
                  >
                    <span>⏹️ Terminar</span>
                  </button>
                  <button 
                    className="ayuno-btn ayuno-edit"
                    onClick={abrirEditorAyuno}
                    aria-label="Editar ayuno en curso"
                  >
                    <span>✏️ Editar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Acciones rápidas removidas por solicitud (copiar día completo y favoritos) */}
      </div>

      {/* Modal para editar ayuno manualmente */}
      {showAyunoModal && (
        <div className="modal-overlay-final" onClick={() => setShowAyunoModal(false)}>
          <div className="modal-content-final ayuno-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-final">
              <h3>✏️ Editar Ayuno</h3>
              <button 
                className="close-btn-final"
                onClick={() => setShowAyunoModal(false)}
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="field-group">
                <label className="field-label">Horas completadas:</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="48"
                    value={editingHours}
                    onChange={(e) => setEditingHours(e.target.value)}
                    placeholder="Ej: 16.5"
                    className="ayuno-input"
                    autoFocus
                  />
                  <span className="field-unit">horas</span>
                </div>
                <p className="field-hint">
                  Ingresa un valor entre 0 y 48 horas. Usa 0 para cancelar el ayuno.
                </p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="ayuno-btn ayuno-cancel"
                onClick={cancelarAyuno}
                aria-label="Cancelar ayuno completamente"
              >
                <span>❌ Cancelar ayuno (0h)</span>
              </button>
              <button 
                className="ayuno-btn ayuno-save"
                onClick={guardarAyunoManual}
                aria-label="Guardar horas de ayuno"
              >
                <span>💾 Guardar</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
                      aria-expanded={openMeal === meal}
                      aria-controls={`meal-${meal}-panel`}
                      onClick={() => setOpenMeal(prev => (prev === meal ? null : meal))}
                    >
                      <span className="chevron">▾</span>
                    </button>
                  </div>
                  {/* Hora oculta en todas las plataformas por solicitud */}
                </div>
                
                <div className="meal-stats">
                  <span className="meal-kcal">
                    {Math.round(entries.reduce((acc, e) => acc + e.kcal, 0))} kcal
                  </span>
                </div>
                
                {/* Acción de repetir solo del día anterior (texto pequeño) */}
                <div className="meal-copy-actions">
                  <button
                    className="meal-copy-link"
                    onClick={() => copyMealByDelta(meal, -1)}
                    aria-label="Repetir del día anterior"
                    title="Repetir del día anterior"
                  >
                    repetir día anterior
                  </button>
                </div>

                <button
                  className="add-food-btn-final"
                  onClick={() => {
                    setSelectedMeal(meal);
                    setOpenMeal(meal);
                    setActiveModal('add-food');
                  }}
                >
                  <span>+</span>
                </button>
              </div>

              {openMeal === meal && (
              <div className="meal-foods-final" id={`meal-${meal}-panel`}>
                {entries.map(entry => (
                  <div key={entry.id} className="food-entry-final">
                    <div className="food-info-final">
                      <span className="food-emoji">{entry.emoji}</span>
                      <div className="food-details-final">
                        <span className="food-name">{entry.nombre}</span>
                        <div className="food-meta">
                          <span className="food-meta-line">
                            {entry.units && entry.unit_name
                              ? `${entry.units} ${entry.unit_name}${entry.units > 1 ? 's' : ''} • ${entry.grams}g`
                              : `${entry.grams}g`}
                            {` • ${Math.round(entry.kcal)} kcal`}
                            {!isMobile && ` • ${Math.round(entry.prot)}g prot`}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="food-actions">
                      <button
                        className="edit-food-btn"
                        onClick={() => openEditEntry(entry)}
                        aria-label="Editar alimento"
                      >
                        ✎
                      </button>
                      <button
                        className="remove-food-btn-final"
                        onClick={() => removeFood(entry.id)}
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

      {/* Modal para agregar/editar comida */}
      {(activeModal === 'add-food' || activeModal === 'edit-food') && (
        <div className="modal-overlay-final" role="dialog" aria-modal="true" aria-labelledby="add-food-title" onClick={() => { setActiveModal(null); setEditingEntry(null); }}>
          <div className={`modal-content-final ${selectedFood ? 'has-selected' : ''} ${isMobile && selectedFood ? 'mobile-portion' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="modal-header-final">
              <div className="modal-title-section">
                <h3 id="add-food-title">{activeModal === 'edit-food' ? 'Editar alimento' : `Agregar a ${getMealInfo(selectedMeal).name}`}</h3>
                {/* En móviles, reemplazar la hora por el selector Unidades/Gramos en el header */}
                {isMobile ? (
                  selectedFood && (
                    <div className="input-method-toggle">
                      <button
                        className={`toggle-btn ${inputMethod === 'units' ? 'active' : ''}`}
                        onClick={() => setInputMethod('units')}
                        aria-pressed={inputMethod === 'units'}
                      >
                        Unidades
                      </button>
                      <button
                        className={`toggle-btn ${inputMethod === 'grams' ? 'active' : ''}`}
                        onClick={() => setInputMethod('grams')}
                        aria-pressed={inputMethod === 'grams'}
                      >
                        Gramos
                      </button>
                    </div>
                  )
                ) : (
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
                )}
              </div>
              <button onClick={() => { setActiveModal(null); setEditingEntry(null); }} className="modal-close-final" aria-label="Cerrar">
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
              {!selectedFood && (
                <>
                  {/* Cargando base de alimentos */}
                  {(!foodApi || loadingFoodApi) && (
                    <div style={{ padding: 16, textAlign: 'center' }}>
                      <Spinner label="Cargando base de alimentos…" />
                    </div>
                  )}
                  {foodApi && !loadingFoodApi && (
                    <>
                      <div className="search-row">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setSearchQuery('');
                          }}
                          placeholder="Buscar alimento…"
                          className="search-input-final"
                          aria-label="Buscar alimento"
                        />
                      </div>
                      <div className="categories-row">
                        {categories.map(cat => (
                          <button
                            key={cat.id}
                            className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                            aria-pressed={selectedCategory === cat.id}
                            title={cat.desc}
                          >
                            <span className="pill-emoji">{cat.emoji}</span>
                            <span className="pill-text">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                      <div className="food-list-final">
                        {getFilteredFoods().map(food => (
                          <button
                            key={food.id}
                            className="food-item-btn"
                            onClick={() => {
                              setSelectedFood(food);
                              setInputMethod('units');
                              setCustomUnits('');
                              setCustomGrams('');
                            }}
                            title={`${Math.round(food.kcal_100g)} kcal/100g, ${Math.round(food.prot_g_100g)}g prot/100g`}
                          >
                            <span className="food-emoji">{food.emoji}</span>
                            <span className="food-name">{food.nombre}</span>
                            <span className="food-meta-small">{Math.round(food.kcal_100g)} kcal/100g</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {selectedFood && !isMobile && (
                <div className="portion-header" ref={portionRef}>
                  <div className="portion-selected">
                    <span className="selected-food-emoji">{selectedFood.emoji}</span>
                    <span className="selected-food-name">{selectedFood.nombre}</span>
                  </div>
                  <div className="portion-toggle">
                    <button
                      className={`toggle-btn ${inputMethod === 'units' ? 'active' : ''}`}
                      onClick={() => setInputMethod('units')}
                      aria-pressed={inputMethod === 'units'}
                    >
                      Unidades
                    </button>
                    <button
                      className={`toggle-btn ${inputMethod === 'grams' ? 'active' : ''}`}
                      onClick={() => setInputMethod('grams')}
                      aria-pressed={inputMethod === 'grams'}
                    >
                      Gramos
                    </button>
                  </div>
                </div>
              )}
            </div>

                {selectedFood && (inputMethod === 'units' ? (
                  <div className="units-input-section">
                    <div className="unit-reference">
                      <span className="unit-info">
                        1 {selectedFood!.unidad_base.nombre} = {selectedFood!.unidad_base.peso_g}g = {selectedFood!.unidad_base.kcal_unidad} kcal
                      </span>
                    </div>

                    <div className="portions-grid-final">
                      {selectedFood!.porciones_comunes.map((portion, idx) => (
                        <button
                          key={idx}
                          className="portion-btn-final units"
                          onClick={() => applyUnits(selectedFood!, portion.cantidad, selectedMeal)}
                        >
                          <span className="portion-name">{portion.nombre}</span>
                          <span className="portion-quantity">{portion.cantidad} {selectedFood!.unidad_base.nombre}{portion.cantidad > 1 ? 's' : ''}</span>
                          <span className="portion-kcal">{Math.round(selectedFood!.unidad_base.kcal_unidad * portion.cantidad)} kcal</span>
                        </button>
                      ))}
                    </div>

                    <div className="custom-units-section">
                      {(() => {
                        const unitsVal = parseFloat(customUnits);
                        if (!selectedFood || !(unitsVal > 0)) return null;
                        const proj = projectedWithUnits(selectedFood, unitsVal);
                        if (!proj || !alertsOn) return null;
                        const over = listExceeded(proj, getGoals());
                        if (over.length === 0) return null;
                        return (
                          <div className="field-alert-msg" role="status" aria-live="polite">
                            Excede objetivo de {over.join(', ')}
                          </div>
                        );
                      })()}
                      <label>Cantidad personalizada:</label>
                      <div className="custom-input-group-final">
                        <input
                          type="number"
                          value={customUnits}
                          onChange={(e) => setCustomUnits(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const units = parseFloat(customUnits);
                              if (units > 0 && selectedFood) applyUnits(selectedFood, units, selectedMeal);
                            }
                          }}
                          className={`custom-input-final ${alertsOn ? (() => {
                            const unitsVal = parseFloat(customUnits);
                            if (!selectedFood || !(unitsVal > 0)) return '';
                            const proj = projectedWithUnits(selectedFood, unitsVal);
                            if (!proj) return '';
                            return exceedsAny(proj, getGoals()) ? 'field-alert' : '';
                          })() : ''}`}
                          aria-invalid={alertsOn ? (() => {
                            const unitsVal = parseFloat(customUnits);
                            if (!selectedFood || !(unitsVal > 0)) return false;
                            const proj = projectedWithUnits(selectedFood, unitsVal);
                            if (!proj) return false;
                            return exceedsAny(proj, getGoals());
                          })() : false}
                          placeholder="p. ej. 1"
                          min="0.1"
                          step="0.5"
                          max="50"
                        />
                        <span className="input-unit">{selectedFood!.unidad_base.nombre}s</span>
                        <button
                          className="add-custom-btn-final"
                          disabled={!(parseFloat(customUnits) > 0)}
                          onClick={() => {
                            const units = parseFloat(customUnits);
                            if (units > 0 && selectedFood) applyUnits(selectedFood, units, selectedMeal);
                          }}
                        >
                          {activeModal === 'edit-food' ? 'Guardar' : 'Agregar'}
                        </button>
                      </div>
                      <div className="custom-nutrition-final">
                        {parseFloat(customUnits) > 0 && selectedFood && (
                          <span>
                            = {Math.round(selectedFood.unidad_base.peso_g * parseFloat(customUnits))}g, {Math.round(selectedFood.unidad_base.kcal_unidad * parseFloat(customUnits))} kcal, {Math.round((selectedFood.prot_g_100g * selectedFood.unidad_base.peso_g * parseFloat(customUnits)) / 100)}g prot
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grams-input-section">
                    <div className="portions-grid-final">
                      {selectedFood!.porciones_comunes.map((portion, idx) => (
                        <button
                          key={idx}
                          className="portion-btn-final grams"
                          onClick={() => applyGrams(selectedFood!, portion.gramos, selectedMeal)}
                        >
                          <span className="portion-name">{portion.nombre}</span>
                          <span className="portion-weight">{portion.gramos}g</span>
                          <span className="portion-kcal">{Math.round((selectedFood!.kcal_100g * portion.gramos) / 100)} kcal</span>
                        </button>
                      ))}
                    </div>

                    <div className="custom-grams-section">
                      {(() => {
                        const gramsVal = parseInt(customGrams);
                        if (!selectedFood || !(gramsVal > 0)) return null;
                        const proj = projectedWithGrams(selectedFood, gramsVal);
                        if (!proj || !alertsOn) return null;
                        const over = listExceeded(proj, getGoals());
                        if (over.length === 0) return null;
                        return (
                          <div className="field-alert-msg" role="status" aria-live="polite">
                            Excede objetivo de {over.join(', ')}
                          </div>
                        );
                      })()}
                      <label>Cantidad en gramos:</label>
                      <div className="custom-input-group-final">
                        <input
                          type="number"
                          value={customGrams}
                          onChange={(e) => setCustomGrams(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const grams = parseInt(customGrams);
                              if (grams > 0 && selectedFood) applyGrams(selectedFood, grams, selectedMeal);
                            }
                          }}
                          className={`custom-input-final ${alertsOn ? (() => {
                            const gramsVal = parseInt(customGrams);
                            if (!selectedFood || !(gramsVal > 0)) return '';
                            const proj = projectedWithGrams(selectedFood, gramsVal);
                            if (!proj) return '';
                            return exceedsAny(proj, getGoals()) ? 'field-alert' : '';
                          })() : ''}`}
                          aria-invalid={alertsOn ? (() => {
                            const gramsVal = parseInt(customGrams);
                            if (!selectedFood || !(gramsVal > 0)) return false;
                            const proj = projectedWithGrams(selectedFood, gramsVal);
                            if (!proj) return false;
                            return exceedsAny(proj, getGoals());
                          })() : false}
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
                            if (grams > 0 && selectedFood) applyGrams(selectedFood, grams, selectedMeal);
                          }}
                        >
                          {activeModal === 'edit-food' ? 'Guardar' : 'Agregar'}
                        </button>
                      </div>
                      <div className="custom-nutrition-final">
                        {parseInt(customGrams) > 0 && selectedFood && (
                          <span>
                            = {Math.round((selectedFood.kcal_100g * parseInt(customGrams)) / 100)} kcal, {Math.round((selectedFood.prot_g_100g * parseInt(customGrams)) / 100)}g prot
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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