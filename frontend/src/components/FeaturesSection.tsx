'use client'

import { Calendar, Target, Wrench, Users, Clock, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Calendar,
    title: 'Tee Time Booking',
    description: 'Easy online booking system with real-time availability and instant confirmation.',
    color: 'text-blue-400',
  },
  {
    icon: Target,
    title: 'Driving Range',
    description: 'State-of-the-art driving range with various ball bucket sizes and premium bays.',
    color: 'text-green-400',
  },
  {
    icon: Wrench,
    title: 'Equipment Rental',
    description: 'Premium golf equipment rental including clubs, carts, and accessories.',
    color: 'text-yellow-400',
  },
  {
    icon: Users,
    title: 'Membership Plans',
    description: 'Flexible membership options with exclusive benefits and priority booking.',
    color: 'text-purple-400',
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Book up to 30 days in advance with easy cancellation and rescheduling.',
    color: 'text-red-400',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Safe and secure payment processing with multiple payment options.',
    color: 'text-indigo-400',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-dark-900/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Premium Golf{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
              Experience
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover our comprehensive golf management system designed to enhance every aspect of your golf experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-hover group"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg bg-dark-700 group-hover:bg-dark-600 transition-colors ${feature.color}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-white ml-4">{feature.title}</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Playing?</h3>
            <p className="text-gray-400 mb-6">
              Join thousands of golfers who trust our platform for their golf course management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup" className="btn-primary">
                Create Account
              </a>
              <a href="/courses" className="btn-outline">
                Explore Courses
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
