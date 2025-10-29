'use client'

import { useQuery } from 'react-query'
import { MapPin, Star, DollarSign, Users, Clock, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Course {
  id: number
  name: string
  description: string
  address: string
  phone: string
  email: string
  par: number
  total_holes: number
  course_rating: number
  slope_rating: number
  green_fee: number
  cart_fee: number
  is_active: boolean
}

export default function CoursesPage() {
  const router = useRouter()
  
  const { data: courses, isLoading, error } = useQuery<Course[]>(
    'courses',
    async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`)
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      return response.json()
    }
  )

  const handleViewDetails = (courseId: number) => {
    toast.success('Viewing course details')
    // You can navigate to a dedicated course details page if you create one
    // router.push(`/courses/${courseId}`)
  }

  const handleBookTeeTime = (courseId: number, courseName: string) => {
    router.push(`/booking?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}`)
  }

  const handleViewMap = (courseId: number, courseName: string) => {
    toast.success(`Course map for ${courseName} - Coming soon!`)
    // You could open a modal or navigate to a map page
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 pt-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Courses</h1>
            <p className="text-gray-400">Please try again later.</p>
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
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Our Golf Courses</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Discover our premium golf courses designed for players of all skill levels
          </p>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-900/50 backdrop-blur-sm border border-dark-700 rounded-lg p-4"
            >
              <div className="text-2xl font-bold text-green-400 mb-1">{courses?.length || 0}</div>
              <div className="text-sm text-gray-400">Championship Courses</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-dark-900/50 backdrop-blur-sm border border-dark-700 rounded-lg p-4"
            >
              <div className="text-2xl font-bold text-blue-400 mb-1">18</div>
              <div className="text-sm text-gray-400">Holes Per Course</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-dark-900/50 backdrop-blur-sm border border-dark-700 rounded-lg p-4"
            >
              <div className="text-2xl font-bold text-purple-400 mb-1">Pro</div>
              <div className="text-sm text-gray-400">Tournament Ready</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {courses?.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-dark-900 rounded-xl border border-dark-700 overflow-hidden hover:border-green-500 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Course Header with Gradient */}
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-green-600 via-green-700 to-green-800 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-black/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                  </div>
                  
                  {/* Course Title Overlay */}
                  <div className="absolute inset-0 flex items-end p-6">
                    <div className="w-full">
                      <div className="flex justify-between items-end">
                        <h2 className="text-2xl font-bold text-white drop-shadow-lg">{course.name}</h2>
                        {course.course_rating && (
                          <div className="flex items-center space-x-1 bg-yellow-500/90 text-yellow-900 px-3 py-1 rounded-full backdrop-blur-sm">
                            <Star size={16} fill="currentColor" />
                            <span className="text-sm font-bold">{course.course_rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-400 mb-6 leading-relaxed">{course.description}</p>

                {/* Course Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-lg p-4 border border-dark-600 group-hover:border-green-500/30 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="text-green-400" size={18} />
                      <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">Par</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{course.par}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-lg p-4 border border-dark-600 group-hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="text-blue-400" size={18} />
                      <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">Holes</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{course.total_holes}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-lg p-4 border border-dark-600 group-hover:border-green-500/30 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="text-green-400" size={18} />
                      <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">Green Fee</span>
                    </div>
                    <div className="text-xl font-bold text-green-400">${course.green_fee}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-lg p-4 border border-dark-600 group-hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="text-purple-400" size={18} />
                      <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">Cart Fee</span>
                    </div>
                    <div className="text-xl font-bold text-purple-400">${course.cart_fee}</div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 text-gray-400 bg-dark-800/50 rounded-lg p-3">
                    <MapPin size={16} className="text-green-400 flex-shrink-0" />
                    <span className="text-sm">{course.address}</span>
                  </div>
                  
                  {course.slope_rating && (
                    <div className="flex items-center justify-between bg-dark-800/50 rounded-lg p-3">
                      <span className="text-sm text-gray-400">Slope Rating</span>
                      <span className="text-sm font-semibold text-white bg-blue-500/20 px-2 py-1 rounded">{course.slope_rating}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button 
                    onClick={() => handleViewDetails(course.id)}
                    className="w-full btn-primary group-hover:bg-green-500 transition-colors"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>View Course Details</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleBookTeeTime(course.id, course.name)}
                      className="btn-outline text-xs py-2 hover:bg-green-600 hover:text-white hover:border-green-600"
                    >
                      Book Tee Time
                    </button>
                    <button 
                      onClick={() => handleViewMap(course.id, course.name)}
                      className="btn-secondary text-xs py-2 hover:bg-dark-600"
                    >
                      Course Map
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No courses message */}
        {courses?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-gray-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-400 mb-4">No Courses Available</h2>
              <p className="text-gray-500 mb-6">Check back later for course information.</p>
              <button className="btn-primary">
                Get Notified When Available
              </button>
            </div>
          </motion.div>
        )}

        {/* Additional Features Section */}
        {courses && courses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="bg-gradient-to-r from-green-600/10 to-blue-600/10 rounded-2xl border border-green-500/20 p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Why Choose Our Courses?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="text-green-400" size={24} />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Championship Quality</h4>
                  <p className="text-gray-400 text-sm">Professional-grade courses designed for tournament play</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-blue-400" size={24} />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">All Skill Levels</h4>
                  <p className="text-gray-400 text-sm">From beginners to pros, our courses challenge every player</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="text-purple-400" size={24} />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Premium Experience</h4>
                  <p className="text-gray-400 text-sm">Top-rated facilities with exceptional service</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
