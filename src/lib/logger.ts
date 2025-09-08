import fs from 'fs'
import path from 'path'

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  timestamp: string
  level: string
  message: string
  data?: any
  userId?: string
  username?: string
}

class Logger {
  private logLevel: LogLevel
  private logDir: string

  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
    this.logDir = path.join(process.cwd(), 'logs')
    this.ensureLogDirectory()
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private writeToFile(entry: LogEntry, filename: string) {
    try {
      const logPath = path.join(this.logDir, filename)
      const logLine = `${entry.timestamp} [${entry.level}] ${entry.message}${
        entry.data ? ` | Data: ${JSON.stringify(entry.data)}` : ''
      }${entry.userId ? ` | User: ${entry.userId}` : ''}${
        entry.username ? ` (${entry.username})` : ''
      }\n`

      fs.appendFileSync(logPath, logLine)
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  private log(level: LogLevel, levelName: string, message: string, data?: any, userId?: string, username?: string) {
    if (level > this.logLevel) return

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: levelName,
      message,
      data,
      userId,
      username
    }

    // Console output with colors
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[35m', // Magenta
      RESET: '\x1b[0m'
    }

    const color = colors[levelName as keyof typeof colors] || colors.RESET
    console.log(
      `${color}${entry.timestamp} [${levelName}]${colors.RESET} ${message}${
        data ? ` | ${JSON.stringify(data)}` : ''
      }${userId ? ` | User: ${userId}` : ''}${username ? ` (${username})` : ''}`
    )

    // Write to files
    const today = new Date().toISOString().split('T')[0]
    this.writeToFile(entry, `bot-${today}.log`)
    
    if (level === LogLevel.ERROR) {
      this.writeToFile(entry, `bot-errors.log`)
    }
  }

  error(message: string, data?: any, userId?: string, username?: string) {
    this.log(LogLevel.ERROR, 'ERROR', message, data, userId, username)
  }

  warn(message: string, data?: any, userId?: string, username?: string) {
    this.log(LogLevel.WARN, 'WARN', message, data, userId, username)
  }

  info(message: string, data?: any, userId?: string, username?: string) {
    this.log(LogLevel.INFO, 'INFO', message, data, userId, username)
  }

  debug(message: string, data?: any, userId?: string, username?: string) {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data, userId, username)
  }

  // Bot-specific logging methods
  userAction(action: string, userId: string, username?: string, data?: any) {
    this.info(`User Action: ${action}`, data, userId, username)
  }

  botEvent(event: string, data?: any) {
    this.info(`Bot Event: ${event}`, data)
  }

  userRegistration(userId: string, username?: string, userData?: any) {
    this.info('User Registration', userData, userId, username)
  }

  questionAnswer(userId: string, questionId: string, answer: string, username?: string) {
    this.info('Question Answered', {
      questionId,
      answer
    }, userId, username)
  }

  broadcastSent(questionId: string, userCount: number, successCount: number, failCount: number) {
    this.info('Broadcast Sent', {
      questionId,
      totalUsers: userCount,
      successful: successCount,
      failed: failCount
    })
  }
}

export const logger = new Logger()
