// ExamContext.jsx
// Central exam state: mode, question set, answers, flags, timer, current index,
// and app status (CONFIG | EXAM | REVIEW | RESULT). Auto-persists to localStorage.

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import rawQuestions from '../data/questions.json';
import {
  tagQuestions,
  sampleWeightedExam,
  sampleRandom,
} from '../utils/domainClassifier';
import { calculateResults } from '../utils/scoreCalculator';
import { saveState, loadState, clearState } from '../utils/storage';

export const STATUS = {
  CONFIG: 'CONFIG',
  EXAM: 'EXAM',
  REVIEW: 'REVIEW',
  RESULT: 'RESULT',
};

export const MODE = {
  FULL: 'FULL',
  PRACTICE: 'PRACTICE',
};

// Only keep questions that are actually answerable: at least 2 choices and a
// non-empty solution set. (The raw bank contains some entries with no defined
// correct answer — those are dropped so they never get sampled.)
const VALID_QUESTIONS = rawQuestions.filter(
  (q) =>
    q &&
    q.choices &&
    Object.keys(q.choices).length >= 2 &&
    Array.isArray(q.solutions) &&
    q.solutions.length > 0
);

// Tag the full pool once at module load.
const TAGGED_POOL = tagQuestions(VALID_QUESTIONS);

const FULL_EXAM_COUNT = 65;
const FULL_EXAM_SECONDS = 130 * 60; // 130 minutes

const initialState = {
  status: STATUS.CONFIG,
  mode: MODE.FULL,
  questions: [], // the active exam set (tagged)
  answers: {}, // { question_number: ['A', 'C'] }
  flagged: new Set(), // Set<question_number>
  currentIndex: 0,
  timeRemaining: FULL_EXAM_SECONDS,
  timed: true,
  timerPaused: false,
  timerHidden: false,
  instantFeedback: false, // practice mode: show explanation immediately
  startedAt: null,
  results: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'START_EXAM': {
      const { mode, count, timed, instantFeedback } = action.payload;
      const total =
        mode === MODE.FULL ? FULL_EXAM_COUNT : Math.max(1, count);
      const questions =
        mode === MODE.FULL
          ? sampleWeightedExam(TAGGED_POOL, total)
          : sampleRandom(TAGGED_POOL, Math.min(total, TAGGED_POOL.length));

      return {
        ...initialState,
        status: STATUS.EXAM,
        mode,
        questions,
        timed,
        timerPaused: false,
        timerHidden: false,
        instantFeedback: mode === MODE.PRACTICE ? instantFeedback : false,
        timeRemaining:
          mode === MODE.FULL
            ? FULL_EXAM_SECONDS
            : timed
            ? Math.max(1, count) * 120 // 2 min/question if practice is timed
            : 0,
        startedAt: Date.now(),
        answers: {},
        flagged: new Set(),
        currentIndex: 0,
        results: null,
      };
    }

    case 'SELECT_ANSWER': {
      const { questionNumber, choice, multi } = action.payload;
      const prev = state.answers[questionNumber] || [];
      let next;
      if (multi) {
        next = prev.includes(choice)
          ? prev.filter((c) => c !== choice)
          : [...prev, choice];
      } else {
        next = prev.includes(choice) && prev.length === 1 ? [] : [choice];
      }
      return {
        ...state,
        answers: { ...state.answers, [questionNumber]: next },
      };
    }

    case 'TOGGLE_FLAG': {
      const { questionNumber } = action.payload;
      const flagged = new Set(state.flagged);
      if (flagged.has(questionNumber)) flagged.delete(questionNumber);
      else flagged.add(questionNumber);
      return { ...state, flagged };
    }

    case 'GOTO': {
      const idx = Math.max(
        0,
        Math.min(state.questions.length - 1, action.payload.index)
      );
      return { ...state, currentIndex: idx };
    }

    case 'NEXT':
      return {
        ...state,
        currentIndex: Math.min(
          state.questions.length - 1,
          state.currentIndex + 1
        ),
      };

    case 'PREV':
      return {
        ...state,
        currentIndex: Math.max(0, state.currentIndex - 1),
      };

    case 'TICK':
      if (!state.timed || state.timerPaused) return state;
      if (state.timeRemaining <= 1) {
        // Time's up -> auto submit.
        return {
          ...state,
          timeRemaining: 0,
          status: STATUS.RESULT,
          results: calculateResults(state.questions, state.answers),
        };
      }
      return { ...state, timeRemaining: state.timeRemaining - 1 };

    case 'TOGGLE_TIMER_PAUSE':
      return { ...state, timerPaused: !state.timerPaused };

    case 'TOGGLE_TIMER_HIDDEN':
      return { ...state, timerHidden: !state.timerHidden };

    case 'GO_REVIEW':
      return { ...state, status: STATUS.REVIEW };

    case 'RETURN_TO_EXAM':
      return { ...state, status: STATUS.EXAM };

    case 'SUBMIT':
      return {
        ...state,
        status: STATUS.RESULT,
        results: calculateResults(state.questions, state.answers),
      };

    case 'RESET':
      return { ...initialState };

    case 'HYDRATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

const ExamContext = createContext(null);

export function ExamProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    const restored = loadState();
    if (restored && restored.status && restored.status !== STATUS.CONFIG) {
      // Recompute results object if we restored into RESULT (functions aren't serializable).
      const merged = { ...init, ...restored, flagged: restored.flagged };
      if (merged.status === STATUS.RESULT) {
        merged.results = calculateResults(merged.questions, merged.answers);
      }
      return merged;
    }
    return init;
  });

  // Persist on every meaningful change.
  useEffect(() => {
    if (state.status === STATUS.CONFIG) {
      clearState();
      return;
    }
    // Don't persist the (function-containing) results object.
    const { results, ...persistable } = state;
    saveState(persistable);
  }, [state]);

  // Timer tick.
  useEffect(() => {
    if (state.status !== STATUS.EXAM || !state.timed || state.timerPaused) {
      return undefined;
    }
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.status, state.timed, state.timerPaused]);

  // Warn before leaving during an active exam.
  useEffect(() => {
    if (state.status !== STATUS.EXAM) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.status]);

  const value = {
    state,
    dispatch,
    // Convenience action creators.
    startExam: useCallback(
      (payload) => dispatch({ type: 'START_EXAM', payload }),
      []
    ),
    selectAnswer: useCallback(
      (payload) => dispatch({ type: 'SELECT_ANSWER', payload }),
      []
    ),
    toggleFlag: useCallback(
      (questionNumber) =>
        dispatch({ type: 'TOGGLE_FLAG', payload: { questionNumber } }),
      []
    ),
    goto: useCallback(
      (index) => dispatch({ type: 'GOTO', payload: { index } }),
      []
    ),
    next: useCallback(() => dispatch({ type: 'NEXT' }), []),
    prev: useCallback(() => dispatch({ type: 'PREV' }), []),
    goReview: useCallback(() => dispatch({ type: 'GO_REVIEW' }), []),
    returnToExam: useCallback(() => dispatch({ type: 'RETURN_TO_EXAM' }), []),
    submit: useCallback(() => dispatch({ type: 'SUBMIT' }), []),
    reset: useCallback(() => {
      clearState();
      dispatch({ type: 'RESET' });
    }, []),
    toggleTimerPause: useCallback(
      () => dispatch({ type: 'TOGGLE_TIMER_PAUSE' }),
      []
    ),
    toggleTimerHidden: useCallback(
      () => dispatch({ type: 'TOGGLE_TIMER_HIDDEN' }),
      []
    ),
    poolSize: TAGGED_POOL.length,
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error('useExam must be used within an ExamProvider');
  return ctx;
}
