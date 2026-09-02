import React, { useState, useEffect } from 'react';

// --- Telegram WebApp Type Definitions ---
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
        openTelegramLink?: (url: string) => void;
        ready?: () => void;
      };
    };
  }
}

interface Question {
  id: number;
  section: 'Verbal' | 'Quantitative';
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

// --- Dynamic Mock Questions Array (80 Questions Total) ---
const mockQuestions: Question[] = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  section: i < 35 ? 'Verbal' : 'Quantitative',
  question: i === 34 
    ? 'log 32700 = ?' 
    : `Sample Question ${i + 1}: What is the correct solution for this ${i < 35 ? 'Verbal' : 'Quantitative'} problem?`,
  options: i === 34 
    ? ['log 3.27 + 4', 'log 3.27 + 2', '2 log 327', '100 × log 327'] 
    : ['Option A', 'Option B', 'Option C', 'Option D'],
  correct: 0,
  explanation: i === 34 ? 'log(32700) = log(3.27 × 10⁴) = log(3.27) + log(10⁴) = log(3.27) + 4' : 'Detailed solution explanation here.'
}));

// --- React Inline Styling Definitions ---
const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '16px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#333'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  border: '1px solid #e1e8ed',
  marginBottom: '16px'
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#0088cc',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '8px'
};

const secondaryButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  backgroundColor: '#f1f5f9',
  color: '#334155',
  border: '1px solid #cbd5e1'
};

export default function App() {
  const [screen, setScreen] = useState<'intro' | 'exam' | 'results' | 'review'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(9000); // 2 hours 30 mins
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [userName, setUserName] = useState('Candidate');

  // Load Telegram User First Name
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready?.();
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser?.first_name) {
        setUserName(tgUser.first_name);
      } else if (tgUser?.username) {
        setUserName(`@${tgUser.username}`);
      }
    }
  }, []);

  // Timer Lifecycle
  useEffect(() => {
    if (screen !== 'exam') return;
    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [screen]);

  const handleSelectOption = (optIdx: number) => {
    setAnswers({ ...answers, [currentIdx]: optIdx });
  };

  const toggleFlag = (idx: number) => {
    setFlagged({ ...flagged, [idx]: !flagged[idx] });
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const calculateResults = () => {
    let verbalCorrect = 0;
    let quantCorrect = 0;

    mockQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correct) {
        if (q.section === 'Verbal') verbalCorrect++;
        else quantCorrect++;
      }
    });

    const totalCorrect = verbalCorrect + quantCorrect;
    const scorePct = Math.round((totalCorrect / mockQuestions.length) * 100);

    return { totalCorrect, scorePct, verbalCorrect, quantCorrect };
  };

  const handleShareScore = () => {
    const { totalCorrect, scorePct } = calculateResults();
    const shareText = encodeURIComponent(
      `🎯 I completed the AAU UAT Model Exam!\n\n👤 Candidate: ${userName}\n📊 Score: ${totalCorrect}/${mockQuestions.length} (${scorePct}%)\n⏱️ Time Spent: ${formatTime(9000 - timeLeft)}`
    );
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/')}&text=${shareText}`;
    
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  const totalQs = mockQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQs - answeredCount;

  // --- 1. INTRO SCREEN ---
  if (screen === 'intro') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2>👋 Hello, {userName}!</h2>
          <p style={{ color: '#64748b' }}>Welcome to the Final UAT Model examination simulation.</p>
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0' }} />
          <p><strong>Total Questions:</strong> {totalQs} (35 Verbal, 45 Quantitative)</p>
          <p><strong>Duration:</strong> 2 Hours 30 Minutes</p>
          <p><strong>Pass Mark:</strong> 50%</p>
          <button style={primaryButtonStyle} onClick={() => setScreen('exam')}>
            🚀 Start Examination
          </button>
        </div>
      </div>
    );
  }

  // --- 2. RESULTS SCREEN ---
  if (screen === 'results') {
    const { totalCorrect, scorePct, verbalCorrect, quantCorrect } = calculateResults();
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <h2>🎓 Exam Completed!</h2>
          <p style={{ color: '#64748b' }}>Candidate: {userName}</p>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#0088cc', margin: '10px 0' }}>
            {scorePct}%
          </div>
          <p style={{ color: '#22c55e', fontWeight: 'bold' }}>{totalCorrect} Correct</p>
          <p style={{ color: '#ef4444' }}>{totalQs - totalCorrect} Wrong</p>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0' }} />

          <h3 style={{ textAlign: 'left', fontSize: '16px' }}>Section Performance</h3>
          <div style={{ textAlign: 'left', fontSize: '14px', lineHeight: '2' }}>
            <div>📖 Verbal: {verbalCorrect} / 35 ({Math.round((verbalCorrect / 35) * 100)}%)</div>
            <div>🔢 Quantitative: {quantCorrect} / 45 ({Math.round((quantCorrect / 45) * 100)}%)</div>
          </div>

          <button style={primaryButtonStyle} onClick={() => setScreen('review')}>
            🔍 Review Answers & Explanations
          </button>
          <button style={secondaryButtonStyle} onClick={handleShareScore}>
            📤 Share Your Score
          </button>
          <button style={{ ...secondaryButtonStyle, border: 'none' }} onClick={() => setScreen('intro')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // --- 3. QUESTION REVIEW SCREEN ---
  if (screen === 'review') {
    const q = mockQuestions[currentIdx];
    const userAns = answers[currentIdx];

    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>Review Question {currentIdx + 1} of {totalQs}</span>
          <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc' }} onClick={() => setScreen('results')}>
            Exit Review
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: '12px', color: '#0088cc', fontWeight: 'bold', marginBottom: '8px' }}>
            {q.section.toUpperCase()}
          </div>
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>{q.question}</h3>

          {q.options.map((opt, optIdx) => {
            const isCorrect = optIdx === q.correct;
            const isSelected = userAns === optIdx;

            let bgColor = '#f8fafc';
            let borderColor = '#e2e8f0';

            if (isCorrect) {
              bgColor = '#dcfce7';
              borderColor = '#22c55e';
            } else if (isSelected && !isCorrect) {
              bgColor = '#fee2e2';
              borderColor = '#ef4444';
            }

            return (
              <div key={optIdx} style={{ padding: '10px 14px', margin: '8px 0', borderRadius: '8px', border: `1px solid ${borderColor}`, backgroundColor: bgColor, fontSize: '14px' }}>
                {opt}
                {isCorrect && ' ✅ (Correct Answer)'}
                {isSelected && !isCorrect && ' ❌ (Your Answer)'}
              </div>
            );
          })}

          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #0088cc', fontSize: '13px' }}>
            <strong>Explanation:</strong> {q.explanation || 'No explanation provided for this question.'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={secondaryButtonStyle} disabled={currentIdx === 0} onClick={() => setCurrentIdx((p) => p - 1)}>
            Previous
          </button>
          <button style={primaryButtonStyle} disabled={currentIdx === totalQs - 1} onClick={() => setCurrentIdx((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>
    );
  }

  // --- 4. ACTIVE EXAMINATION SCREEN ---
  const currentQ = mockQuestions[currentIdx];

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
        <span>Question {currentIdx + 1} of {totalQs}</span>
        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>⏱️ {formatTime(timeLeft)}</span>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: '12px', color: '#0088cc', fontWeight: 'bold', marginBottom: '8px' }}>
          {currentQ.section.toUpperCase()}
        </div>
        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>{currentQ.question}</h3>

        {currentQ.options.map((opt, optIdx) => (
          <button
            key={optIdx}
            onClick={() => handleSelectOption(optIdx)}
            style={{
              width: '100%',
              padding: '12px',
              margin: '6px 0',
              textAlign: 'left',
              borderRadius: '8px',
              cursor: 'pointer',
              border: answers[currentIdx] === optIdx ? '2px solid #0088cc' : '1px solid #cbd5e1',
              backgroundColor: answers[currentIdx] === optIdx ? '#e0f2fe' : '#ffffff',
              fontSize: '14px'
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Dynamic Grid Navigation strictly matching mockQuestions */}
      <div style={cardStyle}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>Question Navigation</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
          {mockQuestions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              style={{
                padding: '6px 2px',
                fontSize: '11px',
                borderRadius: '4px',
                border: currentIdx === idx ? '2px solid #0088cc' : '1px solid #cbd5e1',
                backgroundColor: answers[idx] !== undefined ? '#0088cc' : flagged[idx] ? '#f59e0b' : '#f8fafc',
                color: answers[idx] !== undefined || flagged[idx] ? '#ffffff' : '#334155',
                fontWeight: currentIdx === idx ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={secondaryButtonStyle} disabled={currentIdx === 0} onClick={() => setCurrentIdx((p) => p - 1)}>
          Previous
        </button>
        <button
          style={{ ...secondaryButtonStyle, backgroundColor: flagged[currentIdx] ? '#fef3c7' : '#f1f5f9' }}
          onClick={() => toggleFlag(currentIdx)}
        >
          {flagged[currentIdx] ? '🚩 Flagged' : 'Flag'}
        </button>
        <button style={primaryButtonStyle} onClick={() => setCurrentIdx((p) => Math.min(totalQs - 1, p + 1))}>
          Next
        </button>
      </div>

      <button style={{ ...primaryButtonStyle, backgroundColor: '#059669', marginTop: '12px' }} onClick={() => setShowSubmitModal(true)}>
        Submit Examination
      </button>

      {/* Submission Confirmation Modal */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000
        }}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: '400px', marginBottom: 0 }}>
            <h3 style={{ marginTop: 0 }}>Submit Exam?</h3>
            <p>You've answered <strong>{answeredCount} of {totalQs}</strong> questions.</p>
            {unansweredCount > 0 && (
              <p style={{ color: '#b45309', backgroundColor: '#fef3c7', padding: '8px', borderRadius: '6px', fontSize: '13px' }}>
                ⚠️ {unansweredCount} questions unanswered. You cannot change answers after submitting.
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button style={secondaryButtonStyle} onClick={() => setShowSubmitModal(false)}>
                Keep Going
              </button>
              <button style={primaryButtonStyle} onClick={() => { setShowSubmitModal(false); setScreen('results'); }}>
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
