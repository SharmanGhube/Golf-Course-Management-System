'use client'

import { useAuthStore } from '@/lib/auth'
import { useQuery } from 'react-query'
import { dashboardAPI } from '@/lib/api'
import { Calendar, Target, Wrench, CreditCard, Clock, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface DashboardStats {
  upcoming_tee_times: number
  range_sessions: number
  equipment_rentals: number
  total_spent: number
}

interface ActivityItem {
  id: number
  type: string
  title: string
  description: string
  amount: number
  date: string
  status: string
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const { data: stats, isLoading } = useQuery<DashboardStats>(
    'dashboard-stats',
    () => dashboardAPI.getStats(),
    {
      enabled: isAuthenticated,
      refetchInterval: 30000, // Refresh every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  )

  const { data: activities, isLoading: activitiesLoading } = useQuery(
    'dashboard-activity',
    () => dashboardAPI.getRecentActivity(),
    {
      enabled: isAuthenticated,
      refetchInterval: 30000, // Refresh every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  )

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-400">
            Here&apos;s your golf activity overview
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-900 rounded-lg border border-dark-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Calendar className="text-blue-500" size={24} />
              <span className="text-2xl font-bold text-white">
                {isLoading ? '...' : stats?.upcoming_tee_times}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Upcoming Tee Times</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-900 rounded-lg border border-dark-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Target className="text-green-500" size={24} />
              <span className="text-2xl font-bold text-white">
                {isLoading ? '...' : stats?.range_sessions}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Range Sessions</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-dark-900 rounded-lg border border-dark-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Wrench className="text-purple-500" size={24} />
              <span className="text-2xl font-bold text-white">
                {isLoading ? '...' : stats?.equipment_rentals}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Equipment Rentals</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-dark-900 rounded-lg border border-dark-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="text-yellow-500" size={24} />
              <span className="text-2xl font-bold text-white">
                ${isLoading ? '...' : stats?.total_spent}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Total Spent</h3>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => router.push('/booking')}
              className="bg-dark-900 border border-dark-700 rounded-lg p-6 text-left hover:border-green-500 transition-colors group"
            >
              <Calendar className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-white font-semibold mb-2">Book Tee Time</h3>
              <p className="text-gray-400 text-sm">Schedule your next round</p>
            </button>

            <button
              onClick={() => router.push('/range')}
              className="bg-dark-900 border border-dark-700 rounded-lg p-6 text-left hover:border-green-500 transition-colors group"
            >
              <Target className="text-green-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-white font-semibold mb-2">Practice Range</h3>
              <p className="text-gray-400 text-sm">Book driving range session</p>
            </button>

            <button
              onClick={() => router.push('/equipment')}
              className="bg-dark-900 border border-dark-700 rounded-lg p-6 text-left hover:border-green-500 transition-colors group"
            >
              <Wrench className="text-purple-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-white font-semibold mb-2">Rent Equipment</h3>
              <p className="text-gray-400 text-sm">Browse available gear</p>
            </button>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-dark-900 rounded-lg border border-dark-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            <TrendingUp className="text-green-500" size={24} />
          </div>
          
          <div className="space-y-4">
            {activitiesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between py-3 border-b border-dark-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-dark-700 rounded"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-dark-700 rounded w-32"></div>
                          <div className="h-3 bg-dark-700 rounded w-48"></div>
                        </div>
                      </div>
                      <div className="h-3 bg-dark-700 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              activities.slice(0, 6).map((activity: ActivityItem, index: number) => (
                <div key={activity.id} className={`flex items-center justify-between py-3 ${index < activities.length - 1 ? 'border-b border-dark-700' : ''}`}>
                  <div className="flex items-center space-x-3">
                    {activity.type === 'tee_time' && <Calendar className="text-blue-500" size={20} />}
                    {activity.type === 'range_session' && <Target className="text-green-500" size={20} />}
                    {activity.type === 'equipment_rental' && <Wrench className="text-purple-500" size={20} />}
                    <div>
                      <p className="text-white font-medium">{activity.title}</p>
                      <p className="text-gray-400 text-sm">{activity.description}</p>
                      {activity.amount > 0 && (
                        <p className="text-green-400 text-xs">₹{activity.amount.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-sm">{activity.date}</span>
                    <div className="text-xs">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activity.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                        activity.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-400' :
                        activity.status === 'Active' ? 'bg-yellow-500/20 text-yellow-400' :
                        activity.status === 'Returned' ? 'bg-gray-500/20 text-gray-400' :
                        activity.status === 'Overdue' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No recent activity</div>
                <p className="text-gray-500 text-sm">Start booking to see your activity here</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
