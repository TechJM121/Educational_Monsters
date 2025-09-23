import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Minimal, working components with no external dependencies
const HomePage = () => (
  <div style={{ 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #1e293b 0%, #1e40af 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontFamily: 'system-ui, sans-serif'
  }}>
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        🎓 Educational RPG Tutor
      </h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
        Welcome to your learning adventure!
      </p>
      <a 
        href="/auth" 
        style={{
          display: 'inline-block',
          padding: '1rem 2rem',
          backgroundColor: '#2563eb',
          color: 'white',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          fontSize: '1.125rem',
          fontWeight: '600',
          transition: 'background-color 0.3s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
      >
        Start Learning
      </a>
    </div>
  </div>
);

const AuthPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const age = formData.get('age');
    
    if (name && age) {
      localStorage.setItem('educational_rpg_user', JSON.stringify({
        id: `user_${Date.now()}`,
        name,
        age: parseInt(age),
        isGuest: true
      }));
      localStorage.setItem('educational_rpg_session', 'active');
      window.location.href = '/learning';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e293b 0%, #7c3aed 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '28rem',
        backgroundColor: '#1e293b',
        borderRadius: '1rem',
        padding: '2rem',
        border: '1px solid #374151'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '2rem'
          }}>
            🎓
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
            Start Learning
          </h1>
          <p style={{ color: '#9ca3af' }}>Enter your details to begin</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#d1d5db', 
              marginBottom: '0.5rem' 
            }}>
              What's your name?
            </label>
            <input
              type="text"
              name="name"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '1rem'
              }}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#d1d5db', 
              marginBottom: '0.5rem' 
            }}>
              How old are you?
            </label>
            <input
              type="number"
              name="age"
              min="3"
              max="18"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '1rem'
              }}
              placeholder="Enter your age"
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
              color: 'white',
              borderRadius: '0.75rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🚀 Start Learning Adventure
          </button>
        </form>
      </div>
    </div>
  );
};

const LearningPage = () => {
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState(null);
  const [showResult, setShowResult] = React.useState(false);
  const [score, setScore] = React.useState(0);

  const questions = [
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correct: "4",
      explanation: "2 + 2 = 4"
    },
    {
      question: "What is 5 + 3?",
      options: ["7", "8", "9", "10"],
      correct: "8",
      explanation: "5 + 3 = 8"
    },
    {
      question: "What is 10 - 4?",
      options: ["5", "6", "7", "8"],
      correct: "6",
      explanation: "10 - 4 = 6"
    },
    {
      question: "What is 3 × 4?",
      options: ["10", "11", "12", "13"],
      correct: "12",
      explanation: "3 × 4 = 12"
    }
  ];

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      alert(`Quiz Complete! You scored ${score + (selectedAnswer === questions[currentQuestion].correct ? 1 : 0)} out of ${questions.length}`);
      setCurrentQuestion(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const question = questions[currentQuestion];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e293b 0%, #059669 100%)',
      padding: '2rem 1rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
              Mathematics Adventure
            </h1>
            <a 
              href="/" 
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.875rem',
                backgroundColor: '#4b5563',
                color: 'white',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4b5563'}
            >
              Back to Home
            </a>
          </div>

          <div style={{ 
            backgroundColor: '#1e293b', 
            borderRadius: '9999px', 
            height: '1rem', 
            overflow: 'hidden' 
          }}>
            <div 
              style={{
                height: '100%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                transition: 'width 0.5s'
              }}
            />
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '0.5rem', 
            fontSize: '0.875rem', 
            color: '#d1d5db' 
          }}>
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>Score: {score}/{questions.length}</span>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
              {question.question}
            </h2>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1rem', 
            marginBottom: '1.5rem' 
          }}>
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
                style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '2px solid',
                  textAlign: 'left',
                  cursor: showResult ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  fontSize: '1rem',
                  ...(selectedAnswer === option
                    ? showResult
                      ? option === question.correct
                        ? { backgroundColor: '#059669', borderColor: '#10b981', color: 'white' }
                        : { backgroundColor: '#dc2626', borderColor: '#ef4444', color: 'white' }
                      : { backgroundColor: '#2563eb', borderColor: '#3b82f6', color: 'white' }
                    : showResult && option === question.correct
                    ? { backgroundColor: '#059669', borderColor: '#10b981', color: 'white' }
                    : { backgroundColor: '#374151', borderColor: '#4b5563', color: '#d1d5db' })
                }}
                onMouseOver={(e) => {
                  if (!showResult && selectedAnswer !== option) {
                    e.target.style.backgroundColor = '#4b5563';
                    e.target.style.borderColor = '#6b7280';
                  }
                }}
                onMouseOut={(e) => {
                  if (!showResult && selectedAnswer !== option) {
                    e.target.style.backgroundColor = '#374151';
                    e.target.style.borderColor = '#4b5563';
                  }
                }}
              >
                <span style={{ fontWeight: '600', marginRight: '0.5rem' }}>
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
                {showResult && option === question.correct && (
                  <span style={{ marginLeft: '0.5rem', color: '#86efac' }}>✓</span>
                )}
              </button>
            ))}
          </div>

          {showResult && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '2px solid',
              ...(selectedAnswer === question.correct
                ? { backgroundColor: 'rgba(5, 150, 105, 0.1)', borderColor: '#10b981' }
                : { backgroundColor: 'rgba(220, 38, 38, 0.1)', borderColor: '#ef4444' })
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>
                  {selectedAnswer === question.correct ? '🎉' : '😔'}
                </span>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  color: selectedAnswer === question.correct ? '#86efac' : '#fca5a5'
                }}>
                  {selectedAnswer === question.correct ? 'Correct!' : 'Not quite right'}
                </h3>
              </div>
              
              <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                <strong>Explanation:</strong> {question.explanation}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {!showResult ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                style={{
                  padding: '0.75rem 2rem',
                  background: selectedAnswer ? 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)' : '#6b7280',
                  color: 'white',
                  borderRadius: '0.75rem',
                  fontWeight: 'bold',
                  fontSize: '1.125rem',
                  border: 'none',
                  cursor: selectedAnswer ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  if (selectedAnswer) {
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
                  color: 'white',
                  borderRadius: '0.75rem',
                  fontWeight: 'bold',
                  fontSize: '1.125rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/learning" element={<LearningPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;