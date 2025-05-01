import React, { useState, useEffect, useRef } from 'react'

function useDebouncedCallback(callback, delay) {
  const timeoutRef = useRef(null)
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  return (...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      savedCallback.current(...args)
    }, delay)
  }
}

export default function ObservationSection({ observations, onSave }) {
  const initialText = typeof observations === 'string' ? observations : ''
  const [blocks, setBlocks] = useState(() =>
    initialText.trim() ? initialText.split('\n\n') : ['']
  )
  const blocksRef = useRef(blocks)

  useEffect(() => {
    const text = typeof observations === 'string' ? observations : ''
    const split = text.trim() ? text.split('\n\n') : ['']
    setBlocks(split)
    blocksRef.current = split
  }, [observations])

  useEffect(() => {
    blocksRef.current = blocks
  }, [blocks])

  const debouncedSave = useDebouncedCallback(() => {
    const latest = blocksRef.current
    const joined = latest.map(b => b.trim()).filter(Boolean).join('\n\n')
    onSave(joined)
  }, 1000)

  const handleChange = (i, val) => {
    const updated = [...blocks]
    updated[i] = val
    setBlocks(updated)
    debouncedSave()
  }

  const addBlock = () => {
    const updated = [...blocks, '']
    setBlocks(updated)
    blocksRef.current = updated
  }

  const deleteBlock = (index) => {
    if (blocks.length === 1) return
    const updated = blocks.filter((_, i) => i !== index)
    setBlocks(updated)
    blocksRef.current = updated
    debouncedSave()
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-lg font-semibold">Observations</h2>

      {blocks.map((block, i) => (
        <div key={i} className="relative group">
          <textarea
            value={block}
            placeholder={`Observation ${i + 1}`}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleChange(i, e.target.value)}
          />
          {blocks.length > 1 && (
            <button
              onClick={() => deleteBlock(i)}
              className="absolute top-2 right-2 text-red-500 text-sm opacity-0 group-hover:opacity-100 transition"
              title="Delete block"
            >
              🗑
            </button>
          )}
        </div>
      ))}

      <button
        onClick={addBlock}
        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
      >
        + Add Block
      </button>
    </div>
  )
}
