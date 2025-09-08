import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        topic: true,
        _count: {
          select: { answers: true }
        }
      }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params
    const body = await request.json()
    const { nameUz, nameEn, optionsUz, optionsEn, topicId } = body

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

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId }
    })

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
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

    // Update question
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        nameUz,
        nameEn,
        optionsUz: JSON.stringify(optionsUz),
        optionsEn: JSON.stringify(optionsEn),
        topicId
      },
      include: {
        topic: true,
        _count: {
          select: { answers: true }
        }
      }
    })

    return NextResponse.json(updatedQuestion)
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Delete question (this will also delete related answers due to cascade)
    await prisma.question.delete({
      where: { id: questionId }
    })

    return NextResponse.json(
      { message: 'Question deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}
