// ExamHeader.jsx
// Pearson VUE OnVUE-style dark header: title, question counter, timer, flag toggle.

import React from 'react';
import { Flag } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import Timer from './Timer';

export default function ExamHeader() {
  const { state, toggleFlag } = useExam();
  const { questions, currentIndex } = state;
  const currentQuestion = questions[currentIndex];
  const isFlagged =
    currentQuestion && state.flagged.has(currentQuestion.question_number);

  return (
    <header className="exam-header">
      <div className="exam-header-left">
        <span className="exam-title">
          AWS Certified Solutions Architect - Associate
        </span>
        <span className="exam-subtitle">SAA-C03</span>
      </div>

      <div className="exam-header-center">
        <span className="question-counter">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="exam-header-right">
        <Timer />
        <button
          className={`flag-toggle ${isFlagged ? 'flagged' : ''}`}
          onClick={() =>
            currentQuestion && toggleFlag(currentQuestion.question_number)
          }
          title="Flag this question for review"
        >
          <Flag size={16} fill={isFlagged ? 'currentColor' : 'none'} />
          <span>{isFlagged ? 'Flagged' : 'Flag for Review'}</span>
        </button>
      </div>
    </header>
  );
}
