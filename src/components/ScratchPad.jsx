import React, { useState } from 'react';

function ScratchPad({ scratchPad, onSave }) {
  const [content, setContent] = useState(scratchPad);

  // Save on blur, e.g., when switching tabs
  const handleBlur = () => {
    onSave(content);
  };

  return (
    <div>
      <textarea
        className="w-full h-64 p-4 border rounded-lg focus:ring-primary"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlur}
      />
      <button
        onClick={() => onSave(content)}
        className="mt-4 bg-primary text-white px-4 py-2 rounded-full"
      >
        Save
      </button>
    </div>
  );
}

export default ScratchPad;