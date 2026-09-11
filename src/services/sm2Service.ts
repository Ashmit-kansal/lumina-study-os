import { Flashcard } from '../types';

export type ReviewRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface SM2Result {
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewDate: string;
  status: 'new' | 'learning' | 'mastered';
}

/**
 * Calculates next review parameters based on the SuperMemo SM-2 Algorithm.
 * 
 * Rating scale:
 * 1 = Again: Complete failure / Forgot
 * 2 = Hard: Remembered with significant hesitation
 * 3 = Good: Correct recall with modest effort
 * 4 = Easy: Perfect, immediate recall
 */
export function calculateSM2(card: Flashcard, rating: ReviewRating): SM2Result {
  let { repetitions, easeFactor, intervalDays } = card;

  // Convert 1-4 scale to SM-2 quality (0 to 5)
  // 1 -> 0 or 1, 2 -> 3, 3 -> 4, 4 -> 5
  let quality: number;
  switch (rating) {
    case 1: // Again
      quality = 1;
      break;
    case 2: // Hard
      quality = 3;
      break;
    case 3: // Good
      quality = 4;
      break;
    case 4: // Easy
      quality = 5;
      break;
    default:
      quality = 4;
  }

  // Calculate new Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  let newRepetitions: number;
  let newIntervalDays: number;

  if (quality < 3) {
    // Failed recall: reset repetitions to 0, review again in 1 day or immediately
    newRepetitions = 0;
    newIntervalDays = 1;
  } else {
    // Successful recall
    if (repetitions === 0) {
      newIntervalDays = 1;
    } else if (repetitions === 1) {
      newIntervalDays = rating === 4 ? 6 : (rating === 2 ? 2 : 4);
    } else {
      newIntervalDays = Math.round(intervalDays * newEaseFactor);
      if (rating === 2) {
        newIntervalDays = Math.max(intervalDays + 1, Math.round(newIntervalDays * 0.8));
      } else if (rating === 4) {
        newIntervalDays = Math.round(newIntervalDays * 1.3);
      }
    }
    newRepetitions = repetitions + 1;
  }

  // Determine card status
  let status: 'new' | 'learning' | 'mastered' = 'learning';
  if (newRepetitions === 0) {
    status = 'new';
  } else if (newRepetitions >= 4 && newIntervalDays >= 14) {
    status = 'mastered';
  } else {
    status = 'learning';
  }

  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newIntervalDays);
  const nextReviewDate = nextDate.toISOString().split('T')[0];

  return {
    repetitions: newRepetitions,
    easeFactor: Number(newEaseFactor.toFixed(2)),
    intervalDays: newIntervalDays,
    nextReviewDate,
    status,
  };
}

/**
 * Returns human-readable next interval preview for a given rating
 */
export function getIntervalPreview(card: Flashcard, rating: ReviewRating): string {
  const result = calculateSM2(card, rating);
  if (result.intervalDays === 1) return '1 day';
  if (result.intervalDays < 30) return `${result.intervalDays} days`;
  const months = Math.round(result.intervalDays / 30);
  return `${months} mo`;
}

/**
 * Helper to filter cards that are due today or overdue
 */
export function isCardDue(card: Flashcard): boolean {
  const today = new Date().toISOString().split('T')[0];
  return card.nextReviewDate <= today;
}
