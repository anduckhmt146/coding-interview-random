import React, { useEffect, useState } from 'react';
import rawReadme from '../assets/leetcode-500/README.md?raw';
import { useNavigate } from 'react-router-dom';

export interface Question {
  name: string;
  topic: string;
  pattern: string;
  solution: string;
}

const STORAGE_KEY = 'completedQuestions';
const ALL_QUESTIONS_KEY = 'allQuestions';
const TIMER_KEY = 'countdownStart';

const RandomReadMePicker: React.FC = () => {
  const navigate = useNavigate();
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [randomThree, setRandomThree] = useState<Question[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(3600); // seconds (1h)

  // ✅ Safe localStorage load
  const loadCompleted = (): string[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const loadAllQuestions = (): Question[] => {
    try {
      const raw = localStorage.getItem(ALL_QUESTIONS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      return [];
    }
    return [];
  };

  useEffect(() => {
    const savedCompleted = loadCompleted();
    setCompleted(savedCompleted);

    // Load questions
    let parsed = loadAllQuestions();
    if (parsed.length === 0) {
      const rows = rawReadme
        .split('\n')
        .filter(
          (line) =>
            line.startsWith('|') &&
            !line.includes('---') &&
            !line.includes('Num')
        );

      parsed = rows
        .map((row) => {
          const cols = row.split('|').map((c) => c.trim());
          return {
            name: cols[3] || '',
            topic: cols[3] || '',
            pattern: cols[4] || '',
            solution: cols[5] || '',
          };
        })
        .filter((q) => q.name);

      localStorage.setItem(ALL_QUESTIONS_KEY, JSON.stringify(parsed));
    }
    setAllQuestions(parsed);
    pickRandom(parsed, savedCompleted);

    // ⏳ Countdown logic
    const savedStart = localStorage.getItem(TIMER_KEY);
    let startTime: number;
    if (savedStart) {
      startTime = parseInt(savedStart, 10);
    } else {
      startTime = Date.now();
      localStorage.setItem(TIMER_KEY, startTime.toString());
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, 3600 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const pickRandom = (questions: Question[], done: string[] = []) => {
    const doneSet = Array.isArray(done) ? done : [];
    const remaining = questions.filter((q) => !doneSet.includes(q.name));

    if (remaining.length === 0) {
      setRandomThree([]);
      return;
    }

    const shuffled = [...remaining].sort(() => 0.5 - Math.random());
    setRandomThree(shuffled.slice(0, 3));
  };

  const toggleCompleted = (name: string) => {
    let updated: string[];
    if (completed.includes(name)) {
      updated = completed.filter((n) => n !== name);
    } else {
      updated = [...completed, name];
    }
    setCompleted(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    pickRandom(allQuestions, updated);
  };

  const parseMarkdownLink = (str: string) => {
    const match = str.match(/\[(.*?)\]\((.*?)\)/);
    if (!match) return null;
    return { text: match[1], url: match[2] };
  };

  // Format time as mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        📖 Mock Interview Leetcode 500 Questions
      </h1>

      {/* Countdown Timer */}
      <div className="mb-4">
        <span className="inline-flex items-center px-3 py-2 rounded-md text-lg font-semibold bg-red-100 text-red-700">
          ⏳ Time left: {formatTime(timeLeft)}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => pickRandom(allQuestions, completed)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          🔄 Pick Again
        </button>
        <button
          className="mb-4 px-4 py-2 flex items-center gap-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          onClick={() => navigate('/history')}>
          📝 View History
        </button>
      </div>

      {randomThree.length === 0 && (
        <p className="text-gray-500">🎉 All questions completed!</p>
      )}

      <div className="grid gap-4">
        {randomThree.map((q, idx) => {
          const isCompleted = completed.includes(q.name);
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl shadow-md hover:shadow-lg transition ${
                isCompleted ? 'bg-green-50 border border-green-300' : 'bg-white'
              }`}>
              {q.topic && (
                <h2 className="text-lg font-semibold text-blue-600 flex justify-between items-center">
                  {parseMarkdownLink(q.topic) ? (
                    <a
                      href={parseMarkdownLink(q.topic)!.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-600">
                      {parseMarkdownLink(q.topic)!.text}
                    </a>
                  ) : (
                    q.topic
                  )}
                  <button
                    onClick={() => toggleCompleted(q.name)}
                    className={`ml-2 px-2 py-1 text-xs rounded ${
                      isCompleted
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}>
                    {isCompleted ? '❌ Undo' : '✅ Done'}
                  </button>
                </h2>
              )}

              {q.pattern && (
                <p className="text-sm text-gray-600">
                  <strong>Topic:</strong> {q.pattern}
                </p>
              )}
              {q.solution && (
                <p className="text-sm text-gray-600">
                  <strong>Pattern:</strong> {q.solution}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RandomReadMePicker;
