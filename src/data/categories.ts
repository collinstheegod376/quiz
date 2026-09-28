import { Category, DifficultyLevel } from '@/types/quiz';

export const CATEGORIES: Category[] = [
  {
    id: 'anime',
    name: 'ANIMES',
    tagline: 'Otaku Championship',
    description: 'From classics to hidden gems. Test your knowledge on legendary arcs, power scales, and iconic moments.',
    topicCount: 15,
    bannerImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&q=80',
    accentColor: '#DC2626', // Red
  },
  {
    id: 'series',
    name: 'POPULAR SERIES',
    tagline: 'Binge-Worthy TV',
    description: 'Test your knowledge on the most iconic TV series of all time, from gripping dramas to sci-fi thrillers.',
    topicCount: 12,
    bannerImage: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1200&q=80',
    accentColor: '#D97706', // Amber
  },
  {
    id: 'movies',
    name: 'POPULAR MOVIES',
    tagline: 'Cinematic Universe',
    description: 'From Hollywood blockbusters to cult classics. How many directors, characters, and plot twists can you name?',
    topicCount: 12,
    bannerImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
    accentColor: '#7C3AED', // Purple
  },
  {
    id: 'chemistry',
    name: 'CHEMISTRY',
    tagline: 'Molecular Intellect',
    description: 'Elements, reactions, stoichiometry, thermodynamics, and molecular bonding.',
    topicCount: 8,
    bannerImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80',
    accentColor: '#059669', // Emerald
  },
  {
    id: 'physics',
    name: 'PHYSICS',
    tagline: 'Cosmic Laws',
    description: 'Mechanics, quantum phenomena, thermodynamics, optics, and astrophysics.',
    topicCount: 8,
    bannerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
    accentColor: '#2563EB', // Blue
  },
];

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { levelNumber: 1, name: 'Casual', description: 'Elementary concepts, main characters, and iconic starter lore.', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { levelNumber: 2, name: 'Easy', description: 'Foundational trivia familiar to any casual fan or high school student.', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { levelNumber: 3, name: 'Familiar', description: 'Core plot developments, memorable battles, and standard scientific formulas.', badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  { levelNumber: 4, name: 'Moderate', description: 'Key secondary characters, pivotal season twists, and periodic trends.', badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  { levelNumber: 5, name: 'Challenging', description: 'Intermediate knowledge requiring acute attention to detail and precise recall.', badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  { levelNumber: 6, name: 'Hard', description: 'Subtle arcs, backstory intricacies, and multi-step quantitative problems.', badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { levelNumber: 7, name: 'Expert', description: 'Deep lore, manga-adjacent facts, reaction kinetics, and electromagnetic equations.', badgeColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' },
  { levelNumber: 8, name: 'Very Hard', description: 'Obscure trivia, minute timestamps, and advanced college-level principles.', badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { levelNumber: 9, name: 'Master', description: 'Only veteran fans and subject experts will score above fifty percent.', badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  { levelNumber: 10, name: 'Nightmare', description: 'Absolute peak difficulty. Trivia known only by loremasters and researchers.', badgeColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
];
