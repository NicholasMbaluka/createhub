'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [storeName, setStoreName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'creator' | 'founder'>('creator')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role
          }
        }
      })

      if (error) throw error

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user!.id,
            email,
            role,
            created_at: new Date().toISOString()
          }
        ])

      if (profileError) throw profileError

      // Create creator profile if role is creator
      if (role === 'creator') {
        const { error: creatorError } = await supabase
          .from('creators')
          .insert([
            {
              user_id: data.user!.id,
              store_name: storeName,
              phone: phone,
              created_at: new Date().toISOString()
            }
          ])

        if (creatorError) throw creatorError
      }

      router.push('/auth/login?message=Registration successful')
    } catch (error: any) {
      setError(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <h1>Register</h1>
        <p>Create your account</p>
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <select value={role} onChange={(e) => setRole(e.target.value as 'creator' | 'founder')}>
              <option value="creator">Creator</option>
              <option value="founder">Founder</option>
            </select>
          </div>
          
          {role === 'creator' && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Store Name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
