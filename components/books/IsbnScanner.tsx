'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
import { Camera, ImageIcon } from 'lucide-react'

interface IsbnScannerProps {
  onDetected: (isbn: string) => void
}

function parseIsbn(text: string): string | null {
  const clean = text.replace(/[-\s]/g, '')
  return /^(97[89]\d{10}|\d{9}[\dXx])$/.test(clean) ? clean : null
}

export default function IsbnScanner({ onDetected }: IsbnScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [detected, setDetected] = useState<string | null>(null)
  const [decoding, setDecoding] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let active = true

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        })
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return }

        streamRef.current = stream
        const video = videoRef.current!
        video.srcObject = stream
        await video.play()
        setCameraReady(true)

        reader.decodeFromStream(stream, video, (result, err) => {
          if (!active) return
          if (result) {
            const isbn = parseIsbn(result.getText())
            if (isbn) {
              setDetected(isbn)
              reader.reset()
              onDetected(isbn)
            }
          }
          if (err && !(err instanceof NotFoundException)) {
            console.warn('[scanner]', err.message)
          }
        })
      } catch {
        if (active) setCameraError(true)
      }
    }

    start()
    return () => {
      active = false
      reader.reset()
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [onDetected])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setDecoding(true)
    setFileError(null)
    try {
      const url = URL.createObjectURL(file)
      const reader = new BrowserMultiFormatReader()
      const result = await reader.decodeFromImageUrl(url)
      URL.revokeObjectURL(url)
      const isbn = parseIsbn(result.getText())
      if (isbn) {
        setDetected(isbn)
        onDetected(isbn)
      } else {
        setFileError('Code-barres trouvé mais pas un ISBN.')
      }
    } catch {
      setFileError('Impossible de lire un code-barres dans cette image.')
    } finally {
      setDecoding(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {/* Flux caméra — visible seulement si disponible */}
      <div className={`relative rounded-2xl overflow-hidden bg-black aspect-[4/3] ${cameraError ? 'hidden' : ''}`}>
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />

        {!cameraReady && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera size={32} className="text-white/30 animate-pulse" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-56 h-24 border-2 border-white/30 rounded-lg relative">
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br" />
          </div>
        </div>

        {detected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 animate-fade-in">
            <div className="text-center text-white">
              <div className="text-2xl mb-1">✓</div>
              <p className="font-mono text-sm">{detected}</p>
              <p className="text-xs text-white/60 mt-1">Recherche du livre…</p>
            </div>
          </div>
        )}
      </div>

      {/* Bouton photo — primaire si caméra indisponible */}
      <label className={`flex flex-col items-center justify-center gap-2 rounded-2xl py-6 text-sm transition cursor-pointer
        ${cameraError
          ? 'gradient-primary text-white font-medium shadow-glow'
          : 'border border-dashed border-edge text-ink-muted hover:border-primary/40 hover:text-primary'
        }`}>
        <ImageIcon size={cameraError ? 28 : 16} />
        {decoding ? 'Décodage…' : cameraError ? 'Prendre une photo du code-barres' : 'Importer une photo'}
        {cameraError && (
          <span className="text-xs opacity-75">Pointe vers le code-barres et prends une photo</span>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />
      </label>

      {fileError && (
        <p className="text-xs text-red-400 text-center">{fileError}</p>
      )}
    </div>
  )
}
