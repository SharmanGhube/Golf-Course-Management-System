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
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label flex items-center gap-2">
                  <User className="h-4 w-4 text-green-400" />
                  First Name
                </label>
                <input
                  {...register('first_name', {
                    required: 'First name is required',
                  })}
                  type="text"
                  className="form-input"
                  placeholder="First name"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <User className="h-4 w-4 text-green-400" />
                  Last Name
                </label>
                <input
                  {...register('last_name', {
                    required: 'Last name is required',
                  })}
                  type="text"
                  className="form-input"
                  placeholder="Last name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="form-label flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-400" />
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                className="form-input"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="form-label flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-400" />
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="form-input"
                placeholder="Your phone number"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="form-label flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-400" />
                Date of Birth
              </label>
              <input
                {...register('date_of_birth')}
                type="date"
                className="form-input"
              />
            </div>

            {/* Password Fields */}
            <div>
              <label className="form-label flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-400" />
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="form-input pr-12"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="form-label flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-400" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value =>
                      value === password || 'Passwords do not match',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
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
