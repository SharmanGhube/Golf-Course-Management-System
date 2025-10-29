'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Target, Clock, DollarSign, Calendar, Users, Check, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { format, addHours } from 'date-fns'

interface BucketPrice {
  id: string
  size: 'small' | 'medium' | 'large' | 'jumbo'
  ball_count: number
  price: number
  description: string
}

interface BucketPricesResponse {
  small: number
  medium: number
  large: number
  jumbo: number
  balls: {
    small: number
    medium: number
    large: number
    jumbo: number
  }
}

interface RangeSession {
  id: number
  user_id: number
  session_date: string
  start_time: string
  duration_minutes: number
  ball_bucket_size: string
  bucket_price: number
  bay_number?: number
  payment_status: string
  session_status: string
  created_at: string
  updated_at: string
}

export default function RangePage() {
  const { isAuthenticated, user, token } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [selectedBucket, setSelectedBucket] = useState<BucketPrice | null>(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(60) // minutes

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Fetch bucket prices
  const { data: bucketPricesData, isLoading: loadingPrices } = useQuery<BucketPricesResponse>(
    'bucket-prices',
    async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/range/bucket-prices`)
      if (!response.ok) throw new Error('Failed to fetch bucket prices')
      return response.json()
    }
  )

  // Transform the API response into the expected format
  const bucketPrices: BucketPrice[] = bucketPricesData ? [
    {
      id: 'small',
      size: 'small',
      ball_count: bucketPricesData.balls.small,
      price: bucketPricesData.small,
      description: 'Perfect for beginners or quick practice'
    },
    {
      id: 'medium',
      size: 'medium',
      ball_count: bucketPricesData.balls.medium,
      price: bucketPricesData.medium,
      description: 'Great for warming up and technique work'
    },
    {
      id: 'large',
      size: 'large',
      ball_count: bucketPricesData.balls.large,
      price: bucketPricesData.large,
      description: 'Ideal for longer practice sessions'
    },
    {
      id: 'jumbo',
      size: 'jumbo',
      ball_count: bucketPricesData.balls.jumbo,
      price: bucketPricesData.jumbo,
      description: 'Maximum practice for serious golfers'
    }
  ] : []

  // Fetch user's range sessions
  const { data: sessions } = useQuery<RangeSession[]>(
    'user-range-sessions',
    async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/range/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch sessions')
      return response.json()
    },
    {
      enabled: isAuthenticated
    }
  )

  // Book range session mutation
  const bookSessionMutation = useMutation(
    async (sessionData: any) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/range/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sessionData)
      })
      if (!response.ok) throw new Error('Failed to book range session')
      return response.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user-range-sessions'])
        setSelectedBucket(null)
        setSelectedTime('')
        alert('Range session booked successfully!')
      },
      onError: (error) => {
        alert('Failed to book range session. Please try again.')
        console.error('Booking error:', error)
      }
    }
  )

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const handleBooking = () => {
    if (!selectedBucket || !selectedTime) return

    const sessionData = {
      session_date: selectedDate,
      start_time: selectedTime,
      duration_minutes: duration,
      ball_bucket_size: selectedBucket.size,
      bay_number: 0
    }

    bookSessionMutation.mutate(sessionData)
  }

  const getBucketIcon = (size: string) => {
    switch (size) {
      case 'small': return '🥎'
      case 'medium': return '⚾'
      case 'large': return '🏀'
      case 'jumbo': return '🏈'
      default: return '⚾'
    }
  }

  const getBucketColor = (size: string) => {
    switch (size) {
      case 'small': return 'border-blue-500 bg-blue-500/10'
      case 'medium': return 'border-green-500 bg-green-500/10'
      case 'large': return 'border-yellow-500 bg-yellow-500/10'
      case 'jumbo': return 'border-purple-500 bg-purple-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Driving Range</h1>
          <p className="text-gray-400">Perfect your swing with our premium practice facility</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bucket Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-900 rounded-lg border border-dark-700 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Target className="mr-2" size={20} />
                Choose Your Bucket
              </h2>
              
              {loadingPrices ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bucketPrices.map((bucket) => (
                    <button
                      key={bucket.id}
                      onClick={() => setSelectedBucket(bucket)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedBucket?.id === bucket.id
                          ? getBucketColor(bucket.size)
                          : 'border-dark-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getBucketIcon(bucket.size)}</span>
                          <h3 className="text-white font-semibold capitalize">{bucket.size} Bucket</h3>
                        </div>
                        <span className="text-xl font-bold text-green-400">${bucket.price}</span>
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        {bucket.ball_count} balls • ${(bucket.price / bucket.ball_count).toFixed(3)} per ball
                      </div>
                      <div className="text-sm text-gray-500 mb-2">{bucket.description}</div>
                      {bucket.size === 'large' && (
                        <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded mt-2">
                          🏆 Most Popular
                        </div>
                      )}
                      {bucket.size === 'jumbo' && (
                        <div className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded mt-2">
                          💎 Best Value
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Date & Time Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-dark-900 rounded-lg border border-dark-700 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Calendar className="mr-2" size={20} />
                Schedule Your Session
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Start Time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                  >
                    <option value="">Select time</option>
                    {generateTimeSlots().map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-gray-400 text-sm mb-2">Session Duration</label>
                <div className="flex space-x-4">
                  {[30, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDuration(mins)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        duration === mins
                          ? 'border-green-500 bg-green-500/10 text-green-400'
                          : 'border-dark-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-dark-900 rounded-lg border border-dark-700 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Activity className="mr-2" size={20} />
                Recent Sessions
              </h2>
              
              {sessions && sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                      <div>
                        <div className="text-white font-medium">
                          {format(new Date(session.session_date), 'MMM d, yyyy')} at {session.start_time}
                        </div>
                        <div className="text-sm text-gray-400">
                          {session.ball_bucket_size} bucket • {session.duration_minutes} minutes
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-medium">${session.bucket_price}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          session.session_status === 'completed' 
                            ? 'bg-green-500/20 text-green-400'
                            : session.session_status === 'active'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {session.session_status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No range sessions yet. Book your first session!
                </div>
              )}
            </motion.div>
          </div>

          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-dark-900 rounded-lg border border-dark-700 p-6 h-fit"
          >
            <h2 className="text-xl font-bold text-white mb-6">Booking Summary</h2>
            
            {selectedBucket && selectedTime ? (
              <div className="space-y-4">
                <div className="border-b border-dark-700 pb-4">
                  <div className="text-gray-400 text-sm">Bucket Size</div>
                  <div className="text-white font-medium capitalize flex items-center">
                    <span className="mr-2">{getBucketIcon(selectedBucket.size)}</span>
                    {selectedBucket.size} ({selectedBucket.ball_count} balls)
                  </div>
                </div>
                
                <div className="border-b border-dark-700 pb-4">
                  <div className="text-gray-400 text-sm">Date & Time</div>
                  <div className="text-white font-medium">
                    {format(new Date(selectedDate), 'EEEE, MMMM d')} at {selectedTime}
                  </div>
                </div>
                
                <div className="border-b border-dark-700 pb-4">
                  <div className="text-gray-400 text-sm">Duration</div>
                  <div className="text-white font-medium">{duration} minutes</div>
                </div>
                
                {/* Pricing Breakdown */}
                <div className="border-b border-dark-700 pb-4">
                  <div className="text-gray-400 text-sm mb-2">Pricing Details</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-white">
                      <span>Bucket Fee ({selectedBucket.size})</span>
                      <span>${selectedBucket.price}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>Bay Usage ({duration} minutes)</span>
                      <span>Included</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>Equipment Rental</span>
                      <span>Included</span>
                    </div>
                    {duration > 60 && (
                      <div className="flex justify-between text-green-400 text-sm">
                        <span>Extended Session Bonus</span>
                        <span>Free tees included</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-b border-dark-700 pb-4">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-400">${selectedBucket.price}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Price per ball: ${(selectedBucket.price / selectedBucket.ball_count).toFixed(3)}
                  </div>
                </div>
                
                <button
                  onClick={handleBooking}
                  disabled={bookSessionMutation.isLoading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookSessionMutation.isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Booking...</span>
                    </div>
                  ) : (
                    <>
                      <Check className="mr-2" size={20} />
                      Book Session
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                Select bucket and time to see booking details
              </div>
            )}
            
            {/* Range Information */}
            <div className="mt-8 pt-6 border-t border-dark-700">
              <h3 className="text-white font-semibold mb-4">Range Information & Pricing</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock size={16} />
                  <span>Open 6:00 AM - 9:00 PM daily</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Target size={16} />
                  <span>50 covered bays with distance markers</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Users size={16} />
                  <span>Professional instruction available</span>
                </div>
                
                {/* Pricing Benefits */}
                <div className="mt-4 pt-3 border-t border-dark-600">
                  <div className="text-green-400 font-medium mb-2">What&apos;s Included:</div>
                  <ul className="space-y-1 text-gray-300 text-xs">
                    <li>• Premium range balls</li>
                    <li>• Bay rental for session duration</li>
                    <li>• Club cleaning station access</li>
                    <li>• Distance markers up to 300 yards</li>
                    <li>• Covered bay protection</li>
                  </ul>
                </div>
                
                {/* Value Proposition */}
                <div className="mt-3 p-3 bg-dark-800 rounded-lg">
                  <div className="text-yellow-400 font-medium text-xs mb-1">💡 Pro Tip</div>
                  <div className="text-gray-300 text-xs">
                    Large and Jumbo buckets offer better value per ball for extended practice sessions!
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
