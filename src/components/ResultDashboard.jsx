// ResultDashboard.jsx
// Post-exam results: scaled score, pass/fail, domain breakdown bars, and a
// filterable detailed question review with explanations.

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Flag,
  RotateCcw,
  Award,
} from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { PASSING_SCORE } from '../utils/scoreCalculator';

const CHOICE_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const FILTERS = {
  ALL: 'All',
  INCORRECT: 'Incorrect Only',
  FLAGGED: 'Flagged Only',
};

export default function ResultDashboard() {
  const { state, reset } = useExam();
  const { results, flagged } = state;
  const [filter, setFilter] = useState('ALL');

  const filteredQuestions = useMemo(() => {
    if (!results) return [];
    return results.perQuestion.filter((item) => {
      if (filter === 'INCORRECT') return !item.correct;
      if (filter === 'FLAGGED')
        return flagged.has(item.question.question_number);
      return true;
    });
  }, [results, filter, flagged]);

  if (!results) return null;

  const { scaledScore, passed, correctCount, total, percentage } = results;

  return (
    <div className="result-dashboard">
      <div className="result-container">
        {/* Score hero */}
        <div className={`score-hero ${passed ? 'pass' : 'fail'}`}>
          <div className="score-hero-icon">
            <Award size={40} />
          </div>
          <div className="score-hero-body">
            <div className="score-status">
              {passed ? 'PASS' : 'FAIL'}
            </div>
            <div className="score-number">{scaledScore}</div>
            <div className="score-scale">
              out of 1000 &nbsp;·&nbsp; Passing score: {PASSING_SCORE}
            </div>
          </div>
          <div className="score-hero-meta">
            <div className="meta-row">
              <span>Correct</span>
              <strong>
                {correctCount} / {total}
              </strong>
            </div>
            <div className="meta-row">
              <span>Accuracy</span>
              <strong>{percentage}%</strong>
            </div>
          </div>
        </div>

        {/* Domain breakdown */}
        <div className="domain-section">
          <h2 className="section-title">Domain Performance</h2>
          <div className="domain-bars">
            {results.domainBreakdown.map((d) => (
              <div className="domain-bar-row" key={d.id}>
                <div className="domain-bar-header">
                  <span className="domain-name">
                    <span className="domain-num">Domain {d.number}</span>{' '}
                    {d.name}
                  </span>
                  <span className="domain-score">
                    {d.correct}/{d.total} ({d.percentage}%)
                  </span>
                </div>
                <div className="domain-bar-track">
                  <div
                    className={`domain-bar-fill ${
                      d.percentage >= 72
                        ? 'good'
                        : d.percentage >= 50
                        ? 'mid'
                        : 'low'
                    }`}
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
                <div className="domain-weight">
                  Exam weight: {Math.round(d.weight * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed review */}
        <div className="review-detail-section">
          <div className="review-detail-header">
            <h2 className="section-title">Detailed Review</h2>
            <div className="filter-tabs">
              {Object.entries(FILTERS).map(([key, label]) => (
                <button
                  key={key}
                  className={`filter-tab ${filter === key ? 'active' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredQuestions.length === 0 && (
            <p className="empty-state">No questions match this filter.</p>
          )}

          <div className="review-detail-list">
            {filteredQuestions.map((item, i) => {
              const q = item.question;
              const solutions = q.solutions || [];
              const choiceKeys = CHOICE_ORDER.filter(
                (k) => q.choices && q.choices[k] != null
              );
              const isFlagged = flagged.has(q.question_number);

              return (
                <div
                  className="detail-card"
                  key={q.question_number}
                >
                  <div className="detail-card-header">
                    <span className="detail-index">
                      {item.correct ? (
                        <CheckCircle2 className="correct-icon" size={18} />
                      ) : (
                        <XCircle className="incorrect-icon" size={18} />
                      )}
                      Question {i + 1}
                    </span>
                    <span className="detail-tags">
                      {isFlagged && (
                        <span className="tag flag-tag">
                          <Flag size={12} /> Flagged
                        </span>
                      )}
                      {!item.answered && (
                        <span className="tag unanswered-tag">Unanswered</span>
                      )}
                    </span>
                  </div>

                  <p className="detail-question">{q.question}</p>

                  <ul className="detail-choices">
                    {choiceKeys.map((k) => {
                      const isCorrect = solutions.includes(k);
                      const isChosen = item.userSelections.includes(k);
                      let cls = 'detail-choice';
                      if (isCorrect) cls += ' correct';
                      if (isChosen && !isCorrect) cls += ' wrong';
                      return (
                        <li key={k} className={cls}>
                          <span className="detail-choice-letter">{k}</span>
                          <span className="detail-choice-text">
                            {q.choices[k]}
                          </span>
                          <span className="detail-choice-mark">
                            {isCorrect && (
                              <span className="mark correct">
                                Correct
                              </span>
                            )}
                            {isChosen && !isCorrect && (
                              <span className="mark wrong">Your answer</span>
                            )}
                            {isChosen && isCorrect && (
                              <span className="mark you">Your answer</span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="detail-explanation">
                    <span className="explanation-label">Explanation</span>
                    <p>{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="result-actions">
          <button className="btn btn-primary" onClick={reset}>
            <RotateCcw size={18} />
            Start New Exam
          </button>
        </div>
      </div>
    </div>
  );
}
