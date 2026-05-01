'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NewProduct() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image_url: '',
    stock: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
      return
    }

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (user?.role !== 'creator') {
      router.push('/auth/login')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('products')
        .insert([
          {
            creator_id: session.user.id,
            name: formData.name,
            price: parseFloat(formData.price),
            description: formData.description,
            image_url: formData.image_url || null,
            stock: parseInt(formData.stock),
            created_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      router.push('/dashboard/creator')
    } catch (error: any) {
      setError(error.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h1>Add New Product</h1>
        <p>Create a new product for your store</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Describe your product..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Image URL (optional)</label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Stock Quantity</label>
            <input
              type="number"
              placeholder="0"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              required
            />
          </div>
          
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => router.push('/dashboard/creator')}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
