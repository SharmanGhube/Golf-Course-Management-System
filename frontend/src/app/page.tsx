import Hero from '@/components/Hero'
import FeaturesSection from '@/components/FeaturesSection'
import WeatherWidget from '@/components/WeatherWidget'
import QuickActions from '@/components/QuickActions'

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <Hero />
      
      {/* Weather Widget */}
      <section className="container mx-auto px-4">
        <WeatherWidget />
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-4">
        <QuickActions />
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-700">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Golf Course Management</h3>
              <p className="text-gray-400">
                Your premier destination for golf course management and booking services.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tee Time Booking</li>
                <li>Equipment Rental</li>
                <li>Driving Range</li>
                <li>Memberships</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+1 (555) GOLF-123</li>
                <li>info@golfcourse.com</li>
                <li>123 Golf Course Dr</li>
                <li>Pine Valley, CA 90210</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold text-white mb-4">Hours</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Mon-Fri: 6 AM - 8 PM</li>
                <li>Sat-Sun: 5 AM - 9 PM</li>
                <li>Holidays: 6 AM - 7 PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Golf Course Management. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
