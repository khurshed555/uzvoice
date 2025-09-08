# UzVoice - Telegram Survey Bot

A Next.js application with a Telegram bot for conducting surveys in Uzbekistan. Users can register by selecting their region and answer questions on various topics.

## Features

- 🤖 **Telegram Bot Integration** - Interactive bot with inline keyboards
- 🏙️ **Region-based Registration** - Users select from all Uzbekistan regions  
- 📊 **Topic-based Surveys** - Organize questions by topics
- 💾 **SQLite Database** - Using Prisma ORM
- 🔄 **Real-time Responses** - Track user answers and progress
- 📈 **Analytics API** - Get user statistics by region

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: SQLite with Prisma ORM
- **Bot**: Telegraf (Telegram Bot Framework)
- **Language**: TypeScript
- **Styling**: Tailwind CSS

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Database

```bash
# Generate Prisma client and create database
npm run db:push
```

### 3. Configure Telegram Bot

1. Create a new bot with [@BotFather](https://t.me/botfather)
2. Copy your bot token
3. Update `.env` file:

```env
TELEGRAM_BOT_TOKEN="your_bot_token_here"
```

### 4. Start the Application

```bash
# Start the web application
npm run dev

# Start the Telegram bot (in another terminal)
npm run bot:start

# Or start bot in development mode with auto-reload
npm run bot:dev
```

## ✅ Build Status

 The project builds successfully with Next.js 15.5.2 and TypeScript. All parsing and type errors have been resolved.

## Usage

### Bot Commands
- `/start` - Register or show topics menu

### Bot Flow
1. User starts the bot
2. If new user, forced to select region from Uzbekistan
3. User enters their name
4. User can select topics and answer questions
5. Answers are saved to database

### API Endpoints

#### Users
- `GET /api/users` - Get all users with their answers
- `POST /api/users?action=stats` - Get user statistics by region

#### Topics (Full CRUD)
- `GET /api/topics` - Get all topics with question counts
- `POST /api/topics` - Create new topic
- `GET /api/topics/[id]` - Get single topic by ID
- `PUT /api/topics/[id]` - Update topic
- `DELETE /api/topics/[id]` - Delete topic

#### Questions (Full CRUD)
- `GET /api/questions?topicId=xxx` - Get questions by topic
- `POST /api/questions` - Create new question (with broadcast option)
- `GET /api/questions/[id]` - Get single question by ID
- `PUT /api/questions/[id]` - Update question
- `DELETE /api/questions/[id]` - Delete question
- `POST /api/questions/[id]/broadcast` - Broadcast question to all users

### Database Management

```bash
# Open Prisma Studio to view/edit data
npm run db:studio

# Reset database (be careful!)
npm run db:push
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   └── page.tsx        # Main page
├── bot/                # Telegram bot
│   ├── index.ts        # Bot logic
│   └── run.ts          # Bot runner
└── lib/
    └── prisma.ts       # Database client

prisma/
├── schema.prisma       # Database schema
└── dev.db             # SQLite database
```

## Database Schema

- **User**: id, name, tgid (Telegram ID), region, timestamps
- **Topic**: id, name, timestamps
- **Question**: id, name, options (JSON), topicId, timestamps  
- **Answer**: userId, questionId, option, timestamp (composite key)

## Contributing

1. Add topics and questions via API or Prisma Studio
2. Test bot functionality
3. Monitor user responses and analytics

## Uzbekistan Regions Supported

- Toshkent shahri, Toshkent viloyati
- Andijon, Buxoro, Farg'ona, Jizzax viloyatlari
- Xorazm, Namangan, Navoiy, Qashqadaryo viloyatlari
- Qoraqalpog'iston Respublikasi
- Samarqand, Sirdaryo, Surxondaryo viloyatlari
