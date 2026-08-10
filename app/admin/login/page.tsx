'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    if (email.toLowerCase() !== 'admin@veranda.com' || password !== 'veranda123') {
      setError('Invalid credentials. Use admin@veranda.com / veranda123')
      return
    }

    setError('')
    router.push('/admin')
  }

  return (
    <div className="app-shell login-page">
      <main className="login-panel">
        <div className="login-cover">
          <div className="login-cover-copy">
            <span className="eyebrow">Admin access</span>
            <h1>Secure restaurant dashboard login.</h1>
            <p>Sign in to manage orders, kitchen flow, billing, and menu operations.</p>
          </div>
        </div>

        <section className="login-form-card">
          <div className="login-header">
            <div>
              <span className="eyebrow">Welcome back</span>
              <h2>Administrator sign in</h2>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              <span>Email</span>
              <div className="input-icon">
                <Mail size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@veranda.com"
                  required
                />
              </div>
            </label>

            <label>
              <span>Password</span>
              <div className="input-icon">
                <Lock size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </label>

            {error ? <div className="login-error">{error}</div> : null}

            <button type="submit" className="primary-button full">
              Sign in <ArrowRight size={16} />
            </button>

            <p className="login-note">
              Demo credentials: <strong>admin@veranda.com / veranda123</strong>
            </p>
            <p className="login-note">
              Already signed in? <Link href="/admin">Continue to dashboard</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  )
}
