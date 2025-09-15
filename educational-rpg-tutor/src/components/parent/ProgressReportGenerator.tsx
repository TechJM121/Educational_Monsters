// Progress Report Generator - Create detailed learning reports
import React, { useState } from 'react';
import { ParentTeacherService } from '../../services/parentTeacherService';
import type { StudentProgress, ProgressReport } from '../../types/parent';

interface ProgressReportGeneratorProps {
  students: StudentProgress[];
  parentTeacherId: string;
}

export const ProgressReportGenerator: React.FC<ProgressReportGeneratorProps> = ({
  students,
  parentTeacherId
}) => {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'quarter' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [generatedReport, setGeneratedReport] = useState<ProgressReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDateRange = () => {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    let start: string;

    switch (reportPeriod) {
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'month':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'quarter':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'custom':
        start = customStartDate;
        return { start, end: customEndDate };
      default:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    return { start, end };
  };

  const generateReport = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    const { start, end } = getDateRange();
    if (!start || !end) {
      setError('Please provide valid date range');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const report = await ParentTeacherService.generateProgressReport(
        selectedStudent,
        parentTeacherId,
        start,
        end
      );

      setGeneratedReport(report);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!generatedReport) return;

    const student = students.find(s => s.studentId === generatedReport.studentId);
    const reportContent = generateReportContent(generatedReport, student);
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student?.studentName || 'Student'}_Progress_Report_${generatedReport.generatedAt.split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportContent = (report: ProgressReport, student?: StudentProgress) => {
    return `
EDUCATIONAL RPG TUTOR - PROGRESS REPORT
=====================================

Student: ${student?.studentName || 'Unknown'}
Character: ${student?.characterName || 'Unknown'}
Report Period: ${report.reportPeriod.startDate} to ${report.reportPeriod.endDate}
Generated: ${new Date(report.generatedAt).toLocaleDateString()}

SUMMARY STATISTICS
==================
Total Study Time: ${Math.floor(report.summary.totalTimeSpent / 60)}h ${report.summary.totalTimeSpent % 60}m
Total XP Earned: ${report.summary.totalXPEarned.toLocaleString()}
Levels Gained: ${report.summary.levelsGained}
Achievements Earned: ${report.summary.achievementsEarned}
Average Accuracy: ${report.summary.averageAccuracy.toFixed(1)}%

SUBJECTS STUDIED
================
${report.summary.subjectsStudied.join(', ') || 'None'}

STRONGEST SUBJECTS
==================
${report.summary.strongestSubjects.join(', ') || 'None identified'}

AREAS FOR IMPROVEMENT
=====================
${report.summary.strugglingSubjects.join(', ') || 'None identified'}

RECOMMENDATIONS
===============
${report.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

---
This report was generated automatically by the Educational RPG Tutor system.
For questions or concerns, please contact your child's teacher or the platform administrator.
    `.trim();
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Progress Reports</h2>
        <p className="text-blue-200">Generate detailed learning progress reports for students</p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Generate New Report</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Selection */}
          <div>
            <label className="block text-white font-medium mb-2">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2"
            >
              <option value="">Choose a student...</option>
              {students.map((student) => (
                <option key={student.studentId} value={student.studentId}>
                  {student.studentName} ({student.characterName})
                </option>
              ))}
            </select>
          </div>

          {/* Report Period */}
          <div>
            <label className="block text-white font-medium mb-2">Report Period</label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value as any)}
              className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {reportPeriod === 'custom' && (
            <>
              <div>
                <label className="block text-white font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2"
                />
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-600/20 border border-red-500 text-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={generateReport}
            disabled={loading || !selectedStudent}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Generating Report...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Generated Report Display */}
      {generatedReport && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Progress Report</h3>
            <div className="flex space-x-3">
              <button
                onClick={downloadReport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Download Report
              </button>
              <button
                onClick={() => setGeneratedReport(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Report Header */}
          <div className="mb-6 p-4 bg-black/20 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-white mb-2">Student Information</h4>
                <p className="text-blue-200">
                  Student: {students.find(s => s.studentId === generatedReport.studentId)?.studentName}
                </p>
                <p className="text-blue-200">
                  Character: {students.find(s => s.studentId === generatedReport.studentId)?.characterName}
                </p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">Report Period</h4>
                <p className="text-blue-200">
                  {new Date(generatedReport.reportPeriod.startDate).toLocaleDateString()} - {' '}
                  {new Date(generatedReport.reportPeriod.endDate).toLocaleDateString()}
                </p>
                <p className="text-blue-200">
                  Generated: {new Date(generatedReport.generatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-white mb-4">Summary Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {formatTime(generatedReport.summary.totalTimeSpent)}
                </div>
                <div className="text-sm text-blue-200">Study Time</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {generatedReport.summary.totalXPEarned.toLocaleString()}
                </div>
                <div className="text-sm text-blue-200">XP Earned</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {generatedReport.summary.levelsGained}
                </div>
                <div className="text-sm text-blue-200">Levels Gained</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {generatedReport.summary.achievementsEarned}
                </div>
                <div className="text-sm text-blue-200">Achievements</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {generatedReport.summary.averageAccuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-blue-200">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Subject Analysis */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-white mb-4">Subject Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/20 rounded-lg p-4">
                <h5 className="font-bold text-white mb-2">📚 Subjects Studied</h5>
                <div className="space-y-1">
                  {generatedReport.summary.subjectsStudied.length > 0 ? (
                    generatedReport.summary.subjectsStudied.map((subject) => (
                      <div key={subject} className="text-blue-200 text-sm">• {subject}</div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">No subjects recorded</div>
                  )}
                </div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <h5 className="font-bold text-white mb-2">💪 Strongest Areas</h5>
                <div className="space-y-1">
                  {generatedReport.summary.strongestSubjects.length > 0 ? (
                    generatedReport.summary.strongestSubjects.map((subject) => (
                      <div key={subject} className="text-green-300 text-sm">• {subject}</div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">None identified</div>
                  )}
                </div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <h5 className="font-bold text-white mb-2">📈 Areas for Improvement</h5>
                <div className="space-y-1">
                  {generatedReport.summary.strugglingSubjects.length > 0 ? (
                    generatedReport.summary.strugglingSubjects.map((subject) => (
                      <div key={subject} className="text-yellow-300 text-sm">• {subject}</div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">None identified</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Recommendations</h4>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="space-y-3">
                {generatedReport.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-blue-200">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};