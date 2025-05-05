// src/components/ProblemDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import ObservationSection from './ObservationSection';
import ApproachSection from './ApproachSection';
import KnownFactsSection from './KnownFactsSection';
import ScratchPad from './ScratchPad';
import QuestionsSection from './QuestionsSection';
import {
  ClockIcon,
  PencilIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function ProblemDetail({ db, problemId, refreshProblems }) {
  const [p, setP] = useState(null);
  const [tab, setTab] = useState('Observations');
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [editURL, setEditURL] = useState(false);
  const [url, setURL] = useState('');
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef(null);

  // Fetch problem data
  useEffect(() => {
    let mounted = true;
    db.get('problems', problemId).then(data => {
      if (!mounted) return;
      setP(data);
      setTitle(data.title);
      setURL(data.url || '');
      setTime(data.timeSpent || 0);
      setRunning(!data.solved);
    });
    return () => { mounted = false; clearInterval(timer.current); };
  }, [db, problemId]);

  // Timer control
  useEffect(() => {
    if (running) {
      timer.current = setInterval(() => setTime(t => t + 1), 1000);
    } else clearInterval(timer.current);
    return () => clearInterval(timer.current);
  }, [running]);

  // Persist time changes
  useEffect(() => {
    if (!p) return;
    persist({ timeSpent: time });
    // eslint-disable-next-line
  }, [time]);

  function persist(fields) {
    const updated = { ...p, ...fields };
    console.log('persisting to DB:', updated);
    db.put('problems', updated).then(() => {
      setP(updated);
      refreshProblems();
    });
  }

  function toggleSolved() {
    persist({ solved: !p.solved });
    setRunning(p.solved);
  }

  function resetTimer() {
    setTime(0);
    persist({ timeSpent: 0 });
  }

  function fmt(sec) {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  if (!p) return null;

  return (
    <div className="p-6 space-y-8">
      {/* Title & URL */}
      <div className="flex items-center space-x-4">
        {editTitle ? (
          <input
            className="flex-1 p-2 border rounded-lg"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => { persist({ title }); setEditTitle(false); }}
          />
        ) : (
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => setEditTitle(true)}>
            {p.title}
          </h1>
        )}
        {editURL ? (
          <input
            className="flex-1 p-2 border rounded-lg"
            value={url}
            onChange={e => setURL(e.target.value)}
            onBlur={() => { persist({ url }); setEditURL(false); }}
          />
        ) : (
          <a
            href={p.url}
            target="#"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
            onClick={e => { e.preventDefault(); setEditURL(true); }}
          >
            <LinkIcon className="w-5 inline" /> {p.url || 'Add URL'}
          </a>
        )}
      </div>

      {/* Timer & Status */}
      <div className="flex items-center space-x-4">
        <ClockIcon className="w-5" />
        <span>{fmt(time)}</span>
        {running ? (
          <button onClick={() => setRunning(false)} className="px-3 py-1 bg-red-500 text-white rounded">
            Pause
          </button>
        ) : (
          <button onClick={() => setRunning(true)} className="px-3 py-1 bg-green-500 text-white rounded">
            Resume
          </button>
        )}
        <button onClick={resetTimer} className="px-3 py-1 bg-red-500 text-white rounded">
          Reset
        </button>
        <button
          onClick={toggleSolved}
          className="px-3 py-1 bg-gray-200 rounded flex items-center space-x-1"
        >
          {p.solved ? <XCircleIcon className="w-5 text-red-500" /> : <CheckCircleIcon className="w-5 text-green-500" />} 
          <span>{p.solved ? 'Unsolve' : 'Solve'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        {['Observations','Approaches','Known Facts','Scratch Pad','Questions'].map(t => (
          <button
            key={t}
            onMouseEnter={() => setTab(t)}
            className={`pb-2 ${tab===t ? 'border-b-2 border-blue-500' : 'text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div>
        {tab==='Observations' && (
          <ObservationSection observations={p.observations} onSave={d => persist({ observations: d })} />
        )}
        {tab==='Approaches' && (
          <ApproachSection approaches={p.approaches} onSave={d => persist({ approaches: d })} />
        )}
        {tab==='Known Facts' && (
          <KnownFactsSection knownFacts={p.knownFacts} onSave={d => persist({ knownFacts: d })} />
        )}
        {tab==='Scratch Pad' && (
          <ScratchPad scratchPad={p.scratchPad} onSave={d => persist({ scratchPad: d })} />
        )}
        {tab==='Questions' && (
          <QuestionsSection questions={p.questions} onSave={d => persist({ questions: d })} />
        )}
      </div>
    </div>
  );
}
