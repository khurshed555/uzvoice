import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export interface AdminUser {
  username: string
  isAdmin: boolean
}

export async function validateAdminCredentials(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_USERNAME) {
    return false
  }
  
  // For development, use plain text comparison
  // In production, you should hash the password in env
  return password === ADMIN_PASSWORD
}

export function generateToken(user: AdminUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminUser
    return decoded
  } catch (error) {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Also check cookies
  const token = request.cookies.get('admin-token')?.value
  return token || null
}

export function isAuthenticated(request: NextRequest): AdminUser | null {
  const token = getTokenFromRequest(request)
  if (!token) {
    return null
  }
  
  return verifyToken(token)
}

export function requireAuth(request: NextRequest): AdminUser {
  const user = isAuthenticated(request)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
