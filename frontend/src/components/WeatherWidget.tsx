'use client'

import { useQuery } from 'react-query'
import { weatherAPI } from '@/lib/api'
import { Cloud, Sun, CloudRain, Wind, Droplets, Eye, Thermometer } from 'lucide-react'
import { motion } from 'framer-motion'

export default function WeatherWidget() {
  const { data: weather, isLoading, error } = useQuery(
    'weather',
    () => weatherAPI.getCourseWeather(1), // Default to course ID 1
    {
      refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
      retry: 1,
    }
  )

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition?.toLowerCase() || ''
    if (lowerCondition.includes('rain')) return CloudRain
    if (lowerCondition.includes('cloud')) return Cloud
    return Sun
  }

  const getWindDirection = (direction: string) => {
    return direction || 'N/A'
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-dark-700 rounded mb-4"></div>
          <div className="h-20 bg-dark-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="card">
        <div className="text-center">
          <Cloud className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-gray-400">Weather data unavailable</p>
        </div>
      </div>
    )
  }

  const WeatherIcon = getWeatherIcon(weather.weather_condition)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <WeatherIcon className="mr-2 text-green-400" size={24} />
          Course Weather
        </h3>
        <span className="text-sm text-gray-400">Live Conditions</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Temperature */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Thermometer className="text-red-400" size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {weather.temperature ? `${Math.round(weather.temperature)}°C` : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">Temperature</div>
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Droplets className="text-blue-400" size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {weather.humidity ? `${weather.humidity}%` : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">Humidity</div>
          </div>
        </div>

        {/* Wind */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Wind className="text-green-400" size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {weather.wind_speed ? `${Math.round(weather.wind_speed)} km/h` : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">
              Wind {getWindDirection(weather.wind_direction)}
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Eye className="text-purple-400" size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {weather.visibility ? `${weather.visibility} km` : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">Visibility</div>
          </div>
        </div>
      </div>

      {/* Weather Condition */}
      <div className="mt-6 p-4 bg-dark-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-white capitalize">
              {weather.weather_condition || 'Clear'}
            </div>
            <div className="text-sm text-gray-400">
              Perfect conditions for golf!
            </div>
          </div>
          <WeatherIcon className="text-green-400" size={32} />
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Last updated: {new Date(weather.created_at).toLocaleTimeString()}
      </div>
    </motion.div>
  )
}
