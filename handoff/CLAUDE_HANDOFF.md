# YouChef — Complete Technical Handoff & Claude Code Migration Guide

## 1. Application Overview & Product Identity

**YouChef** is a full-stack, AI-driven culinary copilot and smart kitchen assistant designed around zero-waste cooking, professional culinary technique mentoring, and household grocery management.

- **Core Proposition**: Users specify what ingredients they have on hand (via manual tags, fridge photo scans, or grocery receipt scans), and YouChef synthesizes chef-grade recipes constrained strictly to available ingredients and pantry staples.
- **Differentiator**: Strict pantry adherence logic, AI chef personalities with distinct culinary voices, step-by-step interactive cooking mode with timer management, receipt OCR for shelf-life estimation, and dishes/creations social showcase with AI culinary critiques.
- **Current Runtime Target**: Vite + React 19 Frontend with an Express 5 backend proxying Google Gemini GenAI SDK calls.

---

## 2. Technology Stack & Runtime Architecture

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | v22.x | Backend engine & build runtime |
| **Language** | TypeScript | ~5.8.2 | Strict typed codebase across client & server |
| **Backend Server** | Express | ^5.2.1 | API routes, Gemini SDK orchestration, SSR/SPA serving |
| **Frontend Framework** | React | ^19.1.1 | Reactive component hierarchy |
| **DOM Renderer** | React-DOM | ^19.1.1 | Virtual DOM mounting |
| **Dev / Bundler** | Vite | ^6.2.0 | Dev server middleware & frontend client bundle |
| **Backend Bundler** | esbuild | ^0.28.1 | Node CJS bundle (`dist/server.cjs`) for production |
| **Animation Engine** | Motion (Framer Motion) | ^12.38.0 | Fluid transitions, accordion animations |
| **AI SDK** | `@google/genai` | ^1.20.0 | Official Google GenAI SDK |
| **Styling** | Tailwind CSS & Google Fonts | CDN & Google Fonts | Design system (Outfit, Playfair Display) |

### High-Level Architecture Diagram
```
Client Browser (React 19 SPA)
   │
   ├─► Client State & Contexts: AppContext (Pantry, Recipes, User Profile, Leftovers)
   ├─► Local Storage Cache: 'youchef-user-data-cache', 'youchef-daily-tip-YYYY-MM-DD'
   │
   ▼ HTTP / JSON
Express 5 Server (server.ts / dist/server.cjs)
   │
   ├─► /api/recipes        ──► Google GenAI (gemini-3.8-flash)
   ├─► /api/chef-secret    ──► Google GenAI (gemini-3.8-flash)
   ├─► /api/recipe-image   ──► Google GenAI (gemini-3.1-flash-lite-image)
   ├─► /api/critique       ──► Google GenAI (gemini-3.8-flash)
   ├─► /api/scan-receipt   ──► Google GenAI (gemini-3.8-flash)
   ├─► /api/scan-fridge    ──► Google GenAI (gemini-3.8-flash)
   └─► Vite Middleware (Dev) or Static Serves (Production /dist)
```

---

## 3. Directory Map & File Inventory

The repository contains 70 primary files organized into clear functional modules:

```
├── .env.example                     # Environment template with full variable documentation
├── .gitignore                       # Git ignore rules (node_modules, dist, .env, archives)
├── App.tsx                          # Root application layout, navigation routing, page state
├── index.html                       # HTML entry point, Tailwind CDN, Google Fonts, theme variables
├── index.tsx                        # React 19 root client mount point with AppProvider & ToastProvider
├── metadata.json                    # AI Studio applet metadata & permissions declaration
├── package.json                     # Dependency manifests & npm scripts
├── package-lock.json                # Locked dependency tree
├── server.ts                        # Express backend, Gemini API routes, fallback resilience
├── tsconfig.json                    # TypeScript compiler configuration
├── types.ts                         # Complete domain models & TypeScript interfaces
├── vite.config.ts                   # Vite configuration (React plugin, port 3000)
│
├── components/                      # UI Component Layer (39 components)
│   ├── common/
│   │   └── Modal.tsx                # Reusable accessible modal dialog shell
│   ├── AuthModal.tsx                # Simulated authentication & profile switcher
│   ├── Badges.tsx                   # Culinary achievement badge list & progress
│   ├── CookingModePage.tsx          # Full-screen guided step-by-step cooking mode with timers
│   ├── DailyTip.tsx                 # Dismissable daily kitchen wisdom banner
│   ├── Dashboard.tsx                # Logged-in user hub (quick actions, pantry health, activity)
│   ├── EditProfileModal.tsx         # User profile bio, avatar, and dietary settings modal
│   ├── ErrorBoundary.tsx            # React crash-prevention boundary with reload fallback
│   ├── Footer.tsx                   # Application footer with brand info & links
│   ├── FridgeMode.tsx               # Dedicated distraction-free fridge cooking workflow
│   ├── GroceryFinder.tsx            # Instacart & DoorDash affiliate order link generator
│   ├── Header.tsx                   # Responsive top navigation, user menu, modal toggles
│   ├── IngredientInput.tsx          # Tag-based ingredient input bar with quick suggestions
│   ├── InspirationGrid.tsx          # Curated pre-built recipe inspiration cards
│   ├── IntegrationsManager.tsx      # Smart device connection modal (Alexa, Samsung)
│   ├── IntegrationsShowcase.tsx     # Landing page smart kitchen integration showcase
│   ├── LandingPage.tsx              # Public guest marketing view with HeroSection & USP cards
│   ├── LanguageSwitcher.tsx         # Floating English / Spanish locale toggle
│   ├── LeftoverIdeaCard.tsx         # Interactive card for re-inventing leftovers
│   ├── LeftoversManager.tsx         # Leftovers tracker with expiration warnings
│   ├── Loader.tsx                   # Custom culinary animation loading indicator
│   ├── MarkAsCookedModal.tsx        # Post-cook dish critique & completion photo submission
│   ├── MealPlannerPage.tsx          # Weekly interactive drag-and-drop calendar planner
│   ├── Onboarding.tsx               # Interactive 3-step onboarding questionnaire
│   ├── PreferencesForm.tsx          # Advanced filters (dietary, time, skill, equipment)
│   ├── ProfilePage.tsx              # Profile dashboard, achievements, cooked history, friends
│   ├── RecipeDetailPage.tsx         # In-depth recipe viewer, nutrition charts, pairings, tips
│   ├── RecipeDisplay.tsx            # Generated recipe result cards with actions
│   ├── SavedRecipesModal.tsx        # Modal list of bookmarked favorite recipes
│   ├── ScanFridgeModal.tsx          # Live camera / file upload fridge inventory scanner
│   ├── ScanReceiptModal.tsx         # Live camera / file upload grocery receipt scanner
│   ├── ShareModal.tsx               # Recipe social share modal (link copy, Twitter, WhatsApp)
│   ├── ShoppingListModal.tsx        # Interactive checklist of missing ingredients with store links
│   ├── SmartTip.tsx                 # Tooltip / popover for culinary jargon definitions
│   ├── TestReport.tsx               # Built-in verification testing visualizer
│   ├── Toast.tsx                    # Notification toast message component
│   ├── UpgradeModal.tsx             # YouChef Pro subscription plan pricing modal
│   ├── VoiceCommandsGuide.tsx       # Hands-free kitchen voice commands reference modal
│   └── Welcome.tsx                  # Guest onboarding / introduction card
│
├── contexts/                        # Global State Management
│   ├── AppContext.tsx               # Primary application state, user persistence, recipe actions
│   └── ToastContext.tsx             # Global transient notification dispatcher
│
├── data/                            # Static Datasets
│   ├── challenges.ts                # Weekly cooking challenges (Zero-Waste, 15-Minute Meals)
│   └── preBuiltRecipes.ts           # Curated pre-built recipes with high-res photography
│
├── hooks/
│   └── useSousChef.ts               # Web Speech API hook for hands-free voice commands
│
├── services/                        # Service & API Layer
│   ├── achievementsService.ts       # Gamification logic, XP calculation, level progression
│   ├── analyticsService.ts          # Telemetry and event tracker stub
│   ├── geminiService.ts             # Client-to-server API bridge (`fetch('/api/*')`)
│   ├── mealPlanService.ts           # Meal planner persistence and export utilities
│   ├── recipeCache.ts               # In-memory recipe caching utility
│   ├── storageService.ts            # LocalStorage synchronization with fallback hydration
│   ├── systemTests.ts               # Client-side automated integration test runner
│   ├── webVitals.ts                 # Web performance metric observers
│   └── youChefApi.ts                # Mock persistence layer replacing legacy direct storage
│
└── utils/                           # Helper Utilities
    ├── audioUtils.ts                # Audio playback helper for cooking timers & cues
    ├── imageUtils.ts                # Canvas image compression & base64 sanitization
    ├── testRunner.ts                # Command-line / browser test harness
    └── translations.ts              # English / Spanish localization dictionaries
```

---

## 4. Setup, Installation & Running in Claude Code

### Prerequisites
- Node.js version 20.x or 22.x LTS
- npm version 9+ (or pnpm / bun)
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Step-by-Step Installation
1. Extract the project archive (or clone from your git remote):
   ```bash
   cd youchef
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create your local `.env` file from the provided `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and set your Gemini API key:
   ```bash
   GEMINI_API_KEY=AIzaSy...your_actual_key_here
   ```

### Development Mode
Start the full-stack server (runs Express with Vite middleware on port 3000):
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### Production Build & Launch
Compile the frontend client and bundle the Node.js server:
```bash
npm run build
npm start
```
The production bundle will be served on `http://localhost:3000` (or the port defined by `PORT`).

### Typechecking & Linting
Validate all TypeScript definitions across client and server:
```bash
npm run lint
```

---

## 5. Configuration & External Services Breakdown

### Environment Variables
| Variable | Required | Tier | Description | Source |
| :--- | :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | **YES** | Server | Gemini API key for `@google/genai` calls | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `PORT` | NO | Server | HTTP port (defaults to 3000) | System environment |
| `NODE_ENV` | NO | Server | `development` (Vite middleware) or `production` | Deployment runtime |
| `VITE_ANALYTICS_ID` | NO | Client | Optional Google Analytics / Segment tracking ID | Analytics provider |

### External Services & APIs
1. **Google Gemini API (`@google/genai`)**:
   - `gemini-3.8-flash`: Powers recipe generation, receipt OCR extraction, fridge inventory recognition, and dish critiquing. Fallbacks configured to `gemini-flash-latest` and `gemini-3.1-flash-lite`.
   - `gemini-3.1-flash-lite-image`: Generates visual dish photography adhering strictly to input ingredients.
2. **Unsplash Image CDN**:
   - High-quality static food photography used in `preBuiltRecipes.ts` and as dynamic query fallbacks if image generation is bypassed.
3. **Instacart & DoorDash Affiliate Deep Links**:
   - `GroceryFinder.tsx` constructs affiliate deep links for grocery order delivery based on missing ingredients and optional user geolocation.
4. **Browser Web APIs**:
   - Web Speech API (`SpeechRecognition`) via `useSousChef.ts` for hands-free cooking commands.
   - HTML5 Camera & File API for receipt and fridge photo capture.
   - HTML5 Audio API for cooking timer alert chimes.

---

## 6. Stored Data & Persistence Architecture

### Where Data Currently Lives
- **User Accounts, Preferences, Saved Recipes, Leftovers, Meal Plans, Shopping Lists**:
  - Saved in browser `window.localStorage` under key `youchef-user-data` and cached under `youchef-user-data-cache`.
  - Schema definition: `UserProfile` and `AllUsersData` in `types.ts`.
  - Service abstraction: `services/storageService.ts` and `services/youChefApi.ts`.
- **Daily Culinary Tip**:
  - Cached in `localStorage` under `youchef-daily-tip-YYYY-MM-DD` so it rotates once daily.
- **Server State**:
  - The Express backend is currently stateless. All user profiles and historical cooks are stored client-side.

### Migration Recommendations for Claude Code
When migrating to a multi-user production backend (e.g., PostgreSQL, Supabase, or Firebase):
1. Replace `storageService.ts` and `youChefApi.ts` endpoints with database client calls.
2. The data structure `UserProfile` in `types.ts` is already normalized and ready to map directly into SQL tables (`users`, `recipes`, `saved_recipes`, `creations`, `leftovers`, `meal_plans`, `pantry_items`).

---

## 7. Feature Completion Status & Audit

| Feature | Primary Files | Status | Notes / Execution Evidence |
| :--- | :--- | :--- | :--- |
| **Strict-Ingredient Recipe Generator** | `IngredientInput.tsx`, `server.ts`, `RecipeDisplay.tsx` | **VERIFIED WORKING** | Passes schema validation, returns structured recipe objects, filters dietary restrictions. |
| **Chef Secret Tips** | `RecipeDetailPage.tsx`, `server.ts` | **VERIFIED WORKING** | Tested via `POST /api/chef-secret`, returns technique & enhancement. |
| **Grocery Receipt Scanner** | `ScanReceiptModal.tsx`, `server.ts` | **VERIFIED WORKING** | Handles camera & file uploads, extracts items + shelf-life, provides "Stock Pantry" button. |
| **Fridge Vision Scanner** | `ScanFridgeModal.tsx`, `server.ts` | **VERIFIED WORKING** | Parses food items, populates ingredient tags directly into generator. |
| **Dish Critique & AI Scoring** | `MarkAsCookedModal.tsx`, `server.ts` | **VERIFIED WORKING** | Evaluates dish photos, generates culinary critique & 1-100 score. |
| **Guided Cooking Mode** | `CookingModePage.tsx`, `useSousChef.ts` | **VERIFIED WORKING** | Step-by-step full-screen view, interactive step timers, voice command integration. |
| **Weekly Meal Planner** | `MealPlannerPage.tsx`, `mealPlanService.ts` | **WORKING** | Full drag/drop UI, day-by-day recipe scheduling, persisted to localStorage. |
| **Leftover Waste Manager** | `LeftoversManager.tsx`, `LeftoverIdeaCard.tsx` | **WORKING** | Categorizes leftovers, warns of impending expiration, triggers AI ideas. |
| **Shopping List Generator** | `ShoppingListModal.tsx`, `GroceryFinder.tsx` | **WORKING** | Auto-aggregates missing ingredients, checks off items, Instacart link generator. |
| **Gamification & Achievements** | `ProfilePage.tsx`, `Badges.tsx`, `achievementsService.ts`| **WORKING** | Calculates XP, cooking streaks, and awards culinary badges. |
| **Multi-Language (EN / ES)** | `LanguageSwitcher.tsx`, `utils/translations.ts` | **WORKING** | Bilingual dictionary and dynamic locale toggle in UI. |
| **AI Recipe Image Generation** | `server.ts` (`/api/recipe-image`) | **WORKING (WITH FALLBACK)** | Generates via `gemini-3.1-flash-lite-image` with fallback to matched Unsplash assets. |
| **User Authentication** | `AuthModal.tsx`, `AppContext.tsx` | **SIMULATED** | Local mock profile switching without backend session cookies/JWT. |

---

## 8. Prioritized Next Steps in Claude Code

1. **Authentication Backend**: Replace simulated auth in `AuthModal.tsx` with production OAuth (Google, Supabase, or Firebase Auth).
2. **Database Persistence**: Migrate client `localStorage` storage to PostgreSQL / Supabase so user data persists across devices.
3. **Receipt Expiration Push Notifications**: Wire up Web Push notifications to alert users 24 hours before scanned items expire.
4. **Enhanced Voice Prompts**: Expand `useSousChef.ts` speech commands for hands-free timer adjustments ("Hey Chef, add 2 minutes").
5. **Tailwind Build Pipeline**: Replace CDN `<script src="https://cdn.tailwindcss.com">` with Tailwind CSS npm package + PostCSS for optimized production CSS purging.
