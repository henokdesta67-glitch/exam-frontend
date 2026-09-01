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

  if (screen === 'intro') {
    return (
      <div style={containerStyle}>
        <div style={headerBadgeStyle}>
          <span style={{ fontWeight: 'bold', color: '#1e293b' } as React.CSSProperties}>UAT Exam</span>
          <span style={pillBadgeStyle}>AAU UAT 2026 Model</span>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: '40px' } as React.CSSProperties}>👋</div>
          <h2 style={{ margin: '8px 0 4px', color: '#0f172a' } as React.CSSProperties}>Hello, {userName}!</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '
