'use client'

import Link from 'next/link'
import { Calendar, Target, Wrench, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/auth'

const quickActions = [
  {
    title: 'Book Tee Time',
    description: 'Reserve your preferred tee time',
    href: '/booking',
    icon: Calendar,
    color: 'from-blue-500 to-blue-600',
    authRequired: false,
  },
  {
    title: 'Driving Range',
    description: 'Book a practice session',
    href: '/range',
    icon: Target,
    color: 'from-green-500 to-green-600',
    authRequired: false,
  },
  {
    title: 'Rent Equipment',
    description: 'Browse available equipment',
    href: '/equipment',
    icon: Wrench,
    color: 'from-yellow-500 to-yellow-600',
    authRequired: false,
  },
  {
    title: 'My Dashboard',
    description: 'View your bookings and history',
    href: '/dashboard',
    icon: User,
    color: 'from-purple-500 to-purple-600',
    authRequired: true,
  },
]

export default function QuickActions() {
  const { isAuthenticated } = useAuthStore()

  const filteredActions = quickActions.filter(action => 
    !action.authRequired || isAuthenticated
  )

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Quick Actions
          </h2>
          <p className="text-gray-400 text-lg">
            Get started with our most popular services
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={action.href}>
                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 hover:border-green-500/50 transition-all duration-300 h-full">
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
                    <div className="relative p-6 h-full flex flex-col">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="text-white" size={24} />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {action.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="mt-4">
                        <div className="flex items-center text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-sm font-medium">Get Started</span>
                          <svg 
                            className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Additional CTA for non-authenticated users */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="card max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-2">
                Join Our Community
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Create an account to access exclusive features and track your golf journey.
              </p>
              <Link href="/signup" className="btn-primary w-full">
                Sign Up Free
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
