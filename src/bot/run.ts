import 'dotenv/config'
import bot from './index'

async function startBot() {
  try {
    console.log('🚀 Starting UzVoice Telegram Bot...')
    
    // Check if bot token is configured
    if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
      console.error('❌ TELEGRAM_BOT_TOKEN is not configured in .env file')
      process.exit(1)
    }

    // Get bot info
    const botInfo = await bot.telegram.getMe()
    console.log(`✅ Bot connected: @${botInfo.username}`)
    
    // Start polling
    await bot.launch()
    
    console.log('🤖 Bot is running...')
    console.log('Press Ctrl+C to stop the bot')

    // Graceful stop
    process.once('SIGINT', () => {
      console.log('\n🛑 Stopping bot...')
      bot.stop('SIGINT')
    })
    process.once('SIGTERM', () => {
      console.log('\n🛑 Stopping bot...')
      bot.stop('SIGTERM')  
    })

  } catch (error) {
    console.error('❌ Failed to start bot:', error)
    process.exit(1)
  }
}

startBot()
