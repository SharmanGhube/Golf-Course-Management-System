'use client'

import Link from 'next/link'
import { Calendar, Target, Wrench, Users } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image/Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-green-900 opacity-90"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce-gentle"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce-gentle" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
              Pine Valley
            </span>
            <br />
            Golf Club
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience championship golf with state-of-the-art facilities, professional instruction, 
            and premium amenities in a stunning natural setting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/booking" className="btn-primary text-lg px-8 py-3">
              Book Tee Time
            </Link>
            <Link href="/courses" className="btn-outline text-lg px-8 py-3">
              View Courses
            </Link>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">18</div>
              <div className="text-gray-400">Championship Holes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">72</div>
              <div className="text-gray-400">Par Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">7,200</div>
              <div className="text-gray-400">Total Yards</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">5★</div>
              <div className="text-gray-400">Rating</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
