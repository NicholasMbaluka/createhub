import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [showCreatorSignup, setShowCreatorSignup] = useState(false)

  const handleCreatorSignup = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = `/auth/register?email=${encodeURIComponent(email)}&role=creator`
  }

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Navigation */}
      <nav className="fixed top-0 w-full glass z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CH</span>
              </div>
              <span className="text-xl font-bold text-white">CreateHub</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/auth/login" className="nav-link">Login</Link>
              <button 
                className="btn-primary"
                onClick={() => setShowCreatorSignup(true)}
              >
                Start Selling
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Build. Sell. Grow.
                  <span className="text-gradient"> Together.</span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                  The ultimate creator marketplace. Upload products, manage orders, and grow your business - all in one powerful platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className="btn-primary text-lg"
                  onClick={() => setShowCreatorSignup(true)}
                >
                  Start Selling
                  <span className="ml-2">→</span>
                </button>
                <button 
                  className="btn-secondary text-lg"
                  onClick={scrollToFeatures}
                >
                  Explore Features
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-400">1,000+</div>
                  <div className="text-sm text-gray-400">Creators</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-400">$2M+</div>
                  <div className="text-sm text-gray-400">Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-400">99.9%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <div className="glass-card glow">
                <div className="space-y-4">
                  {/* Dashboard Preview */}
                  <div className="bg-dark-900/50 rounded-xl p-4 border border-dark-800/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">CH</span>
                        </div>
                        <div>
                          <div className="text-white font-semibold">Creator Dashboard</div>
                          <div className="text-gray-400 text-sm">Manage your store</div>
                        </div>
                      </div>
                      <div className="text-primary-400">●●●</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-dark-800/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-primary-400">24</div>
                        <div className="text-xs text-gray-400">Products</div>
                      </div>
                      <div className="bg-dark-800/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-400">156</div>
                        <div className="text-xs text-gray-400">Orders</div>
                      </div>
                      <div className="bg-dark-800/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-yellow-400">$8.4k</div>
                        <div className="text-xs text-gray-400">Revenue</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-dark-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">Digital Art Pack</div>
                            <div className="text-gray-400 text-sm">12 orders pending</div>
                          </div>
                          <div className="text-primary-400 font-semibold">$49</div>
                        </div>
                      </div>
                      <div className="bg-dark-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">Video Course</div>
                            <div className="text-gray-400 text-sm">8 orders pending</div>
                          </div>
                          <div className="text-primary-400 font-semibold">$99</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-dark-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-white">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to help creators build, manage, and grow their digital business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4 group-hover:glow">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Product Upload</h3>
              <p className="text-gray-300">
                Upload unlimited products with images, descriptions, and pricing. Support for digital and physical goods.
              </p>
            </div>

            <div className="glass-card group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4 group-hover:glow">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Order Management</h3>
              <p className="text-gray-300">
                Streamlined order processing with status tracking, customer communication, and fulfillment tools.
              </p>
            </div>

            <div className="glass-card group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4 group-hover:glow">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Analytics Dashboard</h3>
              <p className="text-gray-300">
                Real-time insights into sales, revenue, customer behavior, and growth metrics.
              </p>
            </div>

            <div className="glass-card group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4 group-hover:glow">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure Payments</h3>
              <p className="text-gray-300">
                Integrated payment processing with multiple gateways and automatic fraud detection.
              </p>
            </div>

            <div className="glass-card group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4 group-hover:glow">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Creator Support</h3>
              <p className="text-gray-300">
                24/7 support team, extensive documentation, and creator community to help you succeed.
              </p>
            </div>

            <div className="glass-card group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4 group-hover:glow">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Marketing Tools</h3>
              <p className="text-gray-300">
                Built-in marketing features including discount codes, email campaigns, and social media integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="glass-card inline-block">
            <div className="text-3xl font-bold text-gradient mb-2">Join 1,000+ Creators</div>
            <div className="text-gray-300">Building their businesses on CreateHub</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">CH</span>
              </div>
              <span className="text-white">CreateHub</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 CreateHub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Creator Signup Modal */}
      {showCreatorSignup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="glass-card max-w-md w-full animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Start Your Creator Journey</h2>
              <button 
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowCreatorSignup(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreatorSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full text-lg">
                Create Your Store
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary-400 hover:text-primary-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
