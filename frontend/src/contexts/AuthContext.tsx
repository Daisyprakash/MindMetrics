import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('currentUser')
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple login - accept any email/password
    // In a real app, this would validate against a backend
    
    // Create a simple user object for the logged-in user
    const loggedInUser: User = {
      id: `logged_in_${Date.now()}`,
      name: email.split('@')[0] || 'User',
      email: email,
      role: 'Admin',
      status: 'active',
      signupDate: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      region: 'North America',
      subscriptionId: `sub_${Date.now()}`,
    }

    setUser(loggedInUser)
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
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

