# QUIZ//ARENA — Shows & Questions Master Guide

This guide details all available categories, shows, topics, difficulty tiers, question split requirements, and instructions on how to supply and replace questions in the codebase.

---

## 1. Match Rules & Question Requirements

Whenever a room is created, the system calculates the number of questions needed based on the **number of players**:

| Room Capacity | Questions per Match | Timer per Question | Total Match Duration |
| :--- | :--- | :--- | :--- |
| **2 Players** | **10 Questions** | 15 Seconds | ~3 – 4 Minutes |
| **3 Players** | **12 Questions** | 15 Seconds | ~4 – 5 Minutes |
| **4 Players** | **15 Questions** | 15 Seconds | ~5 – 6 Minutes |

- **Answer Flow**: When a question ends, XP is instantly computed and displayed on screen (+XP counter).
- **Auto-Advance**: The system automatically moves to the next question after a **3-second delay** with no button click required.
- **End of Match**: After the final question, players see the podium and final victory rankings.

---

## 2. Difficulty Tiers (1 to 10 Split)

Every show or topic supports 10 progressive difficulty levels. When replacing or adding questions, split them across these 10 tiers:

| Tier | Level Name | Target Difficulty & Lore Scope | Recommended Pool |
| :--- | :--- | :--- | :--- |
| **01** | **Casual** | Main protagonists, starter arcs, signature items, basic knowledge | 10–15 Qs |
| **02** | **Easy** | Foundational trivia, secondary characters, pilot season twists | 10–15 Qs |
| **03** | **Familiar** | Core plot progression, memorable battles, standard terminology | 10–15 Qs |
| **04** | **Moderate** | Mid-tier arcs, character motives, transformations, relationships | 10–15 Qs |
| **05** | **Challenging** | Deep season lore, specific bounties/dates, tactical battle moves | 10–15 Qs |
| **06** | **Hard** | Sub-plots, flashback revelations, intricate power systems/mechanisms | 10–15 Qs |
| **07** | **Expert** | Obscure dialogue, manga/book-only details, complex calculations | 10–15 Qs |
| **08** | **Very Hard** | Minor background characters, timeline timestamps, rare facts | 10–15 Qs |
| **09** | **Master** | Microscopic canon details, production history, Japanese naming lore | 10–15 Qs |
| **10** | **Nightmare** | Deepest canon minutiae, author databooks, ultimate theory tests | 10–15 Qs |

> **Recommended Total per Show**: **100 – 150 questions** (10–15 questions per difficulty tier) ensures players rarely encounter repeated questions in multiple matches.

---

## 3. Catalog of Shows, Franchises & Scientific Topics

Use the exact **`topicId`** string when writing questions:

### A. ANIMES (`categoryId: 'anime'`)
| Franchise / Show | `topicId` | Description & Focus | Target Questions |
| :--- | :--- | :--- | :--- |
| **One Piece** | `one-piece` | Devil Fruits, Haki, Yonko, Void Century, Straw Hat journey | 100 – 150 |
| **Naruto** | `naruto` | Jutsu, Kekkei Genkai, Akatsuki, Ninja wars, Hokage lore | 100 – 150 |
| **Bleach** | `bleach` | Zanpakuto, Bankai, Soul Society, Espada, TYBW arc | 100 – 150 |
| **Demon Slayer** | `demon-slayer` | Breathing forms, Hashira, Twelve Kizuki, Muzan | 100 – 150 |
| **Attack on Titan** | `attack-on-titan` | Nine Titans, Paradis, Eldian history, Survey Corps | 100 – 150 |
| **Jujutsu Kaisen** | `jujutsu-kaisen` | Cursed energy, Domains, Shibuya Incident, Sukuna | 100 – 150 |
| **Dragon Ball Z** | `dragon-ball` | Super Saiyan forms, Dragon Balls, galactic tournaments | 100 – 150 |
| **Hunter x Hunter** | `hunter-x-hunter` | Nen affinities, Chimera Ants, Phantom Troupe, Exam | 100 – 150 |
| **Fullmetal Alchemist** | `fullmetal-alchemist` | State alchemists, Homunculi, Equivalent Exchange | 100 – 150 |

---

### B. POPULAR SERIES (`categoryId: 'series'`)
| Show Title | `topicId` | Description & Focus | Target Questions |
| :--- | :--- | :--- | :--- |
| **Breaking Bad** | `breaking-bad` | Heisenberg, chemistry, cartel deals, Albuquerque lore | 100 – 150 |
| **Game of Thrones** | `game-of-thrones` | Great Houses, Iron Throne, dragons, Westeros history | 100 – 150 |
| **Stranger Things** | `stranger-things` | Hawkins, Upside Down, Eleven, 80s pop culture | 100 – 150 |
| **The Boys** | `the-boys` | Vought, Compound V, The Seven, Butcher & Homelander | 100 – 150 |

---

### C. POPULAR MOVIES (`categoryId: 'movies'`)
| Franchise Title | `topicId` | Description & Focus | Target Questions |
| :--- | :--- | :--- | :--- |
| **Marvel Cinematic Universe** | `marvel` | Infinity Stones, Avengers, multiverse variants, Phase 1–5 | 100 – 150 |
| **Harry Potter** | `harry-potter` | Hogwarts, spells, Horcruxes, Death Eaters, potions | 100 – 150 |
| **Star Wars** | `star-wars` | Jedi Order, Sith, The Force, starships, galactic battles | 100 – 150 |
| **The Dark Knight Trilogy** | `the-dark-knight` | Nolan films, Gotham City, Joker, Bane, Batman tech | 100 – 150 |

---

### D. CHEMISTRY (`categoryId: 'chemistry'`)
| Topic Discipline | `topicId` | Description & Focus | Target Questions |
| :--- | :--- | :--- | :--- |
| **Organic Chemistry** | `organic-chemistry` | Hydrocarbons, functional groups, reactions, isomerism | 100 – 150 |
| **Chemical Reactions** | `chemical-reactions` | Stoichiometry, redox, catalysts, thermodynamics | 100 – 150 |
| **Periodic Table & Elements** | `periodic-table` | Element properties, noble gases, atomic numbers | 100 – 150 |

---

### E. PHYSICS (`categoryId: 'physics'`)
| Topic Discipline | `topicId` | Description & Focus | Target Questions |
| :--- | :--- | :--- | :--- |
| **Quantum Mechanics** | `quantum-mechanics` | Wavefunctions, uncertainty principle, quantum spin | 100 – 150 |
| **Classical Mechanics** | `classical-mechanics` | Newton's laws, kinetic energy, momentum, gravity | 100 – 150 |
| **Astrophysics & Relativity** | `astrophysics` | General relativity, black holes, cosmology, spacetime | 100 – 150 |

---

## 4. Question Data Schema

Every question object conforms to the following TypeScript interface:

```typescript
export interface Question {
  id: string; // Unique ID (e.g. 'op-l01-001')
  topicId: string; // Matches topicId from table above
  levelNumber: number; // 1 to 10
  questionText: string; // The question prompt
  optionA: string; // Option A text
  optionB: string; // Option B text
  optionC: string; // Option C text
  optionD: string; // Option D text
  correctOption: 'A' | 'B' | 'C' | 'D'; // Correct answer key
  explanation: string; // Fact explanation shown after answering
}
```

### JSON / TypeScript Example:
```typescript
{
  id: 'op-l01-001',
  topicId: 'one-piece',
  levelNumber: 1,
  questionText: "What is Monkey D. Luffy's ultimate dream in One Piece?",
  optionA: 'To become the Pirate King',
  optionB: 'To find the All Blue',
  optionC: 'To be the greatest swordsman',
  optionD: 'To map the entire world',
  correctOption: 'A',
  explanation: "Luffy proclaimed from childhood that he would become King of the Pirates by finding the One Piece."
}
```

---

## 5. How to Replace the Questions in the App

1. Open `src/data/questions.ts`.
2. Locate the array `export const SEED_QUESTIONS: Question[] = [ ... ];`.
3. Paste or replace with your custom questions using the schema above.
4. The helper function `getQuestionsForMatch(topicId, levelNumber, count)` automatically:
   - Selects matching questions for the chosen franchise and level tier.
   - Shuffles the questions randomly for each match.
   - If the pool has fewer than required, generates structured fallbacks so matches never break.
5. Save the file and run `npm run build` to verify syntax.

---

## 6. Summary of System Totals

- **Categories**: 5
- **Topics / Shows**: 23
- **Difficulty Tiers**: 10 (Levels 1 – 10)
- **Target Questions**: 23 topics × 100 questions = **2,300 Questions Total** (10 questions per level tier per topic).
