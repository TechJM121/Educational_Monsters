// Local fallback questions for when Supabase is not available
import type { Question, Subject } from '../types/question';

export const localSubjects: Subject[] = [
  {
    id: 'math-local',
    name: 'Mathematics',
    description: 'Numbers, calculations, and problem-solving',
    icon: '🔢',
    color: '#3B82F6',
    statMapping: {
      primary: 'intelligence',
      secondary: 'wisdom'
    }
  },
  {
    id: 'science-local',
    name: 'Science',
    description: 'Physics, chemistry, and experiments',
    icon: '🔬',
    color: '#10B981',
    statMapping: {
      primary: 'dexterity',
      secondary: 'intelligence'
    }
  },
  {
    id: 'biology-local',
    name: 'Biology',
    description: 'Living organisms and life processes',
    icon: '🧬',
    color: '#059669',
    statMapping: {
      primary: 'vitality',
      secondary: 'intelligence'
    }
  },
  {
    id: 'history-local',
    name: 'History',
    description: 'Past events and civilizations',
    icon: '📚',
    color: '#F59E0B',
    statMapping: {
      primary: 'wisdom',
      secondary: 'charisma'
    }
  },
  {
    id: 'language-local',
    name: 'Language Arts',
    description: 'Reading, writing, and communication',
    icon: '📝',
    color: '#8B5CF6',
    statMapping: {
      primary: 'charisma',
      secondary: 'creativity'
    }
  },
  {
    id: 'art-local',
    name: 'Art',
    description: 'Creative expression and design',
    icon: '🎨',
    color: '#EF4444',
    statMapping: {
      primary: 'creativity',
      secondary: 'charisma'
    }
  }
];

export const localQuestions: Question[] = [
  // Mathematics Questions - Ages 3-6
  {
    id: 'math-1',
    subject_id: 'math-local',
    question_text: 'How many apples are there? 🍎🍎🍎',
    answer_options: ['2', '3', '4', '5'],
    correct_answer: '3',
    difficulty_level: 1,
    xp_reward: 10,
    age_range: '3-6',
    hint: 'Count each apple carefully!',
    explanation: 'There are 3 apples shown.',
    subjects: localSubjects[0]
  },
  {
    id: 'math-2',
    subject_id: 'math-local',
    question_text: 'What is 1 + 1?',
    answer_options: ['1', '2', '3', '4'],
    correct_answer: '2',
    difficulty_level: 1,
    xp_reward: 10,
    age_range: '3-6',
    hint: 'Put one finger up, then add another finger!',
    explanation: 'When you add 1 and 1 together, you get 2.',
    subjects: localSubjects[0]
  },
  {
    id: 'math-3',
    subject_id: 'math-local',
    question_text: 'What is 2 + 2?',
    answer_options: ['3', '4', '5', '6'],
    correct_answer: '4',
    difficulty_level: 1,
    xp_reward: 10,
    age_range: '3-6',
    hint: 'Count on your fingers: 2 fingers plus 2 more fingers!',
    explanation: '2 + 2 = 4. You can count it on your fingers!',
    subjects: localSubjects[0]
  },
  {
    id: 'math-4',
    subject_id: 'math-local',
    question_text: 'How many sides does a triangle have?',
    answer_options: ['2', '3', '4', '5'],
    correct_answer: '3',
    difficulty_level: 1,
    xp_reward: 10,
    age_range: '3-6',
    hint: 'A triangle has three corners!',
    explanation: 'A triangle always has exactly 3 sides.',
    subjects: localSubjects[0]
  },

  // Mathematics Questions - Ages 7-10
  {
    id: 'math-5',
    subject_id: 'math-local',
    question_text: 'What is 7 + 5?',
    answer_options: ['11', '12', '13', '14'],
    correct_answer: '12',
    difficulty_level: 2,
    xp_reward: 20,
    age_range: '7-10',
    hint: 'Try counting up from 7: 8, 9, 10, 11, 12',
    explanation: '7 + 5 = 12. You can count up from 7 five times.',
    subjects: localSubjects[0]
  },
  {
    id: 'math-6',
    subject_id: 'math-local',
    question_text: 'What is 3 × 4?',
    answer_options: ['10', '11', '12', '13'],
    correct_answer: '12',
    difficulty_level: 2,
    xp_reward: 20,
    age_range: '7-10',
    hint: 'Think of it as 3 groups of 4, or 4 + 4 + 4',
    explanation: '3 × 4 = 12. Multiplication is repeated addition!',
    subjects: localSubjects[0]
  },

  // Science Questions - Ages 3-6
  {
    id: 'science-1',
    subject_id: 'science-local',
    question_text: 'What do plants need to grow?',
    answer_options: ['Only water', 'Only sunlight', 'Water, sunlight, and air', 'Only soil'],
    correct_answer: 'Water, sunlight, and air',
    difficulty_level: 1,
    xp_reward: 10,
    age_range: '3-6',
    hint: 'Plants are like us - they need multiple things to stay healthy!',
    explanation: 'Plants need water, sunlight, and air to grow big and strong.',
    subjects: localSubjects[1]
  },
  {
    id: 'science-2',
    subject_id: 'science-local',
    question_text: 'What happens to water when it gets very cold?',
    answer_options: ['It disappears', 'It turns into ice', 'It gets warmer', 'It changes color'],
    correct_answer: 'It turns into ice',
    difficulty_level: 2,
    xp_reward: 20,
    age_range: '7-10',
    hint: 'Think about what you see in the freezer!',
    explanation: 'When water gets very cold (below 0°C), it freezes and becomes ice.',
    subjects: localSubjects[1]
  },

  // Biology Questions
  {
    id: 'biology-1',
    subject_id: 'biology-local',
    question_text: 'How many legs does a spider have?',
    answer_options: ['6', '8', '10', '12'],
    correct_answer: '8',
    difficulty_level: 1,
    xp_reward: 10,
    age_range: '3-6',
    hint: 'Spiders have more legs than insects!',
    explanation: 'All spiders have 8 legs. This is what makes them arachnids, not insects.',
    subjects: localSubjects[2]
  },

  // History Questions
  {
    id: 'history-1',
    subject_id: 'history-local',
    question_text: 'What did people use before cars to travel long distances?',
    answer_options: ['Airplanes', 'Horses and carriages', 'Bicycles', 'Trains only'],
    correct_answer: 'Horses and carriages',
    difficulty_level: 2,
    xp_reward: 20,
    age_range: '7-10',
    hint: 'Think about animals that can carry people!',
    explanation: 'Before cars were invented, people used horses and carriages for long-distance travel.',
    subjects: localSubjects[3]
  },

  // Language Arts Questions
  {
    id: 'language-1',
    subject_id: 'language-local',
    question_text: 'Which word rhymes with "cat"?',
    answer_options: ['dog', 'hat', 'bird', 'fish'],
    correct_answer: 'hat',
    difficulty_level: 1,
    xp_reward: 10,
    age_range: '3-6',
    hint: 'Listen to the ending sounds: cat, hat!',
    explanation: 'Cat and hat both end with the same sound (-at), so they rhyme.',
    subjects: localSubjects[4]
  },

  // Art Questions
  {
    id: 'art-1',
    subject_id: 'art-local',
    question_text: 'What are the three primary colors?',
    answer_options: ['Red, Blue, Yellow', 'Red, Green, Blue', 'Blue, Yellow, Orange', 'Red, Purple, Green'],
    correct_answer: 'Red, Blue, Yellow',
    difficulty_level: 2,
    xp_reward: 20,
    age_range: '7-10',
    hint: 'These colors cannot be made by mixing other colors!',
    explanation: 'Red, blue, and yellow are primary colors. All other colors can be made by mixing these.',
    subjects: localSubjects[5]
  }
];

// Helper function to get questions by filters
export function getLocalQuestions(filters: {
  ageRange?: string;
  subjectId?: string;
  difficultyLevel?: number;
  limit?: number;
}): Question[] {
  let filteredQuestions = [...localQuestions];

  if (filters.ageRange) {
    filteredQuestions = filteredQuestions.filter(q => q.age_range === filters.ageRange);
  }

  if (filters.subjectId) {
    filteredQuestions = filteredQuestions.filter(q => q.subject_id === filters.subjectId);
  }

  if (filters.difficultyLevel) {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty_level === filters.difficultyLevel);
  }

  // Shuffle questions for variety
  const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);

  if (filters.limit) {
    return shuffled.slice(0, filters.limit);
  }

  return shuffled;
}

// Helper function to get local subjects
export function getLocalSubjects(): Subject[] {
  return [...localSubjects];
}