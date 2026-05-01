'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  description: string
  image_url: string
}

interface Creator {
  store_name: string
  phone: string
}

export default function CreatorDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [creator, setCreator] = useState<Creator | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadData()
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

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Load products
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', session.user.id)

    // Get user info
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    setProducts(productsData || [])
    setCreator(userData)
    setLoading(false)
  }

  const handleDeleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (!error) {
      loadData()
    }
  }

  if (loading) {
    return <div className="container">Loading...</div>
  }

  return (
    <div className="container">
      <nav className="nav">
        <div className="nav-brand">CreateHub</div>
        <div className="nav-links">
          <Link href="/dashboard/creator" className="nav-link">Dashboard</Link>
          <button 
            className="nav-btn"
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/auth/login')
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="page">
        <h1>{creator?.store_name || 'Creator Dashboard'}</h1>
        
        {/* Store Info */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Store Information</h3>
          <p><strong>Store Name:</strong> {creator?.store_name}</p>
          <p><strong>WhatsApp:</strong> {creator?.phone}</p>
          <p><strong>Your Public Link:</strong></p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="text" 
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/store/${creator?.store_name}`}
              readOnly
              style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
            />
            <button 
              onClick={() => navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/store/${creator?.store_name}`)}
              className="btn-secondary"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Products Section */}
        <div className="card">
          <h2>Products</h2>
          {products.length === 0 ? (
            <p>No products yet. Create your first product!</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {products.map(product => (
                <div key={product.id} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3>{product.name}</h3>
                      <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${product.price}</p>
                      <p>{product.description}</p>
                      <p>Stock: {product.stock}</p>
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          style={{ maxWidth: '100px', height: 'auto', borderRadius: '4px' }}
                        />
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn-secondary"
                        onClick={() => router.push(`/dashboard/creator/products/${product.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button 
            className="btn-primary" 
            style={{ marginTop: '1rem', width: 'auto' }}
            onClick={() => router.push('/dashboard/creator/products/new')}
          >
            Add Product
          </button>
        </div>

        {/* WhatsApp Info */}
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>How Orders Work</h3>
          <p>Customers will order directly through your WhatsApp</p>
          <p>No order management needed - you handle everything through WhatsApp!</p>
          <p><strong>Your WhatsApp:</strong> {creator?.phone}</p>
        </div>
      </div>
    </div>
  )
}
