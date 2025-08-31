import React, { useEffect, useState } from 'react';
import type { Question } from './RandomReadMePicker';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'completedQuestions';
const ALL_QUESTIONS_KEY = 'allQuestions';

const HistoryQuestion: React.FC = () => {
  const [completed, setCompleted] = useState<string[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');

  useEffect(() => {
    try {
      const rawCompleted = localStorage.getItem(STORAGE_KEY);
      const parsedCompleted = rawCompleted ? JSON.parse(rawCompleted) : [];
      if (Array.isArray(parsedCompleted)) {
        setCompleted(parsedCompleted);
      }

      const rawAll = localStorage.getItem(ALL_QUESTIONS_KEY);
      const parsedAll = rawAll ? JSON.parse(rawAll) : [];
      if (Array.isArray(parsedAll)) {
        setAllQuestions(parsedAll);
      }
    } catch {
      setCompleted([]);
      setAllQuestions([]);
    }
  }, []);

  const parseMarkdownLink = (str: string) => {
    const match = str.match(/\[(.*?)\]\((.*?)\)/);
    if (!match) return null;
    return { text: match[1], url: match[2] };
  };

  // Completed questions only
  const completedQuestions = allQuestions.filter((q) =>
    completed.includes(q.name)
  );

  // Extract unique topics
  const uniqueTopics = Array.from(
    new Set(completedQuestions.map((q) => q.pattern))
  );

  // Apply topic filter
  const filteredQuestions =
    selectedTopic === 'All'
      ? completedQuestions
      : completedQuestions.filter((q) => q.pattern === selectedTopic);

  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">✅ Completed Questions</h1>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        📊 View all questions
      </button>

      {/* Topic Filter */}
      {uniqueTopics.length > 0 && (
        <div className="mb-4">
          <label className="mr-2 font-medium">Filter by Topic:</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="border rounded p-1">
            <option value="All">All</option>
            {uniqueTopics.map((topic, idx) => (
              <option key={idx} value={topic}>
                {parseMarkdownLink(topic)?.text || topic}
              </option>
            ))}
          </select>
        </div>
      )}

      {filteredQuestions.length === 0 ? (
        <p className="text-gray-500">No completed questions yet.</p>
      ) : (
        <div className="grid gap-4">
          {filteredQuestions.map((q, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl shadow-md hover:shadow-lg transition bg-green-100 border border-green-300">
              {q.topic && (
                <h2 className="text-lg font-semibold text-blue-700">
                  {parseMarkdownLink(q.topic) ? (
                    <a
                      href={parseMarkdownLink(q.topic)!.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-700">
                      {parseMarkdownLink(q.topic)!.text}
                    </a>
                  ) : (
                    q.topic
                  )}
                </h2>
              )}

              {q.pattern && (
                <p className="text-sm text-gray-700">
                  <strong>Topic:</strong> {q.pattern}
                </p>
              )}
              {q.solution && (
                <p className="text-sm text-gray-700">
                  <strong>Pattern:</strong> {q.solution}
                </p>
              )}

              <div className="mt-2">
                <button
                  onClick={() => {
                    const updated = completed.filter((n) => n !== q.name);
                    setCompleted(updated);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                  }}
                  className="px-3 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600">
                  🔄 Retry
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryQuestion;
