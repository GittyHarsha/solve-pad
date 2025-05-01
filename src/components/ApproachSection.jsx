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

export default function ApproachSection({ approaches, onSave }) {
  const [blocks, setBlocks] = useState(() =>
    Array.isArray(approaches) ? approaches : ['']
  )
  const blocksRef = useRef(blocks)

  useEffect(() => {
    const arr = Array.isArray(approaches) ? approaches : ['']
    setBlocks(arr)
    blocksRef.current = arr
  }, [approaches])

  useEffect(() => {
    blocksRef.current = blocks
  }, [blocks])

  const debouncedSave = useDebouncedCallback(() => {
    const trimmed = blocks.map((b) => b.trim()).filter(Boolean)
    onSave(trimmed)
  }, 1000)

  const handleChange = (i, value) => {
    const updated = [...blocks]
    updated[i] = value
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
      <h2 className="text-lg font-semibold">Approaches</h2>

      {blocks.map((block, i) => (
        <div key={i} className="relative group">
          <textarea
            value={block}
            placeholder={`Approach ${i + 1}`}
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
        + Add Approach
      </button>
    </div>
  )
}
