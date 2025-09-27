// Utility functions for mapping user ages to question age ranges

/**
 * Maps a user's actual age to an appropriate question age range
 * Users over 18 will get questions from the highest available age range (18)
 */
export function mapUserAgeToQuestionRange(userAge: number): string {
  // Ensure minimum age
  if (userAge < 3) {
    return '3-6';
  }
  
  // Age ranges based on typical educational levels
  if (userAge >= 3 && userAge <= 6) {
    return '3-6';
  } else if (userAge >= 7 && userAge <= 10) {
    return '7-10';
  } else if (userAge >= 11 && userAge <= 14) {
    return '11-14';
  } else if (userAge >= 15 && userAge <= 18) {
    return '15-18';
  } else {
    // For users over 18, use the highest available age range
    return '15-18';
  }
}

/**
 * Gets all available age ranges in the system
 */
export function getAvailableAgeRanges(): string[] {
  return ['3-6', '7-10', '11-14', '15-18'];
}

/**
 * Validates if an age range is valid
 */
export function isValidAgeRange(ageRange: string): boolean {
  return getAvailableAgeRanges().includes(ageRange);
}

/**
 * Gets the difficulty level associated with an age range
 */
export function getAgeRangeDifficulty(ageRange: string): number {
  switch (ageRange) {
    case '3-6':
      return 1;
    case '7-10':
      return 2;
    case '11-14':
      return 3;
    case '15-18':
      return 4;
    default:
      return 1;
  }
}

/**
 * Gets a user-friendly description of an age range
 */
export function getAgeRangeDescription(ageRange: string): string {
  switch (ageRange) {
    case '3-6':
      return 'Early Learning (Ages 3-6)';
    case '7-10':
      return 'Elementary (Ages 7-10)';
    case '11-14':
      return 'Middle School (Ages 11-14)';
    case '15-18':
      return 'High School (Ages 15-18)';
    default:
      return 'Unknown Age Range';
  }
}