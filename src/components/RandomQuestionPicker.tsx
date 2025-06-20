import { useEffect, useState } from 'react';
import Papa from 'papaparse';

type Question = {
  ID: string;
  Title: string;
  Acceptance: string;
  Difficulty: 'Easy' | 'Medium' | 'Hard';
  Frequency: string;
  'Leetcode Question Link': string;
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => 0.5 - Math.random());
}

function pickUniqueSets(
  allQuestions: Question[],
  setsCount: number,
  perSet: number
): Question[][] {
  const shuffled = shuffle(allQuestions);
  const result: Question[][] = [];

  for (let i = 0; i < setsCount; i++) {
    const slice = shuffled.slice(i * perSet, (i + 1) * perSet);
    if (slice.length < perSet) break;
    result.push(slice);
  }

  return result;
}

const CACHE_KEY = 'parsedLeetQuestions';
const CACHE_EXPIRY_MS = 1000 * 60 * 10; // 10 minutes

export default function RandomQuestionPicker() {
  const [randomSets, setRandomSets] = useState<Question[][] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFromCache = (): Question[] | null => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;

        const { data, expires } = JSON.parse(raw);
        if (Date.now() > expires) return null;

        return data as Question[];
      } catch (e) {
        console.warn('Invalid cache data', e);
        return null;
      }
    };

    const saveToCache = (data: Question[]) => {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data,
          expires: Date.now() + CACHE_EXPIRY_MS,
        })
      );
    };

    async function loadCSVData(): Promise<Question[]> {
      const modules1 = import.meta.glob(
        '../assets/data/LeetCode-Questions-CompanyWise/*.csv',
        { as: 'raw' }
      );
      const modules2 = import.meta.glob(
        '../assets/data/leetcode-company-wise-problems/**/*.csv',
        { as: 'raw' }
      );

      const allEntries = [
        ...Object.entries(modules1),
        ...Object.entries(modules2),
      ];

      const shuffledEntries = shuffle(allEntries);

      const results = await Promise.all(
        shuffledEntries.map(async ([, loader]) => {
          try {
            const raw = await loader();
            const parsed = Papa.parse<Question>(raw, {
              header: true,
              skipEmptyLines: true,
            });
            const data = parsed.data.filter((q) => q.ID && q.Title);
            return data.length >= 9 ? data : null;
          } catch (err) {
            console.warn('Skipping invalid CSV:', err);
            return null;
          }
        })
      );

      const firstValid = results.find((data) => data !== null);
      if (!firstValid) throw new Error('Not enough valid questions found.');

      saveToCache(firstValid);
      return firstValid;
    }

    async function init() {
      try {
        const cached = loadFromCache();
        const questions = cached || (await loadCSVData());
        const sets = pickUniqueSets(questions, 1, 3); // 1 set, 3 questions
        setRandomSets(sets);
      } catch (err) {
        console.error(err);
        setRandomSets([]);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  if (loading || !randomSets) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">🧠 Random Leetcode Questions</h1>
      {randomSets.map((set, index) => (
        <div key={index}>
          <ul className="space-y-4">
            {set.map((q) => (
              <li key={q.ID} className="p-4 border rounded shadow">
                <a
                  href={q['Leetcode Question Link']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-lg font-semibold">
                  {q.Title}
                </a>
                <div className="text-sm text-gray-700">
                  <span className="mr-4">Difficulty: {q.Difficulty}</span>
                  <span className="mr-4">Acceptance: {q.Acceptance}</span>
                  <span>
                    Frequency: {parseFloat(q.Frequency || '0').toFixed(3)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <footer className="fixed bottom-0 w-full bg-white text-center shadow-md py-3 text-md text-gray-700">
        @2025, Made with ❤️ by{' '}
        <a
          href="https://github.com/anduckhmt146/coding-interview-random"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-medium hover:underline hover:text-blue-800 transition-colors duration-200">
          anduckhmt146
        </a>
      </footer>
    </div>
  );
}
