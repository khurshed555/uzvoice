import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Require authentication for this route
    requireAuth(request)
    const users = await prisma.user.findMany({
      include: {
        answers: {
          include: {
            question: {
              include: {
                topic: true
              }
            }
          }
        },
        _count: {
          select: { answers: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// Get user statistics by region
export async function POST(request: NextRequest) {
  try {
    // Require authentication for this route
    requireAuth(request)
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'stats') {
      const stats = await prisma.user.groupBy({
        by: ['region'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      })
      
      return NextResponse.json(stats)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
