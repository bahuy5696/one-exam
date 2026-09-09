// QuestionGridModal.jsx
// Jump-to-question grid drawer. Shows answered / unanswered / flagged / current.

import React from 'react';
import { X, Flag } from 'lucide-react';
import { useExam } from '../context/ExamContext';

export default function QuestionGridModal({ open, onClose }) {
  const { state, goto } = useExam();
  const { questions, answers, flagged, currentIndex } = state;

  if (!open) return null;

  const answeredCount = questions.filter(
    (q) => (answers[q.question_number] || []).length > 0
  ).length;

  const handleJump = (index) => {
    goto(index);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal grid-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Question Navigator</h2>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="grid-legend">
          <span className="legend-item">
            <span className="legend-swatch answered" /> Answered
          </span>
          <span className="legend-item">
            <span className="legend-swatch unanswered" /> Unanswered
          </span>
          <span className="legend-item">
            <span className="legend-swatch flagged">
              <Flag size={10} />
            </span>{' '}
            Flagged
          </span>
          <span className="legend-item">
            <span className="legend-swatch current" /> Current
          </span>
        </div>

        <div className="grid-summary">
          {answeredCount} of {questions.length} answered
        </div>

        <div className="question-grid">
          {questions.map((q, idx) => {
            const answered = (answers[q.question_number] || []).length > 0;
            const isFlagged = flagged.has(q.question_number);
            const isCurrent = idx === currentIndex;

            let cls = 'grid-cell';
            if (isCurrent) cls += ' current';
            else if (answered) cls += ' answered';
            else cls += ' unanswered';
            if (isFlagged) cls += ' flagged';

            return (
              <button
                key={q.question_number}
                className={cls}
                onClick={() => handleJump(idx)}
              >
                {idx + 1}
                {isFlagged && <Flag className="cell-flag" size={10} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
