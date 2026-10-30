import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Sparkles, BookOpen, Volume2, Award, Flame, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

interface LandingPageProps {
  setCurrentTab: (tab: 'home' | 'learn' | 'dictionary' | 'culture' | 'dashboard') => void;
  openAuthModal: () => void;
  onSearchDictionary: (query: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  setCurrentTab,
  openAuthModal,
  onSearchDictionary,
}) => {
  const { user, setActiveLanguage } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchDictionary(searchQuery.trim());
      setCurrentTab('dictionary');
    }
  };

  const handleStartLanguage = (lang: 'ibibio' | 'efik') => {
    setActiveLanguage(lang);
    if (user) {
      setCurrentTab('learn');
    } else {
      openAuthModal();
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 bg-gradient-to-b from-amber-50/60 to-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <span>South-South Nigeria Cultural Revitalization</span>
                <span aria-hidden="true">·</span>
                <span>Akwa Ibom & Cross River</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15] font-display text-balance">
                Speak <span className="text-emerald-700 underline decoration-amber-400 decoration-wavy decoration-2">Ibibio</span> and{' '}
                <span className="text-amber-700 underline decoration-emerald-400 decoration-wavy decoration-2">Efik</span> with Pride.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
                Connect with your roots through Nigeria&apos;s first gamified learning platform for Lower Cross River languages. Master verified vocabulary, tonal pronunciation, and authentic dialogue in 5 bite-sized minutes a day.
              </p>

              {/* Two Prominent Language Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-white border-2 border-emerald-600/30 hover:border-emerald-600 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Akwa Ibom State</span>
                    <span className="text-xs font-medium text-stone-400">10M+ Speakers</span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-1 font-display">Learn Ibibio</h3>
                  <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                    Master greetings like <span className="font-semibold text-stone-700">&quot;Emesiere&quot;</span>, counting, family kinship, and village proverbs.
                  </p>
                  <button
                    onClick={() => handleStartLanguage('ibibio')}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Start Ibibio Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-white border-2 border-amber-600/30 hover:border-amber-600 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Cross River State</span>
                    <span className="text-xs font-medium text-stone-400">Calabar Heritage</span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-1 font-display">Learn Efik</h3>
                  <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                    Explore royal Calabar speech, salutations like <span className="font-semibold text-stone-700">&quot;Mọkọm&quot;</span>, and Edikang Ikong cuisine.
                  </p>
                  <button
                    onClick={() => handleStartLanguage('efik')}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Start Efik Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Dictionary Search Launcher */}
              <div className="pt-2">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center max-w-lg">
                  <div className="absolute left-3.5 text-stone-400 pointer-events-none">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search verified dictionary (e.g. 'Emesiere', 'Water', 'Father')..."
                    className="w-full pl-10 pr-24 py-3 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent shadow-xs"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Lookup
                  </button>
                </form>
                <div className="flex items-center gap-2 mt-2 text-xs text-stone-500">
                  <span className="font-medium text-stone-400">Popular:</span>
                  <button
                    onClick={() => {
                      onSearchDictionary('Emesiere');
                      setCurrentTab('dictionary');
                    }}
                    className="hover:text-emerald-700 underline underline-offset-2 cursor-pointer"
                  >
                    Emesiere
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => {
                      onSearchDictionary('Edikang Ikong');
                      setCurrentTab('dictionary');
                    }}
                    className="hover:text-emerald-700 underline underline-offset-2 cursor-pointer"
                  >
                    Edikang Ikong
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => {
                      onSearchDictionary('Sosọñọ');
                      setCurrentTab('dictionary');
                    }}
                    className="hover:text-emerald-700 underline underline-offset-2 cursor-pointer"
                  >
                    Sosọñọ
                  </button>
                </div>
              </div>
            </div>

            {/* Right Media Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-amber-100 aspect-16/10 sm:aspect-16/9 lg:aspect-4/3">
                <img
                  src="/src/assets/images/hero_ibibio_efik_culture_1793364997691.jpg"
                  alt="Ibibio and Efik linguistic heritage celebration artwork"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Preserving Living Heritage</span>
                  <p className="text-xs sm:text-sm font-medium text-stone-200 mt-1">
                    Akwa Ibom &amp; Cross River oral traditions, proverbs, and ancient scripts brought into the digital age.
                  </p>
                </div>
              </div>

              {/* Floating Tutor Companion Card */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white p-3 sm:p-4 rounded-2xl shadow-lg border border-stone-200/80 flex items-center gap-3 max-w-xs">
                <img
                  src="/src/assets/images/mascot_usem_guide_1793364998164.jpg"
                  alt="Ekpe the learning guide parrot mascot"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-amber-200"
                />
                <div>
                  <p className="text-xs font-bold text-stone-900 font-display">Ekpe the Language Guide</p>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    &quot;Sosọñọ! Ready for your 5-minute indigenous language lesson today?&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW THE LEARNING EXPERIENCE WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Duolingo-Inspired Pedagogy</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-display">
            How Usem Nnyin Works
          </h2>
          <p className="text-sm text-stone-600">
            Interactive, intuitive, and designed to foster true fluency through daily micro-practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-display">1. Listen &amp; Pronounce Tones</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Ibibio and Efik are tonal languages. Our phonetic pitch synthesizer accurately models high, mid, and low tonal cadences so you speak naturally.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-700">
              High · Mid · Low Tone Models
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-display">2. Multi-Format Exercises</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Engage with matching games, sentence reordering, fill-in-the-blank challenges, and listening tests drawn from 7 curated thematic modules.
            </p>
            <div className="pt-2 text-xs font-semibold text-amber-700">
              Interactive Gamified Drills
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-display">3. Earn XP &amp; Build Streaks</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Keep your learning habit strong with consecutive daily streak flames, verifiable experience points (XP), and unlockable cultural badges.
            </p>
            <div className="pt-2 text-xs font-semibold text-rose-700">
              Milestones &amp; Achievements
            </div>
          </div>
        </div>
      </section>

      {/* VERIFIED DICTIONARY SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Strict Linguistic Accuracy Standard</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight">
                Authentic Bilingual Dictionary
              </h2>
              <p className="text-sm text-stone-300 leading-relaxed max-w-xl">
                No machine-hallucinated indigenous words. Every entry features verified definitions, orthography, phonetic syllables, real example sentences with translations, and optional AI-assisted etymological explanations clearly labeled.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setCurrentTab('dictionary')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Open Bilingual Dictionary</span>
                </button>
                <button
                  onClick={() => setCurrentTab('culture')}
                  className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  Explore Nsibidi Heritage
                </button>
              </div>
            </div>

            {/* Sample Dictionary Card Preview */}
            <div className="lg:col-span-5 bg-stone-800/90 border border-stone-700 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Sample Verified Entry</span>
                <span className="text-[11px] text-stone-400">Ibibio &amp; Efik</span>
              </div>
              <div>
                <h4 className="text-2xl font-extrabold text-white font-display">Sosọñọ</h4>
                <p className="text-xs text-amber-300 font-mono">/soh-sohn-yoh/</p>
              </div>
              <p className="text-sm text-stone-200 font-semibold">
                Thank you <span className="text-xs font-normal text-stone-400">· Expression of gratitude</span>
              </p>
              <div className="p-3 bg-stone-900/80 rounded-xl text-xs space-y-1">
                <p className="text-emerald-300 font-medium">&quot;Sosọñọ eti-eti ke unwam fo.&quot;</p>
                <p className="text-stone-400">&quot;Thank you very much for your help.&quot;</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CULTURAL HERITAGE & NSIBIDI PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs">
          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-stone-200 aspect-4/3">
            <img
              src="/src/assets/images/culture_nsibidi_patterns_1793364998118.jpg"
              alt="Ancient Cross River Nsibidi symbols and traditional woven tapestry"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Ancient Indigenous Literacy</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
              Preserving the Nsibidi Script &amp; Cultural Wisdom
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Long before European contact, communities across the Cross River basin documented love, statecraft, unity, and lineage through <strong>Nsibidi</strong>—an indigenous pictographic writing system recorded on textiles, calabashes, and sacred bronze staffs.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <p className="text-lg font-bold text-stone-900 font-display">Ima</p>
                <p className="text-[11px] text-stone-500">Love / Amity</p>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <p className="text-lg font-bold text-stone-900 font-display">Emem</p>
                <p className="text-[11px] text-stone-500">Peace</p>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <p className="text-lg font-bold text-stone-900 font-display">Ekpe</p>
                <p className="text-[11px] text-stone-500">Courage / Justice</p>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <p className="text-lg font-bold text-stone-900 font-display">Ifiọk</p>
                <p className="text-[11px] text-stone-500">Wisdom</p>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setCurrentTab('culture')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Read the Complete Nsibidi &amp; Language Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-8 sm:p-14 space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display">
            Start Learning Your Mother Tongue Today
          </h2>
          <p className="text-stone-200 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Join thousands revitalizing their ancestral language. Choose Ibibio or Efik, track your daily streak, and unlock cultural knowledge.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => handleStartLanguage('ibibio')}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer"
            >
              Start Ibibio Track
            </button>
            <button
              onClick={() => handleStartLanguage('efik')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition-all border border-white/30 cursor-pointer"
            >
              Start Efik Track
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
