import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [showCreatorSignup, setShowCreatorSignup] = useState(false)

  const handleCreatorSignup = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = `/auth/register?email=${encodeURIComponent(email)}&role=creator`
  }

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>CreateHub</h1>
          </div>
          <div className="nav-links">
            <Link href="/auth/login" className="nav-link">Login</Link>
            <button 
              className="btn-primary"
              onClick={() => setShowCreatorSignup(true)}
            >
              Start Selling
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Sell Your Products
                <span className="highlight"> Directly</span>
              </h1>
              <p className="hero-subtitle">
                No commissions, no order management. Just you, your products, and customers connecting through WhatsApp.
              </p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">0%</span>
                  <span className="stat-label">Commission</span>
                </div>
                <div className="stat">
                  <span className="stat-number">∞</span>
                  <span className="stat-label">Products</span>
                </div>
                <div className="stat">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">WhatsApp</span>
                </div>
              </div>
              <button 
                className="hero-cta"
                onClick={() => setShowCreatorSignup(true)}
              >
                Start Your Store
                <span className="cta-arrow">→</span>
              </button>
            </div>
            <div className="hero-visual">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="app-header">
                    <div className="app-logo">CH</div>
                    <div className="app-title">CreateHub</div>
                  </div>
                  <div className="product-card">
                    <div className="product-image">
                      <div className="image-placeholder">📦</div>
                    </div>
                    <div className="product-info">
                      <h3>Digital Product</h3>
                      <p className="price">$29.99</p>
                      <div className="product-meta">
                        <span className="stock">5 in stock</span>
                      </div>
                    </div>
                  </div>
                  <div className="whatsapp-button">
                    <div className="whatsapp-icon">📱</div>
                    <span>Order via WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🛍️</div>
              <h3>Create Store</h3>
              <p>Set up your digital store in minutes. Add products, set prices, manage stock.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>WhatsApp Orders</h3>
              <p>Customers order directly through your WhatsApp. No platform fees, no delays.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Keep 100%</h3>
              <p>No commissions, no hidden fees. You keep all your earnings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Signup Modal */}
      {showCreatorSignup && (
        <div className="modal-overlay" onClick={() => setShowCreatorSignup(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Start Selling Today</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreatorSignup(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreatorSignup} className="signup-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary full-width">
                Create Your Store
              </button>
            </form>
            <div className="modal-footer">
              <p>Already have an account? <Link href="/auth/login">Sign in</Link></p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
