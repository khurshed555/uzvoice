import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params

    // Check if topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    })

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    // Delete topic (this will also delete related questions and answers due to cascade)
    await prisma.topic.delete({
      where: { id: topicId }
    })

    return NextResponse.json(
      { message: 'Topic deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting topic:', error)
    return NextResponse.json(
      { error: 'Failed to delete topic' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        questions: true,
        _count: {
          select: { questions: true }
        }
      }
    })

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(topic)
  } catch (error) {
    console.error('Error fetching topic:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params
    const body = await request.json()
    const { nameUz, nameEn } = body

    if (!nameUz || !nameEn) {
      return NextResponse.json(
        { error: 'Both Uzbek and English topic names are required' },
        { status: 400 }
      )
    }

    // Check if topic exists
    const existingTopic = await prisma.topic.findUnique({
      where: { id: topicId }
    })

    if (!existingTopic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    // Update topic
    const updatedTopic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        nameUz,
        nameEn
      },
      include: {
        questions: true,
        _count: {
          select: { questions: true }
        }
      }
    })

    return NextResponse.json(updatedTopic)
  } catch (error) {
    console.error('Error updating topic:', error)
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    )
  }
}
