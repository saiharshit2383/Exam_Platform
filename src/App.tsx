import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import StartExam from './components/StartExam';
import ExamInterface from './components/ExamInterface';
import Results from './components/Results';
import { ExamResult } from './types';

type AppState = 'start' | 'exam' | 'results';

const AppContent: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>('start');
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  const { user, loading } = useAuth();

  const handleStartExam = () => {
    setCurrentState('exam');
  };

  const handleExamComplete = (result: ExamResult) => {
    setExamResult(result);
    setCurrentState('results');
  };

  const handleStartNewExam = () => {
    setExamResult(null);
    setCurrentState('start');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Login 
        onToggleMode={() => setIsRegisterMode(!isRegisterMode)}
        isRegisterMode={isRegisterMode}
      />
    );
  }

  switch (currentState) {
    case 'start':
      return <StartExam onStartExam={handleStartExam} />;
    case 'exam':
      return <ExamInterface onExamComplete={handleExamComplete} />;
    case 'results':
      return examResult ? (
        <Results result={examResult} onStartNewExam={handleStartNewExam} />
      ) : (
        <StartExam onStartExam={handleStartExam} />
      );
    default:
      return <StartExam onStartExam={handleStartExam} />;
  }
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;