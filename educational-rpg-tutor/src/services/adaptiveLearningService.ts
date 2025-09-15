import { supabase } from './supabaseClient';
import { difficultyScalingService } from './difficultyScalingService';
import { ageFilteringService } from './ageFilteringService';
import type { Question } from '../types/question';

export interface LearningProfile {
  userId: string;
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  strengths: string[]; // Subject areas where student excels
  weaknesses: string[]; // Subject areas needing improvement
  averageSessionLength: number; // In minutes
  optimalDifficultyCurve: number; // Rate of difficulty increase
  motivationFactors: string[]; // What motivates this student
  lastUpdated: Date;
}

export interface AdaptiveRecommendation {
  questions: Question[];
  reasoning: string;
  difficultyAdjustment: number;
  estimatedCompletionTime: number;
  learningObjectives: string[];
  nextSteps: string[];
}

export interface ConceptMastery {
  conceptId: string;
  conceptName: string;
  subjectId: string;
  masteryLevel: number; // 0-1 scale
  questionsAttempted: number;
  questionsCorrect: number;
  averageResponseTime: number;
  lastPracticed: Date;
  needsReview: boolean;
}

export interface LearningAnalytics {
  userId: string;
  conceptMasteries: ConceptMastery[];
  knowledgeGaps: string[];
  recommendedTopics: string[];
  learningVelocity: number; // Concepts mastered per week
  timeSpentLearning: number; // Total minutes
  streakDays: number;
  lastAnalyzed: Date;
}

export interface ContentRecommendation {
  questionIds: string[];
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDifficulty: number;
  learningObjectives: string[];
  prerequisites: string[];
}

export class AdaptiveLearningService {
  /**
   * Get personalized learning recommendations for a user
   */
  async getPersonalizedRecommendations(
    userId: string,
    subjectId?: string,
    limit: number = 10
  ): Promise<AdaptiveRecommendation> {
    const learningProfile = await this.getLearningProfile(userId);
    const analytics = await this.getLearningAnalytics(userId);
    const userAge = await this.getUserAge(userId);
    
    // Get age-appropriate content
    const ageAppropriateContent = await ageFilteringService.getAgeAppropriateContent(
      userId,
      subjectId,
      limit * 2 // Get more to allow for filtering
    );

    // Apply adaptive filtering based on performance and learning profile
    const adaptiveQuestions = await this.filterQuestionsAdaptively(
      ageAppropriateContent.questions,
      learningProfile,
      analytics,
      limit
    );

    const difficultyAdjustment = this.calculateDifficultyAdjustment(analytics);
    const estimatedTime = this.estimateCompletionTime(adaptiveQuestions, learningProfile);
    const objectives = this.generateLearningObjectives(adaptiveQuestions, analytics);
    const nextSteps = this.generateNextSteps(analytics, learningProfile);

    return {
      questions: adaptiveQuestions,
      reasoning: this.generateRecommendationReasoning(learningProfile, analytics, adaptiveQuestions),
      difficultyAdjustment,
      estimatedCompletionTime: estimatedTime,
      learningObjectives: objectives,
      nextSteps
    };
  }

  /**
   * Get or create learning profile for a user
   */
  async getLearningProfile(userId: string): Promise<LearningProfile> {
    const { data: profile, error } = await supabase
      .from('learning_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      // Create default profile for new user
      return await this.createDefaultLearningProfile(userId);
    }

    return {
      userId: profile.user_id,
      preferredLearningStyle: profile.preferred_learning_style,
      strengths: profile.strengths || [],
      weaknesses: profile.weaknesses || [],
      averageSessionLength: profile.average_session_length || 15,
      optimalDifficultyCurve: profile.optimal_difficulty_curve || 0.1,
      motivationFactors: profile.motivation_factors || [],
      lastUpdated: new Date(profile.last_updated)
    };
  }

  /**
   * Create default learning profile for new user
   */
  private async createDefaultLearningProfile(userId: string): Promise<LearningProfile> {
    const userAge = await this.getUserAge(userId);
    
    const defaultProfile: LearningProfile = {
      userId,
      preferredLearningStyle: 'mixed',
      strengths: [],
      weaknesses: [],
      averageSessionLength: userAge <= 10 ? 10 : 15,
      optimalDifficultyCurve: userAge <= 10 ? 0.05 : 0.1,
      motivationFactors: ['achievements', 'progress_bars', 'social_recognition'],
      lastUpdated: new Date()
    };

    const { error } = await supabase
      .from('learning_profiles')
      .insert({
        user_id: userId,
        preferred_learning_style: defaultProfile.preferredLearningStyle,
        strengths: defaultProfile.strengths,
        weaknesses: defaultProfile.weaknesses,
        average_session_length: defaultProfile.averageSessionLength,
        optimal_difficulty_curve: defaultProfile.optimalDifficultyCurve,
        motivation_factors: defaultProfile.motivationFactors,
        last_updated: defaultProfile.lastUpdated.toISOString()
      });

    if (error) {
      console.warn('Failed to create learning profile:', error);
    }

    return defaultProfile;
  }

  /**
   * Get comprehensive learning analytics for a user
   */
  async getLearningAnalytics(userId: string): Promise<LearningAnalytics> {
    const conceptMasteries = await this.getConceptMasteries(userId);
    const knowledgeGaps = await this.identifyKnowledgeGaps(userId, conceptMasteries);
    const recommendedTopics = await this.getRecommendedTopics(userId, conceptMasteries);
    const learningVelocity = await this.calculateLearningVelocity(userId);
    const timeSpentLearning = await this.getTotalLearningTime(userId);
    const streakDays = await this.getCurrentStreak(userId);

    return {
      userId,
      conceptMasteries,
      knowledgeGaps,
      recommendedTopics,
      learningVelocity,
      timeSpentLearning,
      streakDays,
      lastAnalyzed: new Date()
    };
  }

  /**
   * Get concept mastery levels for a user
   */
  private async getConceptMasteries(userId: string): Promise<ConceptMastery[]> {
    // Get all question responses with concept mapping
    const { data: responses, error } = await supabase
      .from('question_responses')
      .select(`
        is_correct,
        response_time_seconds,
        created_at,
        questions (
          id,
          subject_id,
          difficulty_level,
          question_text,
          subjects (
            name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error || !responses) {
      return [];
    }

    // Group by concept (using subject as concept for now)
    const conceptGroups: Record<string, any[]> = {};
    
    responses.forEach(response => {
      const subjectId = response.questions?.subject_id;
      if (subjectId) {
        if (!conceptGroups[subjectId]) {
          conceptGroups[subjectId] = [];
        }
        conceptGroups[subjectId].push(response);
      }
    });

    // Calculate mastery for each concept
    const masteries: ConceptMastery[] = [];
    
    for (const [subjectId, subjectResponses] of Object.entries(conceptGroups)) {
      const correctCount = subjectResponses.filter(r => r.is_correct).length;
      const totalCount = subjectResponses.length;
      const accuracy = totalCount > 0 ? correctCount / totalCount : 0;
      
      const responseTimes = subjectResponses
        .filter(r => r.response_time_seconds)
        .map(r => r.response_time_seconds);
      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

      const lastPracticed = subjectResponses.length > 0
        ? new Date(subjectResponses[0].created_at)
        : new Date();

      // Calculate mastery level based on accuracy, consistency, and recency
      const recencyFactor = this.calculateRecencyFactor(lastPracticed);
      const consistencyFactor = this.calculateConsistencyFactor(subjectResponses);
      const masteryLevel = Math.min(1.0, accuracy * consistencyFactor * recencyFactor);

      const subjectName = subjectResponses[0]?.questions?.subjects?.name || `Subject ${subjectId}`;

      masteries.push({
        conceptId: subjectId,
        conceptName: subjectName,
        subjectId,
        masteryLevel,
        questionsAttempted: totalCount,
        questionsCorrect: correctCount,
        averageResponseTime: avgResponseTime,
        lastPracticed,
        needsReview: masteryLevel < 0.7 || this.daysSince(lastPracticed) > 7
      });
    }

    return masteries.sort((a, b) => b.masteryLevel - a.masteryLevel);
  }

  /**
   * Identify knowledge gaps based on concept masteries
   */
  private async identifyKnowledgeGaps(
    userId: string,
    conceptMasteries: ConceptMastery[]
  ): Promise<string[]> {
    const gaps: string[] = [];

    // Find concepts with low mastery
    const weakConcepts = conceptMasteries.filter(c => c.masteryLevel < 0.6);
    gaps.push(...weakConcepts.map(c => `Low mastery in ${c.conceptName}`));

    // Find concepts that haven't been practiced recently
    const staleConcepts = conceptMasteries.filter(c => 
      c.masteryLevel > 0.6 && this.daysSince(c.lastPracticed) > 14
    );
    gaps.push(...staleConcepts.map(c => `${c.conceptName} needs review`));

    // Find missing prerequisite concepts
    const missingPrereqs = await this.findMissingPrerequisites(userId, conceptMasteries);
    gaps.push(...missingPrereqs);

    return gaps.slice(0, 10); // Limit to top 10 gaps
  }

  /**
   * Get recommended topics based on current progress
   */
  private async getRecommendedTopics(
    userId: string,
    conceptMasteries: ConceptMastery[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Recommend topics for improvement
    const improvementCandidates = conceptMasteries
      .filter(c => c.masteryLevel >= 0.4 && c.masteryLevel < 0.8)
      .sort((a, b) => b.masteryLevel - a.masteryLevel)
      .slice(0, 3);

    recommendations.push(...improvementCandidates.map(c => 
      `Continue practicing ${c.conceptName}`
    ));

    // Recommend new topics based on strengths
    const strengths = conceptMasteries
      .filter(c => c.masteryLevel >= 0.8)
      .map(c => c.subjectId);

    if (strengths.length > 0) {
      recommendations.push(`Explore advanced topics in your strong subjects`);
    }

    // Recommend review for stale concepts
    const needsReview = conceptMasteries.filter(c => c.needsReview);
    if (needsReview.length > 0) {
      recommendations.push(`Review ${needsReview[0].conceptName} to maintain mastery`);
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Filter questions adaptively based on learning profile and analytics
   */
  private async filterQuestionsAdaptively(
    questions: Question[],
    profile: LearningProfile,
    analytics: LearningAnalytics,
    limit: number
  ): Promise<Question[]> {
    // Score questions based on adaptive criteria
    const scoredQuestions = questions.map(question => ({
      question,
      score: this.calculateAdaptiveScore(question, profile, analytics)
    }));

    // Sort by score and take top questions
    scoredQuestions.sort((a, b) => b.score - a.score);
    
    return scoredQuestions.slice(0, limit).map(sq => sq.question);
  }

  /**
   * Calculate adaptive score for a question
   */
  private calculateAdaptiveScore(
    question: Question,
    profile: LearningProfile,
    analytics: LearningAnalytics
  ): number {
    let score = 0;

    // Base score from difficulty appropriateness
    const conceptMastery = analytics.conceptMasteries.find(c => c.subjectId === question.subjectId);
    if (conceptMastery) {
      const difficultyMatch = 1 - Math.abs(question.difficultyLevel - (conceptMastery.masteryLevel * 5));
      score += difficultyMatch * 10;
    } else {
      // New concept - start with easier questions
      score += question.difficultyLevel <= 2 ? 8 : 4;
    }

    // Boost score for weakness areas
    if (profile.weaknesses.includes(question.subjectId)) {
      score += 5;
    }

    // Reduce score for strength areas (unless they need review)
    if (profile.strengths.includes(question.subjectId)) {
      const needsReview = conceptMastery?.needsReview;
      score += needsReview ? 3 : -2;
    }

    // Boost score for knowledge gaps
    const hasKnowledgeGap = analytics.knowledgeGaps.some(gap => 
      gap.toLowerCase().includes(question.subjectId.toLowerCase())
    );
    if (hasKnowledgeGap) {
      score += 7;
    }

    return score;
  }

  /**
   * Helper methods
   */
  private async getUserAge(userId: string): Promise<number> {
    const { data: user, error } = await supabase
      .from('users')
      .select('age')
      .eq('id', userId)
      .single();

    return user?.age || 10; // Default age
  }

  private calculateRecencyFactor(lastPracticed: Date): number {
    const daysSince = this.daysSince(lastPracticed);
    if (daysSince <= 1) return 1.0;
    if (daysSince <= 7) return 0.9;
    if (daysSince <= 30) return 0.7;
    return 0.5;
  }

  private calculateConsistencyFactor(responses: any[]): number {
    if (responses.length < 5) return 1.0;
    
    // Calculate consistency based on recent performance trend
    const recent = responses.slice(0, 10);
    const correctCount = recent.filter(r => r.is_correct).length;
    const consistency = correctCount / recent.length;
    
    return Math.max(0.5, consistency);
  }

  private daysSince(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private async findMissingPrerequisites(
    userId: string,
    conceptMasteries: ConceptMastery[]
  ): Promise<string[]> {
    // Simplified prerequisite checking
    // In a real system, this would use a knowledge graph
    const prerequisites: string[] = [];
    
    // Example: If struggling with advanced math, check basic math
    const mathMastery = conceptMasteries.find(c => c.conceptName.toLowerCase().includes('math'));
    if (mathMastery && mathMastery.masteryLevel < 0.5) {
      prerequisites.push('Review basic arithmetic before advanced math');
    }

    return prerequisites;
  }

  private async calculateLearningVelocity(userId: string): Promise<number> {
    // Calculate concepts mastered per week over the last month
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: recentResponses, error } = await supabase
      .from('question_responses')
      .select('created_at, questions(subject_id)')
      .eq('user_id', userId)
      .gte('created_at', oneWeekAgo.toISOString());

    if (error || !recentResponses) return 0;

    const uniqueSubjects = new Set(
      recentResponses.map(r => r.questions?.subject_id).filter(Boolean)
    );

    return uniqueSubjects.size; // Subjects engaged with per week
  }

  private async getTotalLearningTime(userId: string): Promise<number> {
    const { data: responses, error } = await supabase
      .from('question_responses')
      .select('response_time_seconds')
      .eq('user_id', userId);

    if (error || !responses) return 0;

    const totalSeconds = responses
      .filter(r => r.response_time_seconds)
      .reduce((sum, r) => sum + r.response_time_seconds!, 0);

    return Math.round(totalSeconds / 60); // Convert to minutes
  }

  private async getCurrentStreak(userId: string): Promise<number> {
    const { data: responses, error } = await supabase
      .from('question_responses')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !responses) return 0;

    // Calculate consecutive days with activity
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activityDates = new Set(
      responses.map(r => {
        const date = new Date(r.created_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    let currentDate = new Date(today);
    while (activityDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  private calculateDifficultyAdjustment(analytics: LearningAnalytics): number {
    const avgMastery = analytics.conceptMasteries.length > 0
      ? analytics.conceptMasteries.reduce((sum, c) => sum + c.masteryLevel, 0) / analytics.conceptMasteries.length
      : 0.5;

    return (avgMastery - 0.5) * 2; // Range: -1 to 1
  }

  private estimateCompletionTime(
    questions: Question[],
    profile: LearningProfile
  ): number {
    const baseTimePerQuestion = profile.averageSessionLength / 10; // Assume 10 questions per session
    return questions.length * baseTimePerQuestion;
  }

  private generateLearningObjectives(
    questions: Question[],
    analytics: LearningAnalytics
  ): string[] {
    const objectives: string[] = [];
    
    // Group questions by subject
    const subjectGroups: Record<string, Question[]> = {};
    questions.forEach(q => {
      if (!subjectGroups[q.subjectId]) {
        subjectGroups[q.subjectId] = [];
      }
      subjectGroups[q.subjectId].push(q);
    });

    // Generate objectives for each subject
    Object.entries(subjectGroups).forEach(([subjectId, subjectQuestions]) => {
      const conceptMastery = analytics.conceptMasteries.find(c => c.subjectId === subjectId);
      const avgDifficulty = subjectQuestions.reduce((sum, q) => sum + q.difficultyLevel, 0) / subjectQuestions.length;
      
      if (conceptMastery && conceptMastery.masteryLevel < 0.6) {
        objectives.push(`Improve understanding of ${conceptMastery.conceptName}`);
      } else if (avgDifficulty >= 4) {
        objectives.push(`Master advanced concepts in ${conceptMastery?.conceptName || 'this subject'}`);
      } else {
        objectives.push(`Practice and reinforce ${conceptMastery?.conceptName || 'this subject'} skills`);
      }
    });

    return objectives;
  }

  private generateNextSteps(
    analytics: LearningAnalytics,
    profile: LearningProfile
  ): string[] {
    const steps: string[] = [];

    // Based on knowledge gaps
    if (analytics.knowledgeGaps.length > 0) {
      steps.push(`Focus on addressing: ${analytics.knowledgeGaps[0]}`);
    }

    // Based on learning velocity
    if (analytics.learningVelocity < 1) {
      steps.push('Try to engage with learning content more regularly');
    } else if (analytics.learningVelocity > 3) {
      steps.push('Consider exploring more challenging topics');
    }

    // Based on streak
    if (analytics.streakDays === 0) {
      steps.push('Start building a daily learning habit');
    } else if (analytics.streakDays >= 7) {
      steps.push('Great job maintaining your learning streak!');
    }

    // Based on weaknesses
    if (profile.weaknesses.length > 0) {
      steps.push(`Dedicate extra time to ${profile.weaknesses[0]}`);
    }

    return steps.slice(0, 3);
  }

  private generateRecommendationReasoning(
    profile: LearningProfile,
    analytics: LearningAnalytics,
    questions: Question[]
  ): string {
    const reasons: string[] = [];

    if (analytics.conceptMasteries.length > 0) {
      const avgMastery = analytics.conceptMasteries.reduce((sum, c) => sum + c.masteryLevel, 0) / analytics.conceptMasteries.length;
      if (avgMastery < 0.5) {
        reasons.push('focusing on foundational concepts');
      } else if (avgMastery > 0.8) {
        reasons.push('providing challenging content to maintain engagement');
      } else {
        reasons.push('balancing review and new learning');
      }
    }

    if (profile.weaknesses.length > 0) {
      reasons.push(`addressing identified weakness areas`);
    }

    if (analytics.knowledgeGaps.length > 0) {
      reasons.push('filling knowledge gaps');
    }

    const avgDifficulty = questions.reduce((sum, q) => sum + q.difficultyLevel, 0) / questions.length;
    reasons.push(`targeting difficulty level ${avgDifficulty.toFixed(1)}`);

    return `Recommendations based on ${reasons.join(', ')}.`;
  }

  /**
   * Update learning profile based on recent activity
   */
  async updateLearningProfile(userId: string): Promise<void> {
    const analytics = await this.getLearningAnalytics(userId);
    const currentProfile = await this.getLearningProfile(userId);

    // Update strengths and weaknesses based on mastery levels
    const strengths = analytics.conceptMasteries
      .filter(c => c.masteryLevel >= 0.8)
      .map(c => c.subjectId)
      .slice(0, 3);

    const weaknesses = analytics.conceptMasteries
      .filter(c => c.masteryLevel < 0.6)
      .map(c => c.subjectId)
      .slice(0, 3);

    // Update average session length based on recent activity
    const recentSessionLength = await this.calculateRecentSessionLength(userId);

    const updatedProfile = {
      ...currentProfile,
      strengths,
      weaknesses,
      averageSessionLength: recentSessionLength || currentProfile.averageSessionLength,
      lastUpdated: new Date()
    };

    await supabase
      .from('learning_profiles')
      .upsert({
        user_id: userId,
        preferred_learning_style: updatedProfile.preferredLearningStyle,
        strengths: updatedProfile.strengths,
        weaknesses: updatedProfile.weaknesses,
        average_session_length: updatedProfile.averageSessionLength,
        optimal_difficulty_curve: updatedProfile.optimalDifficultyCurve,
        motivation_factors: updatedProfile.motivationFactors,
        last_updated: updatedProfile.lastUpdated.toISOString()
      });
  }

  private async calculateRecentSessionLength(userId: string): Promise<number | null> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: responses, error } = await supabase
      .from('question_responses')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error || !responses || responses.length < 2) return null;

    // Group responses by session (assuming 30-minute gaps indicate new sessions)
    const sessions: Date[][] = [];
    let currentSession: Date[] = [new Date(responses[0].created_at)];

    for (let i = 1; i < responses.length; i++) {
      const currentTime = new Date(responses[i].created_at);
      const lastTime = currentSession[currentSession.length - 1];
      const timeDiff = (currentTime.getTime() - lastTime.getTime()) / (1000 * 60); // minutes

      if (timeDiff <= 30) {
        currentSession.push(currentTime);
      } else {
        sessions.push(currentSession);
        currentSession = [currentTime];
      }
    }
    sessions.push(currentSession);

    // Calculate average session length
    const sessionLengths = sessions.map(session => {
      if (session.length < 2) return 5; // Minimum session length
      const start = session[0];
      const end = session[session.length - 1];
      return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    });

    return sessionLengths.reduce((sum, length) => sum + length, 0) / sessionLengths.length;
  }
}

export const adaptiveLearningService = new AdaptiveLearningService();