// Parental Controls Panel - Manage social features and screen time
import React, { useState, useEffect, useCallback } from 'react';
import { ParentTeacherService } from '../../services/parentTeacherService';
import type { StudentProgress, ParentalControls } from '../../types/parent';

interface ParentalControlsPanelProps {
  students: StudentProgress[];
  parentTeacherId: string;
  role: 'parent' | 'teacher';
}

export const ParentalControlsPanel: React.FC<ParentalControlsPanelProps> = ({
  students,
  parentTeacherId,
  role
}) => {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [controls, setControls] = useState<ParentalControls | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Default controls for new students
  const defaultControls: ParentalControls['settings'] = {
    socialFeaturesEnabled: true,
    tradingEnabled: true,
    leaderboardVisible: true,
    friendRequestsEnabled: true,
    maxDailyScreenTime: 120, // 2 hours
    allowedPlayTimes: [
      { start: '16:00', end: '19:00' } // 4 PM to 7 PM
    ],
    contentFilters: {
      maxDifficultyLevel: 5,
      blockedSubjects: []
    }
  };

  const loadControls = useCallback(async () => {
    if (!selectedStudent) return;

    try {
      setLoading(true);
      setError(null);

      const existingControls = await ParentTeacherService.getParentalControls(selectedStudent);
      
      if (existingControls) {
        setControls(existingControls);
      } else {
        // Create default controls for new student
        setControls({
          id: '',
          studentId: selectedStudent,
          parentId: parentTeacherId,
          settings: defaultControls,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Failed to load parental controls:', err);
      setError('Failed to load parental controls. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedStudent, parentTeacherId]);

  useEffect(() => {
    if (selectedStudent) {
      loadControls();
    }
  }, [selectedStudent, loadControls]);

  const saveControls = async () => {
    if (!controls || !selectedStudent) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await ParentTeacherService.updateParentalControls(
        selectedStudent,
        parentTeacherId,
        controls.settings
      );

      setSuccessMessage('Parental controls updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save parental controls:', err);
      setError('Failed to save parental controls. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    if (!controls) return;

    const newControls = { ...controls };
    const keys = path.split('.');
    let current: any = newControls.settings;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setControls(newControls);
  };

  const addPlayTime = () => {
    if (!controls) return;

    const newPlayTime = { start: '16:00', end: '18:00' };
    updateSetting('allowedPlayTimes', [...controls.settings.allowedPlayTimes, newPlayTime]);
  };

  const removePlayTime = (index: number) => {
    if (!controls) return;

    const newPlayTimes = controls.settings.allowedPlayTimes.filter((_, i) => i !== index);
    updateSetting('allowedPlayTimes', newPlayTimes);
  };

  const updatePlayTime = (index: number, field: 'start' | 'end', value: string) => {
    if (!controls) return;

    const newPlayTimes = [...controls.settings.allowedPlayTimes];
    newPlayTimes[index] = { ...newPlayTimes[index], [field]: value };
    updateSetting('allowedPlayTimes', newPlayTimes);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const availableSubjects = [
    'Mathematics', 'Science', 'Reading', 'History', 'Art', 'Music', 'Physical Education'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {role === 'parent' ? 'Parental' : 'Learning'} Controls
        </h2>
        <p className="text-blue-200">
          Manage social features, screen time, and content settings for students
        </p>
      </div>

      {/* Student Selection */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-white font-medium mb-2">Select Student</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full md:w-1/2 bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2"
          >
            <option value="">Choose a student...</option>
            {students.map((student) => (
              <option key={student.studentId} value={student.studentId}>
                {student.studentName} ({student.characterName})
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 bg-red-600/20 border border-red-500 text-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-green-600/20 border border-green-500 text-green-200 p-3 rounded-lg">
            {successMessage}
          </div>
        )}
      </div>

      {/* Controls Interface */}
      {selectedStudent && controls && !loading && (
        <div className="space-y-6">
          {/* Social Features */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">👥 Social Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium">Enable Social Features</label>
                  <input
                    type="checkbox"
                    checked={controls.settings.socialFeaturesEnabled}
                    onChange={(e) => updateSetting('socialFeaturesEnabled', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium">Allow Trading</label>
                  <input
                    type="checkbox"
                    checked={controls.settings.tradingEnabled}
                    onChange={(e) => updateSetting('tradingEnabled', e.target.checked)}
                    disabled={!controls.settings.socialFeaturesEnabled}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium">Show on Leaderboard</label>
                  <input
                    type="checkbox"
                    checked={controls.settings.leaderboardVisible}
                    onChange={(e) => updateSetting('leaderboardVisible', e.target.checked)}
                    disabled={!controls.settings.socialFeaturesEnabled}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium">Allow Friend Requests</label>
                  <input
                    type="checkbox"
                    checked={controls.settings.friendRequestsEnabled}
                    onChange={(e) => updateSetting('friendRequestsEnabled', e.target.checked)}
                    disabled={!controls.settings.socialFeaturesEnabled}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Screen Time Management */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">⏰ Screen Time Management</h3>
            
            <div className="mb-6">
              <label className="block text-white font-medium mb-2">
                Maximum Daily Screen Time: {formatTime(controls.settings.maxDailyScreenTime)}
              </label>
              <input
                type="range"
                min="30"
                max="480"
                step="30"
                value={controls.settings.maxDailyScreenTime}
                onChange={(e) => updateSetting('maxDailyScreenTime', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-blue-200 mt-1">
                <span>30 min</span>
                <span>8 hours</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-white">Allowed Play Times</h4>
                <button
                  onClick={addPlayTime}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Add Time Slot
                </button>
              </div>
              
              <div className="space-y-3">
                {controls.settings.allowedPlayTimes.map((timeSlot, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-black/20 p-3 rounded-lg">
                    <input
                      type="time"
                      value={timeSlot.start}
                      onChange={(e) => updatePlayTime(index, 'start', e.target.value)}
                      className="bg-black/20 text-white border border-white/20 rounded px-2 py-1"
                    />
                    <span className="text-white">to</span>
                    <input
                      type="time"
                      value={timeSlot.end}
                      onChange={(e) => updatePlayTime(index, 'end', e.target.value)}
                      className="bg-black/20 text-white border border-white/20 rounded px-2 py-1"
                    />
                    <button
                      onClick={() => removePlayTime(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                
                {controls.settings.allowedPlayTimes.length === 0 && (
                  <p className="text-blue-200 text-sm">No time restrictions - student can play anytime</p>
                )}
              </div>
            </div>
          </div>

          {/* Content Filters */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">🛡️ Content Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Maximum Difficulty Level: {controls.settings.contentFilters.maxDifficultyLevel}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={controls.settings.contentFilters.maxDifficultyLevel}
                  onChange={(e) => updateSetting('contentFilters.maxDifficultyLevel', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-blue-200 mt-1">
                  <span>Beginner</span>
                  <span>Expert</span>
                </div>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Blocked Subjects</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableSubjects.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={controls.settings.contentFilters.blockedSubjects.includes(subject)}
                        onChange={(e) => {
                          const blocked = controls.settings.contentFilters.blockedSubjects;
                          if (e.target.checked) {
                            updateSetting('contentFilters.blockedSubjects', [...blocked, subject]);
                          } else {
                            updateSetting('contentFilters.blockedSubjects', blocked.filter(s => s !== subject));
                          }
                        }}
                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      />
                      <label className="text-white text-sm">{subject}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveControls}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {saving ? 'Saving...' : 'Save Controls'}
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && selectedStudent && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading parental controls...</p>
        </div>
      )}

      {/* No Student Selected */}
      {!selectedStudent && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <h3 className="text-xl font-bold text-white mb-2">Select a Student</h3>
          <p className="text-blue-200">
            Choose a student from the dropdown above to manage their {role === 'parent' ? 'parental' : 'learning'} controls.
          </p>
        </div>
      )}
    </div>
  );
};