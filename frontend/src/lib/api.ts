import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage)
          const token = parsed.state?.token
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        } catch (error) {
          console.error('Error parsing auth storage:', error)
        }
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth storage on 401
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage')
      }
    }
    return Promise.reject(error)
  }
)

// Auth API endpoints
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  
  signup: async (userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone?: string
    date_of_birth?: string
  }) => {
    const response = await api.post('/auth/signup', userData)
    return response.data
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },
}

// Dashboard API endpoints
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },
  
  getRecentActivity: async () => {
    const response = await api.get('/dashboard/activity')
    return response.data
  },
}

// Courses API endpoints
export const coursesAPI = {
  getCourses: async () => {
    const response = await api.get('/courses')
    return response.data
  },
  
  getCourse: async (id: number) => {
    const response = await api.get(`/courses/${id}`)
    return response.data
  },
}

// Tee Times API endpoints
export const teeTimesAPI = {
  getAvailableTeeTimes: async (courseId: number, date: string) => {
    const response = await api.get(`/tee-times/available?course_id=${courseId}&date=${date}`)
    return response.data
  },
  
  bookTeeTime: async (bookingData: {
    course_id: number
    booking_date: string
    tee_time: string
    players_count: number
    cart_required: boolean
    special_requests?: string
  }) => {
    const response = await api.post('/tee-times', bookingData)
    return response.data
  },
  
  getUserTeeTimes: async () => {
    const response = await api.get('/tee-times')
    return response.data
  },
}

// Range API endpoints
export const rangeAPI = {
  getBucketPrices: async () => {
    const response = await api.get('/range/bucket-prices')
    return response.data
  },
  
  bookRangeSession: async (sessionData: {
    session_date: string
    start_time: string
    duration_minutes?: number
    ball_bucket_size: string
    bay_number?: number
  }) => {
    const response = await api.post('/range/sessions', sessionData)
    return response.data
  },
  
  getUserRangeSessions: async () => {
    const response = await api.get('/range/sessions')
    return response.data
  },
}

// Equipment API endpoints
export const equipmentAPI = {
  getEquipment: async (category?: string) => {
    const url = category ? `/equipment?category=${category}` : '/equipment'
    const response = await api.get(url)
    return response.data
  },
  
  getEquipmentById: async (id: number) => {
    const response = await api.get(`/equipment/${id}`)
    return response.data
  },
  
  rentEquipment: async (rentalData: {
    equipment_id: number
    rental_date: string
    return_date: string
    quantity: number
    notes?: string
  }) => {
    const response = await api.post('/equipment/rentals', rentalData)
    return response.data
  },
  
  getUserRentals: async () => {
    const response = await api.get('/equipment/rentals')
    return response.data
  },
  
  returnEquipment: async (rentalId: number) => {
    const response = await api.put(`/equipment/rentals/${rentalId}/return`)
    return response.data
  },
}

// Weather API endpoints
export const weatherAPI = {
  getCourseWeather: async (courseId: number) => {
    const response = await api.get(`/weather/course/${courseId}`)
    return response.data
  },
  
  getCourseWeatherHistory: async (courseId: number, days?: number) => {
    const url = days 
      ? `/weather/course/${courseId}/history?days=${days}`
      : `/weather/course/${courseId}/history`
    const response = await api.get(url)
    return response.data
  },
}
