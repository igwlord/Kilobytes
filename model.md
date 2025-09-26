<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KiloByte - Tu Guía Nutricional</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Roboto:wght@400;500&family=Inter:wght@400;500;600&family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet">
    
    <style>
        /* Definición de temas y tipografías */
        :root {
            --font-title: 'Poppins', 'Inter', sans-serif;
            --font-body: 'Roboto', 'Inter', sans-serif;
            --font-mono: 'Source Code Pro', monospace;
        }

        /* Tema Claro (por defecto) */
        .light {
            --bg-primary: #FFF7F2;
            --bg-secondary: #FFFFFF;
            --color-primary: #FFC7A6;
            --color-secondary: #BFE8C6;
            --color-accent: #E6A5D8;
            --text-primary: #2A2A2A;
            --text-secondary: #5f5f5f;
            --border-color: #e0e0e0;
            --btn-active-bg: #f0f0f0;
        }

        /* Tema Oscuro */
        .dark {
            --bg-primary: #0B0A1A;
            --bg-secondary: #0B1E3A;
            --color-primary: #6C4ED9;
            --color-secondary: #D4AF37; /* Dorado */
            --color-accent: #1e293b;
            --text-primary: #F2F2F2;
            --text-secondary: #a0a0a0;
            --border-color: #2a3a5a;
            --btn-active-bg: #2a3a5a;
        }
        
        body {
            font-family: var(--font-body);
            background-color: var(--bg-primary);
            color: var(--text-primary);
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        h1, h2, h3 { font-family: var(--font-title); }
        .font-mono { font-family: var(--font-mono); }
        
        .card {
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 1.25rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
        }
        .dark .card {
             box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 1rem;
            font-weight: 600;
            transition: all 0.2s ease;
            cursor: pointer;
            text-align: center;
        }
        .btn-primary {
            background-color: var(--color-primary);
            color: #0B0A1A;
        }
        .dark .btn-primary {
             color: var(--text-primary);
        }
        .btn-primary:hover {
            opacity: 0.9;
            transform: translateY(-2px);
        }
        .btn-ghost {
            background-color: transparent;
            border: 2px solid var(--color-primary);
            color: var(--color-primary);
        }

        .tab-bar {
            position: fixed; bottom: 0; left: 0; right: 0;
            height: 60px; background-color: var(--bg-secondary);
            border-top: 1px solid var(--border-color);
            box-shadow: 0 -2px 10px rgba(0,0,0,0.05); z-index: 50;
        }
        .tab-bar-item.active svg { color: var(--color-primary); }
        .dark .tab-bar { box-shadow: 0 -2px 10px rgba(0,0,0,0.2); }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        main > section { display: none; }
        main > section.active { display: block; }
        
        .typewriter-input {
            font-family: var(--font-mono);
            caret-color: var(--color-secondary);
            border-bottom: 2px solid var(--border-color);
        }
        .typewriter-input:focus {
            border-bottom-color: var(--color-secondary);
            outline: none;
        }
        
        .tooltip { position: relative; display: inline-block; }
        .tooltip .tooltip-text {
            visibility: hidden; width: 220px; background-color: var(--bg-secondary);
            color: var(--text-primary); text-align: center; border-radius: 6px;
            padding: 5px; position: absolute; z-index: 1; bottom: 125%;
            left: 50%; margin-left: -110px; opacity: 0; transition: opacity 0.3s;
            border: 1px solid var(--border-color); font-family: var(--font-body);
        }
        .tooltip:hover .tooltip-text { visibility: visible; opacity: 1; }

        .toast {
            position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem;
            border-radius: 0.75rem; background-color: var(--bg-secondary);
            color: var(--text-primary); border: 1px solid var(--border-color);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 100;
            animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }

        .theme-toggle button.active { background-color: var(--btn-active-bg); }

        /* --- Keyframes para Animaciones de Bienvenida --- */
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }

        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: var(--color-secondary); }
        }

        @keyframes gradient-bg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* --- Mejoras Visuales Pantalla de Bienvenida --- */
        #welcome-screen {
            background: linear-gradient(-45deg, #0B0A1A, #0B1E3A, #6C4ED9, #0B0A1A);
            background-size: 400% 400%;
            animation: gradient-bg 15s ease infinite;
        }

        #welcome-screen .welcome-title {
            color: var(--color-secondary); /* Dorado */
            text-shadow: 0 0 10px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3);
            overflow: hidden;
            border-right: .15em solid var(--color-secondary);
            white-space: nowrap;
            letter-spacing: .1em; 
            animation: 
              typing 2s steps(8, end),
              blink-caret .75s step-end infinite;
        }

        /* Staggered fade-in para otros elementos */
        .welcome-subtitle, 
        .welcome-input-container, 
        .welcome-button {
            opacity: 0; /* Empiezan invisibles */
            animation: fadeInUp 1s forwards; /* 'forwards' mantiene el estado final */
        }

        .welcome-subtitle { animation-delay: 2.2s; }
        .welcome-input-container { animation-delay: 2.4s; }
        .welcome-button { animation-delay: 2.6s; }
    </style>
</head>
<body class="antialiased">

    <!-- === PANTALLA DE BIENVENIDA === -->
    <div id="welcome-screen" class="dark min-h-screen w-full flex flex-col items-center justify-center p-4">
        <div class="text-center w-full max-w-md">
            <h1 class="text-6xl font-bold font-mono inline-block welcome-title">KiloByte</h1>
            <p class="text-lg text-gray-300 mt-2 mb-12 welcome-subtitle">Tu guía de nutrición inteligente.</p>
            <div class="relative mb-4 welcome-input-container">
                 <div class="absolute -top-8 right-0 tooltip">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400 cursor-pointer"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    <span class="tooltip-text">Usaremos tu nombre para personalizar tu experiencia en la app.</span>
                </div>
                <input type="text" id="username-input" placeholder="Escribí tu nombre..." class="w-full bg-transparent text-2xl text-center typewriter-input p-2 text-white focus:outline-none">
            </div>
            <p id="username-error" class="text-red-500 h-6 text-sm"></p>
            <button id="enter-app-btn" class="btn btn-primary w-full mt-6 welcome-button" style="background-color: var(--color-primary); color: #F2F2F2;">Entrar</button>
        </div>
    </div>

    <!-- === CONTENEDOR PRINCIPAL DE LA APP === -->
    <div id="app-container" class="hidden">
        
        <header class="hidden md:flex bg-[var(--bg-secondary)] shadow-sm sticky top-0 z-40">
            <nav class="container mx-auto px-6 py-3 flex justify-between items-center">
                <div class="font-title font-bold text-2xl" style="color: var(--color-primary);">KiloByte</div>
                <div id="desktop-nav" class="flex space-x-6 items-center">
                    <a href="#inicio" class="nav-link">Inicio</a>
                    <a href="#plan" class="nav-link">Plan</a>
                    <a href="#registro" class="nav-link">Registro</a>
                    <a href="#calendario" class="nav-link">Calendario</a>
                    <a href="#progreso" class="nav-link">Progreso</a>
                    <a href="#metas" class="nav-link">Metas</a>
                    <a href="#perfil" class="nav-link">Perfil</a>
                </div>
            </nav>
        </header>

        <main class="container mx-auto p-4 md:p-6 pb-20 md:pb-6">
            
            <section id="inicio">
                <h1 id="welcome-message" class="text-3xl font-bold mb-1"></h1>
                <p class="text-[var(--text-secondary)] mb-6">Ajustá porciones según tus datos y seguí tu progreso día a día.</p>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="card p-4 text-center">
                        <h3 class="font-semibold text-lg">Calorías</h3>
                        <div class="relative w-24 h-24 mx-auto my-2">
                             <svg class="w-full h-full" viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border-color)" stroke-width="3"></path><path id="kpi-kcal-circle" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-primary)" stroke-width="3" stroke-dasharray="0, 100" stroke-linecap="round"></path></svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span id="kpi-kcal" class="text-xl font-bold">0</span>
                                <span id="kpi-kcal-total" class="text-xs text-[var(--text-secondary)]">/ 1500</span>
                            </div>
                        </div>
                    </div>
                    <div class="card p-4 text-center">
                        <h3 class="font-semibold text-lg">Proteínas</h3>
                         <div class="relative w-24 h-24 mx-auto my-2">
                             <svg class="w-full h-full" viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border-color)" stroke-width="3"></path><path id="kpi-prot-circle" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-secondary)" stroke-width="3" stroke-dasharray="0, 100" stroke-linecap="round"></path></svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span id="kpi-prot" class="text-xl font-bold">0g</span>
                                <span id="kpi-prot-total" class="text-xs text-[var(--text-secondary)]">/ 110g</span>
                            </div>
                        </div>
                    </div>
                    <div class="card p-4 text-center">
                        <h3 class="font-semibold text-lg">Agua</h3>
                        <div class="relative w-24 h-24 mx-auto my-2">
                             <svg class="w-full h-full" viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border-color)" stroke-width="3"></path><path id="kpi-agua-circle" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-accent)" stroke-width="3" stroke-dasharray="75, 100" stroke-linecap="round"></path></svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span id="kpi-agua" class="text-xl font-bold">1.5L</span>
                                <span id="kpi-agua-total" class="text-xs text-[var(--text-secondary)]">/ 2.0L</span>
                            </div>
                        </div>
                    </div>
                    <div class="card p-4 text-center">
                        <h3 class="font-semibold text-lg">Pasos</h3>
                        <div class="relative w-24 h-24 mx-auto my-2">
                             <svg class="w-full h-full" viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border-color)" stroke-width="3"></path><path id="kpi-pasos-circle" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-secondary)" stroke-width="3" stroke-dasharray="65, 100" stroke-linecap="round" style="--tw-shadow: 0 0 15px var(--color-secondary); filter: drop-shadow(var(--tw-shadow));"></path></svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span id="kpi-pasos" class="text-xl font-bold">3900</span>
                                <span id="kpi-pasos-total" class="text-xs text-[var(--text-secondary)]">/ 6000</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button id="btn-go-to-register" class="btn btn-primary">Registrar Comida</button>
                    <button id="btn-quick-add" class="btn btn-ghost">Agregar Rápido / Escanear</button>
                </div>
            </section>
            
            <section id="plan">
                <h1 class="text-3xl font-bold mb-6">Mi Plan Nutricional</h1>
                <div class="card p-6 space-y-6">
                    <div>
                        <label for="objetivo" class="block font-medium mb-2">Mi objetivo principal</label>
                        <select id="objetivo" class="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]">
                            <option value="bajar">Bajar peso</option>
                            <option value="mantener">Mantener peso</option>
                            <option value="subir">Subir peso</option>
                        </select>
                    </div>
                    <div>
                        <h3 class="font-semibold text-lg mb-2">Objetivos diarios</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div><label for="kcal-objetivo" class="text-sm">Calorías (kcal)</label><input type="number" id="kcal-objetivo" value="1500" class="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] mt-1"></div>
                            <div><label for="prote-objetivo" class="text-sm">Proteínas (g)</label><input type="number" id="prote-objetivo" value="110" class="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] mt-1"></div>
                            <div><label for="grasa-objetivo" class="text-sm">Grasas (g)</label><input type="number" id="grasa-objetivo" value="50" class="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] mt-1"></div>
                            <div><label for="carbs-objetivo" class="text-sm">Carbs (g)</label><input type="number" id="carbs-objetivo" value="150" class="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] mt-1"></div>
                        </div>
                         <button id="calculate-macros-btn" class="text-sm mt-2" style="color: var(--color-primary);">Calcular automáticamente</button>
                    </div>
                    <div>
                        <h3 class="font-semibold text-lg mb-2">Exclusiones alimentarias</h3>
                        <div id="exclusions-container" class="flex flex-wrap gap-3">
                            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded" data-exclusion="pescado"><span>Sin pescado</span></label>
                            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded" data-exclusion="yogur"><span>Sin yogur</span></label>
                            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded" data-exclusion="tacc"><span>Sin TACC</span></label>
                            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded" data-exclusion="vegetariano"><span>Vegetariano</span></label>
                        </div>
                    </div>
                    <button id="btn-apply-plan" class="btn btn-primary w-full mt-4">Aplicar a la semana</button>
                </div>
            </section>
            
            <section id="registro">
                <h1 class="text-3xl font-bold mb-6">Registro Diario</h1>
                <div class="card p-6">
                    <input type="date" id="log-date" class="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] mb-6">
                    <div id="daily-log-container" class="space-y-6"></div>
                    <div class="mt-8 pt-4 border-t border-[var(--border-color)] text-center">
                        <p class="font-bold text-lg">Total del día: <span id="log-total-kcal">0</span> kcal</p>
                    </div>
                </div>
            </section>
            
            <section id="calendario">
                 <h1 class="text-3xl font-bold mb-6">Calendario de Adherencia</h1>
                 <div class="card p-6">
                    <div class="flex justify-between items-center mb-4">
                        <button id="prev-month-btn">&lt;</button>
                        <h2 id="month-year-label" class="text-xl font-semibold"></h2>
                        <button id="next-month-btn">&gt;</button>
                    </div>
                    <div class="grid grid-cols-7 text-center text-xs text-[var(--text-secondary)] mb-2">
                        <span>DO</span><span>LU</span><span>MA</span><span>MI</span><span>JU</span><span>VI</span><span>SA</span>
                    </div>
                     <div id="calendar-grid" class="grid grid-cols-7 gap-2 text-center"></div>
                 </div>
            </section>
            
            <section id="progreso">
                <h1 class="text-3xl font-bold mb-6">Mi Progreso</h1>
                <div class="card p-6 mb-6">
                    <h2 class="font-semibold text-xl mb-4">Peso Corporal (kg)</h2>
                    <div class="h-60 bg-[var(--bg-primary)] rounded-xl p-4">
                        <svg width="100%" height="100%" viewBox="0 0 300 150"><line x1="10" y1="140" x2="290" y2="140" stroke="var(--border-color)" stroke-width="1"/><line x1="10" y1="10" x2="10" y2="140" stroke="var(--border-color)" stroke-width="1"/><polyline points="20,100 80,80 140,90 200,60 260,50" fill="none" stroke="var(--color-primary)" stroke-width="2"/><circle cx="260" cy="50" r="3" fill="var(--color-primary)"/></svg>
                    </div>
                </div>
            </section>
            
            <section id="metas">
                 <h1 class="text-3xl font-bold mb-6">Mis Metas</h1>
                 <div class="space-y-4">
                     <div class="card p-6">
                        <h2 class="font-semibold text-lg">Bajar a <span id="goal-weight-label">58</span> kg</h2>
                        <div class="w-full bg-[var(--color-accent)] rounded-full h-2.5 mt-2"><div id="goal-weight-bar" class="bg-[var(--color-primary)] h-2.5 rounded-full" style="width: 45%"></div></div>
                        <p id="goal-weight-percent" class="text-sm text-right mt-1">45%</p>
                     </div>
                 </div>
            </section>
            
            <section id="perfil">
                 <h1 class="text-3xl font-bold mb-6">Mi Perfil</h1>
                 <div class="card p-6 space-y-4">
                     <div class="grid md:grid-cols-2 gap-4">
                         <div><label for="peso" class="text-sm">Peso (kg)</label><input id="peso" type="number" class="w-full mt-1 p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]"></div>
                         <div><label for="altura" class="text-sm">Altura (cm)</label><input id="altura" type="number" class="w-full mt-1 p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]"></div>
                         <div><label for="edad" class="text-sm">Edad</label><input id="edad" type="number" class="w-full mt-1 p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]"></div>
                         <div>
                            <label for="genero" class="text-sm">Género</label>
                            <select id="genero" class="w-full mt-1 p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]"><option value="masculino">Masculino</option><option value="femenino">Femenino</option></select>
                        </div>
                     </div>
                     <div>
                        <label for="actividad" class="text-sm">Nivel de actividad</label>
                        <select id="actividad" class="w-full mt-1 p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]"><option value="1.2">Sedentario</option><option value="1.375">Ligero</option><option value="1.55">Moderado</option><option value="1.725">Alto</option></select>
                     </div>
                     <div class="pt-4 border-t border-[var(--border-color)]">
                         <h3 class="font-semibold mb-2">Preferencias</h3>
                         <div class="flex justify-between items-center">
                             <span>Tema de la App</span>
                             <div class="theme-toggle flex items-center space-x-2 rounded-full p-1 bg-[var(--bg-primary)] border border-[var(--border-color)]">
                                 <button id="theme-light" class="p-1.5 rounded-full">☀️</button>
                                 <button id="theme-dark" class="p-1.5 rounded-full">🌙</button>
                             </div>
                         </div>
                     </div>
                     <div class="pt-4 border-t border-[var(--border-color)]">
                         <h3 class="font-semibold mb-2">Gestión de Datos</h3>
                         <div class="flex space-x-2">
                            <button id="export-btn" class="btn btn-ghost text-sm flex-1">Exportar JSON</button>
                            <button id="import-btn" class="btn btn-ghost text-sm flex-1">Importar JSON</button>
                            <input type="file" id="import-file" class="hidden" accept=".json">
                         </div>
                     </div>
                 </div>
            </section>
            
        </main>
        
        <footer class="md:hidden tab-bar flex justify-around items-center">
            <a href="#inicio" class="tab-bar-item active flex flex-col items-center text-xs space-y-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>Inicio</span></a>
            <a href="#plan" class="tab-bar-item flex flex-col items-center text-xs space-y-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg><span>Plan</span></a>
            <a href="#registro" class="tab-bar-item flex flex-col items-center text-xs space-y-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg><span>Registro</span></a>
            <a href="#progreso" class="tab-bar-item flex flex-col items-center text-xs space-y-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg><span>Progreso</span></a>
            <a href="#perfil" class="tab-bar-item flex flex-col items-center text-xs space-y-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Perfil</span></a>
        </footer>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const app = {
            state: {},
            currentDate: new Date(),
            foodDB: [
                { id: 1, name: 'Huevo', unit: 'u', kcal: 70, prot: 6 },
                { id: 2, name: 'Pechuga de pollo', unit: 'g', kcal: 1.2, prot: 0.22 },
                { id: 3, name: 'Arroz integral cocido', unit: 'g', kcal: 1.3, prot: 0.03 },
                { id: 4, name: 'Pan integral', unit: 'rebanada', kcal: 80, prot: 4 },
                { id: 5, name: 'Queso Port Salut light', unit: 'g', kcal: 2.3, prot: 0.2 },
            ],

            init() {
                this.loadState();
                this.bindEvents();
                this.checkLogin();
            },
            
            checkLogin() {
                if (this.state.perfil && this.state.perfil.nombre) {
                    this.showApp();
                } else {
                    this.showWelcome();
                }
            },
            
            showWelcome() {
                document.getElementById('welcome-screen').classList.remove('hidden');
                document.getElementById('app-container').classList.add('hidden');
            },

            showApp() {
                document.getElementById('welcome-screen').classList.add('hidden');
                document.getElementById('app-container').classList.remove('hidden');
                this.renderAll();
                this.navigateTo(window.location.hash || '#inicio');
            },
            
            bindEvents() {
                document.getElementById('enter-app-btn').addEventListener('click', () => {
                    const username = document.getElementById('username-input').value.trim();
                    if (username) {
                        document.getElementById('username-error').textContent = '';
                        this.state.perfil.nombre = username;
                        this.saveState();
                        this.showApp();
                    } else {
                        document.getElementById('username-error').textContent = 'Por favor, ingresá un nombre.';
                    }
                });

                document.querySelectorAll('.nav-link, .tab-bar-item').forEach(link => {
                    link.addEventListener('click', (e) => { e.preventDefault(); this.navigateTo(link.getAttribute('href')); });
                });
                
                document.getElementById('theme-light').addEventListener('click', () => this.setTheme('light'));
                document.getElementById('theme-dark').addEventListener('click', () => this.setTheme('dark'));

                document.getElementById('perfil').addEventListener('input', e => this.updateProfile(e.target.id, e.target.value));

                document.getElementById('calculate-macros-btn').addEventListener('click', () => this.calculateAndSetMacros());
                document.getElementById('objetivo').addEventListener('change', () => this.calculateAndSetMacros());
                document.getElementById('exclusions-container').addEventListener('change', e => this.updateExclusions(e.target.dataset.exclusion, e.target.checked));
                document.querySelectorAll('#plan input').forEach(input => input.addEventListener('change', e => this.updateMacrosManually(e.target.id, e.target.value)));
                document.getElementById('btn-apply-plan').addEventListener('click', () => this.showToast('Plan guardado y aplicado ✨'));

                const logDateInput = document.getElementById('log-date');
                logDateInput.value = new Date().toISOString().split('T')[0];
                logDateInput.addEventListener('change', () => this.renderDailyLog());

                document.getElementById('daily-log-container').addEventListener('click', e => {
                    if (e.target.classList.contains('btn-add-food')) {
                        const { datekey, mealname } = e.target.dataset;
                        this.addFood(datekey, mealname);
                    }
                });

                document.getElementById('prev-month-btn').addEventListener('click', () => { this.currentDate.setMonth(this.currentDate.getMonth() - 1); this.renderCalendar(); });
                document.getElementById('next-month-btn').addEventListener('click', () => { this.currentDate.setMonth(this.currentDate.getMonth() + 1); this.renderCalendar(); });

                document.getElementById('export-btn').addEventListener('click', () => this.exportData());
                document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file').click());
                document.getElementById('import-file').addEventListener('change', e => this.importData(e));
                
                document.getElementById('btn-go-to-register').addEventListener('click', () => this.navigateTo('#registro'));
                document.getElementById('btn-quick-add').addEventListener('click', () => this.showToast('Función no implementada aún ✨'));
            },
            
            navigateTo(id) {
                document.querySelectorAll('main > section').forEach(s => s.classList.remove('active'));
                const targetSection = document.querySelector(id);
                if (targetSection) targetSection.classList.add('active');
                else document.querySelector('#inicio').classList.add('active');
                
                document.querySelectorAll('.nav-link, .tab-bar-item').forEach(l => {
                    const linkMatches = l.getAttribute('href') === id;
                    l.classList.toggle('active', linkMatches);
                    if (linkMatches) {
                        l.style.color = document.body.classList.contains('dark') ? 'var(--color-secondary)' : 'var(--color-primary)';
                    } else {
                        l.style.color = '';
                    }
                });
                if(id === '#calendario') this.renderCalendar();
            },

            loadState() {
                const savedState = localStorage.getItem('kiloByteData');
                if (savedState) {
                    this.state = JSON.parse(savedState);
                } else {
                    this.state = {
                        perfil: { nombre: null, peso: 70, altura_cm: 175, edad: 30, genero: "masculino", actividad: "1.375", exclusiones: [], objetivo: "mantener", theme: 'dark' },
                        metas: { peso_objetivo: 65, kcal: 2000, prote_g_dia: 140, grasa_g_dia: 60, carbs_g_dia: 225, agua_ml: 2000, pasos_dia: 8000 },
                        log: {}
                    };
                }
            },

            saveState() {
                localStorage.setItem('kiloByteData', JSON.stringify(this.state));
            },

            renderAll() {
                this.applyTheme();
                this.renderProfile();
                this.renderPlan();
                this.renderDailyLog();
                this.renderKPIs();
                this.renderGoals();
            },
            
            setTheme(theme) {
                this.state.perfil.theme = theme;
                this.applyTheme();
                this.saveState();
            },
            
            applyTheme() {
                document.body.classList.toggle('dark', this.state.perfil.theme === 'dark');
                document.body.classList.toggle('light', this.state.perfil.theme !== 'dark');
                document.getElementById('theme-dark').classList.toggle('active', this.state.perfil.theme === 'dark');
                document.getElementById('theme-light').classList.toggle('active', this.state.perfil.theme !== 'dark');
                this.navigateTo(document.querySelector('.nav-link.active')?.getAttribute('href') || '#inicio');
            },

            updateProfile(key, value) {
                this.state.perfil[key] = isNaN(parseFloat(value)) ? value : parseFloat(value);
                this.saveState();
                this.calculateAndSetMacros();
                this.renderGoals();
            },

            renderProfile() {
                const { peso, altura_cm, edad, genero, actividad } = this.state.perfil;
                document.getElementById('peso').value = peso;
                document.getElementById('altura').value = altura_cm;
                document.getElementById('edad').value = edad;
                document.getElementById('genero').value = genero;
                document.getElementById('actividad').value = actividad;
                document.getElementById('welcome-message').textContent = `¡Hola, ${this.state.perfil.nombre}!`;
            },
            
            renderPlan() {
                const { kcal, prote_g_dia, grasa_g_dia, carbs_g_dia } = this.state.metas;
                document.getElementById('kcal-objetivo').value = Math.round(kcal);
                document.getElementById('prote-objetivo').value = Math.round(prote_g_dia);
                document.getElementById('grasa-objetivo').value = Math.round(grasa_g_dia);
                document.getElementById('carbs-objetivo').value = Math.round(carbs_g_dia);
                document.getElementById('objetivo').value = this.state.perfil.objetivo;
                document.querySelectorAll('#exclusions-container input').forEach(cb => {
                    cb.checked = this.state.perfil.exclusiones.includes(cb.dataset.exclusion);
                });
            },

            renderDailyLog() {
                const dateKey = document.getElementById('log-date').value;
                const log = this.state.log[dateKey] || { meals: { Desayuno: [], Almuerzo: [], Merienda: [], Cena: [] }, totals: { kcal: 0, prot: 0 } };
                const container = document.getElementById('daily-log-container');
                container.innerHTML = '';

                Object.entries(log.meals).forEach(([mealName, items]) => {
                    const mealHtml = `
                        <div>
                            <h3 class="font-semibold text-lg border-b border-[var(--border-color)] pb-2 mb-3">${mealName}</h3>
                            <div class="space-y-2 text-sm">
                                ${items.map(item => `<p>${item.amount}${item.food.unit} ${item.food.name} - ${Math.round(item.kcal)} kcal</p>`).join('') || '<p class="text-[var(--text-secondary)]">No hay nada registrado.</p>'}
                            </div>
                            <button class="btn-add-food text-sm mt-3" style="color: var(--color-primary);" data-datekey="${dateKey}" data-mealname="${mealName}">+ Agregar alimento</button>
                        </div>`;
                    container.innerHTML += mealHtml;
                });
                document.getElementById('log-total-kcal').textContent = Math.round(log.totals.kcal);
                this.renderKPIs();
            },

            renderKPIs() {
                const dateKey = new Date().toISOString().split('T')[0];
                const log = this.state.log[dateKey] || { totals: { kcal: 0, prot: 0 } };
                const metas = this.state.metas;

                document.getElementById('kpi-kcal').textContent = Math.round(log.totals.kcal);
                document.getElementById('kpi-kcal-total').textContent = `/ ${Math.round(metas.kcal)}`;
                this.updateKpiCircle('kpi-kcal-circle', log.totals.kcal, metas.kcal);

                document.getElementById('kpi-prot').textContent = `${Math.round(log.totals.prot)}g`;
                document.getElementById('kpi-prot-total').textContent = `/ ${Math.round(metas.prote_g_dia)}g`;
                this.updateKpiCircle('kpi-prot-circle', log.totals.prot, metas.prote_g_dia);
            },

            updateKpiCircle(id, value, total) {
                const circle = document.getElementById(id);
                if (circle) {
                    const percentage = total > 0 ? (value / total) * 100 : 0;
                    circle.style.strokeDasharray = `${Math.min(percentage, 100)}, 100`;
                }
            },

            renderCalendar() {
                const grid = document.getElementById('calendar-grid');
                grid.innerHTML = '';
                const year = this.currentDate.getFullYear();
                const month = this.currentDate.getMonth();
                document.getElementById('month-year-label').textContent = `${this.currentDate.toLocaleString('es-AR', { month: 'long' })} ${year}`.replace(/^\w/, c => c.toUpperCase());

                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                for (let i = 0; i < firstDay; i++) grid.innerHTML += '<div></div>';
                
                for (let day = 1; day <= daysInMonth; day++) {
                    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const log = this.state.log[dateKey];
                    let colorClass = '';
                    if (log && log.totals.kcal > 0) {
                        const adherence = (log.totals.kcal / this.state.metas.kcal) * 100;
                        if (adherence >= 90 && adherence <= 110) colorClass = 'bg-green-200 text-green-800';
                        else if (adherence >= 70 && adherence < 120) colorClass = 'bg-yellow-200 text-yellow-800';
                        else colorClass = 'bg-red-200 text-red-800';
                    }
                    grid.innerHTML += `<div class="p-2 rounded-full ${colorClass}">${day}</div>`;
                }
            },
            
            renderGoals() {
                const { peso } = this.state.perfil;
                const { peso_objetivo } = this.state.metas;
                const peso_inicial = this.state.perfil.peso_inicial || peso;
                document.getElementById('goal-weight-label').textContent = peso_objetivo;

                const progress = Math.max(0, (peso_inicial - peso) / (peso_inicial - peso_objetivo)) * 100;
                document.getElementById('goal-weight-bar').style.width = `${Math.min(progress, 100)}%`;
                document.getElementById('goal-weight-percent').textContent = `${Math.round(progress)}%`;
            },

            calculateTMB() {
                const p = this.state.perfil;
                if(p.genero === 'masculino') return 10 * p.peso + 6.25 * p.altura_cm - 5 * p.edad + 5;
                return 10 * p.peso + 6.25 * p.altura_cm - 5 * p.edad - 161;
            },
            
            calculateTDEE() { return this.calculateTMB() * this.state.perfil.actividad; },
            
            calculateAndSetMacros() {
                const tdee = this.calculateTDEE();
                let kcal = tdee;
                if (this.state.perfil.objetivo === 'bajar') kcal -= 450;
                if (this.state.perfil.objetivo === 'subir') kcal += 300;

                const prote_g = this.state.perfil.peso * 1.8;
                const grasa_g = this.state.perfil.peso * 0.9;
                const carbs_g = (kcal - (prote_g * 4) - (grasa_g * 9)) / 4;
                
                this.state.metas = { ...this.state.metas, kcal, prote_g_dia: prote_g, grasa_g_dia: grasa_g, carbs_g_dia: carbs_g };
                this.saveState();
                this.renderPlan();
                this.showToast('Plan actualizado ✨');
            },

            updateMacrosManually(key, value) {
                const macroMap = { 'kcal-objetivo': 'kcal', 'prote-objetivo': 'prote_g_dia', 'grasa-objetivo': 'grasa_g_dia', 'carbs-objetivo': 'carbs_g_dia' };
                this.state.metas[macroMap[key]] = parseFloat(value);
                this.saveState();
            },

            updateExclusions(exclusion, isChecked) {
                const exclusions = new Set(this.state.perfil.exclusiones);
                if (isChecked) exclusions.add(exclusion);
                else exclusions.delete(exclusion);
                this.state.perfil.exclusiones = [...exclusions];
                this.saveState();
                this.showToast('Preferencias guardadas ✅');
            },

            addFood(dateKey, mealName) {
                const foodId = prompt("Ingresá el ID del alimento (1: Huevo, 2: Pollo, 3: Arroz, 4: Pan, 5: Queso):");
                const food = this.foodDB.find(f => f.id == foodId);
                if (!food) return alert('ID de alimento no válido.');

                const amount = parseFloat(prompt(`Cantidad de ${food.name} (${food.unit}):`));
                if (isNaN(amount) || amount <= 0) return;

                if (!this.state.log[dateKey]) {
                    this.state.log[dateKey] = { meals: { Desayuno: [], Almuerzo: [], Merienda: [], Cena: [] }, totals: { kcal: 0, prot: 0 }};
                }
                
                const logEntry = this.state.log[dateKey];
                const kcal = (food.kcal * amount);
                const prot = (food.prot * amount);

                logEntry.meals[mealName].push({ food, amount, kcal, prot });
                logEntry.totals.kcal += kcal;
                logEntry.totals.prot += prot;

                this.saveState();
                this.renderDailyLog();
            },

            showToast(message) {
                const toast = document.createElement('div');
                toast.className = 'toast';
                toast.textContent = message;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            },
            
            exportData() {
                const dataStr = JSON.stringify(this.state, null, 2);
                const blob = new Blob([dataStr], {type: "application/json"});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `kilobyte_backup_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.showToast('Datos exportados ✅');
            },

            importData(event) {
                const file = event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedState = JSON.parse(e.target.result);
                        if (importedState.perfil && importedState.metas) {
                            this.state = importedState;
                            this.saveState();
                            this.renderAll();
                            this.showToast('Datos importados correctamente ✅');
                        } else {
                            throw new Error('Formato de archivo no válido.');
                        }
                    } catch (error) {
                        alert('Error al importar el archivo: ' + error.message);
                    }
                };
                reader.readAsText(file);
                event.target.value = null;
            }
        };

        app.init();
    });
    </script>
</body>
</html>

