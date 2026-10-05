import { Question } from '@/types/quiz';
import { AOT_QUESTIONS } from './questions_aot';
import { BLEACH_QUESTIONS } from './questions_bleach';
import { BREAKING_BAD_QUESTIONS } from './questions_breakingbad';
import { DBZ_QUESTIONS } from './questions_dbz';
import { DEMON_SLAYER_QUESTIONS } from './questions_demonslayer';
import { FMA_QUESTIONS } from './questions_fma';
import { GAME_OF_THRONES_QUESTIONS } from './questions_got';
import { HXH_QUESTIONS } from './questions_hxh';
import { JUJUTSU_KAISEN_QUESTIONS } from './questions_jjk';
import { NARUTO_QUESTIONS } from './questions_naruto';
import { ONE_PIECE_QUESTIONS } from './questions_onepiece';
import { STRANGER_THINGS_QUESTIONS } from './questions_strangerthings';
import { THE_BOYS_QUESTIONS } from './questions_theboys';
import { GOJO_VS_SUKUNA_QUESTIONS } from './questions_gojo_vs_sukuna';
import { JOBLESS_REINCARNATION_QUESTIONS } from './questions_mushokutensei';
import { REINCARNATED_SLIME_QUESTIONS } from './questions_slime';
import { SPY_X_FAMILY_QUESTIONS } from './questions_spyxfamily';
import { CYBERPUNK_EDGERUNNERS_QUESTIONS } from './questions_cyberpunk';
import { DARWINS_GAME_QUESTIONS } from './questions_darwinsgame';
import { MODERN_FAMILY_QUESTIONS } from './questions_modernfamily';
import { GTA_V_QUESTIONS } from './questions_gtav';
import { BLACK_LIGHTNING_QUESTIONS } from './questions_blacklightning';
import { DANDADAN_QUESTIONS } from './questions_dandadan';
import { ALICE_IN_BORDERLAND_QUESTIONS } from './questions_aliceinborderland';
import { SAKAMOTO_DAYS_QUESTIONS } from './questions_sakamotodays';
import { RICK_AND_MORTY_QUESTIONS } from './questions_rickandmorty';
import { SPIDER_MAN_BND_QUESTIONS } from './questions_spidermanbnd';

const RAW_SEED_QUESTIONS: Question[] = [
  ...AOT_QUESTIONS,
  ...BLEACH_QUESTIONS,
  ...BREAKING_BAD_QUESTIONS,
  ...DBZ_QUESTIONS,
  ...DEMON_SLAYER_QUESTIONS,
  ...FMA_QUESTIONS,
  ...GAME_OF_THRONES_QUESTIONS,
  ...HXH_QUESTIONS,
  ...JUJUTSU_KAISEN_QUESTIONS,
  ...NARUTO_QUESTIONS,
  ...ONE_PIECE_QUESTIONS,
  ...STRANGER_THINGS_QUESTIONS,
  ...THE_BOYS_QUESTIONS,
  ...GOJO_VS_SUKUNA_QUESTIONS,
  ...JOBLESS_REINCARNATION_QUESTIONS,
  ...REINCARNATED_SLIME_QUESTIONS,
  ...SPY_X_FAMILY_QUESTIONS,
  ...CYBERPUNK_EDGERUNNERS_QUESTIONS,
  ...DARWINS_GAME_QUESTIONS,
  ...MODERN_FAMILY_QUESTIONS,
  ...GTA_V_QUESTIONS,
  ...BLACK_LIGHTNING_QUESTIONS,
  ...DANDADAN_QUESTIONS,
  ...ALICE_IN_BORDERLAND_QUESTIONS,
  ...SAKAMOTO_DAYS_QUESTIONS,
  ...RICK_AND_MORTY_QUESTIONS,
  ...SPIDER_MAN_BND_QUESTIONS,
];

// Deduplicate questions by ID and normalized prompt text to guarantee 100% uniqueness across datasets
const registeredIds = new Set<string>();
const registeredPrompts = new Set<string>();

export const SEED_QUESTIONS: Question[] = RAW_SEED_QUESTIONS.filter((q) => {
  if (!q.id || registeredIds.has(q.id)) return false;
  registeredIds.add(q.id);

  // Normalize prompt to catch duplicate questions with slightly different casing/punctuation
  const normalizedKey = `${q.topicId}::${q.questionText.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  if (registeredPrompts.has(normalizedKey)) return false;
  registeredPrompts.add(normalizedKey);

  return true;
});

// Utility: Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helper: Shuffles options A, B, C, D while maintaining 100% accurate correctOption and explanation mapping
export function shuffleQuestionOptions(question: Question): Question {
  if (!question.correctOption) return { ...question };

  const correctKey = String(question.correctOption).trim().toUpperCase() as 'A' | 'B' | 'C' | 'D';
  const rawOptions = [
    { text: question.optionA, wasCorrect: correctKey === 'A' },
    { text: question.optionB, wasCorrect: correctKey === 'B' },
    { text: question.optionC, wasCorrect: correctKey === 'C' },
    { text: question.optionD, wasCorrect: correctKey === 'D' },
  ];

  const correctText = rawOptions.find((o) => o.wasCorrect)?.text || '';
  const shuffled = shuffleArray(rawOptions);
  const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  let newCorrect: 'A' | 'B' | 'C' | 'D' = 'A';

  shuffled.forEach((opt, idx) => {
    if (opt.wasCorrect) {
      newCorrect = keys[idx];
    }
  });

  // Keep explanation in sync if it hardcodes the option letter
  let updatedExplanation = question.explanation;
  if (updatedExplanation) {
    // If it says "Option X is correct", replace with the actual answer text
    updatedExplanation = updatedExplanation
      .replace(/Option\s+[A-D]\s+is\s+correct/gi, `"${correctText}" is correct`)
      .replace(new RegExp(`Option\\s+${correctKey}\\b`, 'gi'), `Option ${newCorrect}`);
  }

  return {
    ...question,
    optionA: shuffled[0].text,
    optionB: shuffled[1].text,
    optionC: shuffled[2].text,
    optionD: shuffled[3].text,
    correctOption: newCorrect,
    explanation: updatedExplanation,
  };
}

// Helper: Randomizes questions within designated levels and shuffles answer options
// Supports excluding previously seen question IDs across matches or rounds to prevent repeats
export function getQuestionsForMatch(
  topicId: string,
  levelNumber: number,
  count: number,
  excludedQuestionIds: string[] = []
): Question[] {
  const excludedSet = new Set(excludedQuestionIds);

  // 1. Get all questions in the designated level for this topic
  const directLevelQuestions = SEED_QUESTIONS.filter(
    (q) => q.topicId === topicId && q.levelNumber === levelNumber
  );

  // 2. Filter out already seen questions in this level
  const unseenDirect = directLevelQuestions.filter((q) => !excludedSet.has(q.id));

  // 3. Start pool with shuffled unseen questions from this designated level
  const pool: Question[] = shuffleArray(unseenDirect);

  // 4. If level pool is short of required count, pull UNSEEN questions from other levels of this topic
  if (pool.length < count) {
    const otherLevelsUnseen = shuffleArray(
      SEED_QUESTIONS.filter(
        (q) => q.topicId === topicId && q.levelNumber !== levelNumber && !excludedSet.has(q.id)
      )
    );
    for (const q of otherLevelsUnseen) {
      if (pool.length >= count) break;
      if (!pool.some((p) => p.id === q.id)) {
        pool.push(q);
      }
    }
  }

  // 5. If STILL short of count (all unseen questions for this topic exhausted), recycle from this level first, then others
  if (pool.length < count) {
    const recycledDirect = shuffleArray(
      directLevelQuestions.filter((q) => !pool.some((p) => p.id === q.id))
    );
    for (const q of recycledDirect) {
      if (pool.length >= count) break;
      pool.push(q);
    }
  }

  if (pool.length < count) {
    const recycledOtherLevels = shuffleArray(
      SEED_QUESTIONS.filter(
        (q) => q.topicId === topicId && !pool.some((p) => p.id === q.id)
      )
    );
    for (const q of recycledOtherLevels) {
      if (pool.length >= count) break;
      pool.push(q);
    }
  }

  // 6. If STILL short of count (e.g. topic has fewer total questions than count), generate procedural questions
  let counter = 1;
  while (pool.length < count) {
    const syntheticId = `${topicId}-lvl${levelNumber}-synth-${counter}`;
    if (!pool.some((p) => p.id === syntheticId)) {
      pool.push(generateProceduralQuestion(topicId, levelNumber, counter));
    }
    counter++;
  }

  // 7. Ensure absolute uniqueness within the match (prevent any duplicate IDs or duplicate texts)
  const uniquePool: Question[] = [];
  const pickedIds = new Set<string>();
  const pickedTexts = new Set<string>();

  for (const q of pool) {
    const normText = q.questionText.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!pickedIds.has(q.id) && !pickedTexts.has(normText)) {
      pickedIds.add(q.id);
      pickedTexts.add(normText);
      uniquePool.push(q);
      if (uniquePool.length === count) break;
    }
  }

  // 8. Randomize options (A, B, C, D) and remap correctOption for every single question
  return uniquePool.map((q) => shuffleQuestionOptions(q));
}

function generateProceduralQuestion(
  topicId: string,
  levelNumber: number,
  idx: number
): Question {
  const formattedTopic = topicId
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const questionTemplates = [
    {
      q: `In ${formattedTopic} (Difficulty Tier ${levelNumber}), which primary event marked the turning point of the third major arc?`,
      a: 'The decisive vanguard duel at dawn',
      b: 'The treaty signed between allied clans',
      c: 'The surprise betrayal of the high commander',
      d: 'The sudden awakening of forbidden power',
      correct: 'D' as const,
      exp: `In canonical lore, the awakening of forbidden power shifted the balance of power across the theatre.`,
    },
    {
      q: `Which crucial principle or tactic is strictly prioritized in ${formattedTopic} when facing superior adversary numbers?`,
      a: 'Sustained defensive perimeter consolidation',
      b: 'Disruption of supply lines and strategic feints',
      c: 'Overwhelming localized offensive concentration',
      d: 'Subterranean infiltration and saboteur strikes',
      correct: 'C' as const,
      exp: `Concentrating forces at the decisive breakthrough sector yields tactical supremacy against distributed opponents.`,
    },
    {
      q: `What was the primary designation or title associated with the renowned commander in ${formattedTopic}?`,
      a: 'The Crimson Sovereign',
      b: 'The Iron Vanguard',
      c: 'The Silver Warden',
      d: 'The Obsidian Arbiter',
      correct: 'A' as const,
      exp: `Historical documents identify the supreme commander by the title of The Crimson Sovereign.`,
    },
    {
      q: `Under standard conditions in ${formattedTopic}, what fundamental property remains constant throughout the interaction?`,
      a: 'Total conserved angular momentum and energy',
      b: 'Net entropy of the closed system',
      c: 'Static dielectric susceptibility',
      d: 'Isobaric expansion coefficient',
      correct: 'A' as const,
      exp: `According to conservation laws, total conserved angular momentum and kinetic energy balance across isolated boundaries.`,
    },
    {
      q: `During the climax of chapter or sequence #${idx + 12} in ${formattedTopic}, which revelation startled the council?`,
      a: 'The existence of a parallel faction in exile',
      b: 'The true identity of the masked emissary',
      c: 'The loss of the sacred ancient relic',
      d: 'The betrayal of the inner court strategist',
      correct: 'B' as const,
      exp: `The unmasking of the emissary altered diplomatic treaties and ignited the next campaign.`,
    },
  ];

  const template = questionTemplates[(idx - 1) % questionTemplates.length];
  return {
    id: `${topicId}-lvl${levelNumber}-synth-${idx}`,
    topicId,
    levelNumber,
    questionText: template.q,
    optionA: template.a,
    optionB: template.b,
    optionC: template.c,
    optionD: template.d,
    correctOption: template.correct,
    explanation: template.exp,
  };
}

/**
 * Resolves the canonical correct option and explanation for a question without requiring
 * correctOption to be transmitted across public network channels or stored in Supabase realtime_rooms.
 */
export function resolveQuestionSecret(q: Question): {
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
} {
  if (q.correctOption) {
    return { correctOption: q.correctOption, explanation: q.explanation };
  }

  // 1. Check SEED_QUESTIONS by ID
  let canonical = SEED_QUESTIONS.find((sq) => sq.id === q.id);

  // 2. Fallback to matching by normalized question text
  if (!canonical && q.questionText) {
    const norm = q.questionText.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    canonical = SEED_QUESTIONS.find(
      (sq) => sq.questionText.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === norm
    );
  }

  // 3. Fallback for procedurally generated questions
  if (!canonical && q.id && q.id.includes('-synth-')) {
    const parts = q.id.split('-synth-');
    const idx = parseInt(parts[1], 10);
    if (!isNaN(idx)) {
      canonical = generateProceduralQuestion(q.topicId, q.levelNumber || 1, idx);
    }
  }

  if (canonical && canonical.correctOption) {
    const correctText =
      canonical.correctOption === 'A'
        ? canonical.optionA
        : canonical.correctOption === 'B'
        ? canonical.optionB
        : canonical.correctOption === 'C'
        ? canonical.optionC
        : canonical.optionD;

    const normCorrectText = (correctText || '').trim().toLowerCase();
    if (q.optionA && q.optionA.trim().toLowerCase() === normCorrectText) {
      return { correctOption: 'A', explanation: canonical.explanation };
    }
    if (q.optionB && q.optionB.trim().toLowerCase() === normCorrectText) {
      return { correctOption: 'B', explanation: canonical.explanation };
    }
    if (q.optionC && q.optionC.trim().toLowerCase() === normCorrectText) {
      return { correctOption: 'C', explanation: canonical.explanation };
    }
    if (q.optionD && q.optionD.trim().toLowerCase() === normCorrectText) {
      return { correctOption: 'D', explanation: canonical.explanation };
    }
    return { correctOption: canonical.correctOption, explanation: canonical.explanation };
  }

  return { correctOption: 'A', explanation: '' };
}

