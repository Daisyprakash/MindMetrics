import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '@/api/api'

interface AdminUser {
  _id: string
  name: string
  email: string
  role: string
  organizationId: string | {
    _id: string
    name: string
    industry: string
    timezone: string
    currency: string
  }
}

interface AuthContextType {
  user: AdminUser | null
  login: (email: string, password: string) => Promise<boolean>
  register: (data: {
    name: string
    email: string
    password: string
    organizationName: string
    industry?: string
  }) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from token
    const token = localStorage.getItem('authToken')
    if (token) {
      // Verify token by fetching user data
      authApi
        .getMe()
        .then((userData) => {
          setUser(userData as AdminUser)
        })
        .catch(() => {
          // Token invalid, clear it
          localStorage.removeItem('authToken')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password)
      localStorage.setItem('authToken', response.token)
      setUser(response.user as AdminUser)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (data: {
    name: string
    email: string
    password: string
    organizationName: string
    industry?: string
  }): Promise<boolean> => {
    try {
      const response = await authApi.register(data)
      localStorage.setItem('authToken', response.token)
      setUser(response.user as AdminUser)
      return true
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('authToken')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

