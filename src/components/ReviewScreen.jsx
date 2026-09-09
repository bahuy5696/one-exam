// ReviewScreen.jsx
// Pre-submission summary table with answered/flagged status and warnings.

import React, { useState } from 'react';
import { AlertTriangle, Flag, ArrowLeft, Send } from 'lucide-react';
import { useExam } from '../context/ExamContext';

export default function ReviewScreen() {
  const { state, goto, returnToExam, submit } = useExam();
  const { questions, answers, flagged } = state;
  const [confirming, setConfirming] = useState(false);

  const unanswered = questions.filter(
    (q) => (answers[q.question_number] || []).length === 0
  );
  const flaggedList = questions.filter((q) =>
    flagged.has(q.question_number)
  );

  const jumpTo = (index) => {
    goto(index);
    returnToExam();
  };

  return (
    <div className="review-screen">
      <div className="review-container">
        <h1 className="review-title">Review Your Answers</h1>
        <p className="review-desc">
          Review the status of all questions before submitting. You can return
          to any question to change your answer.
        </p>

        <div className="review-stats">
          <div className="review-stat">
            <span className="stat-value">{questions.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="review-stat">
            <span className="stat-value answered-color">
              {questions.length - unanswered.length}
            </span>
            <span className="stat-label">Answered</span>
          </div>
          <div className="review-stat">
            <span className="stat-value warning-color">
              {unanswered.length}
            </span>
            <span className="stat-label">Unanswered</span>
          </div>
          <div className="review-stat">
            <span className="stat-value flag-color">{flaggedList.length}</span>
            <span className="stat-label">Flagged</span>
          </div>
        </div>

        {unanswered.length > 0 && (
          <div className="warning-banner">
            <AlertTriangle size={20} />
            <span>
              You have {unanswered.length} unanswered question
              {unanswered.length > 1 ? 's' : ''}. Unanswered questions will be
              marked incorrect.
            </span>
          </div>
        )}

        <div className="review-table-wrap">
          <table className="review-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Status</th>
                <th>Flagged</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => {
                const answered =
                  (answers[q.question_number] || []).length > 0;
                const isFlagged = flagged.has(q.question_number);
                return (
                  <tr key={q.question_number}>
                    <td>{idx + 1}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          answered ? 'answered' : 'unanswered'
                        }`}
                      >
                        {answered ? 'Answered' : 'Unanswered'}
                      </span>
                    </td>
                    <td>
                      {isFlagged ? (
                        <span className="flag-cell">
                          <Flag size={14} fill="currentColor" /> Flagged
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="link-btn"
                        onClick={() => jumpTo(idx)}
                      >
                        Go to question
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="review-actions">
          <button className="btn btn-secondary" onClick={returnToExam}>
            <ArrowLeft size={18} />
            Return to Exam
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setConfirming(true)}
          >
            <Send size={18} />
            Final Submit
          </button>
        </div>
      </div>

      {confirming && (
        <div className="modal-overlay" onClick={() => setConfirming(false)}>
          <div
            className="modal confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Submit Exam?</h2>
            </div>
            <p className="confirm-text">
              Once submitted you cannot change your answers.
              {unanswered.length > 0 && (
                <>
                  {' '}
                  You still have{' '}
                  <strong>{unanswered.length} unanswered</strong> question
                  {unanswered.length > 1 ? 's' : ''}.
                </>
              )}
            </p>
            <div className="review-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={submit}>
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
