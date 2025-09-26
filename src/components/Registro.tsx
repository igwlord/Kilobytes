import React, { useState, useEffect } from 'react';
import './Registro.css';

interface Food {
  id: number;
  name: string;
  unit: string;
  kcal: number;
  prot: number;
}

interface LogEntry {
  food: Food;
  amount: number;
  kcal: number;
  prot: number;
}

interface DayLog {
  meals: {
    Desayuno: LogEntry[];
    Almuerzo: LogEntry[];
    Merienda: LogEntry[];
    Cena: LogEntry[];
  };
  totals: {
    kcal: number;
    prot: number;
  };
}

interface RegistroProps {
  appState: any;
  updateAppState: (newState: any) => void;
  showToast: (message: string) => void;
}

const Registro: React.FC<RegistroProps> = ({ appState, updateAppState, showToast }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayLog, setDayLog] = useState<DayLog>({
    meals: { Desayuno: [], Almuerzo: [], Merienda: [], Cena: [] },
    totals: { kcal: 0, prot: 0 }
  });

  const foodDB: Food[] = [
    { id: 1, name: 'Huevo', unit: 'u', kcal: 70, prot: 6 },
    { id: 2, name: 'Pechuga de pollo', unit: 'g', kcal: 1.2, prot: 0.22 },
    { id: 3, name: 'Arroz integral cocido', unit: 'g', kcal: 1.3, prot: 0.03 },
    { id: 4, name: 'Pan integral', unit: 'rebanada', kcal: 80, prot: 4 },
    { id: 5, name: 'Queso Port Salut light', unit: 'g', kcal: 2.3, prot: 0.2 },
  ];

  useEffect(() => {
    loadDayLog();
  }, [selectedDate, appState.log]);

  const loadDayLog = () => {
    const log = appState.log?.[selectedDate] || {
      meals: { Desayuno: [], Almuerzo: [], Merienda: [], Cena: [] },
      totals: { kcal: 0, prot: 0 }
    };
    setDayLog(log);
  };

  const addFood = (mealName: string) => {
    const foodIdStr = prompt("Ingresá el ID del alimento:\n1: Huevo\n2: Pechuga de pollo\n3: Arroz integral\n4: Pan integral\n5: Queso light");
    const foodId = parseInt(foodIdStr || '0');
    const food = foodDB.find(f => f.id === foodId);
    
    if (!food) {
      alert('ID de alimento no válido.');
      return;
    }

    const amountStr = prompt(`Cantidad de ${food.name} (${food.unit}):`);
    const amount = parseFloat(amountStr || '0');
    
    if (isNaN(amount) || amount <= 0) {
      alert('Cantidad no válida.');
      return;
    }

    const kcal = food.kcal * amount;
    const prot = food.prot * amount;

    const newLogEntry: LogEntry = { food, amount, kcal, prot };
    
    const newLog = { ...dayLog };
    newLog.meals[mealName as keyof typeof newLog.meals].push(newLogEntry);
    newLog.totals.kcal += kcal;
    newLog.totals.prot += prot;

    const newState = {
      ...appState,
      log: {
        ...appState.log,
        [selectedDate]: newLog
      }
    };

    updateAppState(newState);
    setDayLog(newLog);
    showToast(`${food.name} agregado correctamente ✅`);
  };

  const removeFood = (mealName: string, index: number) => {
    const newLog = { ...dayLog };
    const removedItem = newLog.meals[mealName as keyof typeof newLog.meals][index];
    
    newLog.meals[mealName as keyof typeof newLog.meals].splice(index, 1);
    newLog.totals.kcal -= removedItem.kcal;
    newLog.totals.prot -= removedItem.prot;

    const newState = {
      ...appState,
      log: {
        ...appState.log,
        [selectedDate]: newLog
      }
    };

    updateAppState(newState);
    setDayLog(newLog);
    showToast('Alimento eliminado ✅');
  };

  const mealNames = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena'] as const;

  return (
    <div className="registro-container">
      <h1 className="registro-title">Registro Diario</h1>
      <div className="registro-card">
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="registro-date-input"
        />
        
        <div className="registro-meals">
          {mealNames.map((mealName) => (
            <div key={mealName} className="meal-section">
              <h3 className="meal-title">{mealName}</h3>
              <div className="meal-items">
                {dayLog.meals[mealName].length > 0 ? (
                  dayLog.meals[mealName].map((item, index) => (
                    <div key={index} className="meal-item">
                      <span className="item-description">
                        {item.amount}{item.food.unit} {item.food.name} - {Math.round(item.kcal)} kcal
                      </span>
                      <button 
                        onClick={() => removeFood(mealName, index)}
                        className="remove-item-btn"
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-items">No hay nada registrado.</p>
                )}
              </div>
              <button 
                onClick={() => addFood(mealName)}
                className="add-food-btn"
              >
                + Agregar alimento
              </button>
            </div>
          ))}
        </div>

        <div className="registro-summary">
          <p className="total-calories">
            Total del día: <strong>{Math.round(dayLog.totals.kcal)}</strong> kcal
          </p>
          <p className="total-protein">
            Proteínas: <strong>{Math.round(dayLog.totals.prot)}</strong>g
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;