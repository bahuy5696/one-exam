// ExamScreen.jsx
// The active exam layout: header + question body + fixed footer + grid modal.

import React, { useState } from 'react';
import ExamHeader from './ExamHeader';
import QuestionCard from './QuestionCard';
import NavigationFooter from './NavigationFooter';
import QuestionGridModal from './QuestionGridModal';

export default function ExamScreen() {
  const [gridOpen, setGridOpen] = useState(false);

  return (
    <div className="exam-screen">
      <ExamHeader />
      <main className="exam-body">
        <div className="exam-body-inner">
          <QuestionCard />
        </div>
      </main>
      <NavigationFooter onOpenGrid={() => setGridOpen(true)} />
      <QuestionGridModal open={gridOpen} onClose={() => setGridOpen(false)} />
    </div>
  );
}
