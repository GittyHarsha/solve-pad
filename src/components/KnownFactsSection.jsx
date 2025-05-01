import React, { useState, useEffect, useRef } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import debounce from 'lodash.debounce'

export default function KnownFactsSection({ knownFacts, onSave }) {
  const [value, setValue] = useState(knownFacts ?? '')
  const valueRef = useRef(value)

  // Update ref on every change to avoid stale closures
  useEffect(() => {
    valueRef.current = value
  }, [value])

  // Safe debounce with ref
  const debouncedSave = useRef(
    debounce(() => {
      onSave(valueRef.current)
    }, 1000)
  ).current

  // Clean up on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  // Sync prop on change
  useEffect(() => {
    const initial = knownFacts ?? ''
    setValue(initial)
    valueRef.current = initial
  }, [knownFacts])

  const handleChange = (val) => {
    setValue(val)
    valueRef.current = val
    debouncedSave()
  }

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
  )
}
