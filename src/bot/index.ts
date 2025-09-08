import { Telegraf, Markup, Context } from 'telegraf'
import { CallbackQuery } from 'telegraf/types'
import { PrismaClient } from '@prisma/client'
import { t, getRegions, type Language } from './i18n'

const prisma = new PrismaClient()
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!)

interface SessionData {
  step?: 'waiting_language' | 'waiting_region' | 'waiting_name' | 'registered'
  language?: Language
  selectedRegion?: string
  currentTopicId?: string
  currentQuestionIndex?: number
}

// Simple in-memory session storage (in production, use Redis or database)
const sessions: Record<string, SessionData> = {}

const getSession = (userId: string): SessionData => {
  if (!sessions[userId]) {
    sessions[userId] = {}
  }
  return sessions[userId]
}

// Start command - handle both new and existing users
bot.start(async (ctx) => {
  const tgid = ctx.from?.id.toString()
  if (!tgid) return

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { tgid }
    })

    if (existingUser) {
      // Existing user - show welcome message and topics
      const session = getSession(tgid)
      session.language = existingUser.language as Language
      session.step = 'registered'
      
      const welcomeMsg = `${t('welcome', existingUser.language as Language)}\n\n` +
        `👤 <b>${t('name', existingUser.language as Language)}</b> ${existingUser.name}\n` +
        `🏙️ <b>${t('region', existingUser.language as Language)}</b> ${existingUser.region}\n\n` +
        `${t('selectTopic', existingUser.language as Language)}`
      
      await ctx.reply(welcomeMsg, { parse_mode: 'HTML' })
      await showTopics(ctx, existingUser.id, existingUser.language as Language, false)
      return
    }

    // New user - force language selection first
    const session = getSession(tgid)
    session.step = 'waiting_language'

    await ctx.reply(
      t('selectLanguage', 'uz') + ' / ' + t('selectLanguage', 'en'),
      getLanguageKeyboard()
    )
  } catch (error) {
    console.error('Error in start command:', error)
    await ctx.reply(t('unexpectedError', 'uz'), { parse_mode: 'HTML' })
  }
})

// Handle language selection
bot.action(/^lang_(.+)$/, async (ctx) => {
  const tgid = ctx.from?.id.toString()
  const match = ctx.match
  if (!match) return
  const language = match[1] as Language
  
  if (!tgid || !['uz', 'en'].includes(language)) return

  try {
    const session = getSession(tgid)
    session.language = language
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { tgid }
    })

    if (existingUser) {
      // Update existing user's language
      await prisma.user.update({
        where: { tgid },
        data: { language }
      })
      
      session.step = 'registered'
      
      const welcomeMsg = `${t('welcome', language)}\n\n` +
        `👤 <b>${t('name', language)}</b> ${existingUser.name}\n` +
        `🏙️ <b>${t('region', language)}</b> ${existingUser.region}\n\n` +
        `${t('languageChanged', language)}\n\n` +
        t('selectTopic', language)
      
      await ctx.editMessageText(welcomeMsg, { parse_mode: 'HTML' })
      await showTopics(ctx, existingUser.id, language, false)
      return
    }
    
    // New user registration flow
    session.step = 'waiting_region'

    await ctx.editMessageText(
      t('welcome', language) + '\n\n' + t('selectRegion', language),
      { reply_markup: getRegionKeyboard(language).reply_markup, parse_mode: 'HTML' }
    )
  } catch (error) {
    console.error('Error selecting language:', error)
    await ctx.answerCbQuery(t('error', language || 'uz'))
  }
})

// Handle region selection
bot.action(/^region_(.+)$/, async (ctx) => {
  const tgid = ctx.from?.id.toString()
  const match = ctx.match
  if (!match) return
  const regionIndex = parseInt(match[1])
  
  if (!tgid) return

  try {
    const session = getSession(tgid)
    const lang = session.language || 'uz'
    const regions = getRegions(lang)
    
    if (regionIndex >= regions.length) return
    
    const selectedRegion = regions[regionIndex]

    if (session.step === 'waiting_region') {
      session.selectedRegion = selectedRegion
      session.step = 'waiting_name'
      
      await ctx.editMessageText(
        `✅ <b>${selectedRegion}</b> ${t('regionSelected', lang)}\n\n` +
        t('enterName', lang),
        { parse_mode: 'HTML' }
      )
    }
  } catch (error) {
    console.error('Error selecting region:', error)
    const session = getSession(tgid || '')
    const lang = session.language || 'uz'
    await ctx.answerCbQuery(t('error', lang))
  }
})

// Handle name input
bot.on('text', async (ctx) => {
  const tgid = ctx.from?.id.toString()
  if (!tgid) return

  const session = getSession(tgid)
  
  if (session.step === 'waiting_name' && session.selectedRegion && session.language) {
    try {
      const name = ctx.message?.text
      if (!name) return

      // Create user
      const newUser = await prisma.user.create({
        data: {
          tgid,
          name,
          region: session.selectedRegion,
          language: session.language
        }
      })

      session.step = 'registered'
      
      await ctx.reply(
        t('registrationComplete', session.language) + '\n\n' +
        `👤 <b>${t('name', session.language)}</b> ${name}\n` +
        `🏙️ <b>${t('region', session.language)}</b> ${session.selectedRegion}\n\n` +
        t('canStartSurvey', session.language),
        { parse_mode: 'HTML' }
      )

      await showTopics(ctx, newUser.id, session.language, false)
    } catch (error) {
      console.error('Error creating user:', error)
      await ctx.reply(t('registrationError', session.language || 'uz'), { parse_mode: 'HTML' })
    }
  }
})

// Handle topic selection
bot.action(/^topic_(.+)$/, async (ctx) => {
  const match = ctx.match
  if (!match) return
  const topicId = match[1]
  const tgid = ctx.from?.id.toString()
  
  if (!tgid) return

  try {
    const user = await prisma.user.findUnique({ where: { tgid } })
    if (!user) {
      await ctx.answerCbQuery(t('registerFirst', 'uz'))
      return
    }

    const session = getSession(tgid)
    session.currentTopicId = topicId
    session.language = user.language as Language

    // Find the first unanswered question in this topic
    const firstUnansweredIndex = await findFirstUnansweredQuestion(user.id, topicId)
    
    if (firstUnansweredIndex === -1) {
      // All questions in this topic have been answered
      const topic = await prisma.topic.findUnique({ where: { id: topicId } })
      const topicName = user.language === 'uz' ? topic?.nameUz : topic?.nameEn
      
      await ctx.answerCbQuery(
        `✅ ${t('topicCompleted', user.language as Language, { topicName: topicName || '' })}`,
        { show_alert: true }
      )
      return
    }
    
    session.currentQuestionIndex = firstUnansweredIndex
    await showQuestion(ctx, user.id, topicId, firstUnansweredIndex, user.language as Language)
  } catch (error) {
    console.error('Error selecting topic:', error)
    await ctx.answerCbQuery(t('error', 'uz'))
  }
})

// Handle answer selection
bot.action(/^answer_(.+)_(.+)$/, async (ctx) => {
  const match = ctx.match
  if (!match) return
  const questionId = match[1]
  const optionIndex = parseInt(match[2])
  const tgid = ctx.from?.id.toString()
  
  if (!tgid) return

  try {
    const user = await prisma.user.findUnique({ where: { tgid } })
    if (!user) return

    // Check if user already answered this question
    const existingAnswer = await prisma.answer.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId: questionId
        }
      }
    })

    // If user clicks on the same answer they already selected, just show feedback
    if (existingAnswer && existingAnswer.optionKey === optionIndex.toString()) {
      await ctx.answerCbQuery(`✅ ${t('selected', user.language as Language, { option: existingAnswer.option })}`, { show_alert: false })
      return
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { topic: true }
    })
    if (!question) return

    const lang = user.language as Language
    const options = JSON.parse(lang === 'uz' ? question.optionsUz : question.optionsEn)
    const selectedOption = options[optionIndex]

    // Save or update answer
    await prisma.answer.upsert({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId: question.id
        }
      },
      update: { 
        option: selectedOption,
        optionKey: optionIndex.toString()
      },
      create: {
        userId: user.id,
        questionId: question.id,
        option: selectedOption,
        optionKey: optionIndex.toString()
      }
    })

    await ctx.answerCbQuery(t('selected', lang, { option: selectedOption }))

    const session = getSession(tgid)
    const currentIndex = session.currentQuestionIndex || 0
    
    // Update the question display with new answer
    await showQuestion(ctx, user.id, question.topicId, currentIndex, lang, true)
    
    // Wait a bit before showing next question
    setTimeout(async () => {
      try {
        // Get next question in the same topic
        const nextQuestions = await prisma.question.findMany({
          where: { topicId: question.topicId },
          skip: currentIndex + 1,
          take: 1
        })

        // Find next unanswered question
        const nextUnansweredIndex = await findFirstUnansweredQuestion(user.id, question.topicId, currentIndex + 1)
        
        if (nextUnansweredIndex !== -1) {
          session.currentQuestionIndex = nextUnansweredIndex
          await showQuestion(ctx, user.id, question.topicId, nextUnansweredIndex, lang)
        } else {
          // No more unanswered questions in this topic
          const topicName = lang === 'uz' ? question.topic.nameUz : question.topic.nameEn
          await ctx.editMessageText(
            `🎉 <b>${t('topicCompleted', lang, { topicName })}</b>\n\n` +
            t('selectOtherTopics', lang),
            { parse_mode: 'HTML' }
          )
          await showTopics(ctx, user.id, lang, false)
        }
      } catch (error) {
        console.error('Error showing next question:', error)
      }
    }, 1000)
    
  } catch (error) {
    console.error('Error saving answer:', error)
    const user = await prisma.user.findUnique({ where: { tgid: tgid || '' } })
    const lang = user?.language as Language || 'uz'
    await ctx.answerCbQuery(t('error', lang))
  }
})

// Back to topics
bot.action('back_to_topics', async (ctx) => {
  const tgid = ctx.from?.id.toString()
  if (!tgid) return

  try {
    const user = await prisma.user.findUnique({ where: { tgid } })
    if (!user) return

    await showTopics(ctx, user.id, user.language as Language, true)
  } catch (error) {
    console.error('Error going back to topics:', error)
    const user = await prisma.user.findUnique({ where: { tgid: tgid || '' } })
    const lang = user?.language as Language || 'uz'
    await ctx.answerCbQuery(t('error', lang))
  }
})

// Change language
bot.action('change_language', async (ctx) => {
  const tgid = ctx.from?.id.toString()
  if (!tgid) return

  try {
    const session = getSession(tgid)
    session.step = 'waiting_language'
    
    await ctx.editMessageText(
      t('selectLanguage', 'uz') + ' / ' + t('selectLanguage', 'en'),
      getLanguageKeyboard()
    )
  } catch (error) {
    console.error('Error changing language:', error)
    await ctx.answerCbQuery(t('error', 'uz'))
  }
})

// Broadcast new question to all users
export async function broadcastQuestion(questionId: string) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { topic: true }
    })
    
    if (!question) return

    const users = await prisma.user.findMany()
    
    for (const user of users) {
      try {
        const lang = user.language as Language
        const questionText = lang === 'uz' ? question.nameUz : question.nameEn
        const topicName = lang === 'uz' ? question.topic.nameUz : question.topic.nameEn
        const options = JSON.parse(lang === 'uz' ? question.optionsUz : question.optionsEn)

        const buttons = options.map((option: string, index: number) => 
          Markup.button.callback(option, `answer_${question.id}_${index}`)
        )

        const keyboard = Markup.inlineKeyboard([
          ...buttons.map((button: any) => [button]),
          [Markup.button.callback(t('backToTopics', lang), 'back_to_topics')]
        ])

        const message = 
          `📢 <b>${t('newQuestion', lang)}</b>\n\n` +
          `📊 <b>${topicName}</b>\n` +
          `${questionText}`

        await bot.telegram.sendMessage(user.tgid, message, { 
          reply_markup: keyboard.reply_markup,
          parse_mode: 'HTML'
        })
      } catch (userError) {
        console.error(`Error broadcasting to user ${user.tgid}:`, userError)
      }
    }

    // Mark as broadcasted
    await prisma.question.update({
      where: { id: questionId },
      data: { broadcasted: true }
    })

  } catch (error) {
    console.error('Error broadcasting question:', error)
    throw error
  }
}

// Helper functions
async function findFirstUnansweredQuestion(userId: string, topicId: string, startIndex: number = 0): Promise<number> {
  const questions = await prisma.question.findMany({
    where: { topicId },
    orderBy: { createdAt: 'asc' },
    skip: startIndex
  })

  for (let i = 0; i < questions.length; i++) {
    const existingAnswer = await prisma.answer.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId: questions[i].id
        }
      }
    })
    
    if (!existingAnswer) {
      return startIndex + i
    }
  }
  
  return -1 // All questions answered
}

async function getUnansweredQuestionCount(userId: string, topicId: string): Promise<number> {
  const questions = await prisma.question.findMany({
    where: { topicId }
  })

  let unansweredCount = 0
  for (const question of questions) {
    const existingAnswer = await prisma.answer.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId: question.id
        }
      }
    })
    
    if (!existingAnswer) {
      unansweredCount++
    }
  }
  
  return unansweredCount
}

function getLanguageKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🇺🇿 Oʻzbekcha', 'lang_uz'),
      Markup.button.callback('🇺🇸 English', 'lang_en')
    ]
  ])
}

function getRegionKeyboard(language: Language) {
  const regions = getRegions(language)
  const buttons = regions.map((region, index) => 
    Markup.button.callback(region, `region_${index}`)
  )
  
  // Create rows of 2 buttons each
  const buttonRows = []
  for (let i = 0; i < buttons.length; i += 2) {
    buttonRows.push(buttons.slice(i, i + 2))
  }
  
  return Markup.inlineKeyboard(buttonRows)
}

async function showTopics(ctx: any, userId: string, language: Language, isEdit: boolean = true) {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        questions: true
      }
    })

    // Filter out topics that have no questions
    const topicsWithQuestions = topics.filter(topic => topic.questions.length > 0)

    if (topicsWithQuestions.length === 0) {
      await ctx.reply(t('noTopics', language), { parse_mode: 'HTML' })
      return
    }

    // Get topic buttons with unanswered question counts
    const buttons = await Promise.all(topicsWithQuestions.map(async topic => {
      const topicName = language === 'uz' ? topic.nameUz : topic.nameEn
      const unansweredCount = await getUnansweredQuestionCount(userId, topic.id)
      const totalQuestions = topic.questions.length
      
      let displayText: string
      if (unansweredCount === 0) {
        displayText = `✅ ${topicName} (${totalQuestions}/${totalQuestions})`
      } else {
        displayText = `${topicName} (${totalQuestions - unansweredCount}/${totalQuestions})`
      }
      
      return Markup.button.callback(displayText, `topic_${topic.id}`)
    }))

    // Add language change button
    buttons.push(Markup.button.callback(t('changeLanguage', language), 'change_language'))

    const keyboard = Markup.inlineKeyboard(
      buttons.map(button => [button])
    )

    const message = `📋 <b>${t('selectTopic', language)}</b>`
    
    if (ctx.callbackQuery && isEdit) {
      await ctx.editMessageText(message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'HTML'
      })
    } else {
      await ctx.reply(message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'HTML'
      })
    }
  } catch (error) {
    console.error('Error showing topics:', error)
    await ctx.reply(t('topicsError', language), { parse_mode: 'HTML' })
  }
}

async function showQuestion(ctx: any, userId: string, topicId: string, questionIndex: number, language: Language, isUpdate: boolean = false) {
  try {
    const questions = await prisma.question.findMany({
      where: { topicId },
      include: { topic: true },
      orderBy: { createdAt: 'asc' },
      skip: questionIndex,
      take: 1
    })

    if (questions.length === 0) return

    const question = questions[0]
    const questionText = language === 'uz' ? question.nameUz : question.nameEn
    const options = JSON.parse(language === 'uz' ? question.optionsUz : question.optionsEn)
    const topicName = language === 'uz' ? question.topic.nameUz : question.topic.nameEn
    
    // Check if user already answered this question
    const existingAnswer = await prisma.answer.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId: question.id
        }
      }
    })

    const buttons = options.map((option: string, index: number) => {
      const text = existingAnswer?.optionKey === index.toString() ? `✅ ${option}` : option
      return Markup.button.callback(text, `answer_${question.id}_${index}`)
    })

    const keyboard = Markup.inlineKeyboard([
      ...buttons.map((button: any) => [button]),
      [Markup.button.callback(t('backToTopics', language), 'back_to_topics')]
    ])

    const totalQuestions = await prisma.question.count({ where: { topicId } })
    const answeredQuestions = await prisma.answer.count({
      where: {
        userId,
        question: { topicId }
      }
    })
    
    const message = 
      `📊 <b>${topicName}</b>\n` +
      `❓ <b>${t('question', language)} ${questionIndex + 1}${t('of', language)}${totalQuestions}</b>\n` +
      `📈 <b>Progress: ${answeredQuestions}/${totalQuestions}</b>\n\n` +
      `${questionText}`

    const messageOptions = {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'HTML' as const
    }

    if (ctx.callbackQuery || isUpdate) {
      await ctx.editMessageText(message, messageOptions)
    } else {
      await ctx.reply(message, messageOptions)
    }
  } catch (error) {
    console.error('Error showing question:', error)
    await ctx.reply(t('questionError', language), { parse_mode: 'HTML' })
  }
}

// Error handling
bot.catch(async (err, ctx) => {
  console.error('Bot error:', err)
  
  try {
    const tgid = ctx.from?.id.toString()
    let language: Language = 'uz'
    
    if (tgid) {
      const user = await prisma.user.findUnique({ where: { tgid } })
      if (user) {
        language = user.language as Language
      }
    }
    
    await ctx.reply(t('unexpectedError', language), { parse_mode: 'HTML' })
  } catch (error) {
    console.error('Error in error handler:', error)
    await ctx.reply(t('unexpectedError', 'uz'))
  }
})

export default bot
