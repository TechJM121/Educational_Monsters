import { supabase } from './supabaseClient';
import type { Achievement, UserAchievement, CollectibleItem, UserInventory } from '../types/achievement';

export class AchievementService {
  /**
   * Get all available achievements
   */
  static async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('rarity_level', { ascending: true });

    if (error) {
      console.error('Error fetching achievements:', error);
      throw new Error('Failed to fetch achievements');
    }

    return data.map(achievement => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      badgeIcon: achievement.badge_icon,
      unlockCriteria: achievement.unlock_criteria,
      rarityLevel: achievement.rarity_level,
      category: achievement.category,
      createdAt: new Date(achievement.created_at)
    }));
  }

  /**
   * Get user's unlocked achievements
   */
  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        id,
        user_id,
        achievement_id,
        unlocked_at,
        achievements (
          name,
          description,
          badge_icon,
          rarity_level,
          category
        )
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching user achievements:', error);
      throw new Error('Failed to fetch user achievements');
    }

    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      achievementId: item.achievement_id,
      unlockedAt: new Date(item.unlocked_at)
    }));
  }

  /**
   * Check and award achievements based on user progress
   */
  static async checkAndAwardAchievements(userId: string): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];

    try {
      // Get user's current progress data
      const [userProgress, questionResponses, character] = await Promise.all([
        this.getUserProgress(userId),
        this.getUserQuestionResponses(userId),
        this.getUserCharacter(userId)
      ]);

      // Get all achievements and user's current achievements
      const [allAchievements, userAchievements] = await Promise.all([
        this.getAllAchievements(),
        this.getUserAchievements(userId)
      ]);

      const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));

      // Check each achievement
      for (const achievement of allAchievements) {
        if (unlockedAchievementIds.has(achievement.id)) {
          continue; // Already unlocked
        }

        const shouldUnlock = await this.checkAchievementCriteria(
          achievement,
          { userProgress, questionResponses, character }
        );

        if (shouldUnlock) {
          await this.awardAchievement(userId, achievement.id);
          newAchievements.push(achievement);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  /**
   * Award a specific achievement to a user
   */
  static async awardAchievement(userId: string, achievementId: string): Promise<void> {
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId
      });

    if (error && error.code !== '23505') { // Ignore duplicate key errors
      console.error('Error awarding achievement:', error);
      throw new Error('Failed to award achievement');
    }
  }

  /**
   * Check if achievement criteria is met
   */
  private static async checkAchievementCriteria(
    achievement: Achievement,
    userData: {
      userProgress: any[];
      questionResponses: any[];
      character: any;
    }
  ): Promise<boolean> {
    const criteria = achievement.unlockCriteria as any;

    switch (criteria.type) {
      case 'lessons_completed':
        return userData.questionResponses.length >= criteria.count;

      case 'subject_correct_answers': {
        const subjectResponses = userData.questionResponses.filter(
          (response: any) => response.subject_name === criteria.subject && response.is_correct
        );
        return subjectResponses.length >= criteria.count;
      }

      case 'subject_lessons': {
        const subjectProgress = userData.userProgress.find(
          (progress: any) => progress.subject_name === criteria.subject
        );
        return subjectProgress ? subjectProgress.questions_answered >= criteria.count : false;
      }

      case 'fast_answers': {
        const fastAnswers = userData.questionResponses.filter(
          (response: any) => response.response_time_seconds <= criteria.time_limit
        );
        return fastAnswers.length >= criteria.count;
      }

      case 'accuracy_streak':
        return this.checkAccuracyStreak(userData.questionResponses, criteria.accuracy, criteria.count);

      case 'daily_streak': {
        const maxStreak = Math.max(...userData.userProgress.map((p: any) => p.best_streak || 0));
        return maxStreak >= criteria.count;
      }

      case 'character_level':
        return userData.character?.level >= criteria.level;

      default:
        return false;
    }
  }

  /**
   * Check accuracy streak
   */
  private static checkAccuracyStreak(responses: any[], requiredAccuracy: number, requiredCount: number): boolean {
    let currentStreak = 0;
    let maxStreak = 0;

    for (const response of responses.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())) {
      if (response.is_correct) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return maxStreak >= requiredCount;
  }

  /**
   * Get user progress data
   */
  private static async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        subjects (name)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user progress:', error);
      return [];
    }

    return data.map(item => ({
      ...item,
      subject_name: item.subjects?.name
    }));
  }

  /**
   * Get user question responses
   */
  private static async getUserQuestionResponses(userId: string) {
    const { data, error } = await supabase
      .from('question_responses')
      .select(`
        *,
        questions (
          subjects (name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching question responses:', error);
      return [];
    }

    return data.map(item => ({
      ...item,
      subject_name: item.questions?.subjects?.name
    }));
  }

  /**
   * Get user character data
   */
  private static async getUserCharacter(userId: string) {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching character:', error);
      return null;
    }

    return data;
  }

  /**
   * Get all collectible items
   */
  static async getAllCollectibleItems(): Promise<CollectibleItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('rarity_level', { ascending: true });

    if (error) {
      console.error('Error fetching collectible items:', error);
      throw new Error('Failed to fetch collectible items');
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      icon: item.icon_url || '',
      rarity: this.mapRarityLevel(item.rarity_level),
      category: this.mapItemType(item.item_type),
      tradeable: item.item_type !== 'equipment' // Equipment is bound, others are tradeable
    }));
  }

  /**
   * Get user's inventory
   */
  static async getUserInventory(userId: string): Promise<Array<{ item: CollectibleItem; inventory: UserInventory }>> {
    const { data, error } = await supabase
      .from('user_inventory')
      .select(`
        *,
        inventory_items (*)
      `)
      .eq('user_id', userId)
      .order('acquired_at', { ascending: false });

    if (error) {
      console.error('Error fetching user inventory:', error);
      throw new Error('Failed to fetch user inventory');
    }

    return data.map(item => ({
      item: {
        id: item.inventory_items.id,
        name: item.inventory_items.name,
        description: item.inventory_items.description || '',
        icon: item.inventory_items.icon_url || '',
        rarity: this.mapRarityLevel(item.inventory_items.rarity_level),
        category: this.mapItemType(item.inventory_items.item_type),
        tradeable: item.inventory_items.item_type !== 'equipment'
      },
      inventory: {
        id: item.id,
        userId: item.user_id,
        itemId: item.item_id,
        quantity: item.quantity,
        acquiredAt: new Date(item.acquired_at)
      }
    }));
  }

  /**
   * Award random collectible item to user
   */
  static async awardRandomItem(userId: string): Promise<CollectibleItem | null> {
    try {
      // Get all items with rarity weights
      const items = await this.getAllCollectibleItems();
      
      // Define rarity weights (lower rarity = higher chance)
      const rarityWeights = {
        common: 50,
        uncommon: 25,
        rare: 15,
        epic: 8,
        legendary: 2
      };

      // Calculate weighted random selection
      const weightedItems = items.flatMap(item => 
        Array(rarityWeights[item.rarity]).fill(item)
      );

      if (weightedItems.length === 0) return null;

      const randomItem = weightedItems[Math.floor(Math.random() * weightedItems.length)];

      // Add item to user's inventory
      const { error } = await supabase
        .from('user_inventory')
        .upsert({
          user_id: userId,
          item_id: randomItem.id,
          quantity: 1
        }, {
          onConflict: 'user_id,item_id',
          ignoreDuplicates: false
        });

      if (error) {
        // If item already exists, increment quantity
        const { error: updateError } = await supabase
          .rpc('increment_item_quantity', {
            p_user_id: userId,
            p_item_id: randomItem.id
          });

        if (updateError) {
          console.error('Error updating item quantity:', updateError);
          return null;
        }
      }

      return randomItem;
    } catch (error) {
      console.error('Error awarding random item:', error);
      return null;
    }
  }

  /**
   * Map rarity level to string
   */
  private static mapRarityLevel(level: number): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
    const rarityMap = {
      1: 'common' as const,
      2: 'uncommon' as const,
      3: 'rare' as const,
      4: 'epic' as const,
      5: 'legendary' as const
    };
    return rarityMap[level as keyof typeof rarityMap] || 'common';
  }

  /**
   * Map item type to category
   */
  private static mapItemType(type: string): 'spell_book' | 'potion' | 'artifact' | 'equipment' {
    const typeMap: Record<string, 'spell_book' | 'potion' | 'artifact' | 'equipment'> = {
      'equipment': 'equipment',
      'consumable': 'potion',
      'collectible': 'artifact'
    };
    return typeMap[type] || 'artifact';
  }
}