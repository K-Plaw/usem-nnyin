# UsemNnyin (Usem Nnyin) 🌍🗣️
### Preserving Indigenous Languages Through AI and Modern Technology

> **"Our vision: A digitally connected generation that never loses connection with its roots."**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-teal.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-orange.svg)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Flash-purple.svg)](https://ai.google.dev/)

---

## 📖 Executive Summary & Mission

Our community in **Akwa Ibom State, Nigeria** (and neighboring Cross River communities) is increasingly influenced by Western culture and dominant global languages. As an unintended consequence, indigenous spoken languages—specifically **Ibibio** and **Efik**—are experiencing severe linguistic attrition, creating a widening generational gap between native-speaking elders and digitally connected youth.

To counteract this cultural erosion, **UsemNnyin** (*"Our Language"* in Ibibio/Efik) repurposes modern digital innovations—technologies often labeled as "anti-cultural"—as powerful instruments of linguistic revitalization and cultural preservation.

UsemNnyin is a production-grade, AI-powered language-learning and preservation platform combining:
1. **An authentic, peer-reviewed bilingual lexicon** grounded in empirical linguistic research.
2. **Interactive, gamified learning modules** that track user mastery, streaks, and milestones.
3. **Indigenous tone synthesis** reflecting Niger-Congo tonal contours.
4. **Server-side AI linguistic commentary** powered by Google Gemini models to elucidate etymology, cultural folklore, and cross-dialect cognates.

---

## ✨ Key Features

### 1. Academic Bilingual Dictionary (Zero-Fabrication Standard)
- **Authoritative Lexicography**: Lexical records are meticulously grounded in the *Uyo Ibibio Dictionary* (Prof. Eno-Abasi E. Urua, Dr. Moses Ekpenyong, and Prof. Dafydd Gibbon, 2004; DAAD / University of Uyo & Universität Bielefeld) and Elaine Marlowe Kaufman's pioneering field studies (1985).
- **Standard Essien Orthography**: Strict adherence to official Ibibio orthography with tonal accents and diacritics (`ñ`, `ọ`, `ị`, `ʌ`).
- **Phonetic & Machine Notation**: Every record includes accessible phonetic spelling, International Phonetic Alphabet (**IPA**) transcriptions, and machine-readable **SAMPA** notation.
- **Tonal Pitch Formulas**: Tonal markers explicitly documented (`HH`, `HL`, `LH`, `LL`, `HHL`, `LLH`, `LLHH`, `LHLL`, `HF`, `HD`) to prevent tonal misinterpretation.
- **Grammatical Categorization**: Tagged by formal linguistic parts of speech (`n` noun, `tv` transitive verb, `iv` intransitive verb, `num` numeral, `aj` adjective, `adv` adverb, `interj` interjection, `ideo` ideophone).
- **In-App Softcopy Access**: Direct access and download capability for the complete 132-page *Uyo Ibibio Dictionary* PDF directly inside the app.

### 2. Gamified, Progressive Learning Curriculum
- **7 Structured Modules per Language**:
  - *Module 1*: Greetings & Everyday Salutations
  - *Module 2*: Family, Kinship & Traditional Birth Orders (*Akpan*, *Adiaha*, *Udo*)
  - *Module 3*: Numbers & Vigesimal (Base-20) Counting System (*Kiet* to *Edịp*)
  - *Module 4*: Culinary Heritage & Botanical Flora (*Afang*, *Edikang Ikong*, *Afia Efere*)
  - *Module 5*: Daily Activities, Household Life & Verbal Conjugation
  - *Module 6*: Cultural Wisdom, Taboos, Ancestral Societies (*Ekpe*, *Mbopo*, *Abodom*)
  - *Module 7*: Comprehensive Fluency & Mastery Milestone
- **Dynamic Module Unlocking**: Completing a module automatically unlocks subsequent modules with immediate dashboard XP and score updates.
- **Cross-Device Persistence**: Progress, completion timestamps, and XP synchronize instantaneously to Google Cloud Firestore (when signed in) with graceful, offline-resilient local storage fallback.
- **Celebratory Milestones**: Dynamic full-screen confetti fireworks on streak maintenance, record achievements, and full curriculum completion.

### 3. Interactive Multi-Format Exercises
- **Multiple Choice**: Contextual vocabulary and grammar identification.
- **Word Matching**: Interactive tap-to-match between indigenous terms and English equivalents.
- **Sentence Reordering**: Syntactic construction tests reinforcing SOV/SVO indigenous sentence structures.
- **Fill-in-the-Blank**: Precision orthography and spelling tests.
- **Audio Listening**: Ear training calibrated with tone-contour synthesis.

### 4. Audio Pronunciation & Tone Synthesis
- Web Audio API pitch engine calibrated to replicate high, mid, and low tonal registers of indigenous Cross River phonemes.
- Auditory distinction between minimal tonal pairs (e.g., words differentiated solely by high vs. low pitch).

### 5. Server-Side AI Linguistic Explanations (Google Gemini)
- Secure server proxy (`/api/ai-explain`) invoking Gemini Flash models.
- Deep linguistic contextualization:
  - Etymological derivations and root morphemes.
  - Cultural context, proverbs, and traditional ceremonial usages.
  - Comparative cognate analysis between Ibibio and Efik.
  - Transparent disclaimers distinguishing peer-reviewed dictionary records from AI educational commentary.

### 6. Authentication & User Profile Management
- Firebase Authentication supporting Google Sign-In and email/password authentication.
- Seamless Guest Mode allowing immediate learning without registration.
- Profile settings: Language preference (Ibibio or Efik), daily XP goals, streak freeze protections, and notification preferences.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Canvas-Confetti |
| **Backend** | Node.js, Express, tsx (TypeScript execute), RESTful API |
| **Database & Auth** | Firebase Authentication, Google Cloud Firestore, LocalStorage JSON Engine |
| **AI Integration** | Google GenAI SDK (`@google/genai`), Gemini 2.5/Flash via server proxy |
| **Linguistic Assets** | *Uyo Ibibio Dictionary* (2004), Essien Orthography, Kaufman Lexical Database |

---

## 📂 Project Architecture

```
usem-nnyin/
├── public/
│   ├── assets/
│   │   └── aistudio/
│   │       └── 2004_Gibbon_Urua_Ekpenyong_Ibibio_Dictionary01_f72b4bb1.pdf # Academic PDF
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx          # Responsive sign-in/up modal
│   │   ├── DashboardView.tsx      # User stats, streak counter, modules & achievements
│   │   ├── DictionaryView.tsx     # Searchable lexicon, audio player, POS/IPA tags, PDF link
│   │   ├── LessonModal.tsx        # Multi-stage interactive quiz player with next module unlock
│   │   ├── Navigation.tsx         # Responsive application header & navigation
│   │   └── ProfileModal.tsx       # User preferences and goal management
│   ├── context/
│   │   └── AuthContext.tsx        # Firebase Auth + Guest user state management
│   ├── data/
│   │   └── seedData.ts            # Verified dictionary, lessons, and achievements database
│   ├── lib/
│   │   ├── api.ts                 # Dynamic API URL resolution (local & production Vercel)
│   │   └── firebase.ts            # Client-side Firebase App & Firestore initialization
│   ├── types/
│   │   └── index.ts               # Strict TypeScript models & interfaces
│   ├── utils/
│   │   ├── audio.ts               # Indigenous pitch & tone synthesis engine
│   │   ├── confetti.ts            # Celebration & fireworks animations
│   │   └── progress.ts            # Module unlock progression, XP calculation & sync
│   ├── App.tsx                    # Top-level view routing & modal management
│   ├── main.tsx                   # React DOM entry point
│   └── index.css                  # Tailwind CSS root imports & custom scrollbar styles
├── server.ts                      # Full-stack Express server + Vite middleware + Gemini proxy
├── package.json                   # Dependency declarations & scripts
├── tsconfig.json                  # TypeScript compiler settings
└── .env.example                   # Environment configuration template (zero exposed secrets)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* A **Google Gemini API Key** (for real-time AI linguistic explanations)
- *(Optional)* A **Firebase Project** (for persistent cloud synchronization)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/usemnnyin.git
   cd usemnnyin
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Populate the necessary variables:
   ```env
   # Server Port
   PORT=3000

   # Gemini API Key (Server-Side Proxy)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Client Firebase Configuration (Public web client config)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Launch the Development Server**:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` in your browser.

5. **Production Build & Execution**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔒 Security & Privacy Practices

- **Zero Secret Exposure**: All server-side secrets (e.g., `GEMINI_API_KEY`) run strictly within `server.ts` behind Express proxy routes. No sensitive API credentials are ever bundled in client code.
- **Git Ignore Safeguards**: `.env`, build artifacts (`dist/`), temporary logs, and local databases (`data/db.json`) are strictly git-ignored.
- **CORS Whitelisting**: Strict origin controls allow authorized production domains (e.g. `usem-nnyin.vercel.app`) while rejecting unauthorized cross-site requests.
- **Zero Fabricated Records**: When words are missing from the verified lexicon, the application refrains from hallucinating definitions and transparently informs the user while offering educational AI contextualization.

---

## 📚 Academic Grounding & Citations

The lexical foundation of UsemNnyin is built upon peer-reviewed scholarship:

1. **Urua, Eno-Abasi E., Moses Ekpenyong, & Dafydd Gibbon** (2004).  
   *Uyo Ibibio Dictionary*.  
   Uyo & Bielefeld: University of Uyo & Universität Bielefeld. Funded by the German Academic Exchange Service (DAAD) under the *Localised Human Language Technologies for Nigerian Languages* project.
2. **Kaufman, Elaine Marlowe** (1985).  
   *Ibibio Dictionary*.  
   Leiden, Netherlands: Cross River State University & Ibibio Language Board in cooperation with the African Studies Centre.
3. **Essien, Okon E.** (1990).  
   *A Grammar of the Ibibio Language*.  
   Ibadan: University Press Plc.

---

## 🤝 Contributing

We welcome contributions from native speakers, linguists, developers, and educators!
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/NewVocabularyModule`).
3. Commit your changes (`git commit -m 'feat: Add botanical terms for Efik cuisine'`).
4. Push to the branch (`git push origin feature/NewVocabularyModule`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>Sosọñọ eti-eti! (Thank you very much!)</b><br/>
  <i>Built with pride for the heritage of Akwa Ibom and Cross River States.</i>
</p>
