import { supabase } from './supabaseClient';
import { adaptiveLearningService } from './adaptiveLearningService';
import { ageFilteringService } from './ageFilteringService';
import { difficultyScalingService } from './difficultyScalingService';
import type { Question } from '../types/question';

export interface RecommendationContext {
  userId: string;
  currentSubject?: string;
  sessionGoals: string[];
  timeAvailable: number; // minutes
  preferredDifficulty?: number;
  avoidRecentQuestions: boolean;
}

export interface TopicRecommendation {
  topicId: string;
  topicName: string;
  subjectId: string;
  priority: number; // 0-1 scale
  reasoning: string;
  estimatedTime: number;
  prerequisites: string[];
  learningOutcomes: string[];
}

export interface ContentRecommendationResult {
  questions: Question[];
  topics: TopicRecommendation[];
  reasoning: string;
  metadata: {
    totalQuestions: number;
    averageDifficulty: number;
    estimatedCompletionTime: number;
    coverageBySubject: Record<string, number>;
  };
}

export class ContentRecommendationService {
  /**
   * Get comprehensive content recommendations for a user
   */
  async getContentRecommendations(
    context: RecommendationContext
  ): Promise<ContentRecommendationResult> {
    // Get user's learning profile and analytics
    const learningProfile = await adaptiveLearningService.getLearningProfile(context.userId);
    const analytics = await adaptiveLearningService.getLearningAnalytics(context.userId);
    const userAge = await this.getUserAge(context.userId);

    // Get recently answered questions to avoid repetition
    const recentQuestions = context.avoidRecentQuestions 
      ? await this.getRecentlyAnsweredQuestions(context.userId, 7)
      : [];

    // Get topic recommendations
    const topicRecommendations = await this.getTopicRecommendations(
      context,
      learningProfile,
      analytics
    );

    // Get question recommendations based on topics and context
    const questionRecommendations = await this.getQuestionRecommendations(
      context,
      topicRecommendations,
      recentQuestions,
      userAge
    );

    // Generate metadata
    const metadata = this.generateRecommendationMetadata(questionRecommendations);

    // Generate reasoning
    const reasoning = this.generateRecommendationReasoning(
      context,
      topicRecommendations,
      questionRecommendations,
      analytics
    );

    return {
      questions: questionRecommendations,
      topics: topicRecommendations,
      reasoning,
      metadata
    };
  }

  /**
   * Get topic recommendations based on learning progress
   */
  private async getTopicRecommendations(
    context: RecommendationContext,
    learningProfile: any,
    analytics: any
  ): Promise<TopicRecommendation[]> {
    const recommendations: TopicRecommendation[] = [];

    // Get all available subjects/topics
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*');

    if (error || !subjects) {
      return recommendations;
    }

    for (const subject of subjects) {
      const conceptMastery = analytics.conceptMasteries.find(
        (c: any) => c.subjectId === subject.id
      );

      let priority = 0.5; // Base priority
      let reasoning = `General practice in ${subject.name}`;
      let estimatedTime = 15; // Default 15 minutes

      // Adjust priority based on mastery level
      if (conceptMastery) {
        if (conceptMastery.masteryLevel < 0.4) {
          priority += 0.3;
          reasoning = `Low mastery (${Math.round(conceptMastery.masteryLevel * 100)}%) - needs attention`;
          estimatedTime = 20;
        } else if (conceptMastery.masteryLevel < 0.7) {
          priority += 0.2;
          reasoning = `Moderate mastery (${Math.round(conceptMastery.masteryLevel * 100)}%) - room for improvement`;
          estimatedTime = 15;
        } else if (conceptMastery.needsReview) {
          priority += 0.15;
          reasoning = `High mastery but needs review to maintain`;
          estimatedTime = 10;
        }
      } else {
        // New topic
        priority += 0.25;
        reasoning = `New topic - good for exploration`;
        estimatedTime = 20;
      }

      // Adjust based on learning profile
      if (learningProfile.weaknesses.includes(subject.id)) {
        priority += 0.2;
        reasoning += ` (identified weakness)`;
      }

      if (learningProfile.strengths.includes(subject.id)) {
        priority += 0.1;
        reasoning += ` (building on strength)`;
      }

      // Adjust based on context
      if (context.currentSubject === subject.id) {
        priority += 0.3;
        reasoning += ` (current focus area)`;
      }

      // Time constraint adjustment
      if (context.timeAvailable < estimatedTime) {
        priority *= 0.7;
        estimatedTime = Math.min(estimatedTime, context.timeAvailable);
      }

      recommendations.push({
        topicId: subject.id,
        topicName: subject.name,
        subjectId: subject.id,
        priority: Math.min(1.0, priority),
        reasoning,
        estimatedTime,
        prerequisites: this.getTopicPrerequisites(subject.id),
        learningOutcomes: this.getTopicLearningOutcomes(subject.id, conceptMastery?.masteryLevel || 0)
      });
    }

    // Sort by priority and return top recommendations
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);
  }

  /**
   * Get question recommendations based on topics and context
   */
  private async getQuestionRecommendations(
    context: RecommendationContext,
    topicRecommendations: TopicRecommendation[],
    recentQuestions: string[],
    userAge: number
  ): Promise<Question[]> {
    const questions: Question[] = [];
    const questionsPerTopic = Math.ceil(20 / topicRecommendations.length);

    for (const topic of topicRecommendations.slice(0, 3)) { // Focus on top 3 topics
      // Get age-appropriate questions for this topic
      const ageAppropriateQuestions = await ageFilteringService.getAgeAppropriateContent(
        context.userId,
        topic.subjectId,
        questionsPerTopic * 2
      );

      // Get adaptive questions with difficulty scaling
      const adaptiveQuestions = await difficultyScalingService.getAdaptiveQuestions(
        context.userId,
        topic.subjectId,
        userAge,
        this.getAgeRange(userAge),
        questionsPerTopic * 2
      );

      // Combine and filter questions
      const combinedQuestions = this.combineAndDeduplicateQuestions(
        ageAppropriateQuestions.questions,
        adaptiveQuestions
      );

      // Filter out recent questions
      const filteredQuestions = combinedQuestions.filter(
        q => !recentQuestions.includes(q.id)
      );

      // Apply context-specific filtering
      const contextFilteredQuestions = this.applyContextFiltering(
        filteredQuestions,
        context,
        topic
      );

      questions.push(...contextFilteredQuestions.slice(0, questionsPerTopic));
    }

    return questions.slice(0, 20); // Limit total questions
  }

  /**
   * Apply context-specific filtering to questions
   */
  private applyContextFiltering(
    questions: Question[],
    context: RecommendationContext,
    topic: TopicRecommendation
  ): Question[] {
    let filtered = [...questions];

    // Filter by preferred difficulty if specified
    if (context.preferredDifficulty) {
      filtered = filtered.filter(q => 
        Math.abs(q.difficultyLevel - context.preferredDifficulty!) <= 1
      );
    }

    // Sort by relevance to session goals
    if (context.sessionGoals.length > 0) {
      filtered = filtered.sort((a, b) => {
        const aRelevance = this.calculateGoalRelevance(a, context.sessionGoals);
        const bRelevance = this.calculateGoalRelevance(b, context.sessionGoals);
        return bRelevance - aRelevance;
      });
    }

    return filtered;
  }

  /**
   * Calculate how relevant a question is to session goals
   */
  private calculateGoalRelevance(question: Question, goals: string[]): number {
    let relevance = 0;
    const questionText = question.questionText.toLowerCase();

    for (const goal of goals) {
      const goalWords = goal.toLowerCase().split(' ');
      for (const word of goalWords) {
        if (questionText.includes(word)) {
          relevance += 1;
        }
      }
    }

    return relevance;
  }

  /**
   * Combine and deduplicate questions from different sources
   */
  private combineAndDeduplicateQuestions(
    ageQuestions: Question[],
    adaptiveQuestions: any[]
  ): Question[] {
    const questionMap = new Map<string, Question>();

    // Add age-appropriate questions
    ageQuestions.forEach(q => questionMap.set(q.id, q));

    // Add adaptive questions (convert format if needed)
    adaptiveQuestions.forEach(q => {
      const question: Question = this.normalizeQuestionFormat(q);
      questionMap.set(question.id, question);
    });

    return Array.from(questionMap.values());
  }

  /**
   * Normalize question format from different sources
   */
  private normalizeQuestionFormat(dbQuestion: any): Question {
    return {
      id: dbQuestion.id,
      subjectId: dbQuestion.subject_id,
      questionText: dbQuestion.question_text,
      answerOptions: dbQuestion.answer_options,
      correctAnswer: dbQuestion.correct_answer,
      difficultyLevel: dbQuestion.difficulty_level,
      xpReward: dbQuestion.xp_reward,
      ageRange: dbQuestion.age_range,
      createdAt: new Date(dbQuestion.created_at)
    };
  }

  /**
   * Get recently answered questions to avoid repetition
   */
  private async getRecentlyAnsweredQuestions(
    userId: string,
    days: number
  ): Promise<string[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data: responses, error } = await supabase
      .from('question_responses')
      .select('question_id')
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString());

    if (error || !responses) {
      return [];
    }

    return responses.map(r => r.question_id);
  }

  /**
   * Generate recommendation metadata
   */
  private generateRecommendationMetadata(questions: Question[]) {
    const totalQuestions = questions.length;
    const averageDifficulty = totalQuestions > 0
      ? questions.reduce((sum, q) => sum + q.difficultyLevel, 0) / totalQuestions
      : 0;

    const estimatedCompletionTime = totalQuestions * 2; // 2 minutes per question average

    const coverageBySubject: Record<string, number> = {};
    questions.forEach(q => {
      coverageBySubject[q.subjectId] = (coverageBySubject[q.subjectId] || 0) + 1;
    });

    return {
      totalQuestions,
      averageDifficulty: Math.round(averageDifficulty * 10) / 10,
      estimatedCompletionTime,
      coverageBySubject
    };
  }

  /**
   * Generate reasoning for recommendations
   */
  private generateRecommendationReasoning(
    context: RecommendationContext,
    topics: TopicRecommendation[],
    questions: Question[],
    analytics: any
  ): string {
    const reasons: string[] = [];

    // Topic-based reasoning
    const topTopic = topics[0];
    if (topTopic) {
      reasons.push(`Focusing on ${topTopic.topicName} (${topTopic.reasoning})`);
    }

    // Difficulty reasoning
    const avgDifficulty = questions.reduce((sum, q) => sum + q.difficultyLevel, 0) / questions.length;
    if (avgDifficulty < 2.5) {
      reasons.push('emphasizing foundational concepts');
    } else if (avgDifficulty > 3.5) {
      reasons.push('providing challenging advanced content');
    } else {
      reasons.push('balancing difficulty for optimal learning');
    }

    // Time-based reasoning
    if (context.timeAvailable < 15) {
      reasons.push('optimized for short study session');
    } else if (context.timeAvailable > 30) {
      reasons.push('comprehensive content for extended learning');
    }

    // Analytics-based reasoning
    if (analytics.knowledgeGaps.length > 0) {
      reasons.push('addressing identified knowledge gaps');
    }

    if (analytics.streakDays > 0) {
      reasons.push(`maintaining ${analytics.streakDays}-day learning streak`);
    }

    return `Recommendations based on ${reasons.join(', ')}.`;
  }

  /**
   * Get topic prerequisites (simplified implementation)
   */
  private getTopicPrerequisites(topicId: string): string[] {
    // This would typically come from a knowledge graph or curriculum mapping
    const prerequisites: Record<string, string[]> = {
      'advanced-math': ['basic-math', 'algebra'],
      'chemistry': ['basic-science', 'math'],
      'physics': ['math', 'basic-science'],
      'advanced-reading': ['basic-reading', 'vocabulary']
    };

    return prerequisites[topicId] || [];
  }

  /**
   * Get topic learning outcomes based on mastery level
   */
  private getTopicLearningOutcomes(topicId: string, masteryLevel: number): string[] {
    const outcomes: string[] = [];

    if (masteryLevel < 0.3) {
      outcomes.push('Build foundational understanding');
      outcomes.push('Practice basic concepts');
    } else if (masteryLevel < 0.7) {
      outcomes.push('Strengthen core skills');
      outcomes.push('Apply concepts to new problems');
    } else {
      outcomes.push('Master advanced applications');
      outcomes.push('Develop expertise and fluency');
    }

    return outcomes;
  }

  /**
   * Get age range for a specific age
   */
  private getAgeRange(age: number): string {
    if (age <= 6) return '3-6';
    if (age <= 10) return '7-10';
    if (age <= 14) return '11-14';
    return '15-18';
  }

  /**
   * Get user age from database
   */
  private async getUserAge(userId: string): Promise<number> {
    const { data: user, error } = await supabase
      .from('users')
      .select('age')
      .eq('id', userId)
      .single();

    return user?.age || 10; // Default age if not found
  }

  /**
   * Get personalized study plan for a user
   */
  async getStudyPlan(
    userId: string,
    durationDays: number = 7,
    dailyTimeMinutes: number = 20
  ): Promise<{
    dailyPlans: Array<{
      day: number;
      topics: TopicRecommendation[];
      estimatedTime: number;
      goals: string[];
    }>;
    overallGoals: string[];
    progressMilestones: string[];
  }> {
    const analytics = await adaptiveLearningService.getLearningAnalytics(userId);
    const learningProfile = await adaptiveLearningService.getLearningProfile(userId);

    const dailyPlans = [];
    const questionsPerDay = Math.floor(dailyTimeMinutes / 2); // 2 minutes per question

    for (let day = 1; day <= durationDays; day++) {
      const context: RecommendationContext = {
        userId,
        sessionGoals: [`Day ${day} learning objectives`],
        timeAvailable: dailyTimeMinutes,
        avoidRecentQuestions: true
      };

      const recommendations = await this.getContentRecommendations(context);
      
      dailyPlans.push({
        day,
        topics: recommendations.topics.slice(0, 2), // Focus on 2 topics per day
        estimatedTime: dailyTimeMinutes,
        goals: [
          `Complete ${questionsPerDay} questions`,
          `Focus on ${recommendations.topics[0]?.topicName || 'core subjects'}`
        ]
      });
    }

    const overallGoals = [
      'Maintain consistent daily learning habit',
      'Improve understanding in identified weak areas',
      'Build on existing strengths'
    ];

    const progressMilestones = [
      `Complete ${questionsPerDay * durationDays} questions over ${durationDays} days`,
      'Achieve 70%+ accuracy in target subjects',
      'Maintain learning streak throughout the plan'
    ];

    return {
      dailyPlans,
      overallGoals,
      progressMilestones
    };
  }
}

export const contentRecommendationService = new ContentRecommendationService();