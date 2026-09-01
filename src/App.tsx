import { useState, useEffect } from 'react';

const mockQuestions = [
  {
    id: 1,
    question: "Which of the following sorting algorithms has the best worst-case time complexity?",
    options: ["Quick Sort", "Merge Sort", "Bubble Sort", "Insertion Sort"],
    correct: 1
  },
  {
    id: 2,
    question: "In database design, what does ACID stand for?",
    options: [
      "Atomicity, Consistency, Isolation, Durability",
      "Access, Control, Identity, Data",
      "Array, Collection, Interface, Directory",
      "Asynchronous, Concurrent, Indexed, Distributed"
    ],
    correct: 0
  },
  {
    id: 3,
    question: "Which HTTP status code represents 'Internal Server Error'?",
    options: ["200", "404", "403", "500"],
    correct: 3
  }
];

export default function App() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [currentIdx]: optIndex });
  };

  const calculateScore = () => {
    let score = 0;
    mockQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correct) score++;
    });
    return score;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = mockQuestions[currentIdx];

  if (isSubmitted) {
    const score = calculateScore();
    const percentage = Math.round((score / mockQuestions.length) * 100);
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
        <h2 style={{ color: '#2d3748' }}>Exam Completed! 🎉</h2>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginTop: '20px' }}>
          <h3>Your Result</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: percentage >= 50 ? '#38a169' : '#e53e3e', margin: '10px 0' }}>
            {score} / {mockQuestions.length}
          </p>
          <p style={{ color: '#718096' }}>Overall Score: {percentage}%</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh', boxSizing: 'border-box' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#fff', padding: '12px 16px', borderRadius: '8px' }}>
        <span style={{ fontWeight: 'bold', color: '#4a5568' }}>Question {currentIdx + 1} of {mockQuestions.length}</span>
        <span style={{ fontWeight: 'bold', color: timeLeft < 60 ? '#e53e3e' : '#3182ce', backgroundColor: '#ebf8ff', padding: '4px 8px', borderRadius: '4px' }}>
          ⏱️ {formatTime(timeLeft)}
        </span>
      </div>

      {/* Question Card */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
        <h3 style={{ marginTop: 0, color: '#1a202c', fontSize: '18px' }}>{currentQ.question}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          {currentQ.options.map((option, optIdx) => {
            const isSelected = answers[currentIdx] === optIdx;
            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #3182ce' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#ebf8ff' : '#fff',
                  textAlign: 'left',
                  fontSize: '15px',
                  color: isSelected ? '#2b6cb0' : '#2d3748',
                  fontWeight: isSelected ? '600' : 'normal',
                  cursor: 'pointer'
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
        <button
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((prev) => prev - 1)}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', backgroundColor: '#fff', opacity: currentIdx === 0 ? 0.5 : 1 }}
        >
          Previous
        </button>

        {currentIdx < mockQuestions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx((prev) => prev + 1)}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#3182ce', color: '#fff', fontWeight: 'bold' }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => setIsSubmitted(true)}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#38a169', color: '#fff', fontWeight: 'bold' }}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
