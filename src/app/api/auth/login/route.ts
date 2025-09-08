import { NextRequest, NextResponse } from 'next/server'
import { validateAdminCredentials, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const isValid = await validateAdminCredentials(username, password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = { username, isAdmin: true }
    const token = generateToken(user)

    const response = NextResponse.json({ 
      message: 'Login successful',
      user,
      token 
    })

    // Set HTTP-only cookie
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
