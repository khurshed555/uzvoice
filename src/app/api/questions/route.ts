import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')

    const questions = await prisma.question.findMany({
      where: topicId ? { topicId } : undefined,
      include: {
        topic: true,
        _count: {
          select: { answers: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nameUz, nameEn, optionsUz, optionsEn, topicId, broadcast } = body

    if (!nameUz || !nameEn || !optionsUz || !optionsEn || !topicId) {
      return NextResponse.json(
        { error: 'Question names (Uzbek & English), options (both languages), and topicId are required' },
        { status: 400 }
      )
    }

    // Validate that options are arrays
    if (!Array.isArray(optionsUz) || optionsUz.length < 2 ||
        !Array.isArray(optionsEn) || optionsEn.length < 2) {
      return NextResponse.json(
        { error: 'Options must be arrays with at least 2 items in both languages' },
        { status: 400 }
      )
    }

    // Validate that both option arrays have the same length
    if (optionsUz.length !== optionsEn.length) {
      return NextResponse.json(
        { error: 'Uzbek and English options must have the same number of items' },
        { status: 400 }
      )
    }

    // Verify topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    })

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    const question = await prisma.question.create({
      data: {
        nameUz,
        nameEn,
        optionsUz: JSON.stringify(optionsUz),
        optionsEn: JSON.stringify(optionsEn),
        topicId,
        broadcasted: false
      },
      include: {
        topic: true
      }
    })

    // Broadcast to all users if requested
    if (broadcast) {
      try {
        // Import the broadcast function
        const { broadcastQuestion } = await import('@/bot/index')
        await broadcastQuestion(question.id)
      } catch (broadcastError) {
        console.error('Error broadcasting question:', broadcastError)
        // Don't fail the question creation if broadcast fails
      }
    }

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
