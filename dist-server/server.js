// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

// src/data/seedData.ts
var VERIFIED_DICTIONARY = [
  // --- GREETINGS & INTRODUCTIONS ---
  {
    id: "dict-1",
    word: "Emesiere",
    phonetic: "eh-meh-see-eh-reh",
    language: "ibibio",
    translation: "Good morning",
    definition: "Traditional morning greeting in Ibibio, wishing the dawn to bring good light and wellness.",
    category: "greetings",
    example_sentence: "Emesiere, ete mi!",
    example_translation: "Good morning, my father!",
    tone_notes: "High tone on first syllable, falling tone on the last.",
    verification_status: "verified"
  },
  {
    id: "dict-2",
    word: "M\u1ECDk\u1ECDm",
    phonetic: "moh-kohm",
    language: "efik",
    translation: "I greet you / Hello",
    definition: "General respectful salutation used across Efik speaking communities to acknowledge someone.",
    category: "greetings",
    example_sentence: "M\u1ECDk\u1ECDm o, mb\u1ECDk di n\u0304kp\u1ECD.",
    example_translation: "Hello, please come over.",
    tone_notes: "Mid-high tone.",
    verification_status: "verified"
  },
  {
    id: "dict-3",
    word: "Mmesiere",
    phonetic: "mmeh-see-eh-reh",
    language: "efik",
    translation: "Good morning",
    definition: "Efik morning salutation, response to morning awakening (literally: you have awakened into dawn).",
    category: "greetings",
    example_sentence: "Mmesiere n\u0304wan mi.",
    example_translation: "Good morning, my wife.",
    tone_notes: "High-mid tone.",
    verification_status: "verified"
  },
  {
    id: "dict-4",
    word: "Idem mfo?",
    phonetic: "ee-dehm m-foh",
    language: "ibibio",
    translation: "How are you? (literally: How is your body?)",
    definition: "Inquiry into general wellbeing, health, and spirit of the listener in Ibibio.",
    category: "greetings",
    example_sentence: "Eyeneka mi, idem mfo?",
    example_translation: "My sibling, how are you?",
    tone_notes: "Low-high rising tone.",
    verification_status: "verified"
  },
  {
    id: "dict-5",
    word: "Idem mi \u1ECDs\u1ECDn\u0304",
    phonetic: "ee-dehm mee oh-sohn",
    language: "efik",
    translation: "I am fine / I am strong",
    definition: 'Standard positive response to "Idem mfo?". Means literally "My body is strong".',
    category: "greetings",
    example_sentence: "Idem mi \u1ECDs\u1ECDn\u0304, sos\u1ECD\xF1\u1ECD.",
    example_translation: "I am fine, thank you.",
    tone_notes: "Mid tone on idem, high prolonged nasal tone on \u1ECDs\u1ECDn\u0304.",
    verification_status: "verified"
  },
  {
    id: "dict-6",
    word: "Sos\u1ECD\xF1\u1ECD",
    phonetic: "soh-sohn-yoh",
    language: "ibibio",
    translation: "Thank you",
    definition: "Expression of gratitude and appreciation in Ibibio and Efik cultures.",
    category: "expressions",
    example_sentence: "Sos\u1ECD\xF1\u1ECD eti-eti ke unwam fo.",
    example_translation: "Thank you very much for your help.",
    tone_notes: "Mid-high-low cadence.",
    verification_status: "verified"
  },
  {
    id: "dict-7",
    word: "Mb\u1ECDk",
    phonetic: "m-bohk",
    language: "efik",
    translation: "Please / I beg you",
    definition: "Polite particle used to prefix or soften requests and entreaties.",
    category: "expressions",
    example_sentence: "Mb\u1ECDk n\u1ECD mi mm\u1ECD\xF1.",
    example_translation: "Please give me water.",
    tone_notes: "Low falling tone on closed vowel.",
    verification_status: "verified"
  },
  {
    id: "dict-8",
    word: "Sangakare",
    phonetic: "sahn-gah-kah-reh",
    language: "ibibio",
    translation: "Safe journey / Walk safely / Farewell",
    definition: "Parting blessing spoken to someone setting off on a voyage or leaving home.",
    category: "expressions",
    example_sentence: "Ka sangakare, Abasi akpeme fi.",
    example_translation: "Go safely, may God protect you.",
    tone_notes: "Smooth mid-rising cadence.",
    verification_status: "verified"
  },
  // --- FAMILY & RELATIONSHIPS ---
  {
    id: "dict-9",
    word: "Ete",
    phonetic: "eh-teh",
    language: "ibibio",
    translation: "Father",
    definition: "Paternal parent or respectful title for an elder man.",
    category: "family",
    example_sentence: "Ete mi amakpa utom ke urua.",
    example_translation: "My father finished work at the market.",
    tone_notes: "High-mid tone.",
    verification_status: "verified"
  },
  {
    id: "dict-10",
    word: "Eka",
    phonetic: "eh-kah",
    language: "efik",
    translation: "Mother",
    definition: "Maternal parent or affectionate title of honor for a matriarch.",
    category: "family",
    example_sentence: "Eka mi etem edikang ikong.",
    example_translation: "My mother is cooking edikang ikong soup.",
    tone_notes: "High-low tone.",
    verification_status: "verified"
  },
  {
    id: "dict-11",
    word: "Eyen",
    phonetic: "eh-yehn",
    language: "ibibio",
    translation: "Child / Offspring",
    definition: "A child, son, or daughter; also used to denote a native of a community.",
    category: "family",
    example_sentence: "Eyen emi edi owo nti.",
    example_translation: "This child is a good person.",
    tone_notes: "Mid tone.",
    verification_status: "verified"
  },
  {
    id: "dict-12",
    word: "Eyeneka",
    phonetic: "eh-yeh-neh-kah",
    language: "efik",
    translation: "Sibling (Brother or Sister)",
    definition: `Compound word from "eyen" (child) and "eka" (mother), meaning mother's child / sibling.`,
    category: "family",
    example_sentence: "Eyeneka mi owo Calabar edi.",
    example_translation: "My sibling is from Calabar.",
    tone_notes: "Level high tone on suffix.",
    verification_status: "verified"
  },
  {
    id: "dict-13",
    word: "N\u0304wan",
    phonetic: "n-wahn",
    language: "ibibio",
    translation: "Woman / Wife",
    definition: "An adult female or spouse.",
    category: "family",
    example_sentence: "N\u0304wan esie asan\u0304a ye inemesit.",
    example_translation: "His wife walks with happiness.",
    tone_notes: "Nasal glide with falling tone.",
    verification_status: "verified"
  },
  {
    id: "dict-14",
    word: "Ebe",
    phonetic: "eh-beh",
    language: "efik",
    translation: "Husband",
    definition: "Male partner in marriage.",
    category: "family",
    example_sentence: "Ebe mi enyene ima.",
    example_translation: "My husband has love.",
    tone_notes: "Mid tone.",
    verification_status: "verified"
  },
  // --- NUMBERS & COUNTING ---
  {
    id: "dict-15",
    word: "Kiet",
    phonetic: "kee-eht",
    language: "ibibio",
    translation: "One (1)",
    definition: "Cardinal number one in Ibibio and Efik numeration.",
    category: "numbers",
    example_sentence: "M\u1ECDnyene nwed kiet.",
    example_translation: "I have one book.",
    tone_notes: "Sharp high tone.",
    verification_status: "verified"
  },
  {
    id: "dict-16",
    word: "Iba",
    phonetic: "ee-bah",
    language: "efik",
    translation: "Two (2)",
    definition: "Cardinal number two.",
    category: "numbers",
    example_sentence: "Nyen mme eyen iba.",
    example_translation: "I have two children.",
    tone_notes: "Low-high tone.",
    verification_status: "verified"
  },
  {
    id: "dict-17",
    word: "Ita",
    phonetic: "ee-tah",
    language: "ibibio",
    translation: "Three (3)",
    definition: "Cardinal number three.",
    category: "numbers",
    example_sentence: "Iyak ita ke us\u1ECDr\u1ECD.",
    example_translation: "Three fish for the festival.",
    tone_notes: "Low-high tone.",
    verification_status: "verified"
  },
  {
    id: "dict-18",
    word: "Inan",
    phonetic: "ee-nahn",
    language: "efik",
    translation: "Four (4)",
    definition: "Cardinal number four.",
    category: "numbers",
    example_sentence: "Uf\u1ECDk inan ke efak emi.",
    example_translation: "Four houses in this street.",
    tone_notes: "Mid-high tone.",
    verification_status: "verified"
  },
  {
    id: "dict-19",
    word: "Itiokiet",
    phonetic: "ee-tyoh-kee-eht",
    language: "ibibio",
    translation: "Five (5)",
    definition: "Cardinal number five (formed as a base count).",
    category: "numbers",
    example_sentence: "Usen itiokiet ke urua.",
    example_translation: "Five days until market.",
    tone_notes: "Compound tone.",
    verification_status: "verified"
  },
  {
    id: "dict-20",
    word: "Duop",
    phonetic: "dwohp",
    language: "efik",
    translation: "Ten (10)",
    definition: "Cardinal number ten, basis of base-10 calculation.",
    category: "numbers",
    example_sentence: "Owo duop \u1EB9du ke mboho.",
    example_translation: "Ten people are in the gathering.",
    tone_notes: "Falling high tone.",
    verification_status: "verified"
  },
  // --- FOOD & OBJECTS ---
  {
    id: "dict-21",
    word: "Mm\u1ECD\xF1",
    phonetic: "m-mohn",
    language: "ibibio",
    translation: "Water",
    definition: "Vital liquid for drinking and domestic life.",
    category: "food",
    example_sentence: "N\u1ECD mi mm\u1ECD\xF1 n\u0304w\u1ECD\xF1.",
    example_translation: "Give me water to drink.",
    tone_notes: "High nasal resonance.",
    verification_status: "verified"
  },
  {
    id: "dict-22",
    word: "Udia",
    phonetic: "oo-dyah",
    language: "efik",
    translation: "Food / Meal",
    definition: "Nourishment or prepared dishes.",
    category: "food",
    example_sentence: "Udia emi anem eti-eti!",
    example_translation: "This food is very sweet / delicious!",
    tone_notes: "Mid-rising tone.",
    verification_status: "verified"
  },
  {
    id: "dict-23",
    word: "Edikang Ikong",
    phonetic: "eh-dee-kahng ee-kohng",
    language: "efik",
    translation: "Traditional vegetable soup",
    definition: "Celebrated royal Efik delicacy made with fluted pumpkin (ugwu) and waterleaves, meat, stockfish, and periwinkles.",
    category: "food",
    example_sentence: "Edikang Ikong edi ata udia Efik.",
    example_translation: "Edikang Ikong is the true food of Efik.",
    tone_notes: "Distinct rhythm and melodic tone.",
    verification_status: "verified"
  },
  {
    id: "dict-24",
    word: "Afang",
    phonetic: "ah-fahng",
    language: "ibibio",
    translation: "Afang leaf / Wild spinach soup",
    definition: "Iconic soup of Akwa Ibom made from pounded Gnetum africanum leaves and waterleaf.",
    category: "food",
    example_sentence: "Afang anem ye usung iyak.",
    example_translation: "Afang soup is delicious with fresh fish.",
    tone_notes: "Low-high tone.",
    verification_status: "verified"
  },
  {
    id: "dict-25",
    word: "Bia",
    phonetic: "bee-yah",
    language: "ibibio",
    translation: "Yam",
    definition: "Staple tuber central to harvest ceremonies in Ibibio land.",
    category: "food",
    example_sentence: "Iwa ye bia \u1EB9du ke urua.",
    example_translation: "Cassava and yam are in the market.",
    tone_notes: "High flat tone.",
    verification_status: "verified"
  },
  {
    id: "dict-26",
    word: "Uf\u1ECDk",
    phonetic: "oo-fohk",
    language: "efik",
    translation: "House / Home / Building",
    definition: "Dwelling place or familial compound.",
    category: "expressions",
    example_sentence: "Nka uf\u1ECDk idaha emi.",
    example_translation: "I am going home right now.",
    tone_notes: "Low tone on first, high on second.",
    verification_status: "verified"
  },
  {
    id: "dict-27",
    word: "Nwed",
    phonetic: "n-wehd",
    language: "ibibio",
    translation: "Book / Letter / Document",
    definition: "Any written paper or scroll of learning.",
    category: "expressions",
    example_sentence: "Kot nwed fo koro ifi\u1ECDk edi odudu.",
    example_translation: "Read your book because knowledge is power.",
    tone_notes: "Falling nasal tone.",
    verification_status: "verified"
  },
  // --- QUESTIONS & RESPONSES ---
  {
    id: "dict-28",
    word: "Nso?",
    phonetic: "n-soh",
    language: "ibibio",
    translation: "What?",
    definition: "Interrogative pronoun used to ask about an object, action, or event.",
    category: "questions",
    example_sentence: "Nso ke anam?",
    example_translation: "What are you doing?",
    tone_notes: "Sharp rising inflection.",
    verification_status: "verified"
  },
  {
    id: "dict-29",
    word: "Anie?",
    phonetic: "ah-nee-eh",
    language: "efik",
    translation: "Who?",
    definition: "Interrogative pronoun inquiring about an identity or person.",
    category: "questions",
    example_sentence: "Anie edi enye oro?",
    example_translation: "Who is that person?",
    tone_notes: "High-mid tone.",
    verification_status: "verified"
  },
  {
    id: "dict-30",
    word: "Mmong?",
    phonetic: "m-mohng",
    language: "efik",
    translation: "Where?",
    definition: "Interrogative asking for location or place.",
    category: "questions",
    example_sentence: "Aka mmong?",
    example_translation: "Where are you going?",
    tone_notes: "High-pitched question tone.",
    verification_status: "verified"
  },
  {
    id: "dict-31",
    word: "Ini ewe?",
    phonetic: "ee-nee eh-weh",
    language: "ibibio",
    translation: "When? (literally: What time?)",
    definition: "Inquiring regarding time or season.",
    category: "questions",
    example_sentence: "Ini ewe ke edi?",
    example_translation: "When will you arrive?",
    tone_notes: "Gentle cadence.",
    verification_status: "verified"
  },
  // --- CORE VERBS & CULTURAL NOTIONS ---
  {
    id: "dict-32",
    word: "Usem",
    phonetic: "oo-sehm",
    language: "ibibio",
    translation: "Language / Tongue / Speech",
    definition: "Spoken dialect, mother tongue, or faculty of speech.",
    category: "expressions",
    example_sentence: "Usem nnyin edi uyo mbuk nnyin.",
    example_translation: "Our language is the voice of our history.",
    tone_notes: "Mid tone.",
    verification_status: "verified"
  },
  {
    id: "dict-33",
    word: "Nnyin",
    phonetic: "n-nyeen",
    language: "efik",
    translation: "We / Us / Our",
    definition: "First-person plural pronoun expressing communal identity.",
    category: "expressions",
    example_sentence: "Usem nnyin anem.",
    example_translation: "Our language is beautiful.",
    tone_notes: "High-pitched nasal vowel.",
    verification_status: "verified"
  },
  {
    id: "dict-34",
    word: "Kpep",
    phonetic: "kpehp",
    language: "ibibio",
    translation: "Learn / Teach",
    definition: "To acquire knowledge or pass on wisdom.",
    category: "verbs",
    example_sentence: "Kpep usem Ibibio mfin.",
    example_translation: "Learn Ibibio language today.",
    tone_notes: "High explosive labiovelar consonant kp.",
    verification_status: "verified"
  },
  {
    id: "dict-35",
    word: "Ima",
    phonetic: "ee-mah",
    language: "efik",
    translation: "Love / Affection",
    definition: "Deep emotional care, harmony, and goodwill toward another.",
    category: "expressions",
    example_sentence: "Ima edi n\u0304kp\u1ECD akpan.",
    example_translation: "Love is a vital thing.",
    tone_notes: "High-mid tone.",
    verification_status: "verified"
  },
  {
    id: "dict-36",
    word: "Emem",
    phonetic: "eh-mehm",
    language: "ibibio",
    translation: "Peace / Serenity",
    definition: "Tranquility, absence of strife in village or family.",
    category: "expressions",
    example_sentence: "Emem odu ye mbufo.",
    example_translation: "Peace be with you all.",
    tone_notes: "Mid-low-mid tone.",
    verification_status: "verified"
  },
  {
    id: "dict-37",
    word: "Ekpe",
    phonetic: "eh-kpeh",
    language: "efik",
    translation: "Leopard / Ekpe Secret Society",
    definition: "The sacred Leopard spirit and renowned ancient governance institution of the Efik and Cross River peoples.",
    category: "nature",
    example_sentence: "Ekpe edi ata odudu ke mboho Efik.",
    example_translation: "Ekpe is a profound authority in Efik society.",
    tone_notes: "Low-high tone.",
    verification_status: "verified"
  },
  {
    id: "dict-38",
    word: "Nsibidi",
    phonetic: "n-see-bee-dee",
    language: "efik",
    translation: "Nsibidi Ancient Pictographic Script",
    definition: "Indigenous pictographic and ideographic writing system created by Cross River cultures centuries prior to European contact.",
    category: "expressions",
    example_sentence: "Nsibidi edi n\u0304wed mbon eset.",
    example_translation: "Nsibidi is the writing system of the ancient ones.",
    tone_notes: "Four rapid alternating tones.",
    verification_status: "verified"
  }
];
var LESSONS_DATABASE = [
  // ==========================================
  // IBIBIO LESSONS (7 MODULES)
  // ==========================================
  {
    id: "ibi-mod-1",
    language: "ibibio",
    module_number: 1,
    module_name: "Greetings & Introductions",
    title: "First Hellos & Morning Smiles",
    indigenous_title: "Ek\u1ECDm ye Emed\u1ECDk",
    description: "Master daily greetings, asking how someone is doing, and polite morning responses in Ibibio.",
    difficulty: "beginner",
    order: 1,
    xp_reward: 25,
    exercises: [
      {
        id: "ibi-ex-101",
        lesson_id: "ibi-mod-1",
        exercise_type: "multiple_choice",
        prompt: "How do you greet someone in the morning in Ibibio?",
        options: ["Emesiere", "Sangakare", "Udia", "Kiet"],
        correct_answer: "Emesiere",
        explanation: '"Emesiere" is the traditional morning greeting in Ibibio, wishing someone a blessed dawn.'
      },
      {
        id: "ibi-ex-102",
        lesson_id: "ibi-mod-1",
        exercise_type: "word_match",
        prompt: "Match the Ibibio greetings with their English meanings:",
        pairs: [
          { indigenous: "Emesiere", english: "Good morning" },
          { indigenous: "Sos\u1ECD\xF1\u1ECD", english: "Thank you" },
          { indigenous: "Mb\u1ECDk", english: "Please" },
          { indigenous: "Sangakare", english: "Safe journey" }
        ],
        correct_answer: "all",
        explanation: "Essential courtesy words are foundational to respectful conversation in Akwa Ibom."
      },
      {
        id: "ibi-ex-103",
        lesson_id: "ibi-mod-1",
        exercise_type: "fill_blank",
        prompt: 'Fill in the blank to ask "How are you?" in Ibibio:',
        blank_sentence: "___ mfo?",
        options: ["Idem", "Uf\u1ECDk", "Eyen", "Mm\u1ECD\xF1"],
        correct_answer: "Idem",
        explanation: '"Idem mfo?" literally asks "How is your body?", reflecting holistic wellbeing.'
      },
      {
        id: "ibi-ex-104",
        lesson_id: "ibi-mod-1",
        exercise_type: "sentence_reorder",
        prompt: 'Arrange the words to say: "Thank you very much"',
        scrambled_words: ["eti-eti", "Sos\u1ECD\xF1\u1ECD"],
        correct_answer: ["Sos\u1ECD\xF1\u1ECD", "eti-eti"],
        explanation: '"Sos\u1ECD\xF1\u1ECD eti-eti" translates to "Thank you very much".'
      },
      {
        id: "ibi-ex-105",
        lesson_id: "ibi-mod-1",
        exercise_type: "listening",
        prompt: "Listen to the audio and select what it means in English:",
        audio_text: "Sangakare",
        options: ["Walk safely / Goodbye", "Good evening", "Eat food", "Where are you?"],
        correct_answer: "Walk safely / Goodbye",
        explanation: '"Sangakare" wishes safe steps to someone leaving.'
      }
    ]
  },
  {
    id: "ibi-mod-2",
    language: "ibibio",
    module_number: 2,
    module_name: "Family & Relationships",
    title: "Kinship & The Household",
    indigenous_title: "Mbon Uf\u1ECDk",
    description: "Learn words for father, mother, siblings, and family bonds in Ibibio.",
    difficulty: "beginner",
    order: 2,
    xp_reward: 30,
    exercises: [
      {
        id: "ibi-ex-201",
        lesson_id: "ibi-mod-2",
        exercise_type: "multiple_choice",
        prompt: 'What is the Ibibio word for "Father"?',
        options: ["Ete", "Eka", "Eyen", "Ebe"],
        correct_answer: "Ete",
        explanation: '"Ete" denotes father or elder male figure in the community.'
      },
      {
        id: "ibi-ex-202",
        lesson_id: "ibi-mod-2",
        exercise_type: "word_match",
        prompt: "Match each family role with its translation:",
        pairs: [
          { indigenous: "Eka", english: "Mother" },
          { indigenous: "Eyen", english: "Child" },
          { indigenous: "Ete", english: "Father" },
          { indigenous: "Eyeneka", english: "Sibling" }
        ],
        correct_answer: "all",
        explanation: "Family is the cornerstone of communal life in Ibibio society."
      },
      {
        id: "ibi-ex-203",
        lesson_id: "ibi-mod-2",
        exercise_type: "sentence_reorder",
        prompt: 'Assemble the sentence: "My father is at home"',
        scrambled_words: ["uf\u1ECDk", "Ete", "ke", "mi", "odu"],
        correct_answer: ["Ete", "mi", "odu", "ke", "uf\u1ECDk"],
        explanation: '"Ete mi odu ke uf\u1ECDk" translates to "My father is in the house".'
      }
    ]
  },
  {
    id: "ibi-mod-3",
    language: "ibibio",
    module_number: 3,
    module_name: "Numbers & Counting",
    title: "Counting from 1 to 5",
    indigenous_title: "Ibat Esit",
    description: "Learn to count everyday items and money with cardinal numbers.",
    difficulty: "beginner",
    order: 3,
    xp_reward: 30,
    exercises: [
      {
        id: "ibi-ex-301",
        lesson_id: "ibi-mod-3",
        exercise_type: "multiple_choice",
        prompt: 'Which number is "Iba"?',
        options: ["2", "1", "4", "5"],
        correct_answer: "2",
        explanation: "Kiet = 1, Iba = 2, Ita = 3, Inan = 4, Itiokiet = 5."
      },
      {
        id: "ibi-ex-302",
        lesson_id: "ibi-mod-3",
        exercise_type: "word_match",
        prompt: "Match the Ibibio numbers to numerals:",
        pairs: [
          { indigenous: "Kiet", english: "One (1)" },
          { indigenous: "Iba", english: "Two (2)" },
          { indigenous: "Ita", english: "Three (3)" },
          { indigenous: "Inan", english: "Four (4)" }
        ],
        correct_answer: "all",
        explanation: "Counting builds foundation for market transactions."
      },
      {
        id: "ibi-ex-303",
        lesson_id: "ibi-mod-3",
        exercise_type: "fill_blank",
        prompt: "Complete the sequence: Kiet, Iba, ___, Inan",
        blank_sentence: "Kiet, Iba, ___, Inan",
        options: ["Ita", "Duop", "Bia", "Urua"],
        correct_answer: "Ita",
        explanation: '"Ita" represents the number three (3).'
      }
    ]
  },
  {
    id: "ibi-mod-4",
    language: "ibibio",
    module_number: 4,
    module_name: "Food & Everyday Objects",
    title: "The Table & Hearth",
    indigenous_title: "Udia ye N\u0304kp\u1ECD Uf\u1ECDk",
    description: "Discover staple foods, water, and household vessels.",
    difficulty: "basic",
    order: 4,
    xp_reward: 35,
    exercises: [
      {
        id: "ibi-ex-401",
        lesson_id: "ibi-mod-4",
        exercise_type: "multiple_choice",
        prompt: 'What is the Ibibio word for "Water"?',
        options: ["Mm\u1ECD\xF1", "Udia", "Bia", "Iyak"],
        correct_answer: "Mm\u1ECD\xF1",
        explanation: '"Mm\u1ECD\xF1" is water; "Mm\u1ECD\xF1 n\u0304w\u1ECD\xF1" means drinking water.'
      },
      {
        id: "ibi-ex-402",
        lesson_id: "ibi-mod-4",
        exercise_type: "fill_blank",
        prompt: 'Complete the sentence: "Afang ___ ye iyak."',
        blank_sentence: "Afang ___ ye iyak.",
        options: ["anem", "edi", "kpep", "san\u0304a"],
        correct_answer: "anem",
        explanation: '"Anem" means tasty, sweet, or pleasant.'
      },
      {
        id: "ibi-ex-403",
        lesson_id: "ibi-mod-4",
        exercise_type: "sentence_reorder",
        prompt: 'Form the sentence: "Give me water"',
        scrambled_words: ["mm\u1ECD\xF1", "N\u1ECD", "mi"],
        correct_answer: ["N\u1ECD", "mi", "mm\u1ECD\xF1"],
        explanation: '"N\u1ECD mi mm\u1ECD\xF1" is the standard respectful way to ask for water.'
      }
    ]
  },
  {
    id: "ibi-mod-5",
    language: "ibibio",
    module_number: 5,
    module_name: "Common Expressions",
    title: "Wisdom & Polite Idioms",
    indigenous_title: "Mme Nsio-nsio Ik\u1ECD",
    description: "Speak with cultural grace, etiquette, and clarity.",
    difficulty: "basic",
    order: 5,
    xp_reward: 35,
    exercises: [
      {
        id: "ibi-ex-501",
        lesson_id: "ibi-mod-5",
        exercise_type: "multiple_choice",
        prompt: 'What does "Mb\u1ECDk" mean in conversation?',
        options: ["Please", "Run", "No", "Tomorrow"],
        correct_answer: "Please",
        explanation: '"Mb\u1ECDk" softens any request and displays good upbringing.'
      },
      {
        id: "ibi-ex-502",
        lesson_id: "ibi-mod-5",
        exercise_type: "word_match",
        prompt: "Match the idiomatic expressions:",
        pairs: [
          { indigenous: "Emem", english: "Peace" },
          { indigenous: "Inemesit", english: "Joy / Happiness" },
          { indigenous: "Ima", english: "Love" },
          { indigenous: "Usem", english: "Language" }
        ],
        correct_answer: "all",
        explanation: "Core cultural virtues of Akwa Ibom people."
      }
    ]
  },
  {
    id: "ibi-mod-6",
    language: "ibibio",
    module_number: 6,
    module_name: "Questions & Responses",
    title: 'Asking "What", "Who", and "Where"',
    indigenous_title: "Mbume ye Ib\u1ECDr\u1ECD",
    description: "Learn to ask essential questions during travels and visits.",
    difficulty: "intermediate",
    order: 6,
    xp_reward: 40,
    exercises: [
      {
        id: "ibi-ex-601",
        lesson_id: "ibi-mod-6",
        exercise_type: "multiple_choice",
        prompt: 'Which word means "What?" in Ibibio?',
        options: ["Nso?", "Anie?", "Ini ewe?", "Mmong?"],
        correct_answer: "Nso?",
        explanation: '"Nso?" is the interrogative pronoun for "What?".'
      },
      {
        id: "ibi-ex-602",
        lesson_id: "ibi-mod-6",
        exercise_type: "sentence_reorder",
        prompt: 'Ask: "What are you doing?"',
        scrambled_words: ["ke", "anam?", "Nso"],
        correct_answer: ["Nso", "ke", "anam?"],
        explanation: '"Nso ke anam?" means "What are you doing?".'
      }
    ]
  },
  {
    id: "ibi-mod-7",
    language: "ibibio",
    module_number: 7,
    module_name: "Everyday Conversations",
    title: "At Uyo Market & Village Gathering",
    indigenous_title: "Nneme Urua ye Idung",
    description: "Combine vocabulary into fluent dialogue for market trading and social visits.",
    difficulty: "intermediate",
    order: 7,
    xp_reward: 50,
    exercises: [
      {
        id: "ibi-ex-701",
        lesson_id: "ibi-mod-7",
        exercise_type: "multiple_choice",
        prompt: 'How do you say "Our language is sweet" in Ibibio?',
        options: ["Usem nnyin anem", "Ete mi odu", "Udia emi \u1ECDkp\u1ECDs\u1ECDn\u0304", "Ka sangakare"],
        correct_answer: "Usem nnyin anem",
        explanation: '"Usem nnyin anem" celebrates the musicality of our indigenous tongue.'
      },
      {
        id: "ibi-ex-702",
        lesson_id: "ibi-mod-7",
        exercise_type: "sentence_reorder",
        prompt: 'Assemble: "I am learning Ibibio language today"',
        scrambled_words: ["Ibibio", "usem", "kpep", "mfin", "Mm\u1ECD"],
        correct_answer: ["Mm\u1ECD", "kpep", "usem", "Ibibio", "mfin"],
        explanation: '"Mm\u1ECD kpep usem Ibibio mfin" means "I am learning Ibibio language today".'
      }
    ]
  },
  // ==========================================
  // EFIK LESSONS (7 MODULES)
  // ==========================================
  {
    id: "efi-mod-1",
    language: "efik",
    module_number: 1,
    module_name: "Greetings & Introductions",
    title: "Calabar Welcomes & Salutations",
    indigenous_title: "Ek\u1ECDm ye Emed\u1ECDk ke Efik",
    description: "Master the polite greetings and responses of Calabar and Cross River.",
    difficulty: "beginner",
    order: 1,
    xp_reward: 25,
    exercises: [
      {
        id: "efi-ex-101",
        lesson_id: "efi-mod-1",
        exercise_type: "multiple_choice",
        prompt: 'What is the standard greeting "I greet you / Hello" in Efik?',
        options: ["M\u1ECDk\u1ECDm", "Emesiere", "Edikang", "Ekpe"],
        correct_answer: "M\u1ECDk\u1ECDm",
        explanation: '"M\u1ECDk\u1ECDm" is the beloved daily greeting in Calabar and Efik communities.'
      },
      {
        id: "efi-ex-102",
        lesson_id: "efi-mod-1",
        exercise_type: "fill_blank",
        prompt: 'When asked "Idem mfo?", how do you respond "I am fine / strong"?',
        blank_sentence: "Idem mi ___.",
        options: ["\u1ECDs\u1ECDn\u0304", "kiet", "afang", "nsibidi"],
        correct_answer: "\u1ECDs\u1ECDn\u0304",
        explanation: '"Idem mi \u1ECDs\u1ECDn\u0304" expresses that your body and health are intact and robust.'
      },
      {
        id: "efi-ex-103",
        lesson_id: "efi-mod-1",
        exercise_type: "word_match",
        prompt: "Match the Efik phrases to their English meanings:",
        pairs: [
          { indigenous: "Mmesiere", english: "Good morning" },
          { indigenous: "M\u1ECDk\u1ECDm", english: "Hello" },
          { indigenous: "Sos\u1ECD\xF1\u1ECD", english: "Thank you" },
          { indigenous: "Mb\u1ECDk", english: "Please" }
        ],
        correct_answer: "all",
        explanation: "Efik speech is known for its poetic cadence and courtly respect."
      },
      {
        id: "efi-ex-104",
        lesson_id: "efi-mod-1",
        exercise_type: "listening",
        prompt: 'Listen to the audio and pick the meaning of "Sos\u1ECD\xF1\u1ECD":',
        audio_text: "Sos\u1ECD\xF1\u1ECD",
        options: ["Thank you", "Goodbye", "Where is it?", "Come here"],
        correct_answer: "Thank you",
        explanation: '"Sos\u1ECD\xF1\u1ECD" is thank you in both Efik and Ibibio.'
      }
    ]
  },
  {
    id: "efi-mod-2",
    language: "efik",
    module_number: 2,
    module_name: "Family & Relationships",
    title: "The Calabar Household",
    indigenous_title: "Mbon Uf\u1ECDk Efik",
    description: "Learn terms for mother, father, children, and spouses in Efik.",
    difficulty: "beginner",
    order: 2,
    xp_reward: 30,
    exercises: [
      {
        id: "efi-ex-201",
        lesson_id: "efi-mod-2",
        exercise_type: "multiple_choice",
        prompt: 'What does "Eka" mean in Efik?',
        options: ["Mother", "Father", "Brother", "Friend"],
        correct_answer: "Mother",
        explanation: '"Eka" means mother; "Eka-eka" refers to grandmother.'
      },
      {
        id: "efi-ex-202",
        lesson_id: "efi-mod-2",
        exercise_type: "sentence_reorder",
        prompt: 'Say: "My mother is cooking food"',
        scrambled_words: ["udia", "Eka", "etem", "mi"],
        correct_answer: ["Eka", "mi", "etem", "udia"],
        explanation: '"Eka mi etem udia" translates directly to "My mother is cooking food".'
      }
    ]
  },
  {
    id: "efi-mod-3",
    language: "efik",
    module_number: 3,
    module_name: "Numbers & Counting",
    title: "Counting in Efik: 1 to 10",
    indigenous_title: "Ibat ke Usem Efik",
    description: "Master numbers up to ten for trade, time, and quantities.",
    difficulty: "beginner",
    order: 3,
    xp_reward: 30,
    exercises: [
      {
        id: "efi-ex-301",
        lesson_id: "efi-mod-3",
        exercise_type: "multiple_choice",
        prompt: 'Which number is "Duop"?',
        options: ["10", "5", "8", "2"],
        correct_answer: "10",
        explanation: '"Duop" is the cardinal number ten in Efik and Ibibio.'
      },
      {
        id: "efi-ex-302",
        lesson_id: "efi-mod-3",
        exercise_type: "word_match",
        prompt: "Match the numbers to their numerals:",
        pairs: [
          { indigenous: "Kiet", english: "1" },
          { indigenous: "Iba", english: "2" },
          { indigenous: "Ita", english: "3" },
          { indigenous: "Duop", english: "10" }
        ],
        correct_answer: "all",
        explanation: "Number prefixes follow rhythmic patterns in Cross River languages."
      }
    ]
  },
  {
    id: "efi-mod-4",
    language: "efik",
    module_number: 4,
    module_name: "Food & Everyday Objects",
    title: "The Royal Cuisines of Calabar",
    indigenous_title: "Udia Edikang Ikong ye N\u0304kp\u1ECD Uf\u1ECDk",
    description: "Learn about Edikang Ikong, fresh seafood, and traditional dishes.",
    difficulty: "basic",
    order: 4,
    xp_reward: 35,
    exercises: [
      {
        id: "efi-ex-401",
        lesson_id: "efi-mod-4",
        exercise_type: "multiple_choice",
        prompt: 'What is "Edikang Ikong"?',
        options: [
          "Celebrated vegetable soup of Calabar",
          "A musical drum",
          "A royal canoe",
          "A traditional greeting"
        ],
        correct_answer: "Celebrated vegetable soup of Calabar",
        explanation: "Edikang Ikong is world-famous as the centerpiece of Efik culinary heritage."
      },
      {
        id: "efi-ex-402",
        lesson_id: "efi-mod-4",
        exercise_type: "fill_blank",
        prompt: 'Complete: "N\u1ECD mi ___ n\u0304w\u1ECD\xF1."',
        blank_sentence: "N\u1ECD mi ___ n\u0304w\u1ECD\xF1.",
        options: ["mm\u1ECD\xF1", "bia", "ete", "ekpe"],
        correct_answer: "mm\u1ECD\xF1",
        explanation: '"Mm\u1ECD\xF1" means water, indispensable in every meal.'
      }
    ]
  },
  {
    id: "efi-mod-5",
    language: "efik",
    module_number: 5,
    module_name: "Common Expressions",
    title: "Grace & Social Customs",
    indigenous_title: "Uyo ye Mbuk Efik",
    description: "Express gratitude, wishes of goodwill, and respectful parting words.",
    difficulty: "basic",
    order: 5,
    xp_reward: 35,
    exercises: [
      {
        id: "efi-ex-501",
        lesson_id: "efi-mod-5",
        exercise_type: "multiple_choice",
        prompt: 'What does "Abasi akpeme fi" mean?',
        options: [
          "May God protect you",
          "What is your name?",
          "Eat well tonight",
          "Come back soon"
        ],
        correct_answer: "May God protect you",
        explanation: "A deep spiritual blessing spoken when blessing a loved one or departing guest."
      },
      {
        id: "efi-ex-502",
        lesson_id: "efi-mod-5",
        exercise_type: "word_match",
        prompt: "Match the cultural virtue words:",
        pairs: [
          { indigenous: "Ima", english: "Love" },
          { indigenous: "Emem", english: "Peace" },
          { indigenous: "Usem", english: "Language" },
          { indigenous: "Ifi\u1ECDk", english: "Wisdom / Knowledge" }
        ],
        correct_answer: "all",
        explanation: 'Knowledge ("Ifi\u1ECDk") and Love ("Ima") are celebrated values.'
      }
    ]
  },
  {
    id: "efi-mod-6",
    language: "efik",
    module_number: 6,
    module_name: "Questions & Responses",
    title: "Inquiries & Directions",
    indigenous_title: "Mbume ke Obio",
    description: 'Ask "Who is that?", "Where are you going?", and find your way.',
    difficulty: "intermediate",
    order: 6,
    xp_reward: 40,
    exercises: [
      {
        id: "efi-ex-601",
        lesson_id: "efi-mod-6",
        exercise_type: "multiple_choice",
        prompt: 'How do you ask "Where are you going?" in Efik?',
        options: ["Aka mmong?", "Nso ke anam?", "Anie edi enye?", "M\u1ECDk\u1ECDm o?"],
        correct_answer: "Aka mmong?",
        explanation: '"Aka" (you are going) + "mmong?" (where?) = "Aka mmong?".'
      },
      {
        id: "efi-ex-602",
        lesson_id: "efi-mod-6",
        exercise_type: "sentence_reorder",
        prompt: 'Form the question: "Who is that person?"',
        scrambled_words: ["enye", "Anie", "oro?", "edi"],
        correct_answer: ["Anie", "edi", "enye", "oro?"],
        explanation: '"Anie edi enye oro?" translates to "Who is that person?".'
      }
    ]
  },
  {
    id: "efi-mod-7",
    language: "efik",
    module_number: 7,
    module_name: "Everyday Conversations",
    title: "Calabar Carnival & Nsibidi Wisdom",
    indigenous_title: "Mbuk ye Nneme Efik",
    description: "Discuss art, ancient Nsibidi symbols, and community life in fluent phrases.",
    difficulty: "intermediate",
    order: 7,
    xp_reward: 50,
    exercises: [
      {
        id: "efi-ex-701",
        lesson_id: "efi-mod-7",
        exercise_type: "multiple_choice",
        prompt: "What was Nsibidi in ancient Cross River history?",
        options: [
          "An indigenous pictographic writing system",
          "A variety of pepper",
          "A royal brass necklace",
          "A wooden canoe"
        ],
        correct_answer: "An indigenous pictographic writing system",
        explanation: "Nsibidi is an ancient writing and symbolism system developed in south-eastern Nigeria long before modern alphabets."
      },
      {
        id: "efi-ex-702",
        lesson_id: "efi-mod-7",
        exercise_type: "sentence_reorder",
        prompt: 'Assemble: "Our language brings joy"',
        scrambled_words: ["inemesit", "ada", "Usem", "nnyin", "di"],
        correct_answer: ["Usem", "nnyin", "ada", "inemesit", "di"],
        explanation: '"Usem nnyin ada inemesit di" means "Our language brings joy".'
      }
    ]
  }
];
var ACHIEVEMENTS_DATABASE = [
  {
    id: "ach-first-lesson",
    title: "First Lesson",
    indigenous_title: "Akpa Ukpepn\u0304kp\u1ECD",
    description: "Completed your very first lesson on Usem Nnyin.",
    lessons_requirement: 1,
    badge_icon: "Sparkles",
    category: "lessons"
  },
  {
    id: "ach-first-100-xp",
    title: "Century of Wisdom",
    indigenous_title: "Ikot Ifi\u1ECDk 100",
    description: "Earned 100 total experience points (XP).",
    xp_requirement: 100,
    badge_icon: "Zap",
    category: "xp"
  },
  {
    id: "ach-three-day-streak",
    title: "Three-Day Streak",
    indigenous_title: "Usen Ita ke Mboho",
    description: "Practiced your indigenous language 3 consecutive days.",
    streak_requirement: 3,
    badge_icon: "Flame",
    category: "streak"
  },
  {
    id: "ach-seven-day-streak",
    title: "Seven-Day Dedication",
    indigenous_title: "Usen Itiaba ke Edinam",
    description: "Built a 7-day learning habit without breaking stride.",
    streak_requirement: 7,
    badge_icon: "Crown",
    category: "streak"
  },
  {
    id: "ach-vocab-explorer",
    title: "Vocabulary Explorer",
    indigenous_title: "Andidun\u0304\u1ECDde Ik\u1ECD",
    description: "Searched and explored verified dictionary entries.",
    xp_requirement: 50,
    badge_icon: "BookOpen",
    category: "special"
  },
  {
    id: "ach-lesson-master",
    title: "Lesson Master",
    indigenous_title: "Ata Andikpep",
    description: "Finished 5 full modules with flawless accuracy.",
    lessons_requirement: 5,
    badge_icon: "Award",
    category: "lessons"
  },
  {
    id: "ach-cultural-scholar",
    title: "Cultural Scholar",
    indigenous_title: "Eyen Obio",
    description: "Deepened appreciation for Nsibidi, Ekpe, and heritage.",
    xp_requirement: 200,
    badge_icon: "Scroll",
    category: "special"
  },
  {
    id: "ach-polyglot",
    title: "Cross River Polyglot",
    indigenous_title: "Andisem Usem Iba",
    description: "Completed lessons across both Ibibio and Efik tracks.",
    lessons_requirement: 3,
    badge_icon: "Compass",
    category: "special"
  }
];

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var PORT = 3e3;
var app = express();
app.use(express.json());
var geminiApiKey = process.env.GEMINI_API_KEY || "";
var ai = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
var DB_DIR = path.resolve(__dirname, "data");
var DB_FILE = path.join(DB_DIR, "db.json");
function initDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const initialDemoUser = {
    id: "user-demo-1",
    display_name: "Ekpedeme Bassey",
    email: "demo@usemnnyin.org",
    selected_language: "ibibio",
    proficiency_level: "beginner",
    total_xp: 85,
    current_streak: 2,
    longest_streak: 4,
    daily_goal: 50,
    daily_xp_today: 25,
    last_activity_date: todayStr,
    activity_dates: [todayStr],
    notification_preferences: {
      daily_reminder: true,
      reminder_time: "19:00",
      streak_freeze_alerts: true,
      browser_notifications: false
    },
    created_at: new Date(Date.now() - 7 * 864e5).toISOString()
  };
  const defaultDb = {
    users: [initialDemoUser],
    passwords: {
      "user-demo-1": "welcome123"
    },
    dictionary: VERIFIED_DICTIONARY,
    lessons: LESSONS_DATABASE,
    user_progress: [
      {
        id: "prog-demo-1",
        user_id: "user-demo-1",
        lesson_id: "ibi-mod-1",
        completed: true,
        score: 100,
        xp_earned: 25,
        completed_at: new Date(Date.now() - 864e5).toISOString()
      }
    ],
    user_achievements: [
      {
        id: "uach-1",
        user_id: "user-demo-1",
        achievement_id: "ach-first-lesson",
        unlocked_at: new Date(Date.now() - 864e5).toISOString()
      }
    ]
  };
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf-8");
    return defaultDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    parsed.dictionary = VERIFIED_DICTIONARY;
    parsed.lessons = LESSONS_DATABASE;
    return parsed;
  } catch {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf-8");
    return defaultDb;
  }
}
var db = initDatabase();
function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database:", err);
  }
}
function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  let user = db.users.find((u) => u.id === token);
  if (!user && token.length > 5) {
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    user = {
      id: token,
      display_name: "Learner",
      email: "",
      selected_language: "ibibio",
      proficiency_level: "beginner",
      total_xp: 0,
      current_streak: 0,
      longest_streak: 0,
      daily_goal: 50,
      daily_xp_today: 0,
      last_activity_date: "",
      activity_dates: [],
      notification_preferences: {
        daily_reminder: true,
        reminder_time: "19:00",
        streak_freeze_alerts: true,
        browser_notifications: false
      },
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.users.push(user);
    saveDatabase();
  }
  return user || null;
}
app.post("/api/auth/register", (req, res) => {
  const { email, password, display_name, selected_language, proficiency_level } = req.body;
  if (!email || !password || !display_name) {
    res.status(400).json({ error: "Email, password, and name are required." });
    return;
  }
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    display_name: display_name.trim(),
    email: email.trim().toLowerCase(),
    selected_language: selected_language === "efik" ? "efik" : "ibibio",
    proficiency_level: proficiency_level || "beginner",
    total_xp: 0,
    current_streak: 0,
    longest_streak: 0,
    daily_goal: 50,
    daily_xp_today: 0,
    last_activity_date: "",
    activity_dates: [],
    notification_preferences: {
      daily_reminder: true,
      reminder_time: "19:00",
      streak_freeze_alerts: true,
      browser_notifications: false
    },
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.users.push(newUser);
  db.passwords[newUser.id] = password;
  saveDatabase();
  res.json({
    user: newUser,
    token: newUser.id
  });
});
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Please enter your email and password." });
    return;
  }
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user || db.passwords[user.id] !== password) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }
  res.json({
    user,
    token: user.id
  });
});
app.post("/api/auth/guest-login", (_req, res) => {
  const demoUser = db.users.find((u) => u.id === "user-demo-1") || db.users[0];
  res.json({
    user: demoUser,
    token: demoUser.id
  });
});
app.post("/api/auth/sync-user", (req, res) => {
  const incomingUser = req.body.user;
  if (!incomingUser || !incomingUser.id) {
    res.status(400).json({ error: "User id is required" });
    return;
  }
  let user = db.users.find((u) => u.id === incomingUser.id);
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  if (!user) {
    user = {
      id: incomingUser.id,
      display_name: incomingUser.display_name || "Learner",
      email: incomingUser.email || "",
      selected_language: incomingUser.selected_language || "ibibio",
      proficiency_level: incomingUser.proficiency_level || "beginner",
      total_xp: incomingUser.total_xp || 0,
      current_streak: incomingUser.current_streak || 0,
      longest_streak: incomingUser.longest_streak || 0,
      daily_goal: incomingUser.daily_goal || 50,
      daily_xp_today: incomingUser.daily_xp_today || 0,
      last_activity_date: incomingUser.last_activity_date || todayStr,
      activity_dates: incomingUser.activity_dates || [todayStr],
      notification_preferences: incomingUser.notification_preferences || {
        daily_reminder: true,
        reminder_time: "19:00",
        streak_freeze_alerts: true,
        browser_notifications: false
      },
      created_at: incomingUser.created_at || (/* @__PURE__ */ new Date()).toISOString()
    };
    db.users.push(user);
  } else {
    if (incomingUser.display_name) user.display_name = incomingUser.display_name;
    if (incomingUser.email) user.email = incomingUser.email;
    if (incomingUser.selected_language) user.selected_language = incomingUser.selected_language;
    if (incomingUser.proficiency_level) user.proficiency_level = incomingUser.proficiency_level;
    if (typeof incomingUser.total_xp === "number") {
      user.total_xp = Math.max(user.total_xp, incomingUser.total_xp);
    }
  }
  saveDatabase();
  res.json({ user });
});
app.get("/api/auth/me", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  if (user.last_activity_date !== todayStr) {
    user.daily_xp_today = 0;
  }
  res.json({ user });
});
app.post("/api/auth/update", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { selected_language, proficiency_level, daily_goal, notification_preferences } = req.body;
  if (selected_language && (selected_language === "ibibio" || selected_language === "efik")) {
    user.selected_language = selected_language;
  }
  if (proficiency_level) {
    user.proficiency_level = proficiency_level;
  }
  if (typeof daily_goal === "number") {
    user.daily_goal = daily_goal;
  }
  if (notification_preferences) {
    user.notification_preferences = {
      ...user.notification_preferences,
      ...notification_preferences
    };
  }
  saveDatabase();
  res.json({ user });
});
app.get("/api/dictionary", (req, res) => {
  const { q, language, category, direction } = req.query;
  let results = [...db.dictionary];
  if (language && language !== "all") {
    results = results.filter((entry) => entry.language === language);
  }
  if (category && category !== "all") {
    results = results.filter((entry) => entry.category === category);
  }
  if (q && typeof q === "string") {
    const search = q.trim().toLowerCase();
    results = results.filter((entry) => {
      const matchWord = entry.word.toLowerCase().includes(search);
      const matchTranslation = entry.translation.toLowerCase().includes(search);
      const matchDef = entry.definition.toLowerCase().includes(search);
      const matchPhonetic = entry.phonetic.toLowerCase().includes(search);
      if (direction === "indigenous_to_en") {
        return matchWord || matchPhonetic;
      }
      if (direction === "en_to_indigenous") {
        return matchTranslation || matchDef;
      }
      return matchWord || matchTranslation || matchDef || matchPhonetic;
    });
  }
  res.json({
    entries: results,
    total: results.length
  });
});
app.get("/api/lessons", (req, res) => {
  const user = getAuthenticatedUser(req);
  const lang = req.query.language;
  let lessons = [...db.lessons];
  if (lang && (lang === "ibibio" || lang === "efik")) {
    lessons = lessons.filter((l) => l.language === lang);
  }
  const progressMap = /* @__PURE__ */ new Map();
  if (user) {
    db.user_progress.filter((p) => p.user_id === user.id).forEach((p) => progressMap.set(p.lesson_id, p));
  }
  const enrichedLessons = lessons.map((lesson, index) => {
    const prog = progressMap.get(lesson.id);
    const isFirst = index === 0;
    const prevLesson = index > 0 ? lessons[index - 1] : null;
    const isUnlocked = isFirst || prevLesson && progressMap.has(prevLesson.id);
    return {
      ...lesson,
      is_completed: prog?.completed || false,
      score: prog?.score || 0,
      is_unlocked: Boolean(isUnlocked)
    };
  });
  res.json({
    lessons: enrichedLessons
  });
});
app.post("/api/lessons/complete", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: "You must be signed in to save lesson progress." });
    return;
  }
  const { lesson_id, score } = req.body;
  if (!lesson_id || typeof score !== "number") {
    res.status(400).json({ error: "lesson_id and score are required." });
    return;
  }
  const lesson = db.lessons.find((l) => l.id === lesson_id);
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  const baseReward = lesson.xp_reward || 30;
  const earnedXp = Math.max(Math.round(baseReward * Math.min(score, 100) / 100), 10);
  let prog = db.user_progress.find((p) => p.user_id === user.id && p.lesson_id === lesson_id);
  const isFirstCompletion = !prog || !prog.completed;
  if (!prog) {
    prog = {
      id: `prog-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      user_id: user.id,
      lesson_id,
      completed: true,
      score,
      xp_earned: earnedXp,
      completed_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.user_progress.push(prog);
  } else {
    prog.completed = true;
    prog.score = Math.max(prog.score, score);
    prog.xp_earned += earnedXp;
    prog.completed_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  user.total_xp += earnedXp;
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const lastActive = user.last_activity_date;
  if (!lastActive) {
    user.current_streak = 1;
    user.longest_streak = Math.max(user.longest_streak, 1);
    user.daily_xp_today = earnedXp;
    user.last_activity_date = todayStr;
    user.activity_dates = [todayStr];
  } else if (lastActive === todayStr) {
    user.daily_xp_today += earnedXp;
  } else {
    const lastDate = new Date(lastActive);
    const currDate = new Date(todayStr);
    const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1e3 * 60 * 60 * 24));
    if (diffDays === 1) {
      user.current_streak += 1;
      user.longest_streak = Math.max(user.longest_streak, user.current_streak);
    } else {
      user.current_streak = 1;
    }
    user.daily_xp_today = earnedXp;
    user.last_activity_date = todayStr;
    if (!user.activity_dates.includes(todayStr)) {
      user.activity_dates.push(todayStr);
    }
  }
  const newAchievements = [];
  const completedLessons = db.user_progress.filter((p) => p.user_id === user.id && p.completed);
  ACHIEVEMENTS_DATABASE.forEach((ach) => {
    const alreadyUnlocked = db.user_achievements.some(
      (ua) => ua.user_id === user.id && ua.achievement_id === ach.id
    );
    if (alreadyUnlocked) return;
    let qualifies = false;
    if (ach.lessons_requirement && completedLessons.length >= ach.lessons_requirement) {
      qualifies = true;
    }
    if (ach.xp_requirement && user.total_xp >= ach.xp_requirement) {
      qualifies = true;
    }
    if (ach.streak_requirement && user.current_streak >= ach.streak_requirement) {
      qualifies = true;
    }
    if (ach.id === "ach-polyglot") {
      const hasIbi = completedLessons.some((p) => p.lesson_id.startsWith("ibi-"));
      const hasEfi = completedLessons.some((p) => p.lesson_id.startsWith("efi-"));
      if (hasIbi && hasEfi) qualifies = true;
    }
    if (qualifies) {
      db.user_achievements.push({
        id: `uach-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        user_id: user.id,
        achievement_id: ach.id,
        unlocked_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      newAchievements.push(ach.title);
    }
  });
  saveDatabase();
  res.json({
    success: true,
    user,
    earned_xp: earnedXp,
    new_achievements: newAchievements,
    is_first_completion: isFirstCompletion
  });
});
app.get("/api/achievements", (req, res) => {
  const user = getAuthenticatedUser(req);
  const unlockedIds = new Set(
    user ? db.user_achievements.filter((ua) => ua.user_id === user.id).map((ua) => ua.achievement_id) : []
  );
  const achievements = ACHIEVEMENTS_DATABASE.map((ach) => ({
    ...ach,
    is_unlocked: unlockedIds.has(ach.id)
  }));
  res.json({ achievements });
});
app.post("/api/ai-explain", async (req, res) => {
  const { query, language } = req.body;
  if (!query) {
    res.status(400).json({ error: "Query parameter is required" });
    return;
  }
  const selectedLang = language === "efik" ? "Efik" : "Ibibio";
  const sisterLang = language === "efik" ? "Ibibio" : "Efik";
  const fallback = {
    query,
    language: selectedLang.toLowerCase(),
    etymology: `The term "${query}" has deep roots in the Lower Cross River linguistic family.`,
    cultural_context: `In ${selectedLang} culture, speech reflects communal solidarity, age-grade respect, and proverbial depth.`,
    tonal_guide: `Tonal inflection is crucial: pitch contour changes whether a word signifies an action, noun, or respectful address.`,
    cognate_comparison: `In ${sisterLang}, cognate expressions share phonetic roots with slight vowel or prefix shifts.`,
    disclaimer: `AI-GENERATED & UNVERIFIED: This explanation is generated by an AI assistant for educational context. For formal cultural or grammatical verification, please consult verified dictionary records or indigenous native speakers and elders.`
  };
  if (!ai) {
    res.json(fallback);
    return;
  }
  try {
    const prompt = `Analyze the following Nigerian indigenous language query: "${query}" in the context of ${selectedLang} (with comparison to sister language ${sisterLang}).
Return a JSON object conforming strictly to the requested schema.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are a respectful linguistic scholar of Nigerian indigenous languages, specifically Ibibio (Akwa Ibom State) and Efik (Cross River State).
CRITICAL RULES:
1. Distinguish Ibibio from Efik clearly. Mention cognates, tonal nuances, and orthographic conventions.
2. Never present speculative information as absolute truth.
3. Keep descriptions concise, culturally enriching, and educational.
4. Always emphasize that this output is an AI-assisted linguistic analysis.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            etymology: { type: Type.STRING, description: "Linguistic breakdown or root origin" },
            cultural_context: { type: Type.STRING, description: "Cultural usage and traditional setting" },
            tonal_guide: { type: Type.STRING, description: "Tonal pronunciation guide (high, mid, low tones)" },
            cognate_comparison: { type: Type.STRING, description: `Comparison with ${sisterLang}` },
            disclaimer: { type: Type.STRING, description: "Explicit verification disclaimer" }
          },
          required: ["etymology", "cultural_context", "tonal_guide", "cognate_comparison", "disclaimer"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json({
      query,
      language: selectedLang.toLowerCase(),
      etymology: parsed.etymology || fallback.etymology,
      cultural_context: parsed.cultural_context || fallback.cultural_context,
      tonal_guide: parsed.tonal_guide || fallback.tonal_guide,
      cognate_comparison: parsed.cognate_comparison || fallback.cognate_comparison,
      disclaimer: `AI-GENERATED & UNVERIFIED: ${parsed.disclaimer || fallback.disclaimer}`
    });
  } catch (error) {
    console.error("Gemini API call failed:", error);
    res.json(fallback);
  }
});
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Usem Nnyin platform running on port ${PORT}`);
  });
}
startServer();
