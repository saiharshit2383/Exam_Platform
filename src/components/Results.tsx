import React from 'react';
import { ExamResult } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Clock, Target, BarChart3, LogOut } from 'lucide-react';

interface ResultsProps {
  result: ExamResult;
  onStartNewExam: () => void;
}

const Results: React.FC<ResultsProps> = ({ result, onStartNewExam }) => {
  const { user, logout } = useAuth();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const gradeInfo = getGrade(result.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Exam Results</h1>
              <p className="text-sm text-gray-600">{user?.fullName}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Results Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${gradeInfo.bg} mb-4`}>
              <Trophy className={`w-10 h-10 ${gradeInfo.color}`} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Exam Complete!</h2>
            <p className="text-gray-600">Here are your results</p>
          </div>

          {/* Score Display */}
          <div className="text-center mb-8">
            <div className="inline-block">
              <div className={`text-6xl font-bold ${gradeInfo.color} mb-2`}>
                {result.percentage}%
              </div>
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${gradeInfo.bg}`}>
                <span className={`text-lg font-semibold ${gradeInfo.color}`}>
                  Grade: {gradeInfo.grade}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {result.score}/{result.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatTime(result.timeTaken)}
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {result.percentage >= 70 ? 'Pass' : 'Fail'}
              </div>
              <div className="text-sm text-gray-600">Result Status</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Performance</span>
              <span>{result.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  result.percentage >= 70 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={onStartNewExam}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Take Another Exam
            </button>
            <button
              onClick={logout}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Performance Feedback */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Feedback</h3>
          <div className="space-y-3">
            {result.percentage >= 90 && (
              <div className="flex items-start p-3 bg-green-50 rounded-lg">
                <div className="text-green-600 mr-3">🎉</div>
                <div>
                  <div className="font-medium text-green-900">Excellent Performance!</div>
                  <div className="text-sm text-green-700">Outstanding work! You've demonstrated excellent understanding of the material.</div>
                </div>
              </div>
            )}
            
            {result.percentage >= 70 && result.percentage < 90 && (
              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-600 mr-3">👍</div>
                <div>
                  <div className="font-medium text-blue-900">Good Performance!</div>
                  <div className="text-sm text-blue-700">Well done! You've passed the exam with a solid understanding.</div>
                </div>
              </div>
            )}
            
            {result.percentage < 70 && (
              <div className="flex items-start p-3 bg-red-50 rounded-lg">
                <div className="text-red-600 mr-3">📚</div>
                <div>
                  <div className="font-medium text-red-900">Needs Improvement</div>
                  <div className="text-sm text-red-700">Consider reviewing the material and taking the exam again to improve your score.</div>
                </div>
              </div>
            )}

            {result.timeTaken < 900 && ( // Less than 15 minutes
              <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
                <div className="text-yellow-600 mr-3">⚡</div>
                <div>
                  <div className="font-medium text-yellow-900">Quick Completion</div>
                  <div className="text-sm text-yellow-700">You completed the exam very quickly. Make sure to review your answers thoroughly next time.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;