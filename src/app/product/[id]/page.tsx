'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  price: number
  description: string
  image_url: string
  stock: number
  status: string
  users: {
    store_name?: string
    email: string
  }
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderForm, setOrderForm] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    notes: ''
  })
  const [orderLoading, setOrderLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string)
    }
  }, [params.id])

  const loadProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users (
            store_name,
            email
          )
        `)
        .eq('id', productId)
        .eq('status', 'active')
        .single()

      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setOrderLoading(true)

    try {
      const { error } = await supabase
        .from('orders')
        .insert([
          {
            product_id: product!.id,
            user_id: product!.user_id,
            buyer_name: orderForm.buyer_name,
            buyer_email: orderForm.buyer_email,
            buyer_phone: orderForm.buyer_phone,
            notes: orderForm.notes,
            total_amount: product!.price,
            status: 'pending'
          }
        ])

      if (error) throw error

      setShowOrderModal(false)
      setOrderForm({
        buyer_name: '',
        buyer_email: '',
        buyer_phone: '',
        notes: ''
      })
      
      alert('Order submitted successfully! The creator will contact you soon.')
    } catch (error: any) {
      alert(error.message || 'Failed to submit order')
    } finally {
      setOrderLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Navigation */}
      <nav className="glass">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CH</span>
              </div>
              <span className="text-xl font-bold text-white">CreateHub</span>
            </Link>
            <Link href="/auth/login" className="btn-primary">
              Creator Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <div className="glass-card">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-96 bg-dark-800 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-gray-400">Product Image</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
              <p className="text-gray-300 mb-4">{product.description}</p>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-primary-400">${product.price}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  product.stock > 0 
                    ? 'bg-green-600/20 text-green-400' 
                    : 'bg-red-600/20 text-red-400'
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-2">Store Information</h3>
              <p className="text-gray-300">{product.users.store_name || 'Independent Creator'}</p>
              <p className="text-gray-400 text-sm">Contact via order submission</p>
            </div>

            <button
              onClick={() => setShowOrderModal(true)}
              className="btn-primary w-full text-lg py-4"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Place Order'}
            </button>

            <div className="text-center text-gray-400 text-sm">
              No account required • Secure ordering • Direct creator contact
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="glass-card max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Place Your Order</h2>
              <button 
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowOrderModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="mb-6 p-4 bg-dark-800/50 rounded-xl border border-dark-700">
              <h3 className="text-white font-semibold mb-2">{product.name}</h3>
              <p className="text-primary-400 font-bold">${product.price}</p>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={orderForm.buyer_name}
                  onChange={(e) => setOrderForm({...orderForm, buyer_name: e.target.value})}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={orderForm.buyer_email}
                  onChange={(e) => setOrderForm({...orderForm, buyer_email: e.target.value})}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={orderForm.buyer_phone}
                  onChange={(e) => setOrderForm({...orderForm, buyer_phone: e.target.value})}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Any special requests or questions..."
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <button type="submit" className="btn-primary w-full" disabled={orderLoading}>
                {orderLoading ? 'Submitting...' : `Submit Order - $${product.price}`}
              </button>
            </form>

            <div className="mt-4 text-center text-gray-400 text-xs">
              Your order will be sent directly to the creator for processing
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
