import { supabase } from './supabaseClient';
import type { Question, QuestionResponse, Subject } from '../types/question';
import type { CharacterStats } from '../types/character';

export class QuestionService {
  /**
   * Get questions filtered by age range and subject
   */
  async getQuestionsByAgeAndSubject(
    ageRange: string,
    subjectId?: string,
    limit: number = 10
  ): Promise<Question[]> {
    let query = supabase
      .from('questions')
      .select(`
        *,
        subjects (
          name,
          primary_stat,
          secondary_stat
        )
      `)
      .eq('age_range', ageRange)
      .limit(limit);

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get questions based on student performance and adaptive difficulty
   */
  async getAdaptiveQuestions(
    userId: string,
    ageRange: string,
    subjectId?: string,
    limit: number = 10
  ): Promise<Question[]> {
    if (!subjectId) {
      // If no specific subject, get questions from all subjects for the age range
      return this.getQuestionsByAgeAndSubject(ageRange, undefined, limit);
    }

    // Get user's age for difficulty scaling
    const { data: user } = await supabase
      .from('users')
      .select('age')
      .eq('id', userId)
      .single();

    if (!user) {
      // Fallback to basic questions if user not found
      return this.getQuestionsByAgeAndSubject(ageRange, subjectId, limit);
    }

    // Use difficulty scaling service for adaptive questions
    const { difficultyScalingService } = await import('./difficultyScalingService');
    
    try {
      return await difficultyScalingService.getAdaptiveQuestions(
        userId,
        subjectId,
        user.age,
        ageRange,
        limit
      );
    } catch (error) {
      console.error('Failed to get adaptive questions, falling back to basic selection:', error);
      return this.getQuestionsByAgeAndSubject(ageRange, subjectId, limit);
    }
  }

  /**
   * Submit a question response and calculate XP reward
   */
  async submitQuestionResponse(
    userId: string,
    questionId: string,
    selectedAnswer: string,
    responseTimeSeconds?: number
  ): Promise<QuestionResponse> {
    // Get the question details
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select(`
        *,
        subjects (
          name,
          primary_stat,
          secondary_stat
        )
      `)
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      throw new Error(`Failed to fetch question: ${questionError?.message}`);
    }

    const isCorrect = selectedAnswer === question.correct_answer;
    let xpEarned = 0;

    if (isCorrect) {
      // Calculate XP based on difficulty, time bonus, and accuracy
      xpEarned = this.calculateXPReward(
        question.difficulty_level,
        question.xp_reward,
        responseTimeSeconds
      );
    }

    // Submit the response
    const { data: response, error: responseError } = await supabase
      .from('question_responses')
      .insert({
        user_id: userId,
        question_id: questionId,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        xp_earned: xpEarned,
        response_time_seconds: responseTimeSeconds
      })
      .select()
      .single();

    if (responseError) {
      throw new Error(`Failed to submit response: ${responseError.message}`);
    }

    // If correct, update character XP and stats
    if (isCorrect && xpEarned > 0) {
      await this.updateCharacterProgress(userId, xpEarned, question.subjects);
    }

    return response;
  }

  /**
   * Calculate XP reward based on difficulty, base reward, and time bonus
   */
  private calculateXPReward(
    difficultyLevel: number,
    baseXP: number,
    responseTimeSeconds?: number
  ): number {
    let xp = baseXP;

    // Difficulty multiplier
    const difficultyMultiplier = 1 + (difficultyLevel - 1) * 0.2;
    xp *= difficultyMultiplier;

    // Time bonus (faster responses get bonus XP)
    if (responseTimeSeconds && responseTimeSeconds <= 10) {
      const timeBonus = Math.max(0, (10 - responseTimeSeconds) / 10 * 0.3);
      xp *= (1 + timeBonus);
    }

    return Math.floor(xp);
  }

  /**
   * Update character XP and stats based on subject
   */
  private async updateCharacterProgress(
    userId: string,
    xpEarned: number,
    subject: any
  ): Promise<void> {
    // Get user's character
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id, total_xp, current_xp, level')
      .eq('user_id', userId)
      .single();

    if (characterError || !character) {
      throw new Error(`Failed to fetch character: ${characterError?.message}`);
    }

    // Calculate new XP and level
    const newTotalXP = character.total_xp + xpEarned;
    const newLevel = this.calculateLevelFromXP(newTotalXP);
    const xpForCurrentLevel = this.calculateXPForLevel(newLevel);
    const xpForNextLevel = this.calculateXPForLevel(newLevel + 1);
    const newCurrentXP = newTotalXP - xpForCurrentLevel;

    // Update character XP and level
    const { error: updateError } = await supabase
      .from('characters')
      .update({
        total_xp: newTotalXP,
        current_xp: newCurrentXP,
        level: newLevel
      })
      .eq('id', character.id);

    if (updateError) {
      throw new Error(`Failed to update character: ${updateError.message}`);
    }

    // If leveled up, award stat points
    if (newLevel > character.level) {
      const levelsGained = newLevel - character.level;
      const statPointsAwarded = levelsGained * 3; // 3 points per level

      const { error: statsError } = await supabase
        .from('character_stats')
        .update({
          available_points: supabase.raw(`available_points + ${statPointsAwarded}`)
        })
        .eq('character_id', character.id);

      if (statsError) {
        console.error('Failed to award stat points:', statsError);
      }
    }

    // Update subject-specific stats slightly
    if (subject) {
      const statIncrease = Math.ceil(xpEarned / 50); // Small stat increase
      const updates: any = {};
      
      if (subject.primary_stat) {
        updates[subject.primary_stat] = supabase.raw(`${subject.primary_stat} + ${statIncrease}`);
      }
      
      if (subject.secondary_stat && statIncrease > 1) {
        const secondaryIncrease = Math.ceil(statIncrease / 2);
        updates[subject.secondary_stat] = supabase.raw(`${subject.secondary_stat} + ${secondaryIncrease}`);
      }

      if (Object.keys(updates).length > 0) {
        const { error: statUpdateError } = await supabase
          .from('character_stats')
          .update(updates)
          .eq('character_id', character.id);

        if (statUpdateError) {
          console.error('Failed to update character stats:', statUpdateError);
        }
      }
    }
  }

  /**
   * Calculate level from total XP
   */
  private calculateLevelFromXP(totalXP: number): number {
    if (totalXP < 100) return 1;
    
    let level = 1;
    let xpRequired = 0;
    
    while (xpRequired <= totalXP) {
      level++;
      if (level <= 10) {
        xpRequired += 100; // 100 XP per level for levels 1-10
      } else if (level <= 25) {
        xpRequired += 150; // 150 XP per level for levels 11-25
      } else {
        xpRequired += 200; // 200 XP per level for 26+
      }
    }
    
    return level - 1;
  }

  /**
   * Calculate total XP required for a specific level
   */
  private calculateXPForLevel(level: number): number {
    if (level <= 1) return 0;
    
    let totalXP = 0;
    
    for (let i = 2; i <= level; i++) {
      if (i <= 10) {
        totalXP += 100;
      } else if (i <= 25) {
        totalXP += 150;
      } else {
        totalXP += 200;
      }
    }
    
    return totalXP;
  }

  /**
   * Get all subjects with their stat mappings
   */
  async getSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch subjects: ${error.message}`);
    }

    return data?.map(subject => ({
      id: subject.id,
      name: subject.name,
      description: subject.description || '',
      icon: '', // Will be handled by UI
      color: '', // Will be handled by UI
      statMapping: {
        primary: subject.primary_stat as keyof CharacterStats,
        secondary: subject.secondary_stat as keyof CharacterStats
      }
    })) || [];
  }

  /**
   * Get user's progress for a specific subject
   */
  async getUserProgress(userId: string, subjectId: string) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('subject_id', subjectId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to fetch user progress: ${error.message}`);
    }

    return data;
  }
}

export const questionService = new QuestionService();