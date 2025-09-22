import { supabase } from './supabaseClient';
import type { 
  GameMode, 
  GameSession, 
  GameParticipant, 
  GameLeaderboardEntry,
  GameModeReward,
  PowerUp,
  GameSessionSettings
} from '../types/gameMode';
import { GAME_MODES, POWER_UPS, SPECIAL_EVENT_MODES } from '../types/gameMode';
import type { Character } from '../types/character';

export class GameModeService {
  /**
   * Get all available game modes for a user
   */
  async getAvailableGameModes(userId: string): Promise<GameMode[]> {
    try {
      const character = await this.getUserCharacter(userId);
      if (!character) {
        throw new Error('Character not found');
      }

      const gameModes: GameMode[] = [];
      const now = new Date();

      // Add regular game modes
      for (const [modeId, modeConfig] of Object.entries(GAME_MODES)) {
        if (character.level >= modeConfig.minLevel) {
          gameModes.push({
            id: modeId,
            ...modeConfig,
            isActive: true
          });
        }
      }

      // Add special event modes (check if they're currently active)
      for (const [modeId, modeConfig] of Object.entries(SPECIAL_EVENT_MODES)) {
        const isEventActive = await this.isSpecialEventActive(modeId);
        if (isEventActive && character.level >= modeConfig.minLevel) {
          gameModes.push({
            id: modeId,
            ...modeConfig,
            isActive: true,
            startTime: await this.getEventStartTime(modeId),
            endTime: await this.getEventEndTime(modeId)
          });
        }
      }

      return gameModes.sort((a, b) => {
        // Sort by category priority, then by difficulty
        const categoryPriority = { 'daily': 1, 'weekly': 2, 'special_event': 3, 'permanent': 4 };
        if (a.category !== b.category) {
          return categoryPriority[a.category] - categoryPriority[b.category];
        }
        return a.difficulty - b.difficulty;
      });

    } catch (error) {
      console.error('Error getting available game modes:', error);
      throw error;
    }
  }

  /**
   * Create a new game session
   */
  async createGameSession(
    userId: string, 
    gameModeId: string, 
    settings?: Partial<GameSessionSettings>
  ): Promise<string> {
    try {
      const gameMode = await this.getGameModeById(gameModeId);
      if (!gameMode) {
        throw new Error('Game mode not found');
      }

      const character = await this.getUserCharacter(userId);
      if (!character) {
        throw new Error('Character not found');
      }

      if (character.level < gameMode.minLevel) {
        throw new Error('Character level too low for this game mode');
      }

      const defaultSettings: GameSessionSettings = {
        questionCount: this.getDefaultQuestionCount(gameMode),
        timePerQuestion: this.getDefaultTimePerQuestion(gameMode),
        allowPowerUps: gameMode.type === 'competitive' || gameMode.type === 'survival',
        difficultyScaling: gameMode.type === 'survival',
        subjectMix: gameMode.subjectId ? [gameMode.subjectId] : ['mathematics', 'science', 'history', 'language-arts']
      };

      const sessionSettings = { ...defaultSettings, ...settings };

      const sessionId = `session_${gameModeId}_${userId}_${Date.now()}`;

      const { error } = await supabase
        .from('game_sessions')
        .insert({
          id: sessionId,
          game_mode_id: gameModeId,
          host_user_id: gameMode.maxParticipants > 1 ? userId : null,
          status: 'waiting',
          current_round: 0,
          total_rounds: this.calculateTotalRounds(gameMode, sessionSettings),
          settings: JSON.stringify(sessionSettings),
          created_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Add the creator as the first participant
      await this.joinGameSession(sessionId, userId);

      return sessionId;
    } catch (error) {
      console.error('Error creating game session:', error);
      throw error;
    }
  }

  /**
   * Join an existing game session
   */
  async joinGameSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const session = await this.getGameSession(sessionId);
      if (!session) {
        throw new Error('Game session not found');
      }

      if (session.status !== 'waiting') {
        throw new Error('Game session is not accepting new players');
      }

      if (session.participants.length >= session.gameMode.maxParticipants) {
        throw new Error('Game session is full');
      }

      const character = await this.getUserCharacter(userId);
      if (!character) {
        throw new Error('Character not found');
      }

      const participant: GameParticipant = {
        userId,
        username: character.username || 'Anonymous',
        characterName: character.name,
        level: character.level,
        joinedAt: new Date(),
        isReady: false,
        currentScore: 0,
        position: session.participants.length + 1,
        status: 'active',
        powerUpsUsed: []
      };

      const { error } = await supabase
        .from('game_participants')
        .insert({
          session_id: sessionId,
          user_id: userId,
          username: participant.username,
          character_name: participant.characterName,
          level: participant.level,
          joined_at: participant.joinedAt.toISOString(),
          is_ready: false,
          current_score: 0,
          position: participant.position,
          status: 'active'
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error joining game session:', error);
      return false;
    }
  }

  /**
   * Start a game session
   */
  async startGameSession(sessionId: string, hostUserId: string): Promise<boolean> {
    try {
      const session = await this.getGameSession(sessionId);
      if (!session) {
        throw new Error('Game session not found');
      }

      if (session.hostUserId !== hostUserId) {
        throw new Error('Only the host can start the game');
      }

      if (session.status !== 'waiting') {
        throw new Error('Game session cannot be started');
      }

      // Check if minimum participants are met
      const minParticipants = session.gameMode.type === 'solo_challenge' ? 1 : 2;
      if (session.participants.length < minParticipants) {
        throw new Error('Not enough participants to start the game');
      }

      const { error } = await supabase
        .from('game_sessions')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
          current_round: 1
        })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      // Generate first set of questions
      await this.generateQuestionsForSession(sessionId);

      return true;
    } catch (error) {
      console.error('Error starting game session:', error);
      return false;
    }
  }

  /**
   * Submit an answer for a game session
   */
  async submitAnswer(
    sessionId: string, 
    userId: string, 
    questionId: string, 
    answer: string,
    timeSpent: number
  ): Promise<{ correct: boolean; points: number; newPosition: number }> {
    try {
      const session = await this.getGameSession(sessionId);
      if (!session || session.status !== 'active') {
        throw new Error('Game session not active');
      }

      const participant = session.participants.find(p => p.userId === userId);
      if (!participant) {
        throw new Error('User not in this game session');
      }

      // Check answer correctness
      const isCorrect = await this.checkAnswer(questionId, answer);
      
      // Calculate points based on game mode rules
      const points = this.calculatePoints(session.gameMode, isCorrect, timeSpent, participant);
      
      // Update participant score
      participant.currentScore += points;

      // Update database
      await supabase
        .from('game_participants')
        .update({
          current_score: participant.currentScore
        })
        .eq('session_id', sessionId)
        .eq('user_id', userId);

      // Record the answer
      await supabase
        .from('game_answers')
        .insert({
          session_id: sessionId,
          user_id: userId,
          question_id: questionId,
          answer: answer,
          is_correct: isCorrect,
          time_spent: timeSpent,
          points_earned: points,
          submitted_at: new Date().toISOString()
        });

      // Update leaderboard positions
      await this.updateLeaderboard(sessionId);

      // Check if round/game is complete
      await this.checkGameProgress(sessionId);

      const newPosition = await this.getUserPosition(sessionId, userId);

      return {
        correct: isCorrect,
        points,
        newPosition
      };

    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  /**
   * Use a power-up during a game
   */
  async usePowerUp(sessionId: string, userId: string, powerUpId: string): Promise<boolean> {
    try {
      const session = await this.getGameSession(sessionId);
      if (!session || session.status !== 'active') {
        throw new Error('Game session not active');
      }

      if (!session.settings.allowPowerUps) {
        throw new Error('Power-ups not allowed in this game mode');
      }

      const powerUp = POWER_UPS[powerUpId];
      if (!powerUp) {
        throw new Error('Power-up not found');
      }

      const participant = session.participants.find(p => p.userId === userId);
      if (!participant) {
        throw new Error('User not in this game session');
      }

      // Check if user has this power-up and can use it
      const canUse = await this.canUsePowerUp(userId, powerUpId);
      if (!canUse) {
        throw new Error('Cannot use this power-up');
      }

      // Apply power-up effect
      await this.applyPowerUpEffect(sessionId, userId, powerUp);

      // Record power-up usage
      participant.powerUpsUsed.push(powerUpId);

      await supabase
        .from('game_power_up_usage')
        .insert({
          session_id: sessionId,
          user_id: userId,
          power_up_id: powerUpId,
          used_at: new Date().toISOString()
        });

      return true;
    } catch (error) {
      console.error('Error using power-up:', error);
      return false;
    }
  }

  /**
   * Get current game session state
   */
  async getGameSession(sessionId: string): Promise<(GameSession & { gameMode: GameMode }) | null> {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        return null;
      }

      const { data: participantsData, error: participantsError } = await supabase
        .from('game_participants')
        .select('*')
        .eq('session_id', sessionId)
        .order('current_score', { ascending: false });

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
      }

      const gameMode = await this.getGameModeById(sessionData.game_mode_id);
      if (!gameMode) {
        return null;
      }

      const participants: GameParticipant[] = (participantsData || []).map(p => ({
        userId: p.user_id,
        username: p.username,
        characterName: p.character_name,
        level: p.level,
        joinedAt: new Date(p.joined_at),
        isReady: p.is_ready,
        currentScore: p.current_score,
        position: p.position,
        status: p.status,
        powerUpsUsed: JSON.parse(p.power_ups_used || '[]')
      }));

      return {
        id: sessionData.id,
        gameModeId: sessionData.game_mode_id,
        hostUserId: sessionData.host_user_id,
        participants,
        status: sessionData.status,
        startedAt: sessionData.started_at ? new Date(sessionData.started_at) : undefined,
        completedAt: sessionData.completed_at ? new Date(sessionData.completed_at) : undefined,
        currentRound: sessionData.current_round,
        totalRounds: sessionData.total_rounds,
        settings: JSON.parse(sessionData.settings || '{}'),
        leaderboard: [], // Will be populated by updateLeaderboard
        gameMode
      };

    } catch (error) {
      console.error('Error getting game session:', error);
      return null;
    }
  }

  /**
   * Get leaderboard for completed games
   */
  async getGameModeLeaderboard(gameModeId: string, timeframe: 'daily' | 'weekly' | 'all_time' = 'weekly'): Promise<GameLeaderboardEntry[]> {
    try {
      let dateFilter = '';
      const now = new Date();
      
      switch (timeframe) {
        case 'daily':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateFilter = `AND gs.completed_at >= '${today.toISOString()}'`;
          break;
        case 'weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = `AND gs.completed_at >= '${weekAgo.toISOString()}'`;
          break;
      }

      const { data, error } = await supabase
        .rpc('get_game_mode_leaderboard', {
          game_mode_id: gameModeId,
          date_filter: dateFilter
        });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting game mode leaderboard:', error);
      return [];
    }
  }

  /**
   * Private helper methods
   */
  private async getUserCharacter(userId: string): Promise<Character | null> {
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

  private async getGameModeById(gameModeId: string): Promise<GameMode | null> {
    // Check regular game modes
    if (GAME_MODES[gameModeId]) {
      return {
        id: gameModeId,
        ...GAME_MODES[gameModeId],
        isActive: true
      };
    }

    // Check special event modes
    if (SPECIAL_EVENT_MODES[gameModeId]) {
      const isActive = await this.isSpecialEventActive(gameModeId);
      return {
        id: gameModeId,
        ...SPECIAL_EVENT_MODES[gameModeId],
        isActive,
        startTime: await this.getEventStartTime(gameModeId),
        endTime: await this.getEventEndTime(gameModeId)
      };
    }

    return null;
  }

  private async isSpecialEventActive(eventId: string): Promise<boolean> {
    // This would check against a special events calendar
    // For now, return true for demo purposes
    return true;
  }

  private async getEventStartTime(eventId: string): Promise<Date | undefined> {
    // This would fetch from events calendar
    return new Date();
  }

  private async getEventEndTime(eventId: string): Promise<Date | undefined> {
    // This would fetch from events calendar
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 7); // 7 days from now
    return endTime;
  }

  private getDefaultQuestionCount(gameMode: GameMode): number {
    switch (gameMode.type) {
      case 'timed':
        return 20; // As many as possible in time limit
      case 'competitive':
        return 10;
      case 'survival':
        return 50; // Until eliminated
      case 'cooperative':
        return 15;
      case 'solo_challenge':
        return 12;
      default:
        return 10;
    }
  }

  private getDefaultTimePerQuestion(gameMode: GameMode): number {
    switch (gameMode.difficulty) {
      case 1:
        return 45;
      case 2:
        return 35;
      case 3:
        return 30;
      case 4:
        return 25;
      case 5:
        return 20;
      default:
        return 30;
    }
  }

  private calculateTotalRounds(gameMode: GameMode, settings: GameSessionSettings): number {
    if (gameMode.type === 'timed') {
      return 1; // Single timed round
    }
    return Math.ceil(settings.questionCount / 5); // 5 questions per round
  }

  private async generateQuestionsForSession(sessionId: string): Promise<void> {
    // This would integrate with the existing question service
    // to generate appropriate questions for the game mode
    console.log(`Generating questions for session ${sessionId}`);
  }

  private async checkAnswer(questionId: string, answer: string): Promise<boolean> {
    // This would check against the question database
    // For now, return a random result for demo
    return Math.random() > 0.3; // 70% correct rate for demo
  }

  private calculatePoints(
    gameMode: GameMode, 
    isCorrect: boolean, 
    timeSpent: number, 
    participant: GameParticipant
  ): number {
    if (!isCorrect) {
      return gameMode.type === 'timed' ? -2 : 0;
    }

    let basePoints = 10;
    
    // Difficulty multiplier
    basePoints *= gameMode.difficulty;

    // Speed bonus for timed modes
    if (gameMode.type === 'timed' || gameMode.type === 'competitive') {
      const maxTime = 30; // seconds
      const speedBonus = Math.max(0, (maxTime - timeSpent) / maxTime * 5);
      basePoints += speedBonus;
    }

    // Streak bonus
    const recentAnswers = participant.powerUpsUsed.length; // Simplified
    if (recentAnswers >= 3) {
      basePoints *= 1.2; // 20% bonus for streaks
    }

    return Math.round(basePoints);
  }

  private async updateLeaderboard(sessionId: string): Promise<void> {
    // Update participant positions based on current scores
    const { data: participants, error } = await supabase
      .from('game_participants')
      .select('*')
      .eq('session_id', sessionId)
      .order('current_score', { ascending: false });

    if (error || !participants) {
      return;
    }

    for (let i = 0; i < participants.length; i++) {
      await supabase
        .from('game_participants')
        .update({ position: i + 1 })
        .eq('session_id', sessionId)
        .eq('user_id', participants[i].user_id);
    }
  }

  private async checkGameProgress(sessionId: string): Promise<void> {
    // Check if the game should end based on mode rules
    const session = await this.getGameSession(sessionId);
    if (!session) return;

    let shouldEnd = false;

    // Check completion conditions based on game mode
    switch (session.gameMode.type) {
      case 'survival':
        // Check if any players have lives remaining
        const activePlayers = session.participants.filter(p => p.status === 'active');
        shouldEnd = activePlayers.length <= 1;
        break;
      case 'timed':
        // Check if time limit reached (would be handled by client timer)
        break;
      case 'competitive':
        // Check if all rounds completed
        shouldEnd = session.currentRound >= session.totalRounds;
        break;
    }

    if (shouldEnd) {
      await this.endGameSession(sessionId);
    }
  }

  private async endGameSession(sessionId: string): Promise<void> {
    try {
      const session = await this.getGameSession(sessionId);
      if (!session) return;

      // Update session status
      await supabase
        .from('game_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      // Award rewards to participants
      await this.awardGameRewards(session);

    } catch (error) {
      console.error('Error ending game session:', error);
    }
  }

  private async awardGameRewards(session: GameSession & { gameMode: GameMode }): Promise<void> {
    for (const participant of session.participants) {
      const rewards = this.getParticipantRewards(session.gameMode, participant.position);
      
      for (const reward of rewards) {
        await this.awardReward(participant.userId, reward);
      }
    }
  }

  private getParticipantRewards(gameMode: GameMode, position: number): GameModeReward[] {
    return gameMode.rewards.filter(reward => {
      switch (reward.position) {
        case 'winner':
          return position === 1;
        case 'top_3':
          return position <= 3;
        case 'top_10':
          return position <= 10;
        case 'participant':
          return true;
        default:
          return false;
      }
    });
  }

  private async awardReward(userId: string, reward: GameModeReward): Promise<void> {
    switch (reward.type) {
      case 'xp':
        // Award XP through existing XP system
        break;
      case 'item':
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
      case 'badge':
        if (reward.badgeId) {
          await supabase
            .from('user_achievements')
            .upsert({
              user_id: userId,
              achievement_id: reward.badgeId
            });
        }
        break;
      case 'stat_points':
        await supabase
          .from('character_stats')
          .update({
            available_points: supabase.raw(`available_points + ${reward.value}`)
          })
          .eq('character_id', supabase.raw(`(SELECT id FROM characters WHERE user_id = '${userId}')`));
        break;
    }
  }

  private async getUserPosition(sessionId: string, userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('game_participants')
      .select('position')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return 0;
    }

    return data.position;
  }

  private async canUsePowerUp(userId: string, powerUpId: string): Promise<boolean> {
    // Check if user has the power-up in inventory and it's not on cooldown
    // This would integrate with inventory and cooldown systems
    return true; // Simplified for demo
  }

  private async applyPowerUpEffect(sessionId: string, userId: string, powerUp: PowerUp): Promise<void> {
    // Apply the power-up effect based on its type
    switch (powerUp.type) {
      case 'time_freeze':
        // Send signal to client to freeze timer
        break;
      case 'double_points':
        // Set flag for next question to award double points
        break;
      case 'hint':
        // Provide hint for current question
        break;
      case 'shield':
        // Set protection flag
        break;
      case 'steal_points':
        // Transfer points from leading opponent
        break;
      case 'extra_life':
        // Add life in survival modes
        break;
    }
  }
}

export const gameModeService = new GameModeService();