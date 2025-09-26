# KiloByte

App local para registrar tu dieta, planes nutricionales y progreso. 100% offline, datos almacenados en localStorage.

## Estado Actual

✅ **Funcional** - La app está lista para usar en modo local.

### Páginas Implementadas

- **Bienvenido** (`/bienvenido`) - Pantalla de entrada con nombre de usuario
- **Inicio** (`/inicio`) - Dashboard con KPIs (calorías, proteínas, agua, pasos) 
- **Plan** (`/plan`) - Creador de planes nutricionales con cálculo automático BMR/TDEE
- **Registro** (`/registro`) - Registro diario por comidas con totales automáticos
- **Perfil** (`/perfil`) - Datos antropométricos, nivel actividad, exportar/importar
- **Calendario** (`/calendario`) - Vista de historial (pendiente gráficos)
- **Progreso** (`/progreso`) - Seguimiento temporal (pendiente gráficos)  
- **Metas** (`/metas`) - Objetivos a largo plazo (pendiente funcionalidad)

### Características

- 🔄 **Persistencia local**: Todos los datos se guardan en localStorage
- 🧮 **Cálculos automáticos**: BMR, TDEE, distribución de macronutrientes
- 📊 **KPI visuales**: Anillos de progreso para métricas clave
- 🌗 **Tema claro/oscuro**: Toggle de tema con persistencia
- 📱 **Responsive**: Funciona en desktop y móvil
- 📄 **Exportar/Importar**: Backup y restauración de datos del perfil

## Desarrollo

```bash
# Instalar dependencias
cd apps/web
npm install

# Modo desarrollo
npm run dev
# http://localhost:3000

# Build de producción  
npm run build
```

## Tecnologías

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Estado**: Zustand para UI, localStorage para datos
- **Componentes**: UI custom (Button, Card, KpiRing)

## Próximos Pasos

- [ ] Integrar shadcn/ui para componentes más pulidos
- [ ] Implementar gráficos en Calendario y Progreso (Recharts)
- [ ] Completar funcionalidad de Metas
- [ ] Mejorar UX con animaciones y transiciones
- [ ] Añadir PWA para instalación offline

---

Basado en las especificaciones de `model.md`. Ver `plan_fases.md` para historial de desarrollo.