import 'dotenv/config'
import bot from './index'
import { logger } from '../lib/logger'

async function startBot() {
  try {
    logger.info('🚀 Starting UzVoice Telegram Bot...')
    
    // Check if bot token is configured
    if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
      logger.error('❌ TELEGRAM_BOT_TOKEN is not configured in .env file')
      process.exit(1)
    }

    // Get bot info
    const botInfo = await bot.telegram.getMe()
    logger.info(`✅ Bot connected: @${botInfo.username}`, { 
      botId: botInfo.id,
      botName: botInfo.first_name 
    })
    
    // Start polling
    await bot.launch()
    
    logger.info('🤖 Bot is running and listening for messages...')
    logger.info('Press Ctrl+C to stop the bot')

    // Graceful stop
    process.once('SIGINT', () => {
      logger.warn('\n🛑 Stopping bot (SIGINT)...')
      bot.stop('SIGINT')
    })
    process.once('SIGTERM', () => {
      logger.warn('\n🛑 Stopping bot (SIGTERM)...')
      bot.stop('SIGTERM')  
    })

  } catch (error) {
    logger.error('❌ Failed to start bot', error)
    process.exit(1)
  }
}

startBot()
