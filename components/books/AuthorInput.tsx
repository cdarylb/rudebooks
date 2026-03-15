'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface AuthorInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function AuthorInput({ value, onChange, placeholder, className }: AuthorInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.length < 2) { setSuggestions([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/authors?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data: string[] = await res.json()
        const filtered = data.filter((s) => s.toLowerCase() !== q.toLowerCase())
        setSuggestions(filtered)
        setOpen(filtered.length > 0)
        setActiveIndex(-1)
      }
    }, 200)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleChange(v: string) {
    onChange(v)
    fetchSuggestions(v)
  }

  function pick(name: string) {
    onChange(name)
    setOpen(false)
    setSuggestions([])
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      pick(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => value.length >= 2 && suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {open && (
        <ul className="absolute left-0 right-0 top-full mt-1 z-50 bg-surface-2 border border-edge rounded-xl shadow-card-hover py-1 max-h-48 overflow-y-auto">
          {suggestions.map((name, i) => (
            <li key={name}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); pick(name) }}
                className={`w-full text-left text-sm px-3 py-2 transition ${
                  i === activeIndex ? 'bg-primary/15 text-primary' : 'text-ink hover:bg-surface-3'
                }`}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
