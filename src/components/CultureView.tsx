import React from 'react';
import { playIndigenousTone } from '../utils/audio';
import { Volume2, BookOpen, Compass, Shield, Sparkles, Heart } from 'lucide-react';

export const CultureView: React.FC = () => {
  const proverbs = [
    {
      indigenous: 'Usem nnyin edi uyo mbuk nnyin.',
      english: 'Our language is the voice of our history.',
      language: 'Ibibio & Efik',
      explanation: 'Speech is considered the living vessel of ancestry and community memory.',
    },
    {
      indigenous: 'Owo idaha kiet ibọp ufọk.',
      english: 'One person alone cannot build a house.',
      language: 'Ibibio proverb',
      explanation: 'Emphasizes communal cooperation, collective village labor, and family unity.',
    },
    {
      indigenous: 'Ifiọk edi odudu mbon eset.',
      english: 'Knowledge is the ancient strength.',
      language: 'Efik proverb',
      explanation: 'Traditional counsel encouraging the youth to master history and wisdom from elders.',
    },
    {
      indigenous: 'Eyen eka edi ufan toto ke emana.',
      english: 'A sibling is a friend from birth.',
      language: 'Ibibio & Efik',
      explanation: 'Highlights the sacred bond between brothers and sisters in the extended compound.',
    },
  ];

  const nsibidiSymbols = [
    {
      name: 'Ima (Love / Mutual Affection)',
      symbolText: '☍☌',
      description: 'Two interlocking spiral paths signifying two souls walking together in courtship and harmony.',
      culturalContext: 'Traditionally inscribed on bridal Ukara cloths during marital celebrations.',
    },
    {
      name: 'Emem (Peace & Reconciliation)',
      symbolText: '⨁',
      description: 'A circle divided into harmonious quadrants, signifying peaceful assembly and dispute settlement.',
      culturalContext: 'Used by village elders during council gatherings to signal a truce or pact.',
    },
    {
      name: 'Ekpe (Leopard Authority & Valor)',
      symbolText: '⌘',
      description: 'Stylized leopard paw and whiskers representing moral justice, leadership, and protection.',
      culturalContext: 'Central insignia of the venerable Ekpe governing fraternity across the Cross River basin.',
    },
    {
      name: 'Eku (Community Gathering / Unity)',
      symbolText: '⧉',
      description: 'Interwoven geometric rectangular lines showing houses gathered around the central square.',
      culturalContext: 'Symbol of collective responsibility in town planning and village defence.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <span>Indigenous Literacy &amp; Heritage</span>
          <span aria-hidden="true">·</span>
          <span>Akwa Ibom &amp; Cross River</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-display">
          Nsibidi Script &amp; Cultural Heritage
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          The Ibibio and Efik languages are inseparable from their profound historical institutions, ancient pictographic systems, and courtly arts.
        </p>
      </div>

      {/* Featured Section: Nsibidi Pictographic Script */}
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
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Ancient Indigenous Script</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
            The Ancient Nsibidi System of Writing
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Long before Latin alphabets were introduced to West Africa, the peoples of the Cross River basin developed <strong>Nsibidi</strong>—an ideographic and pictographic script dating back centuries. Recorded on indigo-dyed Ukara cloth, sacred monoliths (Ikom monoliths), pottery, and wooden staffs, Nsibidi communicated legal decisions, romantic alliances, and spiritual wisdom.
          </p>
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold">Cultural Revitalization Importance:</p>
            <p className="leading-relaxed">
              By learning Ibibio and Efik alongside their historic Nsibidi symbols, learners reconnect with an indigenous tradition of literacy that predates colonization.
            </p>
          </div>
        </div>
      </div>

      {/* Nsibidi Symbols Explorer */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
          Key Nsibidi Concepts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nsibidiSymbols.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl font-bold">
                {item.symbolText}
              </div>
              <h3 className="text-sm font-bold text-stone-900 font-display">{item.name}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
              <div className="pt-2 text-[11px] text-stone-400 border-t border-stone-100">
                {item.culturalContext}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Linguistic Comparison: Ibibio vs Efik */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Linguistic Relationship
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
            Ibibio &amp; Efik: Sister Tongues of Lower Cross River
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Ibibio (spoken primarily in Akwa Ibom) and Efik (the historic trade and literary language of Calabar, Cross River) share more than 85% lexical similarity and belong to the Lower Cross branch of the Benue-Congo language family.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700 space-y-3">
            <h3 className="text-base font-bold text-emerald-400 font-display">Ibibio Dialect Highlights</h3>
            <ul className="text-xs text-stone-300 space-y-2 leading-relaxed">
              <li>· <strong>Akwa Ibom Homeland:</strong> Spoken by over 10 million people across Uyo, Ikot Ekpene, and Eket.</li>
              <li>· <strong>Morning Salutation:</strong> &quot;Emesiere&quot; (wishing a bright dawn).</li>
              <li>· <strong>Phonology:</strong> Strong preservation of open vowel harmony and vibrant verbal prefixes.</li>
              <li>· <strong>Cuisine &amp; Earth:</strong> Deep connection to Afang soup, raffia palm wine, and agricultural cycles.</li>
            </ul>
          </div>

          <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700 space-y-3">
            <h3 className="text-base font-bold text-amber-400 font-display">Efik Dialect Highlights</h3>
            <ul className="text-xs text-stone-300 space-y-2 leading-relaxed">
              <li>· <strong>Calabar Maritime &amp; Royal Center:</strong> Historic court language of the Obong of Calabar.</li>
              <li>· <strong>Morning Salutation:</strong> &quot;Mmesiere&quot; and general greeting &quot;Mọkọm&quot;.</li>
              <li>· <strong>Literary Legacy:</strong> One of the earliest codified Nigerian written languages with standardized orthography.</li>
              <li>· <strong>Cuisine &amp; Regalia:</strong> Birthplace of royal Edikang Ikong soup, Ekpe leopard masking, and Calabar festival.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Traditional Proverbs Section with Audio */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
            Indigenous Proverbs of Wisdom
          </h2>
          <p className="text-xs text-stone-500">
            Proverbs are the palm oil with which words are eaten. Listen to traditional sayings:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proverbs.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {item.language}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 font-display text-emerald-950">
                    &quot;{item.indigenous}&quot;
                  </h3>
                  <p className="text-xs font-semibold text-stone-700">
                    &quot;{item.english}&quot;
                  </p>
                </div>

                <button
                  onClick={() => playIndigenousTone(item.indigenous)}
                  className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-all cursor-pointer shrink-0"
                  title="Listen to proverb cadence"
                  aria-label="Listen to proverb cadence"
                >
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                </button>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed border-t border-stone-100 pt-2">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
