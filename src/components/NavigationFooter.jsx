// NavigationFooter.jsx
// Fixed bottom toolbar: Previous, Next, Navigator (grid), and Review/Submit.

import React from 'react';
import { ChevronLeft, ChevronRight, Grid3x3, Send } from 'lucide-react';
import { useExam } from '../context/ExamContext';

export default function NavigationFooter({ onOpenGrid }) {
  const { state, next, prev, goReview } = useExam();
  const { currentIndex, questions } = state;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  return (
    <footer className="nav-footer">
      <div className="nav-footer-left">
        <button className="btn btn-secondary" onClick={prev} disabled={isFirst}>
          <ChevronLeft size={18} />
          Previous
        </button>
        <button className="btn btn-secondary" onClick={next} disabled={isLast}>
          Next
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="nav-footer-right">
        <button className="btn btn-outline" onClick={onOpenGrid}>
          <Grid3x3 size={18} />
          Navigator
        </button>
        <button className="btn btn-primary" onClick={goReview}>
          <Send size={18} />
          Review &amp; Submit
        </button>
      </div>
    </footer>
  );
}
