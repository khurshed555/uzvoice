import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Require authentication for this route
    requireAuth(request)
    const topics = await prisma.topic.findMany({
      include: {
        questions: true,
        _count: {
          select: { questions: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(topics)
  } catch (error) {
    console.error('Error fetching topics:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication for this route
    requireAuth(request)
    const body = await request.json()
    const { nameUz, nameEn } = body

    if (!nameUz || !nameEn) {
      return NextResponse.json(
        { error: 'Both Uzbek and English topic names are required' },
        { status: 400 }
      )
    }

    const topic = await prisma.topic.create({
      data: { 
        nameUz,
        nameEn
      }
    })

    return NextResponse.json(topic, { status: 201 })
  } catch (error) {
    console.error('Error creating topic:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    )
  }
}
