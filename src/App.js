import './App.css';
import { ExamProvider, useExam, STATUS } from './context/ExamContext';
import ConfigScreen from './components/ConfigScreen';
import ExamScreen from './components/ExamScreen';
import ReviewScreen from './components/ReviewScreen';
import ResultDashboard from './components/ResultDashboard';

function ExamRouter() {
  const { state } = useExam();

  switch (state.status) {
    case STATUS.EXAM:
      return <ExamScreen />;
    case STATUS.REVIEW:
      return <ReviewScreen />;
    case STATUS.RESULT:
      return <ResultDashboard />;
    case STATUS.CONFIG:
    default:
      return <ConfigScreen />;
  }
}

function App() {
  return (
    <ExamProvider>
      <div className="app-root">
        <ExamRouter />
      </div>
    </ExamProvider>
  );
}

export default App;
