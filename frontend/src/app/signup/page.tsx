'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/lib/auth'
import { authAPI } from '@/lib/api'
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface SignupForm {
  email: string
  password: string
  confirmPassword: string
  first_name: string
  last_name: string
  phone: string
  date_of_birth: string
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>()

  const password = watch('password')

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true)
    try {
      const { confirmPassword, ...signupData } = data
      const response = await authAPI.signup(signupData)
      setAuth(response.user, response.token)
      toast.success('Account created successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white">
            Join Golf Course
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Create your account to start booking
          </p>
        </div>

        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name</label>
                <div className="relative">
                  <div className="form-icon-left">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('first_name', {
                      required: 'First name is required',
                    })}
                    type="text"
                    className="form-input-with-icon"
                    placeholder="First name"
                  />
                </div>
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Last Name</label>
                <div className="relative">
                  <div className="form-icon-left">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('last_name', {
                      required: 'Last name is required',
                    })}
                    type="text"
                    className="form-input-with-icon"
                    placeholder="Last name"
                  />
                </div>
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <div className="form-icon-left">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="form-input-with-icon"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="form-label">Phone Number</label>
              <div className="relative">
                <div className="form-icon-left">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone')}
                  type="tel"
                  className="form-input-with-icon"
                  placeholder="Your phone number"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="form-label">Date of Birth</label>
              <div className="relative">
                <div className="form-icon-left">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('date_of_birth')}
                  type="date"
                  className="form-input-with-icon"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <div className="form-icon-left">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="form-input-with-icons"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="form-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <div className="form-icon-left">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value =>
                      value === password || 'Passwords do not match',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input-with-icons"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="form-icon-right"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-green-400 hover:text-green-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-green-400 hover:text-green-300">
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
