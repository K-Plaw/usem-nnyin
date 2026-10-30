import React from 'react';
import { BookOpen, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: 'home' | 'learn' | 'dictionary' | 'culture' | 'dashboard') => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-200 font-bold text-sm">
                U
              </div>
              <span className="text-lg font-bold text-white font-display">Usem Nnyin</span>
            </div>
            <p className="text-sm text-stone-400 max-w-md leading-relaxed">
              Dedicated to the preservation, documentation, and digital revitalization of the Ibibio and Efik indigenous languages of Akwa Ibom and Cross River States, Nigeria.
            </p>
            <div className="flex items-center gap-4 text-xs text-stone-400 pt-1">
              <span>Verified Lexicography</span>
              <span>·</span>
              <span>Duolingo-Inspired Gamification</span>
              <span>·</span>
              <span>Nsibidi Heritage</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentTab('home')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('learn')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Academy & Lessons
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('dictionary')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Bilingual Dictionary
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('culture')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Nsibidi & Cultural Context
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Linguistic Integrity</h4>
            <div className="space-y-2 text-xs text-stone-400">
              <p className="leading-relaxed">
                All dictionary entries and core curriculum modules are verified indigenous linguistic data from native speakers and community records.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Hallucinated Vocabulary Policy</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3">
          <p>© {new Date().getFullYear()} Usem Nnyin Project. Built for indigenous language preservation.</p>
          <div className="flex items-center gap-1">
            <span>Preserving heritage with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for future generations</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
