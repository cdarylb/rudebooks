'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', libraryName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Échec de l'inscription")
      setLoading(false)
      return
    }
    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
      <h2 className="font-heading text-xl font-semibold text-ink">Créer votre bibliothèque</h2>

      {error && (
        <div className="bg-red-950/50 border border-red-800/60 text-red-400 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {[
        { label: 'Votre nom', field: 'name', type: 'text', placeholder: 'Alice' },
        { label: 'Email', field: 'email', type: 'email', placeholder: 'vous@exemple.com' },
        { label: 'Mot de passe', field: 'password', type: 'password', placeholder: 'Min. 8 caractères' },
      ].map(({ label, field, type, placeholder }) => (
        <div key={field} className="space-y-1">
          <label className="text-sm font-medium text-ink-muted">{label}</label>
          <input type={type} value={form[field as keyof typeof form]} onChange={set(field)}
            required className="field" placeholder={placeholder} />
        </div>
      ))}

      <div className="space-y-1 pt-1">
        <label className="text-sm font-medium text-ink-muted flex items-center gap-1.5">
          <BookOpen size={14} className="text-primary" />
          Nom de la bibliothèque
        </label>
        <input type="text" value={form.libraryName} onChange={set('libraryName')}
          required className="field" placeholder="La bibliothèque de la maison" />
      </div>

      <button type="submit" disabled={loading}
        className="w-full gradient-primary text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50">
        {loading ? 'Création…' : 'Créer la bibliothèque et se connecter'}
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
