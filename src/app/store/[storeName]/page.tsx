'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  price: number
  description: string
  image_url: string
  stock: number
}

interface Creator {
  store_name: string
  phone: string
}

export default function PublicStore() {
  const [products, setProducts] = useState<Product[]>([])
  const [creator, setCreator] = useState<Creator | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [orderForm, setOrderForm] = useState({
    buyerName: '',
    buyerPhone: '',
    location: ''
  })
  const params = useParams()

  useEffect(() => {
    if (params.storeName) {
      fetchStoreData()
    }
  }, [params.storeName])

  const fetchStoreData = async () => {
    try {
      // Get creator by store name
      const { data: creatorData } = await supabase
        .from('creators')
        .select('*')
        .eq('store_name', params.storeName)
        .single()

      if (!creatorData) {
        setLoading(false)
        return
      }

      setCreator(creatorData)

      // Get products for this creator
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('creator_id', creatorData.user_id)
        .gt('stock', 0) // Only show products with stock
        .order('created_at', { ascending: false })

      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching store data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderClick = (product: Product) => {
    setSelectedProduct(product)
    setShowOrderModal(true)
  }

  const handleSubmitToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProduct || !creator) return

    const message = `Hello! I'd like to order:\n\n` +
      `📦 Product: ${selectedProduct.name}\n` +
      `💰 Price: $${selectedProduct.price}\n` +
      `📝 Description: ${selectedProduct.description}\n` +
      `📍 Location: ${orderForm.location}\n` +
      `📞 My Phone: ${orderForm.buyerPhone}\n` +
      `👤 Name: ${orderForm.buyerName}`

    const whatsappUrl = `https://wa.me/${creator.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank')
    
    // Reset form and close modal
    setOrderForm({ buyerName: '', buyerPhone: '', location: '' })
    setShowOrderModal(false)
    setSelectedProduct(null)
  }

  if (loading) {
    return <div className="container"><p>Loading store...</p></div>
  }

  if (!creator) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <h1>Store Not Found</h1>
          <p>This store doesn't exist or has been removed.</p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {/* Store Header */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>{creator.store_name}</h1>
        <p>Browse our products and order via WhatsApp</p>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>No Products Available</h2>
          <p>This store doesn't have any products in stock right now.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {products.map((product) => (
            <div key={product.id} className="card">
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover',
                    borderRadius: '8px 8px 0 0'
                  }}
                />
              )}
              <div style={{ padding: '1rem' }}>
                <h3>{product.name}</h3>
                <p style={{ 
                  color: 'var(--primary)', 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  margin: '0.5rem 0'
                }}>
                  ${product.price}
                </p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {product.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    color: product.stock > 5 ? 'var(--secondary)' : 'var(--warning)',
                    fontSize: '0.9rem'
                  }}>
                    {product.stock > 5 ? `${product.stock} in stock` : `Only ${product.stock} left!`}
                  </span>
                  <button 
                    className="btn-primary"
                    onClick={() => handleOrderClick(product)}
                    disabled={product.stock === 0}
                  >
                    Order via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            maxWidth: '500px', 
            width: '90%', 
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Order Details</h3>
              <button 
                onClick={() => setShowOrderModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <h4>{selectedProduct.name}</h4>
              <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                ${selectedProduct.price}
              </p>
              <p>{selectedProduct.description}</p>
            </div>

            <form onSubmit={handleSubmitToWhatsApp}>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={orderForm.buyerName}
                  onChange={(e) => setOrderForm({...orderForm, buyerName: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Your Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={orderForm.buyerPhone}
                  onChange={(e) => setOrderForm({...orderForm, buyerPhone: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Delivery Location</label>
                <textarea
                  placeholder="Enter your delivery address/location"
                  value={orderForm.location}
                  onChange={(e) => setOrderForm({...orderForm, location: e.target.value})}
                  rows={3}
                  required
                />
              </div>
              
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Send Order via WhatsApp
              </button>
            </form>

            <p style={{ 
              fontSize: '0.9rem', 
              color: 'var(--text-secondary)', 
              textAlign: 'center',
              marginTop: '1rem'
            }}>
              You'll be redirected to WhatsApp to complete your order
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
