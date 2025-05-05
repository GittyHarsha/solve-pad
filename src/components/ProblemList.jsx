// src/components/ProblemList.jsx
import React, { useState, useEffect } from 'react'
import {
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon as UploadIcon,
  ArrowDownTrayIcon as DownloadIcon
} from '@heroicons/react/24/solid'

export default function ProblemList({
  db,
  problems,
  onSelect,
  refreshProblems,
}) {
  const [filter, setFilter] = useState('All')
  const [newTitle, setNewTitle] = useState('')
  const [newURL, setNewURL] = useState('')

  // Whenever db becomes available, load the problems
  useEffect(() => {
    if (db) {
      refreshProblems()
    }
  }, [db, refreshProblems])

  // Add a new problem (no‐ops if db is null)
  async function addProblem() {
    if (!db || !newTitle.trim()) return
    try {
      const tx = db.transaction('problems', 'readwrite')
      await tx.objectStore('problems').add({
        title: newTitle.trim(),
        url: newURL.trim(),
        observations: [],
        approaches: [],
        knownFacts: '',
        scratchPad: '',
        questions: [],
        timeSpent: 0,
        reminder: null,
        reminderNotified: false,
        solved: false
      })
      await tx.done
      setNewTitle('')
      setNewURL('')
      refreshProblems()
    } catch (err) {
      console.error('Add failed:', err)
    }
  }

  // Delete by ID
  async function deleteProblem(id) {
    if (!db) return
    try {
      const tx = db.transaction('problems', 'readwrite')
      await tx.objectStore('problems').delete(id)
      await tx.done
      refreshProblems()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }
  // Export all problems
  async function exportData() {
    if (!db) return
    try {
      const tx = db.transaction('problems', 'readonly')
      const all = await tx.objectStore('problems').getAll()
      const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'problems.json'
      a.click()
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  // Import from JSON
  function importData(e) {
    if (!db) return
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const arr = JSON.parse(reader.result)
        if (!Array.isArray(arr)) throw new Error('Invalid format')
        const tx = db.transaction('problems', 'readwrite')
        const store = tx.objectStore('problems')
        for (const p of arr) {
          const { id, ...rest } = p
          await store.add(rest)
        }
        await tx.done
        refreshProblems()
        alert('Import successful!')
      } catch {
        alert('Failed to import: invalid JSON')
      }
    }
    reader.readAsText(file)
  }

  // Filter the list
  const filtered = problems.filter((p) => {
    if (filter === 'Solved') return p.solved
    if (filter === 'Unsolved') return !p.solved
    return true
  })

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="p-4 bg-gray-50 space-y-4">
        {/* Filter Buttons */}
        <div className="flex space-x-2">
          {['All', 'Solved', 'Unsolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full transition ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Export / Import */}
        <div className="flex space-x-2">
          <button
            onClick={exportData}
            className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <DownloadIcon className="w-5 h-5 mr-1" />
            Export
          </button>
          <label className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
            <UploadIcon className="w-5 h-5 mr-1" />
            Import
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>

        {/* Add New Problem */}
        <div className="space-y-2">
          <input
            className="w-full px-3 py-2 border rounded"
            placeholder="Problem Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 border rounded"
            placeholder="Problem URL"
            value={newURL}
            onChange={(e) => setNewURL(e.target.value)}
          />
          <button
            onClick={addProblem}
            className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Problem
          </button>
        </div>
      </div>

      {/* Problem List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length === 0 ? (
          <p className="text-gray-500">No problems found.</p>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center p-3 bg-white rounded shadow hover:bg-gray-50"
            >
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => onSelect(p.id)}
              >
                {p.solved ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                ) : (
                  <div className="w-6 h-6" />
                )}
                <span className="font-medium">{p.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => deleteProblem(p.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
