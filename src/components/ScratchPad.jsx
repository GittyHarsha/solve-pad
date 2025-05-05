// src/components/ScratchPad.jsx
import React, { useState, useEffect, useRef } from 'react';

function useDebouncedCallback(callback, delay) {
  const timeoutRef = useRef(null);
  const savedCb = useRef(callback);

  useEffect(() => {
    savedCb.current = callback;
  }, [callback]);

  return (...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      savedCb.current(...args);
    }, delay);
  };
}

export default function ScratchPad({ scratchPad = '', onSave }) {
  const [content, setContent] = useState(scratchPad);
  const contentRef = useRef(content);

  // Keep ref in sync
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Sync local state when prop changes
  useEffect(() => {
    setContent(scratchPad);
  }, [scratchPad]);

  // Debounced save (500ms)
  const debouncedSave = useDebouncedCallback(() => {
    onSave(contentRef.current);
  }, 500);

  const handleChange = (e) => {
    setContent(e.target.value);
    debouncedSave();
  };

  return (
    <div className="space-y-2 p-4">
      <h2 className="text-lg font-semibold">Scratch Pad</h2>
      <textarea
        className="w-full h-64 p-4 border rounded-lg focus:ring-primary"
        value={content}
        onChange={handleChange}
      />
    </div>
  );
}
