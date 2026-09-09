// ConfigScreen.jsx
// Exam start / configuration screen: choose Full Exam or Practice mode.

import React, { useState } from 'react';
import { GraduationCap, BookOpen, Play, ServerCog } from 'lucide-react';
import { useExam, MODE } from '../context/ExamContext';

export default function ConfigScreen() {
  const { startExam, poolSize } = useExam();
  const [mode, setMode] = useState(MODE.FULL);
  const [practiceCount, setPracticeCount] = useState(20);
  const [practiceTimed, setPracticeTimed] = useState(false);
  const [instantFeedback, setInstantFeedback] = useState(true);

  const handleStart = () => {
    if (mode === MODE.FULL) {
      startExam({ mode: MODE.FULL, timed: true });
    } else {
      const count = Math.max(1, Math.min(practiceCount, poolSize));
      startExam({
        mode: MODE.PRACTICE,
        count,
        timed: practiceTimed,
        instantFeedback,
      });
    }
  };

  return (
    <div className="config-screen">
      <div className="config-container">
        <div className="config-brand">
          <ServerCog size={36} className="brand-icon" />
          <div>
            <h1 className="config-title">AWS Solutions Architect Associate</h1>
            <p className="config-sub">
              SAA-C03 Practice Exam Simulator · OnVUE-style environment
            </p>
          </div>
        </div>

        <p className="pool-info">
          Question bank loaded: <strong>{poolSize}</strong> questions
        </p>

        <div className="mode-cards">
          <button
            className={`mode-card ${mode === MODE.FULL ? 'selected' : ''}`}
            onClick={() => setMode(MODE.FULL)}
          >
            <GraduationCap size={28} />
            <h3>Full Exam Mode</h3>
            <p>65 questions · 130-minute timer</p>
            <p className="mode-note">
              Strict OnVUE simulation. Weighted by official AWS domains. No
              instant answers.
            </p>
          </button>

          <button
            className={`mode-card ${mode === MODE.PRACTICE ? 'selected' : ''}`}
            onClick={() => setMode(MODE.PRACTICE)}
          >
            <BookOpen size={28} />
            <h3>Practice / Study Mode</h3>
            <p>Custom count · optional timer</p>
            <p className="mode-note">
              Choose how many questions. Toggle instant explanations after each
              answer.
            </p>
          </button>
        </div>

        {mode === MODE.PRACTICE && (
          <div className="practice-options">
            <div className="option-row">
              <label htmlFor="count">Number of questions</label>
              <input
                id="count"
                type="number"
                min="1"
                max={poolSize}
                value={practiceCount}
                onChange={(e) =>
                  setPracticeCount(Number(e.target.value) || 1)
                }
              />
            </div>
            <div className="option-row toggle-row">
              <label htmlFor="timed">Enable timer (2 min/question)</label>
              <input
                id="timed"
                type="checkbox"
                checked={practiceTimed}
                onChange={(e) => setPracticeTimed(e.target.checked)}
              />
            </div>
            <div className="option-row toggle-row">
              <label htmlFor="instant">
                Show explanation instantly after answering
              </label>
              <input
                id="instant"
                type="checkbox"
                checked={instantFeedback}
                onChange={(e) => setInstantFeedback(e.target.checked)}
              />
            </div>
          </div>
        )}

        <button className="btn btn-primary btn-large" onClick={handleStart}>
          <Play size={20} />
          Start Exam
        </button>
      </div>
    </div>
  );
}
