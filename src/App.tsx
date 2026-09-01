import { useState, useEffect } from 'react';

// Declare Telegram WebApp type for TypeScript
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

// Mock Question Dataset
const mockQuestions = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  section: i < 35 ? 'Verbal' : 'Quantitative',
  question: `Sample Question ${i + 1}: What is the correct solution for this ${i < 35 ? 'Verbal' : 'Quantitative'} problem?`,
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correct: 0
}));

export default function App() {
  const [screen, setScreen] = useState<'intro' | 'exam' | 'results' | 'review'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(9000); // 2h 30m
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [userName, setUserName] = useState('Candidate');

  useEffect(() => {
    // Fetch Telegram Username (@username) or first_name fallback
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

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;

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

  // 1. INTRO SCREEN
  if (screen === 'intro') {
    return (
      <div style={containerStyle}>
        <div style={headerBadgeStyle}>
          <span style={{ fontWeight: 'bold', color: '#1e293b' }}>UAT Exam</span>
          <span style={pillBadgeStyle}>AAU UAT 2026 Model</span>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: '40px' }}>👋</div>
          <h2 style={{ margin: '8px 0 4px', color: '#0f172a' }}>Hello, {userName}!</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
            Welcome to the Final UAT Model exam simulation.
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Exam Overview</h3>
          <div style={grid2x2Style}>
            <div style={statBoxStyle}>
              <span style={{ fontSize: '20px' }}>📝</span>
              <span style={statNumberStyle}>80</span>
              <span style={statLabelStyle}>Questions</span>
            </div>
            <div style={statBoxStyle}>
              <span style={{ fontSize: '20px' }}>⏱️</span>
              <span style={statNumberStyle}>2h 30m</span>
              <span style={statLabelStyle}>Duration</span>
            </div>
            <div style={statBoxStyle}>
              <span style={{ fontSize: '20px' }}>📚</span>
              <span style={statNumberStyle}>2</span>
              <span style={statLabelStyle}>Sections</span>
            </div>
            <div style={statBoxStyle}>
              <span style={{ fontSize: '20px' }}>🎯</span>
              <span style={statNumberStyle}>50%</span>
              <span style={statLabelStyle}>Pass Mark</span>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>SECTIONS</span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <span style={sectionTagStyle}>Verbal — 35 Qs</span>
              <span style={sectionTagStyle}>Quantitative — 45 Qs</span>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>📋 Instructions</h3>
          <ol style={{ paddingLeft: '20px', margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.6' }}>
            <li>Each question carries 1 mark. No negative marking.</li>
            <li>You can flag questions to review later during the exam.</li>
            <li>Submit when finished to view your final score breakdown.</li>
          </ol>
        </div>

        <button style={primaryButtonStyle} onClick={() => setScreen('exam')}>
          🚀 Start Examination
        </button>
      </div>
    );
  }

  // 2. RESULTS & SCORE OVERVIEW SCREEN
  if (screen === 'results') {
    const { totalCorrect, scorePct, verbalCorrect, quantCorrect } = calculateResults();
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '48px' }}>💪</div>
          <h2 style={{ margin: '8px 0 4px', color: '#0f172a' }}>🎓 Exam Completed!</h2>
          <span style={{ color: '#64748b', fontSize: '14px' }}>Candidate: {userName}</span>
        </div>

        {/* Circular Progress & Score Gauge */}
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <div style={circleGaugeStyle}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#0284c7' }}>{totalCorrect}</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>/80</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0284c7', marginTop: '12px' }}>
              {scorePct}%
            </div>
          </div>

          {/* Correct / Wrong / Score Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '16px' }}>
            <div style={{ ...statCardStyle, backgroundColor: '#f0fdf4' }}>
              <span style={{ color: '#16a34a', fontSize: '18px', fontWeight: 'bold' }}>{totalCorrect}</span>
              <span style={{ fontSize: '12px', color: '#166534' }}>Correct</span>
            </div>
            <div style={{ ...statCardStyle, backgroundColor: '#fef2f2' }}>
              <span style={{ color: '#dc2626', fontSize: '18px', fontWeight: 'bold' }}>{80 - totalCorrect}</span>
              <span style={{ fontSize: '12px', color: '#991b1b' }}>Wrong</span>
            </div>
            <div style={{ ...statCardStyle, backgroundColor: '#f0f9ff' }}>
              <span style={{ color: '#0284c7', fontSize: '18px', fontWeight: 'bold' }}>{scorePct}%</span>
              <span style={{ fontSize: '12px', color: '#075985' }}>Score %</span>
            </div>
          </div>
        </div>

        {/* Section Performance Bars */}
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Section Performance</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={progressLabelRow}>
              <span>📖 Verbal</span>
              <span>{verbalCorrect}/35 ({Math.round((verbalCorrect / 35) * 100)}%)</span>
            </div>
            <div style={trackStyle}>
              <div style={{ ...fillStyle, width: `${(verbalCorrect / 35) * 100}%` }} />
            </div>
          </div>

          <div>
            <div style={progressLabelRow}>
              <span>🔢 Quantitative</span>
              <span>{quantCorrect}/45 ({Math.round((quantCorrect / 45) * 100)}%)</span>
            </div>
            <div style={trackStyle}>
              <div style={{ ...fillStyle, width: `${(quantCorrect / 45) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Action Buttons: Review Questions or Share Score */}
        <button style={primaryButtonStyle} onClick={() => { setCurrentIdx(0); setScreen('review'); }}>
          🔍 Review Questions & Answers
        </button>
        <button style={secondaryButtonStyle} onClick={handleShareScore}>
          📤 Share Your Score
        </button>
      </div>
    );
  }

  // 3. REVIEW QUESTIONS & DETAILED ANSWERS SCREEN
  if (screen === 'review') {
    const q = mockQuestions[currentIdx];
    const userAns = answers[currentIdx];
    const isCorrect = userAns === q.correct;

    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button style={{ ...secondaryButtonStyle, width: 'auto', margin: 0, padding: '6px 12px' }} onClick={() => setScreen('results')}>
            ⬅️ Back to Score
          </button>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>
            Question {currentIdx + 1} of 80
          </span>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{q.section} Section</span>
            <span style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: userAns === undefined ? '#f1f5f9' : isCorrect ? '#dcfce7' : '#fee2e2',
              color: userAns === undefined ? '#475569' : isCorrect ? '#15803d' : '#b91c1c'
            }}>
              {userAns === undefined ? 'Unanswered' : isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
            </span>
          </div>

          <p style={{ color: '#334155', fontSize: '15px', marginTop: '8px' }}>{q.question}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {q.options.map((opt, optIdx) => {
              const isSelected = userAns === optIdx;
              const isRightOpt = q.correct === optIdx;

              let border = '1px solid #e2e8f0';
              let bg = '#fff';
              let color = '#334155';

              if (isRightOpt) {
                border = '2px solid #22c55e';
                bg = '#f0fdf4';
                color = '#15803d';
              } else if (isSelected && !isCorrect) {
                border = '2px solid #ef4444';
                bg = '#fef2f2';
                color = '#b91c1c';
              }

              return (
                <div
                  key={optIdx}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border,
                    backgroundColor: bg,
                    color,
                    fontSize: '14px',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{opt}</span>
                  {isRightOpt && <span style={{ fontWeight: 'bold' }}>Correct Answer ✓</span>}
                  {isSelected && !isRightOpt && <span style={{ fontWeight: 'bold' }}>Your Choice ✗</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Review Grid */}
        <h3 style={{ ...sectionTitleStyle, margin: '16px 0 8px 4px' }}>Question Navigator</h3>
        <div style={gridScrollContainerStyle}>
          {mockQuestions.map((_, idx) => {
            const uAns = answers[idx];
            const correct = uAns === mockQuestions[idx].correct;
            const isCurr = currentIdx === idx;

            let bgColor = '#fff';
            let textColor = '#334155';

            if (isCurr) {
              bgColor = '#0284c7';
              textColor = '#fff';
            } else if (uAns !== undefined) {
              bgColor = correct ? '#dcfce7' : '#fee2e2';
              textColor = correct ? '#15803d' : '#b91c1c';
            }

            return (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                style={{
                  height: '40px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: bgColor,
                  color: textColor,
                  fontWeight: isCurr ? 'bold' : 'normal',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 4. ACTIVE EXAM SCREEN
  const currentQ = mockQuestions[currentIdx];

  return (
    <div style={containerStyle}>
      {/* Timer Bar */}
      <div style={{ ...cardStyle, padding: '10px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>Time Remaining</span>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: timeLeft < 300 ? '#dc2626' : '#0284c7' }}>
          ⏱️ {formatTime(timeLeft)}
        </span>
      </div>

      {/* Question Card */}
      <div style={{ ...cardStyle, marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', color: '#0f172a' }}>
            Q{currentIdx + 1}. {currentQ.section} Section
          </span>
          <button
            onClick={() => toggleFlag(currentIdx)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}
          >
            {flagged[currentIdx] ? '🚩' : '🏳️'}
          </button>
        </div>
        <p style={{ color: '#334155', fontSize: '15px', marginTop: '12px' }}>{currentQ.question}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = answers[currentIdx] === optIdx;
            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#f0f9ff' : '#fff',
                  textAlign: 'left',
                  fontSize: '14px',
                  color: isSelected ? '#0369a1' : '#334155',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Navigation */}
      <h3 style={{ ...sectionTitleStyle, margin: '16px 0 8px 4px' }}>Question Navigation</h3>
      <div style={gridScrollContainerStyle}>
        {mockQuestions.map((_, idx) => {
          const isAnswered = answers[idx] !== undefined;
          const isCurrent = currentIdx === idx;
          const isFlagged = flagged[idx];

          let bgColor = '#fff';
          let textColor = '#334155';

          if (isCurrent) {
            bgColor = '#0284c7';
            textColor = '#fff';
          } else if (isAnswered) {
            bgColor = '#e0f2fe';
            textColor = '#0369a1';
          }

          return (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              style={{
                position: 'relative',
                height: '40px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: bgColor,
                color: textColor,
                fontWeight: isCurrent ? 'bold' : 'normal',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {idx + 1}
              {isFlagged && <span style={gridFlagStyle}>🚩</span>}
            </button>
          );
        })}
      </div>

      {/* Submit Controls */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textAlign: 'center' }}>
          {answeredCount}/80 answered · {flaggedCount} flagged
        </div>
        <button style={primaryButtonStyle} onClick={() => setShowSubmitModal(true)}>
          Submit Exam
        </button>
      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <div style={{ fontSize: '36px' }}>📤</div>
            <h3 style={{ margin: '8px 0', color: '#0f172a' }}>Submit Exam?</h3>
            <p style={{ color: '#475569', fontSize: '14px', margin: '0 0 12px' }}>
              You've answered <b>{answeredCount}</b> of <b>80</b> questions.
            </p>

            {80 - answeredCount > 0 && (
              <div style={warningAlertStyle}>
                ⚠️ {80 - answeredCount} questions unanswered. You can't change answers after submitting.
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button style={secondaryButtonStyle} onClick={() => setShowSubmitModal(false)}>
                Keep Going
              </button>
              <button
                style={{ ...primaryButtonStyle, marginTop: 0 }}
                onClick={() => {
                  setShowSubmitModal(false);
                  setScreen('results');
                }}
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// INLINE STYLES
const containerStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '16px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  backgroundColor: '#f8fafc',
  minHeight: '100vh',
  boxSizing: 'border-box'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '16px',
  marginBottom: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

const headerBadgeStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px'
};

const pillBadgeStyle: React.CSSProperties = {
  backgroundColor: '#f0f9ff',
  color: '#0284c7',
  padding: '4px 10px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600'
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#0f172a',
  marginTop: 0,
  marginBottom: '12px'
};

const grid2x2Style: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '10px'
};

const statBoxStyle: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  padding: '12px',
  borderRadius: '12px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const statNumberStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#0284c7',
  marginTop: '4px'
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#64748b'
};

const sectionTagStyle: React.CSSProperties = {
  backgroundColor: '#f1f5f9',
  color: '#0284c7',
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '500'
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#0284c7',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '8px'
};

const secondaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#f1f5f9',
  color: '#0284c7',
  border: '1px solid #cbd5e1',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '8px'
};

const gridScrollContainerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(8, 1fr)',
  gap: '6px',
  maxHeight: '260px',
  overflowY: 'auto',
  padding: '8px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0'
};

const gridFlagStyle: React.CSSProperties = {
  position: 'absolute',
  top: '1px',
  right: '1px',
  fontSize: '8px'
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '16px',
  zIndex: 100
};

const modalCardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '20px',
  width: '100%',
  maxWidth: '360px',
  textAlign: 'center'
};

const warningAlertStyle: React.CSSProperties = {
  backgroundColor: '#fefce8',
  padding: '10px',
  borderRadius: '8px',
  color: '#854d0e',
  fontSize: '12px'
};

const circleGaugeStyle: React.CSSProperties = {
  width: '90px',
  height: '90px',
  borderRadius: '50%',
  border: '6px solid #e0f2fe',
  borderTopColor: '#0284c7',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto'
};

const statCardStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column'
};

const progressLabelRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
  fontWeight: '500',
  color: '#334155',
  marginBottom: '4px'
};

const trackStyle: React.CSSProperties = {
  height: '8px',
  backgroundColor: '#f1f5f9',
  borderRadius: '4px',
  overflow: 'hidden'
};

const fillStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: '#0284c7',
  borderRadius: '4px'
};
