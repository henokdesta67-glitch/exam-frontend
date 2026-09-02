import React, { useState, useEffect } from 'react';

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

const mockQuestions = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  section: i < 35 ? 'Verbal' : 'Quantitative',
  question: `Sample Question ${i + 1}: What is the correct solution for this ${i < 35 ? 'Verbal' : 'Quantitative'} problem?`,
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correct: 0
}));

// --- Explicitly Typed Style Objects to fix TS2353 ---
const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#333'
};

const headerBadgeStyle: React.CSSProperties = {
  backgroundColor: '#f0f4f8',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '20px',
  textAlign: 'center',
  fontWeight: 'bold',
  color: '#0088cc'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  border: '1px solid #e1e8ed',
  marginBottom: '20px'
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#0088cc',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '10px'
};

const optionButtonStyle = (isSelected: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '12px',
  margin: '8px 0',
  backgroundColor: isSelected ? '#e6f0fa' : '#f8f9fa',
  border: isSelected ? '2px solid #0088cc' : '1px solid #dcdfe6',
  borderRadius: '8px',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '15px'
});

export default function App() {
  const [screen, setScreen] = useState<'intro' | 'exam' | 'results' | 'review'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(9000);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [userName, setUserName] = useState('Candidate');

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready?.();
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser?.username) {
        setUserName(`@${tgUser.username}`);
      } else if (tgUser?.first_name) {
        setUserName(tgUser.first_name);
      }
    }
  }, []);

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
      `🎯 I just completed the UAT Model Exam!\n\n👤 Candidate: ${userName}\n📊 Score: ${totalCorrect}/80 (${scorePct}%)\n⏱️ Time Spent: ${formatTime(9000 - timeLeft)}\n\nTry the bot and test your skills!`
    );
    
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/')}&text=${shareText}`;
    
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  // --- Intro Screen ---
  if (screen === 'intro') {
    return (
      <div style={containerStyle}>
        <div style={headerBadgeStyle}>UAT Model Examination</div>
        <div style={cardStyle}>
          <h2>Welcome, {userName}!</h2>
          <p><strong>Total Questions:</strong> 80 (35 Verbal, 45 Quantitative)</p>
          <p><strong>Time Limit:</strong> 2 Hours 30 Minutes</p>
          <button style={buttonStyle} onClick={() => setScreen('exam')}>
            Start Examination
          </button>
        </div>
      </div>
    );
  }

  // --- Results Screen ---
  if (screen === 'results') {
    const { totalCorrect, scorePct, verbalCorrect, quantCorrect } = calculateResults();
    return (
      <div style={containerStyle}>
        <div style={headerBadgeStyle}>Examination Results</div>
        <div style={cardStyle}>
          <h2>Final Score: {scorePct}%</h2>
          <p><strong>Total Correct:</strong> {totalCorrect} / 80</p>
          <p><strong>Verbal Section:</strong> {verbalCorrect} / 35</p>
          <p><strong>Quantitative Section:</strong> {quantCorrect} / 45</p>
          <button style={buttonStyle} onClick={handleShareScore}>
            Share Score on Telegram
          </button>
          <button style={{ ...buttonStyle, backgroundColor: '#6c757d' }} onClick={() => setScreen('intro')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // --- Active Exam Screen ---
  const currentQ = mockQuestions[currentIdx];

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span>Question {currentIdx + 1} of 80</span>
        <span>⏱️ {formatTime(timeLeft)}</span>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: '12px', color: '#0088cc', fontWeight: 'bold' }}>
          {currentQ.section.toUpperCase()}
        </div>
        <h3 style={{ margin: '10px 0' }}>{currentQ.question}</h3>

        {currentQ.options.map((opt, optIdx) => (
          <button
            key={optIdx}
            style={optionButtonStyle(answers[currentIdx] === optIdx)}
            onClick={() => handleSelectOption(optIdx)}
          >
            {opt}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          style={{ ...buttonStyle, backgroundColor: '#6c757d' }}
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((p) => p - 1)}
        >
          Previous
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: flagged[currentIdx] ? '#ffc107' : '#e2e8f0', color: '#000' }}
          onClick={() => toggleFlag(currentIdx)}
        >
          {flagged[currentIdx] ? '🚩 Flagged' : 'Flag'}
        </button>
        {currentIdx < mockQuestions.length - 1 ? (
          <button style={buttonStyle} onClick={() => setCurrentIdx((p) => p + 1)}>
            Next
          </button>
        ) : (
          <button style={{ ...buttonStyle, backgroundColor: '#28a745' }} onClick={() => setShowSubmitModal(true)}>
            Submit
          </button>
        )}
      </div>

      {showSubmitModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={cardStyle}>
            <h3>Submit Examination?</h3>
            <p>You have answered {Object.keys(answers).length} out of 80 questions.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={buttonStyle} onClick={() => { setShowSubmitModal(false); setScreen('results'); }}>
                Confirm
              </button>
              <button style={{ ...buttonStyle, backgroundColor: '#6c757d' }} onClick={() => setShowSubmitModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
