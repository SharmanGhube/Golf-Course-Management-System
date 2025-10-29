'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Calendar, Clock, Users, DollarSign, MapPin, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { format, addDays, startOfDay } from 'date-fns'

// Utility function to safely format dates
const safeDateFormat = (dateString: string, formatString: string): string => {
  if (!dateString) return 'Invalid Date'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return dateString // Return the original string if it's not a valid date
  }
  
  try {
    return format(date, formatString)
  } catch (error) {
    return dateString // Return original if formatting fails
  }
}

interface TeeTime {
  id: number
  course_id: number
  date: string
  time: string
  available_spots: number
  price: number
  course_name?: string
}

interface Course {
  id: number
  name: string
  green_fee: number
  cart_fee: number
}

export default function BookingPage() {
  const { isAuthenticated, user, token } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  
  // Get course ID from URL params if coming from courses page
  const courseIdFromUrl = searchParams.get('courseId')
  const courseNameFromUrl = searchParams.get('courseName')
  
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedCourse, setSelectedCourse] = useState<number | null>(
    courseIdFromUrl ? parseInt(courseIdFromUrl) : null
  )
  const [selectedTeeTime, setSelectedTeeTime] = useState<TeeTime | null>(null)
  const [playerCount, setPlayerCount] = useState(1)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Set course from URL param when courses data is loaded
  useEffect(() => {
    if (courseIdFromUrl && !selectedCourse) {
      setSelectedCourse(parseInt(courseIdFromUrl))
    }
  }, [courseIdFromUrl, selectedCourse])

  // Fetch courses
  const { data: courses } = useQuery<Course[]>(
    'courses',
    async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`)
      if (!response.ok) throw new Error('Failed to fetch courses')
      return response.json()
    }
  )

  // Fetch available tee times
  const { data: teeTimes, isLoading: loadingTeeTimes } = useQuery<TeeTime[]>(
    ['tee-times', selectedDate, selectedCourse],
    async () => {
      const params = new URLSearchParams({
        date: selectedDate,
        ...(selectedCourse && { course_id: selectedCourse.toString() })
      })
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tee-times/available?${params}`)
      if (!response.ok) throw new Error('Failed to fetch tee times')
      return response.json()
    },
    {
      enabled: !!selectedDate
    }
  )

  // Book tee time mutation
  const bookTeeTimeMutation = useMutation(
    async (bookingData: any) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tee-times`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      })
      if (!response.ok) throw new Error('Failed to book tee time')
      return response.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tee-times'])
        setSelectedTeeTime(null)
        alert('Tee time booked successfully!')
      },
      onError: (error) => {
        alert('Failed to book tee time. Please try again.')
        console.error('Booking error:', error)
      }
    }
  )

  const handleBooking = () => {
    if (!selectedTeeTime) return

    const bookingData = {
      course_id: selectedTeeTime.course_id,
      booking_date: selectedTeeTime.date,
      tee_time: selectedTeeTime.time,
      players_count: playerCount,
      cart_required: false,
      special_requests: ''
    }

    bookTeeTimeMutation.mutate(bookingData)
  }

  // Generate next 7 days
  const getNextSevenDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i)
      days.push({
        date: format(date, 'yyyy-MM-dd'),
        display: format(date, 'EEE, MMM d'),
        isToday: i === 0
      })
    }
    return days
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
          <h1 className="text-3xl font-bold text-white mb-2">Book Tee Time</h1>
          <p className="text-gray-400">Reserve your spot on the course</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-900 rounded-lg border border-dark-700 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Calendar className="mr-2" size={20} />
                Select Date
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {getNextSevenDays().map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      selectedDate === day.date
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-dark-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-sm font-medium">{day.display}</div>
                    {day.isToday && (
                      <div className="text-xs text-green-400 mt-1">Today</div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Course Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-dark-900 rounded-lg border border-dark-700 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <MapPin className="mr-2" size={20} />
                Select Course
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses?.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      selectedCourse === course.id
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-dark-600 hover:border-gray-500'
                    }`}
                  >
                    <h3 className="text-white font-semibold mb-2">{course.name}</h3>
                    <div className="text-sm text-gray-400">
                      Green Fee: ${course.green_fee} | Cart: ${course.cart_fee}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Available Tee Times */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-dark-900 rounded-lg border border-dark-700 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Clock className="mr-2" size={20} />
                Available Times
              </h2>
              
              {loadingTeeTimes ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : teeTimes && teeTimes.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {teeTimes.map((teeTime) => (
                    <button
                      key={`${teeTime.course_id}-${teeTime.date}-${teeTime.time}`}
                      onClick={() => setSelectedTeeTime(teeTime)}
                      disabled={teeTime.available_spots === 0}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        selectedTeeTime?.time === teeTime.time && selectedTeeTime?.course_id === teeTime.course_id
                          ? 'border-green-500 bg-green-500/10 text-green-400'
                          : teeTime.available_spots === 0
                          ? 'border-red-500/50 bg-red-500/10 text-red-400 cursor-not-allowed'
                          : 'border-dark-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium">{teeTime.time}</div>
                      <div className="text-xs mt-1">
                        {teeTime.available_spots === 0 ? 'Full' : `${teeTime.available_spots} spots`}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No available tee times for selected date and course
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
            
            {selectedTeeTime ? (
              <div className="space-y-4">
                <div className="border-b border-dark-700 pb-4">
                  <div className="text-gray-400 text-sm">Course</div>
                  <div className="text-white font-medium">
                    {courses?.find(c => c.id === selectedTeeTime.course_id)?.name}
                  </div>
                </div>
                
                <div className="border-b border-dark-700 pb-4">
                  <div className="text-gray-400 text-sm">Date & Time</div>
                  <div className="text-white font-medium">
                    {safeDateFormat(selectedTeeTime.date, 'EEEE, MMMM d')} at {selectedTeeTime.time}
                  </div>
                </div>
                
                <div className="border-b border-dark-700 pb-4">
                  <div className="text-gray-400 text-sm mb-2">Players</div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPlayerCount(Math.max(1, playerCount - 1))}
                      className="w-8 h-8 rounded-full border border-dark-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-white font-medium">{playerCount}</span>
                    <button
                      onClick={() => setPlayerCount(Math.min(4, playerCount + 1))}
                      className="w-8 h-8 rounded-full border border-dark-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="border-b border-dark-700 pb-4">
                  <div className="flex justify-between text-gray-400 text-sm mb-1">
                    <span>Green Fee (x{playerCount})</span>
                    <span>${((courses?.find(c => c.id === selectedTeeTime.course_id)?.green_fee || 0) * playerCount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold">
                    <span>Total</span>
                    <span>${((courses?.find(c => c.id === selectedTeeTime.course_id)?.green_fee || 0) * playerCount).toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleBooking}
                  disabled={bookTeeTimeMutation.isLoading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookTeeTimeMutation.isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Booking...</span>
                    </div>
                  ) : (
                    <>
                      <Check className="mr-2" size={20} />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                Select a tee time to see booking details
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
