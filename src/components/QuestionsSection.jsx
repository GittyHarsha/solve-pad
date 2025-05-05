// src/components/QuestionsSection.jsx
import React, { useState, useEffect } from 'react';

export default function QuestionsSection({ questions, onSave }) {
  const [list, setList] = useState(() =>
    questions && Array.isArray(questions) ? [...questions, ''] : ['']
  );

  // Keep last block empty always
  useEffect(() => {
    if (list.length === 0 || list[list.length - 1].trim() !== '') {
      setList((prev) => [...prev, '']);
    }
  }, [list]);

  const handleChange = (i, val) => {
    const updated = [...list];
    updated[i] = val;
    setList(updated);
  };

  const handleDelete = (i) => {
    const updated = list.filter((_, idx) => idx !== i);
    setList(updated);
  };

  const handleSave = () => {
    const filtered = list.map((l) => l.trim()).filter(Boolean);
    onSave(filtered);
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
          {list.length > 1 && i !== list.length - 1 && (
            <button
              onClick={() => handleDelete(i)}
              className="absolute right-2 top-2 text-red-500 text-sm opacity-0 group-hover:opacity-100 transition"
            >
              🗑
            </button>
          )}
        </div>
      ))}

      <button
        onClick={handleSave}
        className="bg-primary text-white px-4 py-2 rounded-full"
      >
        Save
      </button>
    </div>
  );
}
