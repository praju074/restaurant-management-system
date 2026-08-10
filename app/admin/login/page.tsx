import Link from 'next/link'
import { ArrowRight, Lock, Mail } from 'lucide-react'

export default function AdminLoginPage() {
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

          <form className="login-form" action="#">
            <label>
              <span>Email</span>
              <div className="input-icon">
                <Mail size={16} />
                <input type="email" placeholder="admin@veranda.com" required />
              </div>
            </label>

            <label>
              <span>Password</span>
              <div className="input-icon">
                <Lock size={16} />
                <input type="password" placeholder="••••••••" required />
              </div>
            </label>

            <button type="submit" className="primary-button full">
              Sign in <ArrowRight size={16} />
            </button>

            <p className="login-note">
              No account? <Link href="/admin">Continue to dashboard</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  )
}
