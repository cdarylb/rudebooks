'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, KeyRound } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [mode, setMode]     = useState<'create' | 'join'>('create')
  const [form, setForm]     = useState({ name: '', email: '', password: '', libraryName: '', inviteCode: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = mode === 'join'
      ? { name: form.name, email: form.email, password: form.password, inviteCode: form.inviteCode.trim().toUpperCase() }
      : { name: form.name, email: form.email, password: form.password, libraryName: form.libraryName }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(typeof data.error === 'string' ? data.error : "Échec de l'inscription")
      setLoading(false)
      return
    }

    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
      <h2 className="font-heading text-xl font-semibold text-ink">Créer une bibliothèque</h2>

      {/* Toggle mode */}
      <div className="flex gap-1 p-1 bg-surface-2 rounded-xl">
        <button type="button" onClick={() => setMode('create')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${
            mode === 'create' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
          }`}>
          <BookOpen size={14} />
          Créer 
        </button>
        <button type="button" onClick={() => setMode('join')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${
            mode === 'join' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
          }`}>
          <KeyRound size={14} />
          Rejoindre
        </button>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800/60 text-red-400 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-ink-muted">Votre nom</label>
        <input type="text" value={form.name} onChange={set('name')}
          required className="field" placeholder="Alice" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-ink-muted">Email</label>
        <input type="email" value={form.email} onChange={set('email')}
          required autoComplete="email" className="field" placeholder="vous@exemple.com" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-ink-muted">Mot de passe</label>
        <input type="password" value={form.password} onChange={set('password')}
          required autoComplete="new-password" className="field" placeholder="Min. 8 caractères" />
      </div>

      {mode === 'create' ? (
        <div className="space-y-1">
          <label className="text-sm font-medium text-ink-muted flex items-center gap-1.5">
            <BookOpen size={14} className="text-primary" />
            Nom de la bibliothèque
          </label>
          <input type="text" value={form.libraryName} onChange={set('libraryName')}
            required className="field" placeholder="La bibliothèque de la maison" />
        </div>
      ) : (
        <div className="space-y-1">
          <label className="text-sm font-medium text-ink-muted flex items-center gap-1.5">
            <KeyRound size={14} className="text-primary" />
            Code d'invitation
          </label>
          <input type="text" value={form.inviteCode} onChange={set('inviteCode')}
            required className="field font-mono uppercase tracking-widest"
            placeholder="XXXXXX" maxLength={12} />
          <p className="text-xs text-ink-subtle">Demandez ce code à l'administrateur de la bibliothèque</p>
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full gradient-primary text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50">
        {loading ? 'Création…' : mode === 'create' ? 'Créer' : 'Rejoindre'}
      </button>

      <p className="text-center text-sm text-ink-muted">
        Déjà un compte ?{' '}
        <Link href="/signin" className="text-primary font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  )
}
