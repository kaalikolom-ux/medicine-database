# Worldwide Medicine Database

A fast, scalable worldwide medicine directory application designed to prioritize **Bangladeshi pharmaceutical companies first**, followed by companies from other countries alphabetically (A to Z), and brand names alphabetically (A to Z).

Optimized for **Cloudflare Pages / Workers** deployment and **Android Web-to-APK (Capacitor / TWA)**.

---

## 🚀 Key Features

1. **Bangladesh-First Custom Priority Sorting:**
   ```sql
   ORDER BY 
       CASE WHEN LOWER(TRIM(country)) = 'bangladesh' THEN 0 ELSE 1 END,
       country ASC,
       brand_name ASC
   ```
2. **Lightning-Fast Full-Text & Fuzzy Search:**
   - PostgreSQL `pg_trgm` extension with GIN indexes on `brand_name`, `generic_name`, and `producer_name`.
3. **Multi-Platform Ready:**
   - Single codebase deployable to **Cloudflare Pages** (static edge delivery) and **Android APK** via Capacitor.
4. **Normalized Database Architecture:**
   - `generics`: Generic names, therapeutic classes, indications, side-effects.
   - `producers`: Pharmaceutical company names, origin country, contact info.
   - `medicines`: Brand formulations, strengths, dosage forms, packaging, and pricing.

---

## 📁 Project Structure

```text
medicine-database/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Cloudflare Pages CI/CD automation
├── public/
│   ├── favicon.ico
│   └── manifest.json               # Web App Manifest for PWA / TWA
├── src/
│   ├── assets/                     # Static icons, logos, flags
│   ├── components/                 # Reusable UI components
│   ├── lib/
│   │   └── supabase.ts             # Supabase client initializer
│   ├── services/
│   │   └── medicineService.ts      # Query logic with custom sorting & RPC
│   ├── types/
│   │   └── database.types.ts       # Database and medicine entity types
│   ├── App.tsx                     # Main application layout & search UI
│   ├── index.css                   # Tailwind styles
│   └── main.tsx                    # React application root
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Supabase tables, GIN indexes, Views & RPC
├── .env.example                    # Environment variable template
├── .gitignore
├── capacitor.config.ts             # Capacitor mobile configuration
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🗄️ Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** tab in your Supabase dashboard.
3. Copy and run the contents of [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql).
4. In your Supabase dashboard, navigate to **Project Settings > API** and copy:
   - `Project URL`
   - `anon / public key`
5. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local Vite development server
npm run dev

# 3. Build for production (Cloudflare Pages output in dist/)
npm run build
```

---

## 🌐 Deploy to Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages**.
2. Click **Create Application** > **Pages** > **Connect to Git**.
3. Select your repository: `kaalikolom-ux/medicine-database`.
4. Set Build Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
5. Under **Environment variables**, add:
   - `VITE_SUPABASE_URL`: `<your-supabase-url>`
   - `VITE_SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
6. Click **Save and Deploy**.

---

## 📱 Android Web-to-APK (Capacitor)

```bash
# 1. Build the production web bundle
npm run build

# 2. Add Android platform (first time only)
npx cap add android

# 3. Sync web assets to native Android project
npm run cap:sync

# 4. Open in Android Studio to build APK
npm run cap:android
```
