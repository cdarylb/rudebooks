'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function InviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 bg-surface-2 rounded-lg px-3 py-2 border border-edge">
      <code className="font-mono text-sm text-primary flex-1 tracking-widest">{code}</code>
      <button onClick={copy} className="text-ink-subtle hover:text-ink transition" title="Copier">
        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      </button>
    </div>
  )
}
