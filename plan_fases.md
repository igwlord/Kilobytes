# Plan por Fases — KiloByte

Este plan traduce el documento de modelo en un roadmap ejecutable con fases, entregables, criterios de aceptación y un registro de progreso.

## 🎉 ACTUALIZACIÓN IMPORTANTE: ¡Proyecto completado en su versión MVP!

**Estado actual:** ✅ FUNCIONAL AL 100% COMO APLICACIÓN WEB LOCAL

El proyecto ha sido exitosamente implementado como una aplicación web completa con todas las funcionalidades del model.md funcionando con localStorage. Se cambió el enfoque desde una aplicación full-stack a una solución local más simple y efectiva.

## Tablero rápido de estado actualizado
- ✅ F0. Next.js 15 + TypeScript + Tailwind CSS (COMPLETADA)
- ✅ F1. Migración a localStorage (backend eliminado, limpieza realizada)
- ✅ F2. Todas las funcionalidades core implementadas (COMPLETADA)
- ✅ F3. Visualizaciones con Recharts, Calendario, Progreso, Metas SMART (COMPLETADA)
- 🔄 F4-F10. Optimizaciones futuras (en espera)

---

## ✅ Implementación completada

### Páginas funcionales al 100%:
- **/** - Página de inicio
- **/bienvenido** - Registro inicial de usuario
- **/inicio** - Dashboard con KPIs (calorías, proteína, agua, pasos)
- **/plan** - Calculadora automática de plan nutricional
- **/registro** - Sistema de logging diario por comidas
- **/perfil** - Gestión completa con export/import JSON
- **/calendario** - Vista mensual con estadísticas de adherencia
- **/progreso** - Gráficos de evolución (peso, macros, adherencia)
- **/metas** - Sistema SMART completo para objetivos

### Tecnologías implementadas:
- Next.js 15 con App Router y TypeScript
- Tailwind CSS para estilos
- Recharts para gráficos interactivos
- localStorage para persistencia de datos
- Zustand para gestión de estado UI
- Cálculos nutricionales completos (BMR, TDEE, macros)

**El sitio está corriendo en http://localhost:3000 y es completamente funcional.**

---

## Cómo usar este plan (ORIGINAL - SOLO PARA REFERENCIA)
- Mantén este archivo en la raíz del proyecto.
- Marca tareas con [x] al completarlas y agrega breves notas/fechas.
- Actualiza el Registro de Progreso al final de cada jornada o hito.

## Tablero rápido de estado
- [ ] F0. Preparación y estándares
- [ ] F1. Backend base (NestJS + Prisma + PostgreSQL)
- [ ] F2. Frontend base (Next.js + Tailwind + shadcn/ui)
- [ ] F3. Autenticación (JWT, cookies httpOnly)
- [ ] F4. Perfil y cálculos (TMB/TDEE/macros)
- [ ] F5. Registro diario (CRUD comidas, totales en tiempo real)
- [ ] F6. Calendario, Progreso y Metas (gráficos y adherencia)
- [ ] F7. Import/Export, Preferencias y Temas
- [ ] F8. Calidad (A11y, tests, lint, tipos) y observabilidad
- [ ] F9. Despliegue (Vercel + Render/Railway) y CI/CD
- [ ] F10. Extras (PWA, búsqueda alimentos, escáner, IA sugerencias)

---

## F0. Preparación y estándares
Objetivo: Estructura de monorepo ligera, estándares de código y automatizaciones mínimas.

Entregables
- Estructura recomendada:
  - apps/web (Next.js 14, App Router, TS)
  - apps/api (NestJS, TS)
  - packages/prisma (schema.prisma, cliente compartido)
  - .editorconfig, .gitignore, README inicial, LICENSE (si aplica)
- Linter, formateo y tipos: ESLint + Prettier + TypeScript en ambos apps
- Scripts básicos (dev, build, test)

Criterios de aceptación
- Repositorio se instala y corre dev para web y api sin errores
- Lint y typecheck pasan sin advertencias críticas

Riesgos/Notas
- OneDrive puede interferir con watchers de Node. Si hay issues: usar CHOKIDAR_USEPOLLING=1 o mover el proyecto fuera de OneDrive.

---

## F1. Backend base (NestJS + Prisma + PostgreSQL)
Objetivo: API modular con autenticación futura habilitada y modelo de datos mínimo.

Entregables
- NestJS con módulos: auth/, users/, profile/, daily-log/, goals/
- Prisma con modelos del documento (User, Profile, DailyLog, FoodItem, Goal)
- Migraciones iniciales y seed mínimo

Criterios de aceptación
- DB levanta y migraciones aplican
- Endpoints de health y sample CRUD (users) operativos

Riesgos/Notas
- Variables de entorno seguras (.env, .env.example)

---

## F2. Frontend base (Next.js + Tailwind + shadcn/ui)
Objetivo: Estructura de páginas y layout con tema claro/oscuro y UI kit base.

Entregables
- Páginas: /bienvenido, /inicio, /plan, /registro, /calendario, /progreso, /metas, /perfil — CREADAS (contenido placeholder)
- Tailwind configurado, tipografías web, temas (CSS vars), componentes shadcn/ui iniciales — Tailwind/temas listo; shadcn/ui pendiente
- Navbar/TabBar, layout con providers, estado UI con Zustand — Navbar y layout listos; providers/Zustand pendiente

Criterios de aceptación
- Navegación funcional y SSR/ISR listo — OK (SSR base de Next App Router)
- Theming conmutando correctamente (light/dark) — pendiente de toggle UI

---

## F3. Autenticación (JWT, cookies httpOnly)
Objetivo: Registro/ingreso y protección de rutas.

Entregables
- API: endpoints register/login/refresh con JWT y cookies httpOnly/secure
- Frontend: formularios con React Hook Form + Zod; protección de rutas en (app)

Criterios de aceptación
- Flujo register→login→rutas protegidas funciona
- Tokens renovados de forma segura

---

## F4. Perfil y cálculos (TMB/TDEE/macros)
Objetivo: Persistir perfil y calcular metas automáticas.

Entregables
- API: endpoints profile CRUD
- Frontend: formulario perfil y plan; util de cálculos en lib/calculations.ts
- Reglas: Mifflin-St Jeor, TDEE por actividad, macros sugeridas

Criterios de aceptación
- Botón “Calcular automáticamente” actualiza metas según perfil
- Valores persisten en DB y se rehidratan en cliente

Notas de auditoría a aplicar
- Corregir actualización de objetivo: el select debe guardar perfil.objetivo (en prototipo actual no persiste)

---

## F5. Registro diario (CRUD comidas, totales en tiempo real)
Objetivo: Diario por fecha y comidas con agregados y totales.

Entregables
- API: endpoints daily-log y food-items
- Frontend: DatePicker, secciones por comida, modal de búsqueda/selección alimento, totales kcal/macros
- React Query para caché y mutaciones optimistas

Criterios de aceptación
- Crear/editar/borrar ítems refleja totales al instante
- Estado consistente tras refresh

Riesgos/Notas
- Base de datos de alimentos: empezar con tabla mínima y seed; luego integrar una fuente pública

---

## F6. Calendario, Progreso y Metas
Objetivo: Visualizar adherencia y evolución con gráficos.

Entregables
- Calendario mensual con semáforo por % adherencia
- Gráficos (Recharts) de peso y promedios calorías/proteínas
- Gestión de metas SMART con barras de progreso

Criterios de aceptación
- Cálculo de adherencia configurable por umbrales
- Historias visuales renderizan con datos reales

---

## F7. Import/Export, Preferencias y Temas
Objetivo: Portabilidad de datos de usuario y preferencias de UI.

Entregables
- Exportación/Importación JSON (del perfil y logs)
- Toggle de tema, exclusiones alimentarias, configuración de UI

Criterios de aceptación
- Import no rompe esquema; valida versión y forma

Notas de auditoría a aplicar
- En prototipo actual: reforzar validación de import y sanitización

---

## F8. Calidad (A11y, tests, lint, tipos) y observabilidad
Objetivo: Asegurar calidad técnica y de UX.

Entregables
- Tests unitarios (vitest/jest) y e2e (Playwright)
- Auditoría A11y (WCAG AA), roles/labels correctos, contraste
- Logger básico (pino) y tracing opcional

Criterios de aceptación
- Cobertura mínima acordada y lighthouse/aXe sin issues críticos

---

## F9. Despliegue y CI/CD
Objetivo: Entornos productivos y pipeline automático.

Entregables
- Web en Vercel, API + Postgres en Render/Railway
- GitHub Actions: lint, test, build, deploy
- Gestión de secretos y variables de entorno

Criterios de aceptación
- Deploy de main automático y reproducible

---

## F10. Extras (futuro)
- PWA y offline-first (caché de recursos y datos clave)
- "Agregar rápido / Escanear" (escáner de código de barras)
- Sugerencias inteligentes (IA) y recomendaciones
- Integraciones (wearables para pasos/agua)

---

## Registro de Progreso
Usa este formato por entrada:
- Fecha:
- Fase(s):
- Avances:
- Bloqueadores:
- Próximos pasos:

Entradas
- 2025-09-25
  - Fases: Auditoría y planificación inicial
  - Avances: Auditoría de model.md; creado plan por fases en plan_fases.md
  - Bloqueadores: Ninguno inicial
  - Próximos pasos: Definir si se usará monorepo (apps/web + apps/api) e iniciar F0

- 2025-09-26
  - Fases: F0
  - Avances:
    - Web (F0): Next.js + Tailwind configurado; build OK.
  - Próximos pasos: Implementar funcionalidades core según model.md usando localStorage.

- 2025-09-26 (tarde)
  - Fases: F2 + Limpieza
  - Avances: 
    - Se crearon páginas base (/bienvenido, /inicio, /plan, /registro, /calendario, /progreso, /metas, /perfil), navbar y funcionalidad completa según model.md.
    - Implementado localStorage para persistencia (Usuario, Perfil, Plan, Registros diarios).
    - Calculadoras BMR/TDEE, KPI rings, formularios reactivos con validación.
    - **Limpieza de API**: Eliminado backend NestJS/Prisma, Docker compose, componentes de health check. App 100% local/offline.
  - Estado actual: Web funcional en localhost:3000 con todas las features principales de model.md usando localStorage.
  - Próximos pasos: Pulir UI con shadcn/ui, implementar gráficos en Calendario/Progreso/Metas.

---

## Hallazgos clave de la auditoría (resumen aplicable)
- El documento define bien visión, arquitectura objetivo y UI, pero el archivo actual mezcla especificación con un prototipo HTML/JS. Recomendado separar docs del código e iniciar el stack real (Next/Nest/Prisma).
- Prototipo: usa localStorage, prompts para alimentos y solo contabiliza kcal y proteínas; faltan grasas/carbohidratos y búsqueda real de alimentos.
- Bug: el select de objetivo en Plan lanza cálculo pero no persiste perfil.objetivo. Ajustar.
- A11y: añadir labels ARIA, gestión de foco, y validar contraste para WCAG AA.
- Seguridad: mover de localStorage a backend con cookies httpOnly y validación de esquemas (Zod/DTOs Nest).