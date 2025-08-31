import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import RandomQuestionPicker from './components/RandomQuestionPicker';
import RandomReadMePicker from './components/RandomReadMePicker';
import HistoryQuestion from './components/HistoryQuestion';

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<RandomQuestionPicker />} /> */}
        <Route path="/leetcode-500" element={<RandomReadMePicker />} />
        <Route path="/leetcode-500/history" element={<HistoryQuestion />} />
      </Routes>
    </Router>
  );
}

export default App;
