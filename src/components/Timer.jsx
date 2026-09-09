// Timer.jsx
// Visual countdown display. Ticking itself is handled in ExamContext.

import React from 'react';
import { Clock, Pause, Play, Eye, EyeOff } from 'lucide-react';
import { useExam } from '../context/ExamContext';

function formatTime(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export default function Timer() {
  const { state, toggleTimerPause, toggleTimerHidden } = useExam();

  if (!state.timed) {
    return (
      <div className="timer">
        <Clock size={16} />
        <span className="timer-label">Untimed</span>
      </div>
    );
  }

  const low = state.timeRemaining <= 300; // last 5 minutes

  return (
    <div className={`timer ${low ? 'timer-low' : ''}`}>
      <Clock size={16} />
      <span className="timer-value">
        {state.timerHidden ? '--:--' : formatTime(state.timeRemaining)}
      </span>
      <button
        className="timer-btn"
        onClick={toggleTimerPause}
        title={state.timerPaused ? 'Resume timer' : 'Pause timer'}
      >
        {state.timerPaused ? <Play size={14} /> : <Pause size={14} />}
      </button>
      <button
        className="timer-btn"
        onClick={toggleTimerHidden}
        title={state.timerHidden ? 'Show timer' : 'Hide timer'}
      >
        {state.timerHidden ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}
