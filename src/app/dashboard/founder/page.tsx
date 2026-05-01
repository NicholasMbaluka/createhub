'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  role: string
  store_name?: string
  phone?: string
  created_at: string
}

interface Product {
  id: string
  user_id: string
  name: string
  price: number
  stock: number
  status: string
  created_at: string
  users: {
    store_name?: string
    email: string
  }
}

interface Order {
  id: string
  product_id: string
  user_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  status: string
  total_amount: number
  created_at: string
  products: {
    name: string
    price: number
    users: {
      store_name?: string
    }
  }
}

export default function FounderDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
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

    if (user?.role !== 'founder') {
      router.push('/dashboard/creator')
    }
  }

  const loadData = async () => {
    try {
      // Load all users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      // Load all products with user info
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          users (
            store_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      // Load all orders with product and user info
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            name,
            price,
            users (
              store_name
            )
          )
        `)
        .order('created_at', { ascending: false })

      setUsers(usersData || [])
      setProducts(productsData || [])
      setOrders(ordersData || [])

      // Calculate stats
      const totalRevenue = ordersData?.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total_amount, 0) || 0
      
      setStats({
        totalUsers: usersData?.length || 0,
        totalProducts: productsData?.length || 0,
        totalOrders: ordersData?.length || 0,
        totalRevenue
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUserStatus = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)

    if (!error) {
      loadData()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Navigation */}
      <nav className="glass">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CH</span>
              </div>
              <span className="text-xl font-bold text-white">CreateHub</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard/creator" className="nav-link">Creator View</Link>
              <button 
                className="btn-secondary"
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push('/auth/login')
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Founder Dashboard</h1>
          <p className="text-gray-300">Manage your creator marketplace platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-400">{stats.totalUsers}</div>
              <div className="text-sm text-gray-400 mt-1">Total Users</div>
            </div>
          </div>
          <div className="glass-card">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{stats.totalProducts}</div>
              <div className="text-sm text-gray-400 mt-1">Products</div>
            </div>
          </div>
          <div className="glass-card">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.totalOrders}</div>
              <div className="text-sm text-gray-400 mt-1">Orders</div>
            </div>
          </div>
          <div className="glass-card">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">${stats.totalRevenue.toFixed(0)}</div>
              <div className="text-sm text-gray-400 mt-1">Revenue</div>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="glass-card mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 text-gray-400">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400">Role</th>
                  <th className="text-left py-3 px-4 text-gray-400">Store</th>
                  <th className="text-left py-3 px-4 text-gray-400">Joined</th>
                  <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-dark-800">
                    <td className="py-3 px-4 text-white">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'founder' 
                          ? 'bg-purple-600/20 text-purple-400' 
                          : 'bg-primary-600/20 text-primary-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{user.store_name || '-'}</td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateUserStatus(user.id, e.target.value)}
                        className="bg-dark-800 border border-dark-700 rounded px-2 py-1 text-sm"
                      >
                        <option value="creator">Creator</option>
                        <option value="founder">Founder</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Products Section */}
        <div className="glass-card mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-dark-800/50 rounded-xl p-4 border border-dark-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-semibold">{product.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.status === 'active' 
                      ? 'bg-green-600/20 text-green-400' 
                      : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {product.status}
                  </span>
                </div>
                <p className="text-primary-400 font-semibold mb-2">${product.price}</p>
                <p className="text-gray-400 text-sm mb-2">Stock: {product.stock}</p>
                <p className="text-gray-500 text-xs">by {product.users.store_name || product.users.email}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Section */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-dark-800/50 rounded-xl p-4 border border-dark-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-semibold">{order.products.name}</h4>
                    <p className="text-gray-400">Customer: {order.buyer_name} ({order.buyer_email})</p>
                    <p className="text-gray-400">Store: {order.products.users.store_name || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-400 font-semibold">${order.total_amount}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'completed' 
                        ? 'bg-green-600/20 text-green-400'
                        : order.status === 'approved'
                        ? 'bg-blue-600/20 text-blue-400'
                        : order.status === 'rejected'
                        ? 'bg-red-600/20 text-red-400'
                        : 'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
