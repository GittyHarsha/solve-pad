import React, { useState, useEffect, useRef } from 'react'
import ObservationSection from './ObservationSection'
import ApproachSection from './ApproachSection'
import KnownFactsSection from './KnownFactsSection'
import ScratchPad from './ScratchPad'
import QuestionsSection from './QuestionsSection'
import {
  ClockIcon,
  PencilIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function ProblemDetail({ db, problemId, refresh }) {
  const [p, setP] = useState(null)
  const [tab, setTab] = useState('Observations')
  const [editTitle, setEditTitle] = useState(false)
  const [title, setTitle] = useState('')
  const [editURL, setEditURL] = useState(false)
  const [url, setURL] = useState('')
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const timer = useRef(null)
  const [reminder, setReminder] = useState(null)

  // fetch problem
  useEffect(() => {
    let mounted = true
    db.get('problems', problemId).then(data => {
      if (!mounted) return
      setP(data)
      setTitle(data.title)
      setURL(data.url||'')
      setTime(data.timeSpent||0)
      setRunning(!data.solved)
      setReminder(data.reminder ? new Date(data.reminder) : null)
    })
    return () => { mounted=false; clearInterval(timer.current) }
  }, [db, problemId])

  // sync time
  useEffect(() => {
    if (running) {
      timer.current = setInterval(() => setTime(t => t+1), 1000)
    } else clearInterval(timer.current)
    return () => clearInterval(timer.current)
  }, [running])

  // persist time
  useEffect(() => {
    if (!p) return
    persist({ timeSpent: time })
    // eslint-disable-next-line
  }, [time])

  function persist(fields) {
    const updated = { ...p, ...fields }
    db.put('problems', updated).then(() => { setP(updated); refresh() })
  }

  function toggleSolved() {
    persist({ solved: !p.solved })
    setRunning(p.solved) // if now unsolved => start
  }

  function resetTimer() {
    setTime(0); persist({ timeSpent: 0 })
  }

  function saveReminder() {
    persist({ reminder: reminder ? reminder.toISOString() : null, reminderNotified: false })
  }

  function fmt(sec) {
    const h = String(Math.floor(sec/3600)).padStart(2,'0')
    const m = String(Math.floor((sec%3600)/60)).padStart(2,'0')
    const s = String(sec%60).padStart(2,'0')
    return `${h}:${m}:${s}`
  }

  if (!p) return null

  return (
    <div className="p-6 space-y-8">
      {/* title & status */}
      <div>
        {editTitle ? (
          <div className="flex space-x-2">
            <input className="flex-1 p-2 border rounded-lg" value={title} onChange={e=>setTitle(e.target.value)}/>
            <button onClick={()=>{ persist({ title }); setEditTitle(false) }} className="px-3 py-1 bg-green-500 text-white rounded">Save</button>
            <button onClick={()=>{ setTitle(p.title); setEditTitle(false) }} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{p.title}</h2>
            <div className="flex items-center space-x-2">
              <button onClick={()=>setEditTitle(true)} className="text-purple-600"><PencilIcon className="w-5 h-5"/></button>
              <button onClick={toggleSolved} className="px-3 py-1 bg-purple-600 text-white rounded">
                {p.solved ? 'Unsolve' : 'Solve'}
              </button>
            </div>
          </div>
        )}

        {/* URL */}
        {editURL ? (
          <div className="flex space-x-2 mt-2">
            <input className="flex-1 p-2 border rounded-lg" value={url} onChange={e=>setURL(e.target.value)}/>
            <button onClick={()=>{ persist({ url }); setEditURL(false) }} className="px-3 py-1 bg-green-500 text-white rounded">Save</button>
            <button onClick={()=>{ setURL(p.url||''); setEditURL(false) }} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
          </div>
        ) : (
          <div className="mt-2 flex justify-between items-center">
            {p.url
              ? <a href={p.url} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:underline">
                  <LinkIcon className="w-5 h-5 mr-1"/>Visit URL
                </a>
              : <span className="text-gray-500">No URL</span>
            }
            <button onClick={()=>setEditURL(true)} className="text-purple-600"><PencilIcon className="w-5 h-5"/></button>
          </div>
        )}
      </div>

      {/* timer */}
      <div className="flex items-center space-x-4">
        <ClockIcon className="w-6 h-6"/>
        <span className="text-lg font-medium">Time Spent: {fmt(time)}</span>
        {!p.solved && (
          <>
            <button onClick={()=>setRunning(r=>!r)} className="px-3 py-1 bg-blue-500 text-white rounded">
              {running ? 'Pause' : 'Resume'}
            </button>
            <button onClick={resetTimer} className="px-3 py-1 bg-red-500 text-white rounded">Reset</button>
          </>
        )}
      </div>

      {/* reminder */}
      <div className="space-y-2">
        <h3 className="font-semibold">Set Reminder</h3>
        <div className="flex items-center space-x-2">
          <DatePicker
            selected={reminder}
            onChange={setReminder}
            showTimeSelect
            dateFormat="Pp"
            className="p-2 border rounded-lg"
          />
          <button onClick={saveReminder} className="px-3 py-1 bg-green-500 text-white rounded">Save</button>
        </div>
      </div>

      {/* tabs */}
      <div className="flex space-x-4 border-b">
        {['Observations','Approaches','Known Facts','Scratch Pad','Questions'].map(t => (
          <button
            key={t}
            onClick={()=>setTab(t)}
            className={`pb-2 ${tab===t ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
          >{t}</button>
        ))}
      </div>

      {/* tab content */}
      {tab==='Observations' && (
        <ObservationSection observations={p.observations} onSave={d=>persist({observations:d})}/>
      )}
      {tab==='Approaches' && (
        <ApproachSection approaches={p.approaches} onSave={d=>persist({approaches:d})}/>
      )}
      {tab==='Known Facts' && (
        <KnownFactsSection knownFacts={p.knownFacts} onSave={d=>persist({knownFacts:d})}/>
      )}
      {tab==='Scratch Pad' && (
        <ScratchPad scratchPad={p.scratchPad} onSave={d=>persist({scratchPad:d})}/>
      )}
      {tab==='Questions' && (
        <QuestionsSection questions={p.questions} onSave={d=>persist({questions:d})}/>
      )}
    </div>
  )
}
