import React, { useEffect, useState } from 'react';
import { openDB } from 'idb';
import ProblemList from './components/ProblemList';
import ProblemDetail from './components/ProblemDetail';
import StatisticsDashboard from './components/StatisticsDashboard';
import Header from './components/Header';
import { useInterval } from './hooks/useInterval';

function App() {
  const [db, setDb] = useState(null);
  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [activeView, setActiveView] = useState('Problems'); // 'Problems' or 'Statistics'

  useEffect(() => {
    async function initDB() {
      const dbInstance = await openDB('SolveSpaceDB', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('problems')) {
            db.createObjectStore('problems', { keyPath: 'id', autoIncrement: true });
          }
        },
      });
      setDb(dbInstance);
    }
    initDB();
  }, []);

  useEffect(() => {
    if (db) {
      fetchProblems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db]);

  async function fetchProblems() {
    const tx = db.transaction('problems', 'readonly');
    const store = tx.objectStore('problems');
    const allProblems = await store.getAll();
    setProblems(allProblems);
  }

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useInterval(() => {
    checkReminders();
  }, 60000); // Check every minute

  async function checkReminders() {
    if (!db) return;

    const now = new Date();
    const tx = db.transaction('problems', 'readwrite');
    const store = tx.objectStore('problems');

    const allProblems = await store.getAll();
    for (const problem of allProblems) {
      if (problem.reminder && !problem.reminderNotified) {
        const reminderTime = new Date(problem.reminder);
        if (reminderTime <= now) {
          if (Notification.permission === 'granted') {
            new Notification('Problem Reminder', {
              body: `Time to review: ${problem.title}`,
            });
          }
          // Update the problem to mark reminder as notified
          problem.reminderNotified = true;
          await store.put(problem);
        }
      }
    }
    await tx.done;
    fetchProblems();
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 h-full">
        <div className="w-full md:w-1/3 border-r overflow-y-auto h-full">
          {/* View Switcher */}
          <div className="p-4 flex space-x-2">
            <button
              onClick={() => setActiveView('Problems')}
              className={`px-4 py-2 rounded-full font-medium transition duration-300 ${
                activeView === 'Problems'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-800 hover:bg-neutral-dark'
              }`}
            >
              Problems
            </button>
            <button
              onClick={() => setActiveView('Statistics')}
              className={`px-4 py-2 rounded-full font-medium transition duration-300 ${
                activeView === 'Statistics'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-800 hover:bg-neutral-dark'
              }`}
            >
              Statistics
            </button>
          </div>
          {activeView === 'Problems' ? (
            <ProblemList
              db={db}
              problems={problems}
              onSelect={setSelectedProblemId}
              refreshProblems={fetchProblems}
            />
          ) : (
            <StatisticsDashboard problems={problems} />
          )}
        </div>
        <div className="hidden md:block md:w-2/3 overflow-y-auto h-full">
          {selectedProblemId && activeView === 'Problems' && (
            <ProblemDetail
              db={db}
              problemId={selectedProblemId}
              refreshProblems={fetchProblems}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
