import { useMemo, useState } from 'react'

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const heroImages = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506399558188-acca6f1de0d4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1451772741724-d20990422508?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
]

const today = new Date()

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1)

const sameDay = (first, second) =>
  first?.getFullYear() === second?.getFullYear() &&
  first?.getMonth() === second?.getMonth() &&
  first?.getDate() === second?.getDate()

const toLocalKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatMonthLabel = (date) =>
  new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)

const formatShortDate = (date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)

const formatLongDate = (date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  }).format(date)

const formatSelectionLabel = (key) => {
  if (!key) {
    return 'No range selected'
  }

  const [startKey, endKey] = key.split('__')

  const startDate = new Date(`${startKey}T00:00:00`)
  const endDate = new Date(`${endKey}T00:00:00`)

  if (startKey === endKey) {
    return formatShortDate(startDate)
  }

  return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`
}

export default function Calendar() {
  const [viewMonth, setViewMonth] = useState(startOfMonth(today))
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [monthMemo, setMonthMemo] = useState(
    'Plan the month, capture deadlines, and keep the essentials visible here.',
  )
  const [rangeNote, setRangeNote] = useState('')
  const [savedRangeNotes, setSavedRangeNotes] = useState({})

  const monthIndex = viewMonth.getMonth()
  const year = viewMonth.getFullYear()
  const heroImage = heroImages[monthIndex]
  const monthTitle = formatMonthLabel(viewMonth)

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, monthIndex, 1)
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const leadingDays = (firstDay.getDay() + 6) % 7
    const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7

    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - leadingDays + 1

      return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null
    })
  }, [monthIndex, year])

  const rangeKey = useMemo(() => {
    if (!startDate) {
      return ''
    }

    const startKey = toLocalKey(startDate)
    const endKey = endDate ? toLocalKey(endDate) : startKey

    return `${startKey}__${endKey}`
  }, [startDate, endDate])

  const selectionLabel = formatSelectionLabel(rangeKey)
  const selectedDays = startDate && endDate ? Math.max(1, endDate.getDate() - startDate.getDate() + 1) : startDate ? 1 : 0
  const totalMonthDays = new Date(year, monthIndex + 1, 0).getDate()

  const resetSelection = () => {
    setStartDate(null)
    setEndDate(null)
    setRangeNote('')
  }

  const goToMonth = (offset) => {
    setViewMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1))
    resetSelection()
  }

  const goToCurrentMonth = () => {
    setViewMonth(startOfMonth(today))
    resetSelection()
  }

  const handleDayClick = (day) => {
    const clickedDate = new Date(year, monthIndex, day)

    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate)
      setEndDate(null)
      setRangeNote(savedRangeNotes[toLocalKey(clickedDate)] ?? '')
      return
    }

    if (clickedDate < startDate) {
      setEndDate(startDate)
      setStartDate(clickedDate)
      const normalizedKey = `${toLocalKey(clickedDate)}__${toLocalKey(startDate)}`
      setRangeNote(savedRangeNotes[normalizedKey] ?? '')
      return
    }

    setEndDate(clickedDate)
    const normalizedKey = `${toLocalKey(startDate)}__${toLocalKey(clickedDate)}`
    setRangeNote(savedRangeNotes[normalizedKey] ?? '')
  }

  const isInRange = (day) => {
    if (!startDate || !endDate) {
      return false
    }

    const currentDate = new Date(year, monthIndex, day)

    return currentDate > startDate && currentDate < endDate
  }

  const saveRangeNote = () => {
    if (!rangeKey) {
      return
    }

    setSavedRangeNotes((currentNotes) => ({
      ...currentNotes,
      [rangeKey]: rangeNote.trim(),
    }))
  }

  const clearRangeNote = () => {
    setRangeNote('')

    if (!rangeKey) {
      return
    }

    setSavedRangeNotes((currentNotes) => ({
      ...currentNotes,
      [rangeKey]: '',
    }))
  }

  const savedNoteEntries = Object.entries(savedRangeNotes).filter(([, note]) => note.trim().length > 0)

  const renderSelectionNoteTitle = () => {
    if (!startDate) {
      return 'Selection note'
    }

    if (startDate && !endDate) {
      return formatLongDate(startDate)
    }

    return `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`
  }

  return (
    <section className="calendar-shell">
      <div className="calendar-card">
        <header className="calendar-hero">
          <div className="calendar-hero__image-wrap">
            <img src={heroImage} alt={`${monthTitle} mood board`} className="calendar-hero__image" />
            <div className="calendar-hero__overlay" />
            <div className="calendar-hero__tag">
              <span>Wall Calendar</span>
              <strong>{year}</strong>
            </div>
          </div>

          <div className="calendar-hero__content">
            <div className="calendar-hero__topline">
              <span className="calendar-kicker">{monthTitle}</span>
              <div className="calendar-controls" aria-label="Month navigation">
                <button type="button" className="calendar-icon-button" onClick={() => goToMonth(-1)}>
                  Prev
                </button>
                <button
                  type="button"
                  className="calendar-icon-button calendar-icon-button--ghost"
                  onClick={goToCurrentMonth}
                >
                  Today
                </button>
                <button type="button" className="calendar-icon-button" onClick={() => goToMonth(1)}>
                  Next
                </button>
              </div>
            </div>

            <h1>
              {monthTitle} {year}
            </h1>
            <p className="calendar-hero__copy">
              A tactile month view with date-range picking, responsive notes, and a visual anchor that feels like a printed page on the wall.
            </p>

            <div className="calendar-stats">
              <div className="calendar-stat">
                <span>Selected range</span>
                <strong>{selectionLabel}</strong>
              </div>
              <div className="calendar-stat">
                <span>Length</span>
                <strong>{selectedDays > 0 ? `${selectedDays} days` : 'Pick a start date'}</strong>
              </div>
              <div className="calendar-stat">
                <span>Days in month</span>
                <strong>{totalMonthDays}</strong>
              </div>
            </div>
          </div>
        </header>

        <div className="calendar-body">
          <aside className="notes-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-eyebrow">Notes</span>
                <h2>Month memo</h2>
              </div>
              <span className="panel-badge">Editable</span>
            </div>

            <label className="field">
              <span>General memo</span>
              <textarea
                value={monthMemo}
                onChange={(event) => setMonthMemo(event.target.value)}
                placeholder="Capture deadlines, reminders, or a monthly intention."
                rows={7}
              />
            </label>

            <label className="field">
              <span>{renderSelectionNoteTitle()}</span>
              <textarea
                value={rangeNote}
                onChange={(event) => setRangeNote(event.target.value)}
                placeholder="Add context for the selected date or range."
                rows={6}
                disabled={!startDate}
              />
            </label>

            <div className="notes-actions">
              <button type="button" className="primary-button" onClick={saveRangeNote} disabled={!startDate}>
                Save note
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={clearRangeNote}
                disabled={!startDate && !rangeNote}
              >
                Clear note
              </button>
            </div>

            <div className="notes-summary">
              <div>
                <span>Current selection</span>
                <strong>{selectionLabel}</strong>
              </div>
              <div>
                <span>Saved notes</span>
                <strong>{savedNoteEntries.length}</strong>
              </div>
            </div>

            <div className="notes-list">
              {savedNoteEntries.length > 0 ? (
                savedNoteEntries.slice(0, 3).map(([key, note]) => {
                  const [startKey, endKey] = key.split('__')
                  const start = new Date(`${startKey}T00:00:00`)
                  const end = new Date(`${endKey}T00:00:00`)
                  const title = startKey === endKey ? formatShortDate(start) : `${formatShortDate(start)} to ${formatShortDate(end)}`

                  return (
                    <article className="notes-list__item" key={key}>
                      <span>{title}</span>
                      <p>{note}</p>
                    </article>
                  )
                })
              ) : (
                <p className="notes-empty">Save a range note to keep track of plans tied to a specific selection.</p>
              )}
            </div>
          </aside>

          <div className="calendar-panel">
            <div className="panel-heading panel-heading--calendar">
              <div>
                <span className="panel-eyebrow">Calendar grid</span>
                <h2>Select a start and end date</h2>
              </div>
              <button type="button" className="secondary-button secondary-button--compact" onClick={resetSelection}>
                Clear range
              </button>
            </div>

            <div className="weekdays" aria-hidden="true">
              {weekdayLabels.map((label) => (
                <div key={label}>{label}</div>
              ))}
            </div>

            <div className="days-grid" role="grid" aria-label={`${monthTitle} ${year}`}>
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="day-cell day-cell--empty" aria-hidden="true" />
                }

                const currentDate = new Date(year, monthIndex, day)
                const isStart = sameDay(currentDate, startDate)
                const isEnd = sameDay(currentDate, endDate)
                const inRange = isInRange(day)
                const isToday = sameDay(currentDate, today)

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={`day-cell ${isStart ? 'day-cell--start' : ''} ${isEnd ? 'day-cell--end' : ''} ${inRange ? 'day-cell--range' : ''} ${isToday ? 'day-cell--today' : ''}`}
                    aria-pressed={isStart || isEnd || inRange}
                    aria-label={formatLongDate(currentDate)}
                  >
                    <span className="day-cell__number">{day}</span>
                    {isToday ? <span className="day-cell__dot" /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}