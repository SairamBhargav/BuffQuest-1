'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    if (!email.toLowerCase().endsWith('@colorado.edu')) {
      setError('Registration is restricted to valid @colorado.edu email addresses.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: email.split('@')[0],
      })

      if (error) {
        setError(error.message || 'Registration failed')
      } else {
        setMessage('Registration successful! Please check your email to verify your account.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      if (!message) {
        setLoading(false)
      }
    }
  }

  return (
    <div className="auth-bg flex min-h-[100dvh] flex-col items-center justify-center p-4" style={{ paddingTop: 'max(var(--sat), 1rem)', paddingBottom: 'max(var(--sab), 1rem)', paddingLeft: 'max(var(--sal), 1rem)', paddingRight: 'max(var(--sar), 1rem)' }}>
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md space-y-6 liquid-glass-dark rounded-[40px] p-8 sm:p-10"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
            className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]"
          >
            <span className="text-4xl">🎓</span>
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">Join BuffQuest</h1>
          <p className="text-sm text-slate-400 font-medium">
            Create your account with a CU Boulder email
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest text-slate-400 uppercase ml-2">Email</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 transition-all font-medium"
              placeholder="ralphie@colorado.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest text-slate-400 uppercase ml-2">Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest text-slate-400 uppercase ml-2">Confirm Password</label>
            <input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 transition-all font-medium"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-center px-1">
            <Link href="/login" className="text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors">
              Already have an account? Sign in
            </Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full squishy-btn text-yellow-900 font-black py-4 rounded-[28px] uppercase tracking-widest text-base border-2 border-white/60 shadow-xl disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-yellow-900/30 border-t-yellow-900 rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </form>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass-gold rounded-2xl px-5 py-3 text-center text-sm font-bold text-yellow-300"
          >
            {message}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="liquid-glass-red rounded-2xl px-5 py-3 text-center text-sm font-bold text-red-300"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
