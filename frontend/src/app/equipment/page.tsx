'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Wrench, Calendar, Clock, DollarSign, Package, Check, ArrowLeft, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { format, addDays } from 'date-fns'

interface Equipment {
  id: number
  name: string
  category: string
  description: string
  daily_rate: number
  hourly_rate: number
  is_available: boolean
  image_url?: string
}

interface Rental {
  id: number
  user_id: number
  equipment_id: number
  rental_date: string
  return_date?: string
  quantity: number
  rental_price: number
  deposit_amount: number
  payment_status: string
  rental_status: string
  notes: string
  created_at: string
  updated_at: string
  equipment?: Equipment
}

export default function EquipmentPage() {
  const { isAuthenticated, user, token } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [rentalDays, setRentalDays] = useState(1)
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Fetch equipment
  const { data: equipment, isLoading: loadingEquipment } = useQuery<Equipment[]>(
    ['equipment', selectedCategory],
    async () => {
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipment${params}`)
      if (!response.ok) throw new Error('Failed to fetch equipment')
      return response.json()
    }
  )

  // Fetch user's rentals
  const { data: rentals } = useQuery<Rental[]>(
    'user-rentals',
    async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipment/rentals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch rentals')
      return response.json()
    },
    {
      enabled: isAuthenticated
    }
  )

  // Rent equipment mutation
  const rentEquipmentMutation = useMutation(
    async (rentalData: any) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipment/rentals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rentalData)
      })
      if (!response.ok) throw new Error('Failed to rent equipment')
      return response.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user-rentals'])
        queryClient.invalidateQueries(['equipment'])
        setSelectedEquipment(null)
        alert('Equipment rented successfully!')
      },
      onError: (error) => {
        alert('Failed to rent equipment. Please try again.')
        console.error('Rental error:', error)
      }
    }
  )

  // Return equipment mutation
  const returnEquipmentMutation = useMutation(
    async (rentalId: number) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipment/rentals/${rentalId}/return`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to return equipment')
      return response.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user-rentals'])
        queryClient.invalidateQueries(['equipment'])
        alert('Equipment returned successfully!')
      }
    }
  )

  const categories = [
    { id: 'all', name: 'All Equipment', icon: '🏌️' },
    { id: 'clubs', name: 'Golf Clubs', icon: '🏌️' },
    { id: 'carts', name: 'Golf Carts', icon: '🛒' },
    { id: 'accessories', name: 'Accessories', icon: '🎒' },
    { id: 'apparel', name: 'Apparel', icon: '👕' }
  ]

  const handleRental = () => {
    if (!selectedEquipment) return

    const endDate = addDays(new Date(startDate), rentalDays)
    const rentalData = {
      equipment_id: selectedEquipment.id,
      rental_date: startDate,
      return_date: format(endDate, 'yyyy-MM-dd'),
      quantity: 1,
      notes: ''
    }

    rentEquipmentMutation.mutate(rentalData)
  }

  const calculateTotal = () => {
    if (!selectedEquipment) return 0
    
    let baseTotal = selectedEquipment.daily_rate * rentalDays
    let discount = 0
    
    // Apply discounts based on rental duration
    if (rentalDays >= 7) {
      discount = baseTotal * 0.15 // 15% off for weekly rentals
    } else if (rentalDays >= 3) {
      discount = baseTotal * 0.1 // 10% off for 3-6 day rentals
    }
    
    return baseTotal - discount
  }

  const getEquipmentIcon = (category: string) => {
    switch (category) {
      case 'clubs': return '🏌️'
      case 'carts': return '🛒'
      case 'accessories': return '🎒'
      case 'apparel': return '👕'
      default: return '📦'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rented': return 'bg-blue-500/20 text-blue-400'
      case 'returned': return 'bg-green-500/20 text-green-400'
      case 'overdue': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (selectedEquipment) {
    return (
      <div className="min-h-screen bg-dark-950 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedEquipment(null)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Equipment</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Equipment Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-dark-900 rounded-lg border border-dark-700 p-6"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{getEquipmentIcon(selectedEquipment.category)}</div>
                <h1 className="text-2xl font-bold text-white mb-2">{selectedEquipment.name}</h1>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm capitalize">
                  {selectedEquipment.category}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-2">Description</h3>
                  <p className="text-gray-400">{selectedEquipment.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Daily Rate</div>
                    <div className="text-2xl font-bold text-green-400">${selectedEquipment.daily_rate}</div>
                    <div className="text-xs text-gray-500">24-hour rental</div>
                  </div>
                  <div className="bg-dark-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Hourly Rate</div>
                    <div className="text-2xl font-bold text-blue-400">${selectedEquipment.hourly_rate}</div>
                    <div className="text-xs text-gray-500">Min. 2 hours</div>
                  </div>
                </div>

                {/* Pricing Tiers */}
                <div className="bg-dark-800 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Rental Options & Discounts</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">1-2 days</span>
                      <span className="text-white">${selectedEquipment.daily_rate}/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">3-6 days</span>
                      <span className="text-green-400">${(selectedEquipment.daily_rate * 0.9).toFixed(0)}/day (10% off)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">7+ days</span>
                      <span className="text-green-400">${(selectedEquipment.daily_rate * 0.85).toFixed(0)}/day (15% off)</span>
                    </div>
                    <div className="flex justify-between border-t border-dark-600 pt-2 mt-2">
                      <span className="text-gray-400">Hourly (2-6 hrs)</span>
                      <span className="text-blue-400">${selectedEquipment.hourly_rate}/hr</span>
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div className="bg-dark-800 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">What&apos;s Included</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Free equipment cleaning & maintenance</li>
                    <li>• Complimentary storage bag/case</li>
                    <li>• 24/7 customer support</li>
                    <li>• Damage protection coverage</li>
                    {selectedEquipment.category === 'clubs' && (
                      <>
                        <li>• Professional club fitting advice</li>
                        <li>• Practice balls (50 balls)</li>
                      </>
                    )}
                    {selectedEquipment.category === 'carts' && (
                      <>
                        <li>• GPS navigation system</li>
                        <li>• Scorecard holder & pencil</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedEquipment.is_available ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={selectedEquipment.is_available ? 'text-green-400' : 'text-red-400'}>
                    {selectedEquipment.is_available ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Rental Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-dark-900 rounded-lg border border-dark-700 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Rent Equipment</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Rental Duration</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 7, 14].map((days) => (
                      <button
                        key={days}
                        onClick={() => setRentalDays(days)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          rentalDays === days
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : 'border-dark-600 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {days} day{days > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-dark-700 pt-4">
                  <h3 className="text-white font-semibold mb-3">Pricing Breakdown</h3>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between text-gray-400">
                      <span>Base Rate ({rentalDays} day{rentalDays > 1 ? 's' : ''})</span>
                      <span>${selectedEquipment.daily_rate} × {rentalDays}</span>
                    </div>
                    
                    {rentalDays >= 3 && rentalDays < 7 && (
                      <div className="flex justify-between text-green-400">
                        <span>Multi-day Discount (10%)</span>
                        <span>-${(selectedEquipment.daily_rate * rentalDays * 0.1).toFixed(2)}</span>
                      </div>
                    )}
                    
                    {rentalDays >= 7 && (
                      <div className="flex justify-between text-green-400">
                        <span>Weekly Discount (15%)</span>
                        <span>-${(selectedEquipment.daily_rate * rentalDays * 0.15).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-gray-400">
                      <span>Security Deposit</span>
                      <span>${(selectedEquipment.daily_rate * 2).toFixed(0)} (refundable)</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-400">
                      <span>Insurance & Damage Protection</span>
                      <span>Included</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-dark-600 pt-3">
                    <div className="flex justify-between text-white font-bold text-lg mb-2">
                      <span>Rental Total</span>
                      <span className="text-green-400">${calculateTotal().toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>Security Deposit (refundable)</span>
                      <span>+${(selectedEquipment.daily_rate * 2).toFixed(0)}</span>
                    </div>
                    
                    <div className="border-t border-dark-600 mt-2 pt-2">
                      <div className="flex justify-between text-white font-bold">
                        <span>Total Due Today</span>
                        <span className="text-xl text-green-400">${(calculateTotal() + (selectedEquipment.daily_rate * 2)).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRental}
                  disabled={!selectedEquipment.is_available || rentEquipmentMutation.isLoading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rentEquipmentMutation.isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2" size={20} />
                      Rent Equipment
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-white mb-2">Equipment Rental</h1>
          <p className="text-gray-400">Rent premium golf equipment for your game</p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  selectedCategory === category.id
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-dark-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Equipment List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-dark-900 rounded-lg border border-dark-700 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Available Equipment</h2>
              
              {loadingEquipment ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : equipment && equipment.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipment.map((item) => (
                    <div
                      key={item.id}
                      className="bg-dark-800 rounded-lg border border-dark-600 p-4 hover:border-green-500 transition-colors cursor-pointer"
                      onClick={() => setSelectedEquipment(item)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getEquipmentIcon(item.category)}</span>
                          <h3 className="text-white font-semibold">{item.name}</h3>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          item.is_available ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                      
                      {/* Enhanced Pricing Section */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-green-400 font-bold text-lg">${item.daily_rate}/day</span>
                          <span className="text-blue-400 text-sm">${item.hourly_rate}/hr</span>
                        </div>
                        
                        {/* Value Indicators */}
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Weekly: ${(item.daily_rate * 7 * 0.85).toFixed(0)}</span>
                          <span className="text-green-300">15% off 7+ days</span>
                        </div>
                        
                        {/* Popular Equipment Indicator */}
                        {item.category === 'clubs' && (
                          <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                            🏆 Most Rented
                          </div>
                        )}
                        
                        {!item.is_available && (
                          <div className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
                            Currently unavailable
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No equipment available in this category
                </div>
              )}
            </motion.div>
          </div>

          {/* Pricing Information & Active Rentals */}
          <div className="space-y-6">
            {/* Pricing Guide */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-dark-900 rounded-lg border border-dark-700 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Rental Pricing Guide</h2>
              
              <div className="space-y-4">
                {/* Pricing Tiers */}
                <div className="bg-dark-800 rounded-lg p-4">
                  <h3 className="text-green-400 font-semibold mb-3">💰 Duration Discounts</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">1-2 days</span>
                      <span className="text-white">Standard Rate</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">3-6 days</span>
                      <span className="text-green-400">10% Discount</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">7+ days</span>
                      <span className="text-green-400">15% Discount</span>
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div className="bg-dark-800 rounded-lg p-4">
                  <h3 className="text-blue-400 font-semibold mb-3">✅ Always Included</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Equipment cleaning & maintenance</li>
                    <li>• Protective carrying case</li>
                    <li>• Damage protection coverage</li>
                    <li>• 24/7 customer support</li>
                    <li>• Free equipment inspection</li>
                  </ul>
                </div>

                {/* Payment Info */}
                <div className="bg-dark-800 rounded-lg p-4">
                  <h3 className="text-yellow-400 font-semibold mb-3">💳 Payment Terms</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Security deposit: 2x daily rate</li>
                    <li>• Deposit fully refundable</li>
                    <li>• Payment due at pickup</li>
                    <li>• Major credit cards accepted</li>
                  </ul>
                </div>

                {/* Contact Info */}
                <div className="text-center p-3 bg-green-500/10 rounded-lg">
                  <div className="text-green-400 font-medium text-sm">Need Help?</div>
                  <div className="text-xs text-gray-400">Call (555) 123-GOLF for assistance</div>
                </div>
              </div>
            </motion.div>

            {/* Active Rentals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-dark-900 rounded-lg border border-dark-700 p-6 h-fit"
            >
            <h2 className="text-xl font-bold text-white mb-6">Your Rentals</h2>
            
            {rentals && rentals.length > 0 ? (
              <div className="space-y-4">
                {rentals.slice(0, 5).map((rental) => (
                  <div key={rental.id} className="bg-dark-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-medium">{rental.equipment?.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(rental.rental_status)}`}>
                        {rental.rental_status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>Start: {format(new Date(rental.rental_date), 'MMM d, yyyy')}</div>
                      <div>End: {rental.return_date ? format(new Date(rental.return_date), 'MMM d, yyyy') : 'Not returned'}</div>
                      <div className="text-green-400 font-medium">Price: ${rental.rental_price}</div>
                      <div className="text-gray-300">Quantity: {rental.quantity}</div>
                    </div>
                    
                    {rental.rental_status === 'rented' && (
                      <button
                        onClick={() => returnEquipmentMutation.mutate(rental.id)}
                        disabled={returnEquipmentMutation.isLoading}
                        className="mt-3 w-full text-sm btn-secondary"
                      >
                        Return Equipment
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No active rentals
              </div>
            )}
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
