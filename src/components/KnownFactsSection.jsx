// src/components/KnownFactsSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Debounce utility
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

export default function KnownFactsSection({ knownFacts = '', onSave }) {
  const [value, setValue] = useState(knownFacts);
  const valueRef = useRef(value);

  // Keep ref updated
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Sync when prop changes
  useEffect(() => {
    setValue(knownFacts);
    valueRef.current = knownFacts;
  }, [knownFacts]);

  // Debounce save to parent
  const debouncedSave = useDebouncedCallback(() => {
    onSave(valueRef.current);
  }, 1000);

  // Cancel on unmount
  useEffect(() => () => debouncedSave.cancel && debouncedSave.cancel(), [debouncedSave]);

  const handleChange = (content) => {
    setValue(content);
    debouncedSave();
  };

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-lg font-semibold">Known Facts</h2>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        placeholder="List known facts here..."
        className="bg-white rounded border"
      />
    </div>
  );
}
