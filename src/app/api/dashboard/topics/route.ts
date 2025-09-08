import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        questions: {
          include: {
            _count: {
              select: { answers: true }
            }
          }
        },
        _count: {
          select: { questions: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filter out topics with no questions for public view
    const topicsWithQuestions = topics.filter(topic => topic.questions.length > 0)

    return NextResponse.json(topicsWithQuestions)
  } catch (error) {
    console.error('Error fetching dashboard topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}
