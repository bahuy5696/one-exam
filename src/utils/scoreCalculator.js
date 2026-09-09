// scoreCalculator.js
// AWS SAA-C03 scaled score (100-1000, passing 720) and per-domain accuracy.

import { DOMAIN_ORDER, DOMAINS } from './domainClassifier';

export const MIN_SCALED = 100;
export const MAX_SCALED = 1000;
export const PASSING_SCORE = 720;

/**
 * Compares a user's answer set against a question's solutions.
 * Correct only when the selected set exactly matches the solution set.
 */
export function isQuestionCorrect(question, userSelections) {
  const correct = [...(question.solutions || [])].sort();
  const chosen = [...(userSelections || [])].sort();
  if (correct.length === 0) return false;
  if (correct.length !== chosen.length) return false;
  return correct.every((c, i) => c === chosen[i]);
}

/**
 * Convert a raw ratio (0..1) to the AWS scaled score range (100..1000).
 */
export function toScaledScore(ratio) {
  const clamped = Math.max(0, Math.min(1, ratio));
  return Math.round(MIN_SCALED + clamped * (MAX_SCALED - MIN_SCALED));
}

/**
 * Compute the full results object for an exam.
 * @param {Array} questions  the exam question set (each tagged with `domain`)
 * @param {Object} answers   map of question_number -> array of choice letters
 */
export function calculateResults(questions, answers) {
  let correctCount = 0;

  const domainStats = {};
  DOMAIN_ORDER.forEach((d) => {
    domainStats[d.id] = { total: 0, correct: 0 };
  });

  const perQuestion = questions.map((q) => {
    const userSelections = answers[q.question_number] || [];
    const correct = isQuestionCorrect(q, userSelections);
    const answered = userSelections.length > 0;

    if (correct) correctCount += 1;

    const domainId = q.domain || DOMAINS.SECURE.id;
    if (!domainStats[domainId]) {
      domainStats[domainId] = { total: 0, correct: 0 };
    }
    domainStats[domainId].total += 1;
    if (correct) domainStats[domainId].correct += 1;

    return {
      question: q,
      userSelections,
      correct,
      answered,
    };
  });

  const total = questions.length || 1;
  const ratio = correctCount / total;
  const scaledScore = toScaledScore(ratio);

  const domainBreakdown = DOMAIN_ORDER.map((d) => {
    const stats = domainStats[d.id] || { total: 0, correct: 0 };
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return {
      id: d.id,
      number: d.number,
      name: d.name,
      weight: d.weight,
      total: stats.total,
      correct: stats.correct,
      percentage: pct,
    };
  });

  return {
    total: questions.length,
    correctCount,
    incorrectCount: questions.length - correctCount,
    percentage: Math.round(ratio * 100),
    scaledScore,
    passed: scaledScore >= PASSING_SCORE,
    domainBreakdown,
    perQuestion,
  };
}
