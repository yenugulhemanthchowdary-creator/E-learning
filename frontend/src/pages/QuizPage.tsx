import {
  Atom,
  Brain,
  Code2,
  Database,
  Play,
  RotateCcw,
  Cpu,
  Trophy,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

type QuizTopic = "Python" | "React" | "SQL" | "JavaScript" | "ML" | "HTML";

interface QuizQuestionItem {
  id: string;
  topic: QuizTopic;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

const TOPICS: QuizTopic[] = ["Python", "React", "SQL", "JavaScript", "ML", "HTML"];

// All 60 questions (10 per topic)
const questions: QuizQuestionItem[] = [
  // Python (10)
  { id: "python-1", topic: "Python", question: "Which keyword is used to define a function in Python?", options: ["function", "def", "func", "lambda"], correctIndex: 1, explanation: "Python uses the def keyword to define a named function." },
  { id: "python-2", topic: "Python", question: "What is the output type of len([1, 2, 3])?", options: ["str", "float", "int", "list"], correctIndex: 2, explanation: "len returns an integer count of items." },
  { id: "python-3", topic: "Python", question: "Which data type is immutable in Python?", options: ["list", "dict", "set", "tuple"], correctIndex: 3, explanation: "Tuples are immutable, unlike lists, dicts, and sets." },
  { id: "python-4", topic: "Python", question: "How do you start a for loop over a list named items?", options: ["for i in items:", "foreach i in items", "loop i from items", "for (i : items)"], correctIndex: 0, explanation: "Python loop syntax is: for variable in iterable:." },
  { id: "python-5", topic: "Python", question: "Which statement handles exceptions?", options: ["catch/throw", "try/except", "guard/rescue", "error/handle"], correctIndex: 1, explanation: "Python exception handling uses try and except." },
  { id: "python-6", topic: "Python", question: "What does list comprehension [x*x for x in range(3)] return?", options: ["[1, 4, 9]", "[0, 1, 4]", "[0, 1, 2]", "[0, 1, 4, 9]"], correctIndex: 1, explanation: "range(3) gives 0,1,2 so squares are 0,1,4." },
  { id: "python-7", topic: "Python", question: "Which operator checks value equality?", options: ["=", "===", "==", ":="], correctIndex: 2, explanation: "== compares values, while = assigns." },
  { id: "python-8", topic: "Python", question: "What is the correct way to import math module?", options: ["include math", "using math", "import math", "require math"], correctIndex: 2, explanation: "Python uses import to bring modules into scope." },
  { id: "python-9", topic: "Python", question: "What does dict.get('x', 0) do if x is missing?", options: ["Raises KeyError", "Returns None", "Returns 0", "Adds x with 0"], correctIndex: 2, explanation: "dict.get returns the default value when key is absent." },
  { id: "python-10", topic: "Python", question: "Which of these creates a set?", options: ["{}", "[]", "set([1,2])", "(1,2)"], correctIndex: 2, explanation: "set([1,2]) creates a set; {} is an empty dict literal." },
  // React (10)
  { id: "react-1", topic: "React", question: "What hook is used for local component state?", options: ["useMemo", "useRef", "useState", "useEffect"], correctIndex: 2, explanation: "useState is React's primary hook for local state." },
  { id: "react-2", topic: "React", question: "What prop uniquely identifies list items in JSX?", options: ["id", "name", "index", "key"], correctIndex: 3, explanation: "React uses key to efficiently reconcile list updates." },
  { id: "react-3", topic: "React", question: "Which hook handles side effects like fetching data?", options: ["useCallback", "useEffect", "useLayout", "useReducer"], correctIndex: 1, explanation: "useEffect is for side effects and external synchronization." },
  { id: "react-4", topic: "React", question: "JSX ultimately compiles into what?", options: ["HTML strings", "DOM nodes", "React.createElement calls", "Template literals"], correctIndex: 2, explanation: "JSX transpiles into React.createElement (or equivalent runtime calls)." },
  { id: "react-5", topic: "React", question: "How should state updates be treated in React?", options: ["Mutate directly", "Replace immutably", "Store in globals", "Use only classes"], correctIndex: 1, explanation: "State should be updated immutably to trigger predictable renders." },
  { id: "react-6", topic: "React", question: "What does useMemo primarily optimize?", options: ["Network calls", "Expensive computed values", "Component styling", "Bundle size"], correctIndex: 1, explanation: "useMemo memoizes expensive calculations between renders." },
  { id: "react-7", topic: "React", question: "Which syntax passes children to a component?", options: ["<Box />", "<Box>Hi</Box>", "Box('Hi')", "<Box children='Hi' /> only"], correctIndex: 1, explanation: "Nested JSX between opening and closing tags becomes children." },
  { id: "react-8", topic: "React", question: "What is the default behavior when state changes?", options: ["No render", "Full page reload", "Component re-render", "Server restart"], correctIndex: 2, explanation: "State changes trigger a re-render of the component tree section." },
  { id: "react-9", topic: "React", question: "Where should API calls usually be triggered in function components?", options: ["Inside render return", "Inside useEffect", "Inside JSX attributes", "Inside CSS"], correctIndex: 1, explanation: "useEffect is the typical place for data fetching side effects." },
  { id: "react-10", topic: "React", question: "What does lifting state up mean?", options: ["Moving state to parent", "Deleting state", "Using local variables", "Using refs only"], correctIndex: 0, explanation: "State is moved to the nearest common parent for shared access." },
  // SQL (10)
  { id: "sql-1", topic: "SQL", question: "Which SQL statement retrieves rows from a table?", options: ["GET", "FETCH", "SELECT", "READ"], correctIndex: 2, explanation: "SELECT is the standard query command for retrieval." },
  { id: "sql-2", topic: "SQL", question: "Which clause filters rows after SELECT?", options: ["ORDER BY", "WHERE", "GROUP BY", "HAVING"], correctIndex: 1, explanation: "WHERE filters rows before grouping and ordering." },
  { id: "sql-3", topic: "SQL", question: "Which keyword sorts query results?", options: ["SORT", "ORDER", "ORDER BY", "ARRANGE BY"], correctIndex: 2, explanation: "ORDER BY controls sorting direction and columns." },
  { id: "sql-4", topic: "SQL", question: "What does COUNT(*) return?", options: ["Number of columns", "Number of rows", "Sum of values", "First row"], correctIndex: 1, explanation: "COUNT(*) returns the total number of rows matched." },
  { id: "sql-5", topic: "SQL", question: "Which JOIN returns only matching rows in both tables?", options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN"], correctIndex: 2, explanation: "INNER JOIN includes intersections between joined tables." },
  { id: "sql-6", topic: "SQL", question: "Which command adds a new row into a table?", options: ["ADD", "INSERT INTO", "UPDATE", "APPEND"], correctIndex: 1, explanation: "INSERT INTO is used to add new records." },
  { id: "sql-7", topic: "SQL", question: "What does UPDATE do?", options: ["Deletes rows", "Modifies existing rows", "Creates table", "Copies table"], correctIndex: 1, explanation: "UPDATE changes values in existing records." },
  { id: "sql-8", topic: "SQL", question: "Which clause groups rows for aggregate functions?", options: ["GROUP BY", "MERGE BY", "COLLECT", "BUNCH"], correctIndex: 0, explanation: "GROUP BY creates groups used by aggregate calculations." },
  { id: "sql-9", topic: "SQL", question: "Which keyword removes rows from a table?", options: ["DROP", "REMOVE", "DELETE", "TRUNCATE COLUMN"], correctIndex: 2, explanation: "DELETE removes selected rows (usually with a WHERE clause)." },
  { id: "sql-10", topic: "SQL", question: "Which constraint ensures unique values in a column?", options: ["UNIQUE", "PRIMARY", "INDEX", "CHECK"], correctIndex: 0, explanation: "UNIQUE enforces no duplicate values in that column." },
  // JavaScript (10)
  { id: "javascript-1", topic: "JavaScript", question: "Which keyword declares a block-scoped variable?", options: ["var", "let", "const var", "define"], correctIndex: 1, explanation: "let creates a mutable block-scoped binding." },
  { id: "javascript-2", topic: "JavaScript", question: "What is the result of typeof null?", options: ["null", "object", "undefined", "boolean"], correctIndex: 1, explanation: "For legacy reasons, typeof null returns 'object'." },
  { id: "javascript-3", topic: "JavaScript", question: "Which method converts JSON text into an object?", options: ["JSON.parse", "JSON.stringify", "JSON.object", "JSON.read"], correctIndex: 0, explanation: "JSON.parse transforms a JSON string into a JavaScript object." },
  { id: "javascript-4", topic: "JavaScript", question: "What does === compare?", options: ["Only value", "Only type", "Value with type", "Reference only"], correctIndex: 2, explanation: "Strict equality compares both value and type." },
  { id: "javascript-5", topic: "JavaScript", question: "Which array method creates a new array from transformation?", options: ["forEach", "map", "filter", "reduce"], correctIndex: 1, explanation: "map applies a function and returns a new transformed array." },
  { id: "javascript-6", topic: "JavaScript", question: "How do you define an arrow function?", options: ["function => ()", "() -> {}", "() => {}", "=> function()"], correctIndex: 2, explanation: "Arrow functions use the => syntax." },
  { id: "javascript-7", topic: "JavaScript", question: "Which keyword handles asynchronous waiting in async functions?", options: ["pause", "await", "yield", "wait"], correctIndex: 1, explanation: "await pauses async function execution until promise settles." },
  { id: "javascript-8", topic: "JavaScript", question: "Which method removes the last element from an array?", options: ["shift", "pop", "splice(0,1)", "removeLast"], correctIndex: 1, explanation: "pop removes and returns the final array element." },
  { id: "javascript-9", topic: "JavaScript", question: "What is a promise in JavaScript?", options: ["A loop", "A future async result", "A data type for arrays", "A DOM event"], correctIndex: 1, explanation: "Promises represent eventual completion or failure of async operations." },
  { id: "javascript-10", topic: "JavaScript", question: "Which statement is used for exception handling?", options: ["try/catch", "if/else", "switch/case", "for/of"], correctIndex: 0, explanation: "try/catch handles exceptions thrown during execution." },
  // ML (10)
  { id: "ml-1", topic: "ML", question: "What does ML stand for?", options: ["Machine Language", "Machine Learning", "Model Logic", "Meta Learning"], correctIndex: 1, explanation: "ML commonly refers to Machine Learning." },
  { id: "ml-2", topic: "ML", question: "Which is a supervised learning task?", options: ["Clustering", "Dimensionality reduction", "Classification", "Anomaly exploration"], correctIndex: 2, explanation: "Classification uses labeled data in supervised learning." },
  { id: "ml-3", topic: "ML", question: "What is overfitting?", options: ["Model too simple", "Model memorizes training data", "Not enough features", "Slow training"], correctIndex: 1, explanation: "Overfitting means poor generalization despite strong training performance." },
  { id: "ml-4", topic: "ML", question: "What is a common metric for classification accuracy?", options: ["MSE", "R-squared", "Accuracy", "RMSE"], correctIndex: 2, explanation: "Accuracy measures fraction of correct predictions." },
  { id: "ml-5", topic: "ML", question: "Which dataset split is used to tune hyperparameters?", options: ["Training", "Validation", "Test", "Production"], correctIndex: 1, explanation: "Validation data is used to tune model settings." },
  { id: "ml-6", topic: "ML", question: "What does feature scaling help with?", options: ["Reducing labels", "Convergence and stability", "Creating test data", "Removing outliers only"], correctIndex: 1, explanation: "Scaling often improves optimization behavior and model stability." },
  { id: "ml-7", topic: "ML", question: "Which algorithm is commonly used for regression?", options: ["K-Means", "Linear Regression", "Apriori", "PCA"], correctIndex: 1, explanation: "Linear Regression models continuous target values." },
  { id: "ml-8", topic: "ML", question: "What is the purpose of a confusion matrix?", options: ["Visualize clustering", "Summarize classification outcomes", "Store features", "Normalize data"], correctIndex: 1, explanation: "It shows true/false positives and negatives for classifiers." },
  { id: "ml-9", topic: "ML", question: "Which term describes model prediction on unseen data quality?", options: ["Compilation", "Generalization", "Serialization", "Tokenization"], correctIndex: 1, explanation: "Generalization is performance on unseen data." },
  { id: "ml-10", topic: "ML", question: "Which approach learns from unlabeled data?", options: ["Supervised learning", "Unsupervised learning", "Reinforcement only", "Transfer learning"], correctIndex: 1, explanation: "Unsupervised learning discovers patterns without labels." },
  // HTML (10)
  { id: "html-1", topic: "HTML", question: "Which tag defines the largest heading by default?", options: ["<h6>", "<heading>", "<h1>", "<head>"], correctIndex: 2, explanation: "<h1> is the top-level heading tag." },
  { id: "html-2", topic: "HTML", question: "Which tag is used for hyperlinks?", options: ["<link>", "<a>", "<href>", "<url>"], correctIndex: 1, explanation: "Anchor tag <a> creates hyperlinks." },
  { id: "html-3", topic: "HTML", question: "Where should metadata like page title be placed?", options: ["<footer>", "<body>", "<main>", "<head>"], correctIndex: 3, explanation: "Metadata belongs in the <head> section." },
  { id: "html-4", topic: "HTML", question: "Which attribute provides alternative text for images?", options: ["title", "src", "alt", "label"], correctIndex: 2, explanation: "alt text improves accessibility and fallback rendering." },
  { id: "html-5", topic: "HTML", question: "Which tag creates an unordered list?", options: ["<ol>", "<ul>", "<li>", "<list>"], correctIndex: 1, explanation: "<ul> wraps bullet-style list items." },
  { id: "html-6", topic: "HTML", question: "Which element is semantically correct for navigation links?", options: ["<section>", "<article>", "<nav>", "<aside>"], correctIndex: 2, explanation: "<nav> identifies a section of navigation links." },
  { id: "html-7", topic: "HTML", question: "What does the <br> tag do?", options: ["Creates bold text", "Inserts line break", "Creates border", "Breaks script"], correctIndex: 1, explanation: "<br> inserts a line break in text flow." },
  { id: "html-8", topic: "HTML", question: "Which input type hides typed characters for passwords?", options: ["text", "hidden", "secure", "password"], correctIndex: 3, explanation: "type='password' masks user input characters." },
  { id: "html-9", topic: "HTML", question: "Which tag is used for table rows?", options: ["<td>", "<th>", "<tr>", "<table-row>"], correctIndex: 2, explanation: "<tr> defines a row inside a table." },
  { id: "html-10", topic: "HTML", question: "Which doctype triggers standards mode in modern HTML?", options: ["<!DOCTYPE html>", "<!HTML5>", "<!DOCTYPE web>", "<doctype html>"], correctIndex: 0, explanation: "<!DOCTYPE html> is the correct modern doctype declaration." },
];
const OPTION_LABELS = ["A", "B", "C", "D"] as const;

const topicIcon: Record<QuizTopic, React.ComponentType<{ className?: string }>> = {
  Python: Cpu,
  React: Atom,
  SQL: Database,
  JavaScript: Zap,
  ML: Brain,
  HTML: Code2,
};

function performanceMessage(score: number): string {
  if (score >= 9) return "Excellent! 🏆";
  if (score >= 7) return "Great job! Keep it up";
  if (score >= 5) return "Good effort, review the topic";
  return "Keep practicing!";
}

export function QuizPage() {
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const topicQuestions = useMemo(() => {
    if (!selectedTopic || !quizStarted) return [];
    return questions.filter((item) => item.topic === selectedTopic).slice(0, 10);
  }, [selectedTopic, quizStarted]);

  const currentQuestion = topicQuestions[currentIndex];
  const progress = topicQuestions.length === 0 ? 0 : ((currentIndex + 1) / topicQuestions.length) * 100;
  const scorePercent = topicQuestions.length ? Math.round((score / topicQuestions.length) * 100) : 0;

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
  };

  const startOver = () => {
    setQuizStarted(false);
    setSelectedTopic(null);
    resetQuiz();
  };

  const startQuiz = () => {
    if (!selectedTopic) return;
    resetQuiz();
    setQuizStarted(true);
  };

  const handleSelectAnswer = (answerIndex: number) => {
    if (!currentQuestion || selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    if (answerIndex === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!currentQuestion || selectedAnswer === null) return;
    const isLastQuestion = currentIndex >= topicQuestions.length - 1;
    if (isLastQuestion) {
      setShowResult(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
  };

  if (!quizStarted) {
    return (
      <section
        className="relative mx-auto w-[min(1120px,95%)] overflow-hidden rounded-[32px] px-4 py-8 sm:px-6"
        style={{ background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
        `}</style>

        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#7c3aed]/25 blur-3xl" />

        <div className="relative z-10 mb-8">
          <h1 className="text-4xl font-semibold text-white sm:text-5xl" style={{ fontFamily: "'Syne', sans-serif" }}>
            Choose a Topic
          </h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">Test your knowledge with 10 questions</p>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((topic) => {
            const Icon = topicIcon[topic];
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedTopic(topic)}
                className={`group rounded-2xl border bg-[rgba(255,255,255,0.04)] p-5 text-left transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-[#7c3aed]/55 hover:shadow-[0_14px_45px_rgba(124,58,237,0.35)] ${
                  isSelected
                    ? "border-[#7c3aed] shadow-[0_0_0_1px_rgba(124,58,237,0.4),0_18px_55px_rgba(124,58,237,0.28)]"
                    : "border-[rgba(255,255,255,0.08)]"
                }`}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#7c3aed]/35 bg-[#7c3aed]/20 text-[#d8b4fe]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-xl font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {topic}
                </p>
                <p className="mt-1 text-sm text-slate-400">10 Questions • Adaptive Difficulty</p>
              </button>
            );
          })}
        </div>

        <div className="relative z-10 mt-6">
          <button
            type="button"
            onClick={startQuiz}
            disabled={!selectedTopic}
            className="inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-3 font-semibold text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Quiz
          </button>
        </div>
      </section>
    );
  }

  if (topicQuestions.length === 0) {
    return (
      <section className="mx-auto w-[min(900px,95%)] rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-6 text-center text-slate-200">
        No questions available for this quiz yet.
      </section>
    );
  }

  if (showResult) {
    return (
      <section
        className="relative mx-auto w-[min(900px,95%)] overflow-hidden rounded-[32px] px-4 py-8 sm:px-6"
        style={{ background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#7c3aed]/25 blur-3xl" />

        <div className="relative z-10 rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-6 text-center sm:p-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#7c3aed]/35 bg-[#7c3aed]/15 text-[#d8b4fe]">
            <Trophy className="h-7 w-7" aria-hidden="true" />
          </div>

          <h2 className="text-4xl font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            You scored {score}/10
          </h2>
          <p className="mt-2 text-base text-slate-300">{performanceMessage(score)}</p>

          <div className="mx-auto mt-8 flex h-36 w-36 items-center justify-center rounded-full" style={{ background: `conic-gradient(#7c3aed ${scorePercent}%, rgba(255,255,255,0.08) ${scorePercent}%)` }}>
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#0f0f17] text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              {scorePercent}%
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={resetQuiz}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-3 font-semibold text-white transition hover:bg-[#6d28d9]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Restart Quiz
            </button>
            <button
              type="button"
              onClick={startOver}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-3 font-semibold text-white transition hover:bg-[#6d28d9]"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Try Another Topic
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative mx-auto w-[min(900px,95%)] overflow-hidden rounded-[32px] px-4 py-8 sm:px-6"
      style={{ background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#7c3aed]/25 blur-3xl" />

      <div className="relative z-10 mb-5 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4">
        <div className="mb-2 flex items-center justify-between text-sm text-[#c4b5fd]">
          <span>{selectedTopic}</span>
          <span>Question {currentIndex + 1} of 10</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800/70">
          <div className="h-2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <article className="relative z-10 rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-6 sm:p-7">
        <h2 className="text-2xl font-semibold leading-snug text-white sm:text-3xl" style={{ fontFamily: "'Syne', sans-serif" }}>
          {currentQuestion.question}
        </h2>

        <div className="mt-6 grid gap-3">
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = selectedAnswer === optionIndex;
            const isCorrect = optionIndex === currentQuestion.correctIndex;

            let colorClasses = "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-slate-100";
            if (selectedAnswer !== null) {
              if (isCorrect) {
                colorClasses = "border-emerald-400/80 bg-emerald-500/20 text-emerald-100";
              } else if (isSelected) {
                colorClasses = "border-rose-400/80 bg-rose-500/20 text-rose-100";
              }
            }

            return (
              <button
                key={`${option}-${optionIndex}`}
                type="button"
                onClick={() => handleSelectAnswer(optionIndex)}
                disabled={selectedAnswer !== null}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${colorClasses} disabled:cursor-not-allowed`}
              >
                <span className="mr-2 font-semibold text-[#c4b5fd]">{OPTION_LABELS[optionIndex]}.</span>
                {option}
              </button>
            );
          })}
        </div>

        {selectedAnswer !== null && (
          <p className="mt-4 text-sm text-slate-300">{currentQuestion.explanation}</p>
        )}

        <button
          type="button"
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-3 font-semibold text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next Question
        </button>
      </article>
    </section>
  );
}
