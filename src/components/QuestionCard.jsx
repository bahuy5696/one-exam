// QuestionCard.jsx
// Renders the question text and choices. Radio buttons for single-answer,
// checkboxes for multi-answer. In practice mode with instant feedback,
// reveals correct/incorrect styling + explanation after answering.

import React from 'react';
import { Check } from 'lucide-react';
import { useExam } from '../context/ExamContext';

const CHOICE_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export default function QuestionCard() {
  const { state, selectAnswer } = useExam();
  const { questions, currentIndex, answers, instantFeedback } = state;
  const question = questions[currentIndex];

  if (!question) return null;

  const solutions = question.solutions || [];
  const isMulti = solutions.length > 1;
  const selected = answers[question.question_number] || [];

  // Ordered list of available choice letters present in this question.
  const choiceKeys = CHOICE_ORDER.filter(
    (k) => question.choices && question.choices[k] != null
  );

  // Practice-mode instant feedback: only reveal once the user has picked as
  // many choices as the question requires (1 for single-answer, N for multi).
  const requiredCount = Math.max(solutions.length, 1);
  const revealed = instantFeedback && selected.length >= requiredCount;

  const handleSelect = (choice) => {
    if (revealed) return; // lock after reveal in instant-feedback mode
    selectAnswer({
      questionNumber: question.question_number,
      choice,
      multi: isMulti,
    });
  };

  return (
    <div className="question-card">
      <div className="question-meta">
        <span className="question-number">Question {currentIndex + 1}</span>
        {isMulti && (
          <span className="multi-hint">
            Choose {solutions.length} answers
          </span>
        )}
      </div>

      <p className="question-text">{question.question}</p>

      <ul className="choices">
        {choiceKeys.map((key) => {
          const isSelected = selected.includes(key);
          const isCorrect = solutions.includes(key);

          let cls = 'choice';
          if (revealed) {
            if (isCorrect) cls += ' choice-correct';
            else if (isSelected) cls += ' choice-incorrect';
          } else if (isSelected) {
            cls += ' choice-selected';
          }

          return (
            <li key={key}>
              <button
                type="button"
                className={cls}
                onClick={() => handleSelect(key)}
                disabled={revealed}
              >
                <span
                  className={`choice-indicator ${
                    isMulti ? 'checkbox' : 'radio'
                  } ${isSelected ? 'checked' : ''}`}
                >
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="choice-letter">{key}</span>
                <span className="choice-text">{question.choices[key]}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {revealed && (
        <div className="instant-explanation">
          <div className="explanation-header">
            {solutions.every((s) => selected.includes(s)) &&
            selected.length === solutions.length ? (
              <span className="verdict correct">✓ Correct</span>
            ) : (
              <span className="verdict incorrect">✗ Incorrect</span>
            )}
            <span className="correct-answer">
              Correct answer: {solutions.join(', ')}
            </span>
          </div>
          <p className="explanation-text">{question.explanation}</p>
          {Array.isArray(question.key_word) && question.key_word.length > 0 && (
            <div className="key-words">
              <span className="key-words-label">Key words</span>
              <ul className="key-words-list">
                {question.key_word.map((kw) => (
                  <li key={kw} className="key-word">
                    {kw}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
