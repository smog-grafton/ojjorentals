'use client'

import { useState, useEffect } from 'react'
import api from '@/services/api'

export interface Notification {
  id: string
  type: string
  data: {
    title: string
    subtitle: string
    avatar_icon?: string
    avatar_color?: string
    avatar_text?: string
    avatar_image?: string
    action_url?: string
    reminder_id?: number
    tenant_id?: number
    invoice_id?: number
  }
  read_at: string | null
  created_at: string
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications?per_page=10')
      setNotifications(response.data.data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count')
      setUnreadCount(response.data.count || 0)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
      // Update unread count if it was unread
      const notification = notifications.find(n => n.id === id)
      if (notification && !notification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications()
      fetchUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  }
}
