# ConversionLayer Academy

A high-fidelity single-page portfolio and SaaS platform for analytics engineers and tracking specialists, engineered with React, Vite, and Tailwind CSS.

---

## 📁 Repository Structure

```text
conversionlayer-academy/
├── .github/
│   └── workflows/
│       ├── firebase-hosting-merge.yml        # Deploys live on push to main branch
│       └── firebase-hosting-pull-request.yml  # Deploys preview channel on PRs
├── public/                         # Static assets (favicons, icons)
├── src/
│   ├── components/                 # Modular UI Components
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx  # Firebase Auth route guard
│   │   ├── AcademyCourses.tsx      # Courses grid with syllabus & enroll modal
│   │   ├── AuditorTool.tsx         # The Tracking Auditor interactive lead magnet
│   │   ├── DFYServices.tsx         # Done-For-You engineering tiers & Fiverr CTAs
│   │   ├── EnrollModal.tsx         # Course enrollment confirmation modal
│   │   ├── Footer.tsx              # Footer with uptime indicator & navigation
│   │   ├── Hero.tsx                # Hero section with live telemetry stats bar
│   │   ├── HireModal.tsx           # Fiverr consultation & order intake modal
│   │   └── Navbar.tsx              # Sticky glassmorphic navbar with mobile drawer
│   ├── pages/                      # Routed Application Views
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx  # Master tabbed Firestore CRUD dashboard
│   │   │   └── AdminLogin.tsx      # Dark SaaS Firebase Auth login screen
│   │   └── Home.tsx                # Public SaaS landing page
│   ├── data/
│   │   └── academyData.ts          # Default course and DFY service schemas
│   ├── lib/
│   │   └── firebase.ts             # Firebase client (auth, db, storage exports)
│   ├── App.tsx                     # React Router implementation (/, /admin/login, /admin)
│   ├── index.css                   # Global styles & Tailwind CSS entry point
│   └── main.tsx                    # Vite React DOM root entry point
├── .env.example                    # Environment variable template
├── .firebaserc                     # Firebase project alias configuration
├── .gitignore                      # Git ignore rules for node_modules and .env files
├── firebase.json                   # Firebase Hosting configuration (SPA rewrites to dist/)
├── index.html                      # HTML5 entry point & webfont linkages
├── package.json                    # Dependencies & build scripts ("build": "vite build")
├── tsconfig.json                   # TypeScript compiler configuration
└── vite.config.ts                  # Vite build tool and Tailwind integration plugin
```

---

## 🚀 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/conversionlayer-academy.git
cd conversionlayer-academy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the `.env.example` file to create your local `.env` file:
```bash
cp .env.example .env
```
*(Note: `.env` is ignored by Git to keep your API keys and secrets safe).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the URL printed in your terminal) in your browser.

### 5. Build for Production
```bash
npm run build
```
This will compile and bundle all static assets into the `dist/` directory.

---

## 🌐 Deploying to Production

### Option A: Firebase Hosting (via GitHub Actions)
1. In your terminal, initialize Firebase Hosting:
   ```bash
   npx firebase-tools login
   npx firebase-tools init hosting
   ```
2. When prompted:
   - **Public directory**: `dist`
   - **Configure as single-page app**: `Yes`
   - **Set up automatic builds and deploys with GitHub**: `Yes`
3. Firebase CLI will automatically create a Service Account and add it to your GitHub repository secrets (`FIREBASE_SERVICE_ACCOUNT`).
4. Whenever you push to the `main` branch, `.github/workflows/deploy.yml` builds and deploys your site to Firebase Hosting.

### Option B: Vercel (Zero-Config)
1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select your GitHub repository.
3. Vercel automatically detects **Vite**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add any environment variables (from `.env.example`) in the Vercel Project Settings.
5. Click **Deploy**. Every subsequent commit to `main` triggers an automatic production deployment.

### Option C: Netlify
1. Log in to [netlify.com](https://netlify.com) and choose **"Import an existing project from Git"**.
2. Select your repository.
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Deploy site.
