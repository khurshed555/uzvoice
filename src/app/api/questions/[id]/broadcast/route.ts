import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params

    // Verify question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { topic: true }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Import the broadcast function
    const { broadcastQuestion } = await import('@/bot/index')
    await broadcastQuestion(questionId)

    return NextResponse.json(
      { message: 'Question broadcasted successfully', questionId },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error broadcasting question:', error)
    return NextResponse.json(
      { error: 'Failed to broadcast question' },
      { status: 500 }
    )
  }
}
