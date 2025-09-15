// Parent/Teacher service for monitoring student progress and managing controls
import { supabase } from './supabaseClient';
import type { 
  ParentTeacher, 
  StudentProgress, 
  ActivityLog, 
  ProgressReport, 
  StudentAlert, 
  ParentalControls,
  DashboardStats 
} from '../types/parent';

export class ParentTeacherService {
  /**
   * Create or link a parent/teacher account
   */
  static async createParentTeacherAccount(
    email: string, 
    name: string, 
    role: 'parent' | 'teacher'
  ): Promise<ParentTeacher> {
    try {
      const { data, error } = await supabase
        .from('parent_teachers')
        .insert({
          email,
          name,
          role,
          linked_students: []
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        linkedStudents: data.linked_students || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Create parent/teacher account error:', error);
      throw error;
    }
  }

  /**
   * Link a student to a parent/teacher account
   */
  static async linkStudent(parentTeacherId: string, studentId: string): Promise<void> {
    try {
      // Get current linked students
      const { data: parentTeacher, error: fetchError } = await supabase
        .from('parent_teachers')
        .select('linked_students')
        .eq('id', parentTeacherId)
        .single();

      if (fetchError) throw fetchError;

      const currentStudents = parentTeacher.linked_students || [];
      if (!currentStudents.includes(studentId)) {
        currentStudents.push(studentId);

        const { error: updateError } = await supabase
          .from('parent_teachers')
          .update({ 
            linked_students: currentStudents,
            updated_at: new Date().toISOString()
          })
          .eq('id', parentTeacherId);

        if (updateError) throw updateError;

        // Also update the student's record to link back to parent/teacher
        const { error: studentUpdateError } = await supabase
          .from('users')
          .update({ parent_id: parentTeacherId })
          .eq('id', studentId);

        if (studentUpdateError) throw studentUpdateError;
      }
    } catch (error) {
      console.error('Link student error:', error);
      throw error;
    }
  }

  /**
   * Get all students linked to a parent/teacher
   */
  static async getLinkedStudents(parentTeacherId: string): Promise<StudentProgress[]> {
    try {
      const { data: parentTeacher, error: parentError } = await supabase
        .from('parent_teachers')
        .select('linked_students')
        .eq('id', parentTeacherId)
        .single();

      if (parentError) throw parentError;

      const studentIds = parentTeacher.linked_students || [];
      if (studentIds.length === 0) return [];

      // Get student details with character data
      const { data: students, error: studentsError } = await supabase
        .from('users')
        .select(`
          id,
          name,
          characters (
            id,
            name,
            level,
            total_xp,
            stats:character_stats (
              intelligence,
              vitality,
              wisdom,
              charisma,
              dexterity,
              creativity
            )
          ),
          activity_logs (
            id,
            activity_type,
            timestamp
          )
        `)
        .in('id', studentIds);

      if (studentsError) throw studentsError;

      // Get achievements for each student
      const progressData: StudentProgress[] = [];
      
      for (const student of students) {
        const character = student.characters?.[0];
        if (!character) continue;

        // Get recent achievements
        const { data: achievements } = await supabase
          .from('user_achievements')
          .select(`
            achievement_id,
            earned_at,
            achievements (
              name,
              description,
              badge_icon
            )
          `)
          .eq('user_id', student.id)
          .order('earned_at', { ascending: false })
          .limit(5);

        // Get recent activity
        const { data: recentActivity } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('student_id', student.id)
          .order('timestamp', { ascending: false })
          .limit(10);

        // Calculate current streak
        const currentStreak = await this.calculateLearningStreak(student.id);

        progressData.push({
          studentId: student.id,
          studentName: student.name,
          characterName: character.name,
          level: character.level,
          totalXP: character.total_xp,
          currentStreak,
          lastActive: student.activity_logs?.[0]?.timestamp || '',
          stats: character.stats?.[0] || {
            intelligence: 0,
            vitality: 0,
            wisdom: 0,
            charisma: 0,
            dexterity: 0,
            creativity: 0
          },
          achievements: achievements?.map(a => ({
            id: a.achievement_id,
            name: a.achievements.name,
            description: a.achievements.description,
            badgeIcon: a.achievements.badge_icon,
            earnedAt: a.earned_at
          })) || [],
          recentActivity: recentActivity?.map(activity => ({
            id: activity.id,
            studentId: activity.student_id,
            activityType: activity.activity_type,
            subject: activity.subject,
            xpEarned: activity.xp_earned,
            timeSpent: activity.time_spent,
            accuracy: activity.accuracy,
            details: activity.details,
            timestamp: activity.timestamp
          })) || []
        });
      }

      return progressData;
    } catch (error) {
      console.error('Get linked students error:', error);
      throw error;
    }
  }

  /**
   * Log student activity
   */
  static async logActivity(activityData: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          student_id: activityData.studentId,
          activity_type: activityData.activityType,
          subject: activityData.subject,
          xp_earned: activityData.xpEarned,
          time_spent: activityData.timeSpent,
          accuracy: activityData.accuracy,
          details: activityData.details,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Log activity error:', error);
      throw error;
    }
  }

  /**
   * Generate progress report for a student
   */
  static async generateProgressReport(
    studentId: string, 
    parentTeacherId: string,
    startDate: string,
    endDate: string
  ): Promise<ProgressReport> {
    try {
      // Get activity data for the period
      const { data: activities, error: activitiesError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('student_id', studentId)
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (activitiesError) throw activitiesError;

      // Calculate summary statistics
      const totalTimeSpent = activities?.reduce((sum, activity) => sum + (activity.time_spent || 0), 0) || 0;
      const totalXPEarned = activities?.reduce((sum, activity) => sum + (activity.xp_earned || 0), 0) || 0;
      const levelsGained = activities?.filter(a => a.activity_type === 'level_up').length || 0;
      const achievementsEarned = activities?.filter(a => a.activity_type === 'achievement_earned').length || 0;
      
      const accuracyActivities = activities?.filter(a => a.accuracy !== null) || [];
      const averageAccuracy = accuracyActivities.length > 0 
        ? accuracyActivities.reduce((sum, a) => sum + a.accuracy, 0) / accuracyActivities.length 
        : 0;

      const subjectsStudied = [...new Set(activities?.map(a => a.subject).filter(Boolean) || [])];
      
      // Analyze subject performance
      const subjectPerformance = this.analyzeSubjectPerformance(activities || []);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(subjectPerformance, averageAccuracy, totalTimeSpent);

      const report: ProgressReport = {
        id: crypto.randomUUID(),
        studentId,
        generatedBy: parentTeacherId,
        reportPeriod: { startDate, endDate },
        summary: {
          totalTimeSpent,
          totalXPEarned,
          levelsGained,
          achievementsEarned,
          averageAccuracy,
          subjectsStudied,
          strongestSubjects: subjectPerformance.strongest,
          strugglingSubjects: subjectPerformance.struggling
        },
        recommendations,
        generatedAt: new Date().toISOString()
      };

      // Save report to database
      const { error: saveError } = await supabase
        .from('progress_reports')
        .insert({
          id: report.id,
          student_id: studentId,
          generated_by: parentTeacherId,
          report_period_start: startDate,
          report_period_end: endDate,
          summary: report.summary,
          recommendations: report.recommendations,
          generated_at: report.generatedAt
        });

      if (saveError) throw saveError;

      return report;
    } catch (error) {
      console.error('Generate progress report error:', error);
      throw error;
    }
  }

  /**
   * Get alerts for students
   */
  static async getStudentAlerts(parentTeacherId: string): Promise<StudentAlert[]> {
    try {
      const { data: parentTeacher, error: parentError } = await supabase
        .from('parent_teachers')
        .select('linked_students')
        .eq('id', parentTeacherId)
        .single();

      if (parentError) throw parentError;

      const studentIds = parentTeacher.linked_students || [];
      if (studentIds.length === 0) return [];

      const { data: alerts, error: alertsError } = await supabase
        .from('student_alerts')
        .select('*')
        .in('student_id', studentIds)
        .eq('acknowledged', false)
        .order('created_at', { ascending: false });

      if (alertsError) throw alertsError;

      return alerts?.map(alert => ({
        id: alert.id,
        studentId: alert.student_id,
        alertType: alert.alert_type,
        severity: alert.severity,
        message: alert.message,
        subject: alert.subject,
        data: alert.data || {},
        acknowledged: alert.acknowledged,
        createdAt: alert.created_at
      })) || [];
    } catch (error) {
      console.error('Get student alerts error:', error);
      throw error;
    }
  }

  /**
   * Create alert for struggling student
   */
  static async createAlert(alertData: Omit<StudentAlert, 'id' | 'acknowledged' | 'createdAt'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('student_alerts')
        .insert({
          student_id: alertData.studentId,
          alert_type: alertData.alertType,
          severity: alertData.severity,
          message: alertData.message,
          subject: alertData.subject,
          data: alertData.data,
          acknowledged: false,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Create alert error:', error);
      throw error;
    }
  }

  /**
   * Acknowledge an alert
   */
  static async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('student_alerts')
        .update({ acknowledged: true })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.error('Acknowledge alert error:', error);
      throw error;
    }
  }

  /**
   * Get parental controls for a student
   */
  static async getParentalControls(studentId: string): Promise<ParentalControls | null> {
    try {
      const { data, error } = await supabase
        .from('parental_controls')
        .select('*')
        .eq('student_id', studentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore not found error

      if (!data) return null;

      return {
        id: data.id,
        studentId: data.student_id,
        parentId: data.parent_id,
        settings: data.settings,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Get parental controls error:', error);
      throw error;
    }
  }

  /**
   * Update parental controls
   */
  static async updateParentalControls(
    studentId: string, 
    parentId: string, 
    settings: ParentalControls['settings']
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('parental_controls')
        .upsert({
          student_id: studentId,
          parent_id: parentId,
          settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Update parental controls error:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(parentTeacherId: string): Promise<DashboardStats> {
    try {
      const { data: parentTeacher, error: parentError } = await supabase
        .from('parent_teachers')
        .select('linked_students')
        .eq('id', parentTeacherId)
        .single();

      if (parentError) throw parentError;

      const studentIds = parentTeacher.linked_students || [];
      if (studentIds.length === 0) {
        return {
          totalStudents: 0,
          activeToday: 0,
          averageLevel: 0,
          totalXPEarned: 0,
          achievementsEarned: 0,
          alertsCount: 0,
          weeklyProgress: []
        };
      }

      // Get basic stats
      const { data: characters } = await supabase
        .from('characters')
        .select('level, total_xp')
        .in('user_id', studentIds);

      const totalStudents = studentIds.length;
      const averageLevel = characters?.reduce((sum, char) => sum + char.level, 0) / characters?.length || 0;
      const totalXPEarned = characters?.reduce((sum, char) => sum + char.total_xp, 0) || 0;

      // Get today's active students
      const today = new Date().toISOString().split('T')[0];
      const { data: todayActivity } = await supabase
        .from('activity_logs')
        .select('student_id')
        .in('student_id', studentIds)
        .gte('timestamp', today);

      const activeToday = new Set(todayActivity?.map(a => a.student_id) || []).size;

      // Get achievements count
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('id')
        .in('user_id', studentIds);

      const achievementsEarned = achievements?.length || 0;

      // Get alerts count
      const { data: alerts } = await supabase
        .from('student_alerts')
        .select('id')
        .in('student_id', studentIds)
        .eq('acknowledged', false);

      const alertsCount = alerts?.length || 0;

      // Get weekly progress
      const weeklyProgress = await this.getWeeklyProgress(studentIds);

      return {
        totalStudents,
        activeToday,
        averageLevel,
        totalXPEarned,
        achievementsEarned,
        alertsCount,
        weeklyProgress
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  /**
   * Calculate learning streak for a student
   */
  private static async calculateLearningStreak(studentId: string): Promise<number> {
    try {
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('timestamp')
        .eq('student_id', studentId)
        .in('activity_type', ['lesson_completed', 'question_answered'])
        .order('timestamp', { ascending: false })
        .limit(30);

      if (!activities || activities.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      const activityDates = new Set(
        activities.map(a => new Date(a.timestamp).toDateString())
      );

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        
        if (activityDates.has(checkDate.toDateString())) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Calculate learning streak error:', error);
      return 0;
    }
  }

  /**
   * Analyze subject performance
   */
  private static analyzeSubjectPerformance(activities: any[]) {
    const subjectStats: Record<string, { accuracy: number[], xp: number }> = {};

    activities.forEach(activity => {
      if (activity.subject && activity.accuracy !== null) {
        if (!subjectStats[activity.subject]) {
          subjectStats[activity.subject] = { accuracy: [], xp: 0 };
        }
        subjectStats[activity.subject].accuracy.push(activity.accuracy);
        subjectStats[activity.subject].xp += activity.xp_earned || 0;
      }
    });

    const subjects = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      averageAccuracy: stats.accuracy.reduce((sum, acc) => sum + acc, 0) / stats.accuracy.length,
      totalXP: stats.xp
    }));

    const strongest = subjects
      .filter(s => s.averageAccuracy >= 80)
      .sort((a, b) => b.averageAccuracy - a.averageAccuracy)
      .slice(0, 3)
      .map(s => s.subject);

    const struggling = subjects
      .filter(s => s.averageAccuracy < 60)
      .sort((a, b) => a.averageAccuracy - b.averageAccuracy)
      .slice(0, 3)
      .map(s => s.subject);

    return { strongest, struggling };
  }

  /**
   * Generate recommendations based on performance
   */
  private static generateRecommendations(
    subjectPerformance: { strongest: string[], struggling: string[] },
    averageAccuracy: number,
    totalTimeSpent: number
  ): string[] {
    const recommendations: string[] = [];

    if (averageAccuracy < 60) {
      recommendations.push('Consider reviewing fundamental concepts before advancing to new topics.');
    }

    if (subjectPerformance.struggling.length > 0) {
      recommendations.push(`Focus additional practice time on: ${subjectPerformance.struggling.join(', ')}.`);
    }

    if (totalTimeSpent < 60) { // Less than 1 hour per week
      recommendations.push('Encourage more regular study sessions to improve learning retention.');
    }

    if (subjectPerformance.strongest.length > 0) {
      recommendations.push(`Excellent progress in: ${subjectPerformance.strongest.join(', ')}. Consider advanced challenges in these areas.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Great progress! Continue with the current learning pace and variety.');
    }

    return recommendations;
  }

  /**
   * Get weekly progress data
   */
  private static async getWeeklyProgress(studentIds: string[]) {
    const weeklyData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const { data: dayActivity } = await supabase
        .from('activity_logs')
        .select('student_id, xp_earned, time_spent')
        .in('student_id', studentIds)
        .gte('timestamp', dateStr)
        .lt('timestamp', new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const activeStudents = new Set(dayActivity?.map(a => a.student_id) || []).size;
      const xpEarned = dayActivity?.reduce((sum, a) => sum + (a.xp_earned || 0), 0) || 0;
      const timeSpent = dayActivity?.reduce((sum, a) => sum + (a.time_spent || 0), 0) || 0;

      weeklyData.push({
        date: dateStr,
        activeStudents,
        xpEarned,
        timeSpent
      });
    }

    return weeklyData;
  }
}