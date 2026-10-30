import React, { useState, useEffect } from 'react';
import { DictionaryEntry, LanguageCode, AiExplanationResponse } from '../types';
import { playIndigenousTone } from '../utils/audio';
import {
  Search,
  Volume2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Loader2,
  ArrowRightLeft,
  X
} from 'lucide-react';

interface DictionaryViewProps {
  initialSearchQuery?: string;
  defaultLanguage?: LanguageCode;
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  initialSearchQuery = '',
  defaultLanguage,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'ibibio' | 'efik'>(
    defaultLanguage || 'all'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchDirection, setSearchDirection] = useState<'all' | 'indigenous_to_en' | 'en_to_indigenous'>('all');
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);

  // Search history stored in localStorage
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('usem_dict_history');
      return stored ? JSON.parse(stored) : ['Emesiere', 'Sosọñọ', 'Edikang Ikong'];
    } catch {
      return [];
    }
  });

  // AI-assisted explanation state
  const [activeAiExplain, setActiveAiExplain] = useState<{
    entry: DictionaryEntry;
    data: AiExplanationResponse | null;
    loading: boolean;
    error: string | null;
  } | null>(null);

  const fetchDictionary = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (selectedLanguage !== 'all') params.append('language', selectedLanguage);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchDirection !== 'all') params.append('direction', searchDirection);

      const res = await fetch(`/api/dictionary?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
      }
    } catch (err) {
      console.error('Failed to query dictionary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDictionary();
  }, [searchQuery, selectedLanguage, selectedCategory, searchDirection]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addHistoryItem(searchQuery.trim());
    }
    fetchDictionary();
  };

  const addHistoryItem = (term: string) => {
    const updated = [term, ...searchHistory.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 8);
    setSearchHistory(updated);
    try {
      localStorage.setItem('usem_dict_history', JSON.stringify(updated));
    } catch {}
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('usem_dict_history');
  };

  const handlePlayAudio = async (entry: DictionaryEntry) => {
    setPlayingWordId(entry.id);
    await playIndigenousTone(entry.word, entry.tone_notes);
    setPlayingWordId(null);
  };

  const handleRequestAiExplanation = async (entry: DictionaryEntry) => {
    setActiveAiExplain({
      entry,
      data: null,
      loading: true,
      error: null,
    });

    try {
      const res = await fetch('/api/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: entry.word,
          language: entry.language,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveAiExplain({
          entry,
          data,
          loading: false,
          error: null,
        });
      } else {
        setActiveAiExplain({
          entry,
          data: null,
          loading: false,
          error: 'Could not generate AI explanation. Please try again.',
        });
      }
    } catch {
      setActiveAiExplain({
        entry,
        data: null,
        loading: false,
        error: 'Network connection error. AI explanation unavailable.',
      });
    }
  };

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'greetings', label: 'Greetings' },
    { id: 'family', label: 'Family & Kinship' },
    { id: 'numbers', label: 'Numbers & Counting' },
    { id: 'food', label: 'Food & Objects' },
    { id: 'expressions', label: 'Common Expressions' },
    { id: 'questions', label: 'Questions' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Mission */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <span>Bilingual Verified Lexicon</span>
          <span aria-hidden="true">·</span>
          <span>Ibibio &amp; Efik</span>
          <span aria-hidden="true">·</span>
          <span>Zero Fabricated Entries</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-display">
          Indigenous Bilingual Dictionary
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
          Search verified vocabulary with standardized orthography, tone markers, example sentences, and audio pronunciation.
        </p>
      </div>

      {/* Main Search Controls */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        {/* Search input bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words in English, Ibibio, or Efik (e.g. 'Good morning', 'Water', 'Eka')..."
              className="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-stone-100">
          {/* Language selector buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-stone-500 mr-1">Language:</span>
            <button
              onClick={() => setSelectedLanguage('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedLanguage === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedLanguage('ibibio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedLanguage === 'ibibio'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Ibibio
            </button>
            <button
              onClick={() => setSelectedLanguage('efik')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedLanguage === 'efik'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Efik
            </button>
          </div>

          {/* Direction toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-stone-500 mr-1">Direction:</span>
            <button
              onClick={() =>
                setSearchDirection(
                  searchDirection === 'all'
                    ? 'indigenous_to_en'
                    : searchDirection === 'indigenous_to_en'
                    ? 'en_to_indigenous'
                    : 'all'
                )
              }
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-stone-500" />
              <span>
                {searchDirection === 'all'
                  ? 'Any ⇄ Any'
                  : searchDirection === 'indigenous_to_en'
                  ? 'Indigenous → English'
                  : 'English → Indigenous'}
              </span>
            </button>
          </div>
        </div>

        {/* Category Horizontal Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-stone-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search History & Suggestions */}
        {searchHistory.length > 0 && (
          <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="flex items-center gap-1 text-stone-400 shrink-0">
                <Clock className="w-3 h-3" />
                <span>Recent:</span>
              </span>
              {searchHistory.map((term, i) => (
                <button
                  key={i}
                  onClick={() => setSearchQuery(term)}
                  className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 cursor-pointer whitespace-nowrap"
                >
                  {term}
                </button>
              ))}
            </div>
            <button
              onClick={clearHistory}
              className="text-stone-400 hover:text-stone-600 text-[11px] underline shrink-0 ml-2 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Dictionary Results Count & Verification Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 gap-2">
        <p>
          Showing <span className="font-bold text-stone-900 tabular-nums">{entries.length}</span> verified entries
        </p>
        <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>All returned entries are verified indigenous lexicography</span>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="w-7 h-7 text-emerald-700 animate-spin" />
          <p className="text-xs text-stone-500">Searching authentic lexicon...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && entries.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center border border-stone-200/80 space-y-3">
          <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-display">No verified entry found for &quot;{searchQuery}&quot;</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            In accordance with our strict accuracy standard, we do not fabricate indigenous vocabulary. You can request an AI-assisted linguistic analysis below or adjust your search filters.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLanguage('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {entries.map((entry) => {
            const isPlaying = playingWordId === entry.id;

            return (
              <div
                key={entry.id}
                className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs hover:border-emerald-600/40 hover:shadow-md transition-all space-y-4"
              >
                {/* Top row: Language badge, Category, and Verified seal */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        entry.language === 'ibibio'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {entry.language === 'ibibio' ? 'Ibibio' : 'Efik'}
                    </span>
                    <span className="text-xs text-stone-400 capitalize">{entry.category}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Entry</span>
                  </div>
                </div>

                {/* Main Word & Pronunciation Play button */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight font-display">
                      {entry.word}
                    </h3>
                    <p className="text-xs text-stone-500 font-mono mt-0.5">
                      /{entry.phonetic}/
                    </p>
                  </div>

                  {/* Audio Button */}
                  <button
                    onClick={() => handlePlayAudio(entry)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isPlaying
                        ? 'bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-300'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                    title="Play indigenous pronunciation"
                    aria-label={`Play pronunciation for ${entry.word}`}
                  >
                    <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                  </button>
                </div>

                {/* Translation & Definition */}
                <div className="space-y-1">
                  <p className="text-sm font-bold text-stone-900">
                    {entry.translation}
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {entry.definition}
                  </p>
                </div>

                {/* Example sentence with interpretation */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span>Example Usage</span>
                    <span>Tones: {entry.tone_notes}</span>
                  </div>
                  <p className="font-semibold text-emerald-900">
                    &quot;{entry.example_sentence}&quot;
                  </p>
                  <p className="text-stone-500 italic">
                    &quot;{entry.example_translation}&quot;
                  </p>
                </div>

                {/* AI Linguistic Analysis Trigger */}
                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={() => handleRequestAiExplanation(entry)}
                    className="text-xs font-semibold text-stone-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Linguistic Context &amp; Dialect Notes</span>
                  </button>
                  <span className="text-[10px] text-stone-400">Lower Cross River Dialect</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Context Modal / Drawer */}
      {activeAiExplain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-bold text-stone-900 font-display">
                  Linguistic Analysis: {activeAiExplain.entry.word}
                </h3>
              </div>
              <button
                onClick={() => setActiveAiExplain(null)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mandatory Unverified AI Disclaimer Badge */}
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">AI-Assisted Educational Analysis</p>
                <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                  This linguistic commentary is generated by Google Gemini to provide cultural context and comparative dialect nuances. It is not an officially verified linguistic dictionary record.
                </p>
              </div>
            </div>

            {activeAiExplain.loading && (
              <div className="py-8 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 text-emerald-700 animate-spin" />
                <p className="text-xs text-stone-500">Consulting linguistic knowledge base...</p>
              </div>
            )}

            {activeAiExplain.error && (
              <div className="p-4 bg-rose-50 text-rose-800 rounded-xl text-xs">
                {activeAiExplain.error}
              </div>
            )}

            {activeAiExplain.data && (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Etymology &amp; Root Origin</h4>
                  <p className="text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {activeAiExplain.data.etymology}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Cultural Context &amp; Traditional Usage</h4>
                  <p className="text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {activeAiExplain.data.cultural_context}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Comparative Cognate Analysis</h4>
                  <p className="text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {activeAiExplain.data.cognate_comparison}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Tonal Pitch Guidance</h4>
                  <p className="text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {activeAiExplain.data.tonal_guide}
                  </p>
                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={() => setActiveAiExplain(null)}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Close Analysis
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
