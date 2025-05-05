// src/components/ObservationSection.jsx
import React, { useState, useEffect, useRef } from 'react';

/**
 * ObservationSection: dynamic list of text blocks for observations.
 * Accepts `observations` as an array of strings.
 * Auto-appends an empty block when typing in the last slot.
 * Debounces onSave callback.
 */
export default function ObservationSection({ observations = [], onSave }) {
  // Local state: always keep a trailing empty block
  const initialArr = Array.isArray(observations) ? observations : [];
  const [blocks, setBlocks] = useState([...initialArr, '']);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  // Sync when prop changes
  useEffect(() => {
    const arr = Array.isArray(observations) ? observations : [];
    setBlocks([...arr, '']);
    blocksRef.current = [...arr, ''];
  }, [observations]);

  // Debounced save utility
  const debouncedSave = (() => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const toSave = blocksRef.current.map(b => b.trim()).filter(Boolean);
        onSave(toSave);
      }, 500);
    };
  })();

  const handleChange = (index, value) => {
    let updated = [...blocksRef.current];
    updated[index] = value;
    // If editing last block and not empty, append new one immediately
    if (index === blocksRef.current.length - 1 && value.trim() !== '') {
      updated = [...updated, ''];
    }
    setBlocks(updated);
    blocksRef.current = updated;
    debouncedSave();
  };

  const handleDelete = (index) => {
    const updated = blocksRef.current.filter((_, i) => i !== index);
    setBlocks(updated);
    blocksRef.current = updated;
    debouncedSave();
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-lg font-semibold">Observations</h2>
      {blocks.map((block, i) => (
        <div key={i} className="relative group">
          <textarea
            value={block}
            placeholder={`Observation ${i + 1}`}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={e => handleChange(i, e.target.value)}
          />
          {/* Show delete on all but trailing blank */}
          {i < blocks.length - 1 && (
            <button
              onClick={() => handleDelete(i)}
              className="absolute top-2 right-2 text-red-500 text-sm opacity-0 group-hover:opacity-100 transition"
              title="Delete block"
            >
              🗑
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
