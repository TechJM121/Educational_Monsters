import { supabase } from './supabaseClient';
import type { 
  Quest, 
  QuestTemplate, 
  UserQuest, 
  QuestObjective,
  QuestReward,
  LearningStreak
} from '../types/quest';
import { DAILY_QUEST_TEMPLATES, WEEKLY_QUEST_TEMPLATES } from '../types/quest';
import type { Character } from '../types/character';

export class QuestService {
  /**
   * Generate daily quests for a user based on their progress and unlocked worlds
   */
  async generateDailyQuests(userId: string): Promise<Quest[]> {
    try {
      // Check if user already has active daily quests
      const existingQuests = await this.getActiveQuests(userId, 'daily');
      if (existingQuests.length > 0) {
        return existingQuests;
      }

      const character = await this.getUserCharacter(userId);
      if (!character) {
        throw new Error('Character not found');
      }

      const unlockedWorlds = await this.getUnlockedWorlds(userId);
      const userProgress = await this.getUserProgress(userId);
      
      const generatedQuests: Quest[] = [];
      const questsToGenerate = Math.min(3, unlockedWorlds.length); // Max 3 daily quests

      // Generate quests for different worlds
      for (let i = 0; i < questsToGenerate; i++) {
        const worldId = unlockedWorlds[i];
        const templates = DAILY_QUEST_TEMPLATES[worldId] || [];
        
        if (templates.length > 0) {
          const template = this.selectQuestTemplate(templates, character, userProgress);
          if (template) {
            const quest = this.createQuestFromTemplate(template, userId);
            generatedQuests.push(quest);
          }
        }
      }

      // Save quests to database
      await this.saveQuests(generatedQuests, userId);

      return generatedQuests;
    } catch (error) {
      console.error('Error generating daily quests:', error);
      throw error;
    }
  }

  /**
   * Generate weekly quests for a user
   */
  async generateWeeklyQuests(userId: string): Promise<Quest[]> {
    try {
      // Check if user already has active weekly quests
      const existingQuests = await this.getActiveQuests(userId, 'weekly');
      if (existingQuests.length > 0) {
        return existingQuests;
      }

      const character = await this.getUserCharacter(userId);
      if (!character) {
        throw new Error('Character not found');
      }

      const userProgress = await this.getUserProgress(userId);
      
      // Select appropriate weekly quest templates
      const availableTemplates = WEEKLY_QUEST_TEMPLATES.filter(template => 
        this.checkQuestPrerequisites(template, character, userProgress)
      );

      if (availableTemplates.length === 0) {
        return [];
      }

      // Generate 1-2 weekly quests
      const questsToGenerate = Math.min(2, availableTemplates.length);
      const generatedQuests: Quest[] = [];

      for (let i = 0; i < questsToGenerate; i++) {
        const template = availableTemplates[i];
        const quest = this.createQuestFromTemplate(template, userId);
        generatedQuests.push(quest);
      }

      // Save quests to database
      await this.saveQuests(generatedQuests, userId);

      return generatedQuests;
    } catch (error) {
      console.error('Error generating weekly quests:', error);
      throw error;
    }
  }

  /**
   * Update quest progress when user completes activities
   */
  async updateQuestProgress(
    userId: string, 
    activityType: 'answer_question' | 'complete_lesson' | 'earn_xp',
    data: {
      subjectId?: string;
      xpEarned?: number;
      accuracy?: number;
      questionsAnswered?: number;
      correctAnswers?: number;
    }
  ): Promise<void> {
    try {
      const activeQuests = await this.getActiveQuests(userId);
      
      for (const quest of activeQuests) {
        let questUpdated = false;
        
        for (const objective of quest.objectives) {
          if (this.shouldUpdateObjective(objective, activityType, data)) {
            const increment = this.calculateObjectiveIncrement(objective, activityType, data);
            objective.currentValue = Math.min(
              objective.currentValue + increment,
              objective.targetValue
            );
            
            if (objective.currentValue >= objective.targetValue) {
              objective.completed = true;
            }
            
            questUpdated = true;
          }
        }

        if (questUpdated) {
          // Check if quest is complete
          const isComplete = quest.objectives.every(obj => obj.completed);
          
          if (isComplete) {
            await this.completeQuest(userId, quest.id);
          } else {
            await this.updateQuestObjectives(quest.id, quest.objectives);
          }
        }
      }

      // Update learning streak
      await this.updateLearningStreak(userId);
    } catch (error) {
      console.error('Error updating quest progress:', error);
      throw error;
    }
  }

  /**
   * Complete a quest and award rewards
   */
  async completeQuest(userId: string, questId: string): Promise<void> {
    try {
      const quest = await this.getQuestById(questId);
      if (!quest) {
        throw new Error('Quest not found');
      }

      // Mark quest as completed
      const { error: updateError } = await supabase
        .from('user_quests')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('quest_id', questId);

      if (updateError) {
        throw updateError;
      }

      // Award rewards
      await this.awardQuestRewards(userId, quest.rewards);

      // Update learning streak if applicable
      const streak = await this.getLearningStreak(userId);
      if (streak && quest.category === 'learning') {
        await this.updateStreakRewards(userId, streak);
      }

    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
    }
  }

  /**
   * Get active quests for a user
   */
  async getActiveQuests(userId: string, type?: 'daily' | 'weekly'): Promise<Quest[]> {
    try {
      let query = supabase
        .from('user_quests')
        .select(`
          *,
          quest:quests(*)
        `)
        .eq('user_id', userId)
        .eq('completed', false)
        .gt('expires_at', new Date().toISOString());

      if (type) {
        query = query.eq('quest.type', type);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data?.map(uq => ({
        ...uq.quest,
        objectives: JSON.parse(uq.progress || '[]')
      })) || [];
    } catch (error) {
      console.error('Error getting active quests:', error);
      return [];
    }
  }

  /**
   * Get learning streak for user
   */
  async getLearningStreak(userId: string): Promise<LearningStreak | null> {
    try {
      const { data, error } = await supabase
        .from('learning_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error getting learning streak:', error);
      return null;
    }
  }

  /**
   * Update learning streak
   */
  async updateLearningStreak(userId: string): Promise<void> {
    try {
      const today = new Date().toDateString();
      const streak = await this.getLearningStreak(userId);

      if (!streak) {
        // Create new streak
        await supabase
          .from('learning_streaks')
          .insert({
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: new Date().toISOString(),
            streak_rewards: JSON.stringify([])
          });
        return;
      }

      const lastActivityDate = new Date(streak.lastActivityDate).toDateString();
      
      if (lastActivityDate === today) {
        // Already updated today
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      let newStreak = streak.currentStreak;
      
      if (lastActivityDate === yesterdayString) {
        // Consecutive day
        newStreak += 1;
      } else {
        // Streak broken
        newStreak = 1;
      }

      const newLongestStreak = Math.max(streak.longestStreak, newStreak);

      await supabase
        .from('learning_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: new Date().toISOString()
        })
        .eq('user_id', userId);

    } catch (error) {
      console.error('Error updating learning streak:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async getUserCharacter(userId: string): Promise<Character | null> {
    const { data, error } = await supabase
      .from('characters')
      .select(`
        *,
        character_stats(*)
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching character:', error);
      return null;
    }

    return data;
  }

  private async getUnlockedWorlds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('world_progress')
      .select('world_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching unlocked worlds:', error);
      return ['numerical-kingdom']; // Default to first world
    }

    const worldIds = data?.map(wp => wp.world_id) || [];
    return worldIds.length > 0 ? worldIds : ['numerical-kingdom'];
  }

  private async getUserProgress(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        subject:subjects(name)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user progress:', error);
      return [];
    }

    return data || [];
  }

  private selectQuestTemplate(
    templates: QuestTemplate[], 
    character: Character, 
    userProgress: any[]
  ): QuestTemplate | null {
    // Filter templates based on character level and prerequisites
    const availableTemplates = templates.filter(template => 
      this.checkQuestPrerequisites(template, character, userProgress)
    );

    if (availableTemplates.length === 0) {
      return null;
    }

    // Select template based on difficulty and character level
    const appropriateTemplates = availableTemplates.filter(template => {
      const levelDiff = Math.abs(template.difficulty * 2 - character.level);
      return levelDiff <= 3; // Allow some flexibility
    });

    if (appropriateTemplates.length > 0) {
      return appropriateTemplates[Math.floor(Math.random() * appropriateTemplates.length)];
    }

    return availableTemplates[0];
  }

  private checkQuestPrerequisites(
    template: QuestTemplate, 
    character: Character, 
    userProgress: any[]
  ): boolean {
    if (!template.prerequisites) {
      return true;
    }

    const { minimumLevel, requiredSubjectXP, completedQuests } = template.prerequisites;

    if (minimumLevel && character.level < minimumLevel) {
      return false;
    }

    if (requiredSubjectXP && template.subjectId) {
      const subjectProgress = userProgress.find(up => 
        up.subject.name.toLowerCase().replace(/\s+/g, '-') === template.subjectId
      );
      if (!subjectProgress || subjectProgress.total_xp_earned < requiredSubjectXP) {
        return false;
      }
    }

    // TODO: Check completed quests when quest history is implemented

    return true;
  }

  private createQuestFromTemplate(template: QuestTemplate, userId: string): Quest {
    const now = new Date();
    const expiresAt = new Date(now);
    
    if (template.type === 'daily') {
      expiresAt.setDate(expiresAt.getDate() + 1);
      expiresAt.setHours(23, 59, 59, 999); // End of day
    } else {
      expiresAt.setDate(expiresAt.getDate() + 7); // One week
    }

    const objectives: QuestObjective[] = template.objectives.map((obj, index) => ({
      id: `${template.id}-obj-${index}`,
      ...obj,
      currentValue: 0,
      completed: false
    }));

    return {
      id: `${template.id}-${userId}-${now.getTime()}`,
      title: template.title,
      description: template.description,
      type: template.type,
      category: template.category,
      worldId: template.worldId,
      subjectId: template.subjectId,
      difficulty: template.difficulty,
      estimatedTimeMinutes: template.estimatedTimeMinutes,
      objectives,
      rewards: template.rewards,
      expiresAt,
      createdAt: now
    };
  }

  private async saveQuests(quests: Quest[], userId: string): Promise<void> {
    for (const quest of quests) {
      // Insert quest
      const { data: questData, error: questError } = await supabase
        .from('quests')
        .insert({
          id: quest.id,
          title: quest.title,
          description: quest.description,
          type: quest.type,
          category: quest.category,
          world_id: quest.worldId,
          subject_id: quest.subjectId,
          difficulty: quest.difficulty,
          estimated_time_minutes: quest.estimatedTimeMinutes,
          rewards: JSON.stringify(quest.rewards),
          expires_at: quest.expiresAt.toISOString()
        })
        .select()
        .single();

      if (questError) {
        console.error('Error saving quest:', questError);
        continue;
      }

      // Insert user quest
      await supabase
        .from('user_quests')
        .insert({
          user_id: userId,
          quest_id: quest.id,
          progress: JSON.stringify(quest.objectives),
          completed: false,
          started_at: new Date().toISOString()
        });
    }
  }

  private shouldUpdateObjective(
    objective: QuestObjective,
    activityType: string,
    data: any
  ): boolean {
    if (objective.completed) {
      return false;
    }

    // Check subject filter
    if (objective.subjectFilter && data.subjectId !== objective.subjectFilter) {
      return false;
    }

    // Check objective type match
    switch (objective.type) {
      case 'answer_questions':
        return activityType === 'answer_question' && data.correctAnswers > 0;
      case 'complete_lessons':
        return activityType === 'complete_lesson';
      case 'earn_xp':
        return activityType === 'earn_xp' && data.xpEarned > 0;
      case 'achieve_accuracy':
        return activityType === 'answer_question' && data.accuracy !== undefined;
      case 'maintain_streak':
        return activityType === 'complete_lesson'; // Streak updated separately
      default:
        return false;
    }
  }

  private calculateObjectiveIncrement(
    objective: QuestObjective,
    activityType: string,
    data: any
  ): number {
    switch (objective.type) {
      case 'answer_questions':
        return data.correctAnswers || 0;
      case 'complete_lessons':
        return 1;
      case 'earn_xp':
        return data.xpEarned || 0;
      case 'achieve_accuracy':
        return data.accuracy || 0;
      case 'maintain_streak':
        return 1;
      default:
        return 0;
    }
  }

  private async getQuestById(questId: string): Promise<Quest | null> {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('id', questId)
      .single();

    if (error) {
      console.error('Error fetching quest:', error);
      return null;
    }

    return {
      ...data,
      rewards: JSON.parse(data.rewards || '[]'),
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at)
    };
  }

  private async updateQuestObjectives(questId: string, objectives: QuestObjective[]): Promise<void> {
    await supabase
      .from('user_quests')
      .update({
        progress: JSON.stringify(objectives)
      })
      .eq('quest_id', questId);
  }

  private async awardQuestRewards(userId: string, rewards: QuestReward[]): Promise<void> {
    for (const reward of rewards) {
      switch (reward.type) {
        case 'xp':
          // Award XP through existing XP system
          // This would integrate with the existing XP service
          break;
        case 'stat_points':
          // Award stat points to character
          await supabase
            .from('character_stats')
            .update({
              available_points: supabase.raw(`available_points + ${reward.value}`)
            })
            .eq('character_id', supabase.raw(`(SELECT id FROM characters WHERE user_id = '${userId}')`));
          break;
        case 'item':
          // Award item to user inventory
          if (reward.itemId) {
            await supabase
              .from('user_inventory')
              .upsert({
                user_id: userId,
                item_id: reward.itemId,
                quantity: reward.value
              });
          }
          break;
        case 'achievement':
          // Award achievement
          if (reward.achievementId) {
            await supabase
              .from('user_achievements')
              .upsert({
                user_id: userId,
                achievement_id: reward.achievementId
              });
          }
          break;
      }
    }
  }

  private async updateStreakRewards(userId: string, streak: LearningStreak): Promise<void> {
    // Check for streak milestone rewards
    const milestones = [3, 7, 14, 30, 60, 100];
    const currentStreak = streak.currentStreak;
    
    for (const milestone of milestones) {
      if (currentStreak >= milestone) {
        const existingReward = streak.streakRewards.find(r => r.streakLength === milestone);
        if (!existingReward || !existingReward.claimed) {
          // Award streak reward
          const reward: QuestReward = {
            type: 'xp',
            value: milestone * 10,
            bonusMultiplier: 1 + (milestone / 100)
          };
          
          await this.awardQuestRewards(userId, [reward]);
          
          // Mark reward as claimed
          const updatedRewards = [...streak.streakRewards];
          if (existingReward) {
            existingReward.claimed = true;
          } else {
            updatedRewards.push({
              streakLength: milestone,
              rewardType: 'xp',
              rewardValue: reward.value,
              claimed: true
            });
          }
          
          await supabase
            .from('learning_streaks')
            .update({
              streak_rewards: JSON.stringify(updatedRewards)
            })
            .eq('user_id', userId);
        }
      }
    }
  }
}

export const questService = new QuestService();