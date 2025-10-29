'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from 'react-query'
import { User, Mail, Phone, Calendar, Award, Edit, Save, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

export default function ProfilePage() {
  const { isAuthenticated, user, token, updateUser } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    date_of_birth: user?.date_of_birth || '',
    handicap: user?.handicap || 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        handicap: user.handicap || 0
      })
    }
  }, [user])

  // Update profile mutation
  const updateProfileMutation = useMutation(
    async (profileData: any) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })
      if (!response.ok) throw new Error('Failed to update profile')
      return response.json()
    },
    {
      onSuccess: (updatedUser) => {
        updateUser(updatedUser)
        setIsEditing(false)
        alert('Profile updated successfully!')
      },
      onError: (error) => {
        alert('Failed to update profile. Please try again.')
        console.error('Update error:', error)
      }
    }
  )

  const handleSave = () => {
    updateProfileMutation.mutate(formData)
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        handicap: user.handicap || 0
      })
    }
    setIsEditing(false)
  }

  const getMembershipBadgeColor = (membershipType: string) => {
    switch (membershipType) {
      case 'premium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
      case 'standard': return 'bg-blue-500/20 text-blue-400 border-blue-500'
      case 'basic': return 'bg-gray-500/20 text-gray-400 border-gray-500'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500'
      case 'staff': return 'bg-purple-500/20 text-purple-400 border-purple-500'
      case 'member': return 'bg-green-500/20 text-green-400 border-green-500'
      case 'customer': return 'bg-blue-500/20 text-blue-400 border-blue-500'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500'
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-gray-400">Manage your account information</p>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 btn-secondary"
            >
              <Edit size={20} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={updateProfileMutation.isLoading}
                className="flex items-center space-x-2 btn-primary disabled:opacity-50"
              >
                <Save size={20} />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 btn-secondary"
              >
                <X size={20} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-dark-900 rounded-lg border border-dark-700 p-6 text-center">
              {/* Avatar */}
              <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={40} className="text-white" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">
                {user.first_name} {user.last_name}
              </h2>
              
              <div className="flex justify-center space-x-2 mb-4">
                <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
                <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getMembershipBadgeColor(user.membership_type)}`}>
                  {user.membership_type}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center justify-center space-x-2">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
                
                {user.phone && (
                  <div className="flex items-center justify-center space-x-2">
                    <Phone size={16} />
                    <span>{user.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-center space-x-2">
                  <Calendar size={16} />
                  <span>Joined {format(new Date(user.created_at), 'MMM yyyy')}</span>
                </div>
                
                {user.handicap !== null && user.handicap !== undefined && (
                  <div className="flex items-center justify-center space-x-2">
                    <Award size={16} />
                    <span>Handicap: {user.handicap}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-dark-900 rounded-lg border border-dark-700 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                    />
                  ) : (
                    <div className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white">
                      {user.first_name}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                    />
                  ) : (
                    <div className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white">
                      {user.last_name}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <div className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-gray-400">
                    {user.email} (cannot be changed)
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white">
                      {user.phone || 'Not provided'}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                    />
                  ) : (
                    <div className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white">
                      {user.date_of_birth ? format(new Date(user.date_of_birth), 'MMM d, yyyy') : 'Not provided'}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Golf Handicap</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={formData.handicap}
                      onChange={(e) => setFormData({ ...formData, handicap: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                      placeholder="Enter handicap"
                    />
                  ) : (
                    <div className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white">
                      {user.handicap !== null && user.handicap !== undefined ? user.handicap : 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Account Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="bg-dark-900 rounded-lg border border-dark-700 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Account Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                  user.is_active ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div className="text-gray-400 text-sm">Account Status</div>
                <div className={user.is_active ? 'text-green-400' : 'text-red-400'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                  user.email_verified ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <div className="text-gray-400 text-sm">Email Status</div>
                <div className={user.email_verified ? 'text-green-400' : 'text-yellow-400'}>
                  {user.email_verified ? 'Verified' : 'Pending'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-gray-400 text-sm">Member Since</div>
                <div className="text-white font-medium">
                  {format(new Date(user.created_at), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
            
            {user.membership_expiry && (
              <div className="mt-6 p-4 bg-dark-800 rounded-lg">
                <div className="text-center">
                  <div className="text-gray-400 text-sm mb-1">Membership Expires</div>
                  <div className="text-white font-medium">
                    {format(new Date(user.membership_expiry), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
