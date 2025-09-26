# Auditoría de `model.md` — KiloByte

Fecha: 2025-09-25

## Resumen ejecutivo
El documento `model.md` combina: (1) una especificación técnica y de producto sólida para una app nutricional full‑stack y (2) un prototipo HTML/JS de una SPA sin backend que demuestra la UI y parte de la lógica. Recomiendo separar documentación de prototipos y avanzar a la arquitectura final (Next.js + NestJS + Prisma) siguiendo el plan por fases.

## Fortalezas
- Visión clara: objetivos, público, principios de UX y estándares A11y.
- Arquitectura propuesta moderna y coherente (Next 14 + NestJS + Prisma + PostgreSQL).
- Diseño UI consistente con variables de tema y tipografías bien definidas.
- Prototipo funcional: flujo de bienvenida, navegación, KPIs y registro diario básico con localStorage.
- Modelo de datos Prisma completo (User, Profile, DailyLog, FoodItem, Goal) y fórmulas de negocio bien especificadas.

## Hallazgos y brechas
1) Mezcla de capas en `model.md`
- La especificación y el prototipo están en el mismo archivo. Dificulta mantenimiento y versionado.

2) Diferencias frente al objetivo full‑stack
- Sin backend ni persistencia robusta; localStorage usado para todo.
- Sin autenticación real (JWT/cookies), ni validación en servidor.
- Gráficos reales (Recharts) y manejo de estado (Zustand/React Query) aún no presentes.

3) Cobertura de datos nutricionales
- En el prototipo, el registro y los KPIs suman kcal y proteínas; faltan grasas y carbohidratos en totales y KPIs.
- No hay balance de macros por día, ni objetivo de agua/pasos editable.

4) A11y y UX
- Faltan roles/aria‑labels en varios controles (botones icónicos, navegación, tabs) y gestión de foco en cambios de sección/modales.
- Contrastes y estados de foco podrían mejorarse para WCAG AA, especialmente en tema oscuro.

5) Export/Import
- Exporta e importa JSON sin versionado de esquema ni validación estricta; riesgo de romper estado.

6) Rendimiento/Robustez
- Ubicación del proyecto en OneDrive puede causar problemas con watchers y locks de archivos en dev.

## Bugs y mejoras concretas en el prototipo
- Objetivo del plan no persiste: al cambiar <select id="objetivo"> se recalculan metas pero no se guarda `perfil.objetivo` en estado.
- Tipo de actividad: `perfil.actividad` es string; `calculateTDEE()` multiplica por string. JS lo coerciona, pero es más seguro usar `parseFloat` al actualizar.
- Mensaje de bienvenida: puede renderizar "Hola, null" si no hay nombre cargado. Proteger con valor por defecto o condicional.
- KPIs parciales: solo kcal y proteínas. Sumar grasas y carbohidratos, y permitir editar objetivos de agua/pasos.
- Importación: faltan validaciones de forma y versión; sanitizar datos antes de guardar en `state`.
- Calendario: umbrales de adherencia están hardcodeados; volverlos configurables.

## Recomendaciones
- Separar archivos: `docs/arquitectura.md` (especificación) y `prototipos/ui_prototipo.html` (si se conserva). Mantener `model.md` solo para especificación o deprecarlo en favor de `docs/*`.
- Adoptar el stack propuesto con monorepo ligero (apps/web, apps/api, packages/prisma) e iniciar migración por fases.
- Añadir validación de entrada con Zod (frontend) y DTOs + class‑validator (backend) en NestJS.
- A11y: roles/aria, navegación por teclado, gestión de foco, y contrastes revisados con aXe/Lighthouse.
- Export/Import: incluir `schemaVersion`, validar y migrar si es necesario.

## Quick wins (bajo esfuerzo, alto impacto)
- Persistir `perfil.objetivo` al cambiar el select y parsear `actividad` como número.
- Mensaje de bienvenida: mostrar saludo condicional y placeholder cuando `nombre` no esté definido.
- Agregar grasas/carbs al cálculo y a la UI de totales del día.
- Añadir `schemaVersion` al estado exportado y validar en import.
- Aumentar ARIA en navegación/tab bar y botones con iconos.

## Riesgos
- Persistencia en localStorage no es confiable, sin cifrado ni control de integridad.
- OneDrive puede causar problemas de performance y archivos bloqueados en desarrollo.
- Falta de validación de datos puede llevar a estados inconsistentes.

## Siguientes pasos propuestos
- Adoptar el "Plan por Fases" (`plan_fases.md`) y comenzar por F0/F1.
- Decidir monorepo vs repos separados. Recomendado monorepo para compartir tipos y prisma.
- Configurar CI simple (lint/typecheck) desde el inicio.

## Anexos útiles
- Fórmulas de negocio: Mifflin‑St Jeor, TDEE y reparto de macros ya presentes en el documento y referenciadas en el plan.
- Esquema Prisma de referencia incluido en `model.md` para implementar en F1.
