import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params

    // Get question details with answers
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        topic: true,
        answers: true
      }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Parse options
    const optionsUz = JSON.parse(question.optionsUz)
    const optionsEn = JSON.parse(question.optionsEn)

    // Count answers by option
    const answerCounts: { [key: string]: number } = {}
    
    // Initialize all options with 0
    optionsUz.forEach((option: string, index: number) => {
      answerCounts[index.toString()] = 0
    })

    // Count actual answers
    question.answers.forEach(answer => {
      const optionKey = answer.optionKey
      if (answerCounts.hasOwnProperty(optionKey)) {
        answerCounts[optionKey]++
      }
    })

    // Prepare chart data
    const chartData = {
      question: {
        id: question.id,
        nameUz: question.nameUz,
        nameEn: question.nameEn,
        topic: {
          nameUz: question.topic.nameUz,
          nameEn: question.topic.nameEn
        }
      },
      options: {
        uz: optionsUz,
        en: optionsEn
      },
      data: Object.keys(answerCounts).map(optionKey => ({
        optionIndex: parseInt(optionKey),
        optionUz: optionsUz[parseInt(optionKey)],
        optionEn: optionsEn[parseInt(optionKey)],
        count: answerCounts[optionKey]
      })),
      totalAnswers: question.answers.length
    }

    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Error fetching question analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question data' },
      { status: 500 }
    )
  }
}
