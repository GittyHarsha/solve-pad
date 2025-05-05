// src/components/QuestionsSection.jsx
import React, { useState, useEffect, useRef } from 'react';

function useDebouncedCallback(callback, delay) {
  const timeoutRef = useRef(null);
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);
  return (...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      saved.current(...args);
    }, delay);
  };
}

export default function QuestionsSection({ questions = [], onSave }) {
  // always keep one empty slot at the end
  const [list, setList] = useState(() =>
    Array.isArray(questions) ? [...questions, ''] : ['']
  );
  const listRef = useRef(list);
  listRef.current = list;

  // sync on prop change
  useEffect(() => {
    setList(Array.isArray(questions) ? [...questions, ''] : ['']);
  }, [questions]);

  // debounce save of non-empty entries
  const debouncedSave = useDebouncedCallback(() => {
    const filtered = listRef.current.map((q) => q.trim()).filter(Boolean);
    onSave(filtered);
  }, 500);

  const handleChange = (i, val) => {
    let updated = [...listRef.current];
    updated[i] = val;
    // if typing into the last slot and not empty, append a new empty one
    if (i === listRef.current.length - 1 && val.trim() !== '') {
      updated = [...updated, ''];
    }
    setList(updated);
    debouncedSave();
  };

  const handleDelete = (i) => {
    const updated = listRef.current.filter((_, idx) => idx !== i);
    setList(updated);
    debouncedSave();
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Questions</h2>
      {list.map((item, i) => (
        <div key={i} className="relative group">
          <input
            type="text"
            value={item}
            onChange={(e) => handleChange(i, e.target.value)}
            placeholder={`Question ${i + 1}`}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* show delete only on non-last filled slots */}
          {i < list.length - 1 && (
            <button
              onClick={() => handleDelete(i)}
              className="absolute right-2 top-2 text-red-500 text-sm opacity-0 group-hover:opacity-100 transition"
              title="Delete question"
            >
              🗑
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
