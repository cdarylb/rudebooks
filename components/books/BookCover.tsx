'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface BookCoverProps {
  src: string
  alt: string
}

export default function BookCover({ src, alt }: BookCoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-md
                   cursor-zoom-in transition-transform duration-200
                   hover:scale-105 hover:shadow-xl active:scale-100"
        aria-label="Agrandir la couverture"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full h-full object-contain" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  )
}
