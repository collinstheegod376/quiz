/**
 * JSON-LD Structured Data Schema Generators for AniZuki
 * Implements Google Rich Results compliant schemas for:
 * - SoftwareApplication / WebApplication
 * - Quiz
 * - Leaderboard (ItemList)
 * - BreadcrumbList
 */

import { Topic, Question } from '@/types/quiz';

const BASE_URL = 'https://anizuki.sbs';

export interface LeaderboardRankItem {
  rank: number;
  username: string;
  score: number;
  winRate?: number;
}

/**
 * Global SoftwareApplication (WebApplication) Schema for AniZuki
 */
export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${BASE_URL}/#webapp`,
    name: 'AniZuki',
    alternateName: 'AniZuki Anime Quiz Arena',
    url: BASE_URL,
    applicationCategory: 'GameApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description:
      'AniZuki is a real-time multiplayer anime trivia and quiz arena. Challenge friends, climb the global leaderboard, and master anime, series, and gaming trivia.',
    image: `${BASE_URL}/images/topics/gojo-vs-sukuna.jpg`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    author: {
      '@type': 'Person',
      name: 'Promised Killua',
      url: 'https://www.promisedkillua.sbs/',
    },
    creator: {
      '@type': 'Person',
      name: 'Promised Killua',
      url: 'https://www.promisedkillua.sbs/',
    },
    inLanguage: 'en',
    genre: ['Trivia', 'Anime', 'Quiz', 'Multiplayer'],
  };
}

/**
 * Quiz Structured Schema for Topics
 * Adheres strictly to Google Rich Results / Schema.org Quiz specifications
 */
export function getQuizSchema(topic: Topic, sampleQuestions: Question[] = []) {
  const schemaQuestions = sampleQuestions.slice(0, 5).map((q) => {
    // Map correct option letter to option text
    let correctText = q.optionA;
    if (q.correctOption === 'B') correctText = q.optionB;
    else if (q.correctOption === 'C') correctText = q.optionC;
    else if (q.correctOption === 'D') correctText = q.optionD;

    const options = [
      { text: q.optionA, pos: 1 },
      { text: q.optionB, pos: 2 },
      { text: q.optionC, pos: 3 },
      { text: q.optionD, pos: 4 },
    ].filter((opt) => Boolean(opt.text));

    return {
      '@type': 'Question',
      name: q.questionText,
      text: q.questionText,
      suggestedAnswer: options.map((opt) => ({
        '@type': 'Answer',
        position: opt.pos,
        text: opt.text,
      })),
      acceptedAnswer: {
        '@type': 'Answer',
        text: correctText,
        comment: q.explanation || undefined,
      },
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    '@id': `${BASE_URL}/topic/${topic.slug || topic.id}#quiz`,
    name: `${topic.name} Anime Quiz & Trivia`,
    description: topic.description,
    educationalLevel: 'All Levels (Tiers 1 to 10)',
    learningResourceType: 'Quiz',
    about: {
      '@type': 'Thing',
      name: topic.name,
    },
    url: `${BASE_URL}/topic/${topic.slug || topic.id}`,
    image: topic.imageUrl.startsWith('http') ? topic.imageUrl : `${BASE_URL}${topic.imageUrl}`,
    provider: {
      '@type': 'Organization',
      name: 'AniZuki',
      url: BASE_URL,
    },
    ...(schemaQuestions.length > 0 ? { hasPart: schemaQuestions } : {}),
  };
}

/**
 * Leaderboard ItemList Structured Schema
 */
export function getLeaderboardSchema(entries: LeaderboardRankItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${BASE_URL}/leaderboard#list`,
    name: 'AniZuki Global Champions Leaderboard',
    description: 'Current real-time rankings and top high-scores on the AniZuki Anime Quiz Arena.',
    url: `${BASE_URL}/leaderboard`,
    numberOfItems: entries.length,
    itemListElement: entries.map((entry) => ({
      '@type': 'ListItem',
      position: entry.rank,
      name: `${entry.username} - Rank #${entry.rank} (${entry.score.toLocaleString()} XP)`,
      description: `Rank #${entry.rank} held by ${entry.username} with a total match score of ${entry.score.toLocaleString()} XP${
        entry.winRate !== undefined ? ` and ${entry.winRate}% win rate` : ''
      }.`,
    })),
  };
}

/**
 * BreadcrumbList Schema
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}
