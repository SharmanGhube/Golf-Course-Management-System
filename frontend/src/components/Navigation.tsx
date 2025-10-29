'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth'
import { Menu, X, User, LogOut, Calendar, Target, Wrench } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <nav className="bg-dark-900 border-b border-dark-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="text-white font-semibold text-lg">Golf Course</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/courses" className="text-gray-300 hover:text-white transition-colors">
              Courses
            </Link>
            
            {/* Authenticated User Only Links */}
            {isAuthenticated && (
              <>
                <Link href="/booking" className="text-gray-300 hover:text-white transition-colors">
                  Tee Times
                </Link>
                <Link href="/range" className="text-gray-300 hover:text-white transition-colors">
                  Driving Range
                </Link>
                <Link href="/equipment" className="text-gray-300 hover:text-white transition-colors">
                  Equipment
                </Link>
              </>
            )}

            {/* Auth Section */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="btn-primary">
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Admin
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                    <User size={20} />
                    <span>{user.first_name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
                      >
                        <User size={16} />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-white transition-colors w-full text-left"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-300 hover:text-white transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-dark-700">
            <div className="space-y-4">
              <Link
                href="/courses"
                className="block text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Courses
              </Link>
              
              {/* Authenticated User Only Links */}
              {isAuthenticated && (
                <>
                  <Link
                    href="/booking"
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Tee Times
                  </Link>
                  <Link
                    href="/range"
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Driving Range
                  </Link>
                  <Link
                    href="/equipment"
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Equipment
                  </Link>
                </>
              )}

              {isAuthenticated && user ? (
                <div className="space-y-4 pt-4 border-t border-dark-700">
                  <Link
                    href="/dashboard"
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block text-red-400 hover:text-red-300 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block text-gray-300 hover:text-white transition-colors text-left"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-dark-700">
                  <Link
                    href="/login"
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block btn-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
