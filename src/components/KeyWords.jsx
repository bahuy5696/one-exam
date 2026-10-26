// KeyWords.jsx
// Renders a question's key_word phrases (the parts of the question text that
// point to the correct answer) as chips. Renders nothing when there are none.

import React from 'react';

export default function KeyWords({ keyWords }) {
  if (!Array.isArray(keyWords) || keyWords.length === 0) return null;

  return (
    <div className="key-words">
      <span className="key-words-label">Key words</span>
      <ul className="key-words-list">
        {keyWords.map((kw) => (
          <li key={kw} className="key-word">
            {kw}
          </li>
        ))}
      </ul>
    </div>
  );
}
