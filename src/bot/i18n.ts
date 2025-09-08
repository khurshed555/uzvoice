// Bot-specific translations (separate from web app)
const botTranslations = {
  uz: {
    welcome: "🇺🇿 Assalomu alaykum! UzVoice botiga xush kelibsiz!",
    selectRegion: "Iltimos, oʻz viloyatingizni tanlang:",
    selectLanguage: "Tilni tanlang:",
    regionSelected: "tanlandi.",
    enterName: "Endi ismingizni kiriting:",
    registrationComplete: "🎉 Roʻyxatdan oʻtish muvaffaqiyatli yakunlandi!",
    name: "👤 Ism:",
    region: "🏙️ Viloyat:",
    canStartSurvey: "Endi soʻrovnomalarga javob berishingiz mumkin.",
    selectTopic: "📋 Quyidagi mavzulardan birini tanlang:",
    noTopics: "📝 Hozircha mavzular mavjud emas.",
    backToTopics: "🔙 Mavzularga qaytish",
    topicCompleted: "🎉 \"{topicName}\" mavzusidagi barcha savollarga javob berdingiz!",
    selectOtherTopics: "Boshqa mavzularni tanlashingiz mumkin:",
    selected: "✅ \"{option}\" tanlandi",
    question: "❓ Savol",
    of: "/",
    error: "❌ Xatolik yuz berdi",
    tryAgain: "Iltimos, qaytadan urinib koʻring.",
    registerFirst: "❌ Avval roʻyxatdan oʻting",
    registrationError: "❌ Roʻyxatdan oʻtishda xatolik yuz berdi.",
    topicsError: "❌ Mavzularni yuklashda xatolik yuz berdi.",
    questionError: "❌ Savolni yuklashda xatolik yuz berdi.",
    unexpectedError: "❌ Kutilmagan xatolik yuz berdi. Iltimos, qaytadan urinib koʻring.",
    languageChanged: "✅ Til oʻzgartirildi",
    newQuestion: "📢 Yangi savol!",
    from: "dan",
    answerNow: "Hozir javob bering",
    changeLanguage: "🌐 Tilni oʻzgartirish",
    progress: "📈 Jarayon",
    completed: "✅ Tugallangan",
    allQuestionsAnswered: "🎉 Barcha savollarga javob berildi!"
  },
  en: {
    welcome: "🇺🇸 Hello! Welcome to UzVoice bot!",
    selectRegion: "Please select your region:",
    selectLanguage: "Choose Language:",
    regionSelected: "selected.",
    enterName: "Now enter your name:",
    registrationComplete: "🎉 Registration completed successfully!",
    name: "👤 Name:",
    region: "🏙️ Region:",
    canStartSurvey: "Now you can answer surveys.",
    selectTopic: "📋 Please select one of the following topics:",
    noTopics: "📝 No topics available yet.",
    backToTopics: "🔙 Back to topics",
    topicCompleted: "🎉 You have answered all questions in \"{topicName}\" topic!",
    selectOtherTopics: "You can select other topics:",
    selected: "✅ \"{option}\" selected",
    question: "❓ Question",
    of: " of ",
    error: "❌ An error occurred",
    tryAgain: "Please try again.",
    registerFirst: "❌ Please register first",
    registrationError: "❌ Registration error occurred.",
    topicsError: "❌ Failed to load topics.",
    questionError: "❌ Failed to load question.",
    unexpectedError: "❌ Unexpected error occurred. Please try again.",
    languageChanged: "✅ Language changed",
    newQuestion: "📢 New question!",
    from: "from",
    answerNow: "Answer now",
    changeLanguage: "🌐 Change Language",
    progress: "📈 Progress",
    completed: "✅ Completed",
    allQuestionsAnswered: "🎉 All questions answered!"
  }
}

const regions = {
  uz: [
    'Toshkent shahri',
    'Toshkent viloyati',
    'Andijon viloyati',
    'Buxoro viloyati',
    'Fargʻona viloyati',
    'Jizzax viloyati',
    'Xorazm viloyati',
    'Namangan viloyati',
    'Navoiy viloyati',
    'Qashqadaryo viloyati',
    'Qoraqalpogʻiston Respublikasi',
    'Samarqand viloyati',
    'Sirdaryo viloyati',
    'Surxondaryo viloyati'
  ],
  en: [
    'Tashkent City',
    'Tashkent Region',
    'Andijan Region',
    'Bukhara Region',
    'Fergana Region',
    'Jizzakh Region',
    'Khorezm Region',
    'Namangan Region',
    'Navoi Region',
    'Kashkadarya Region',
    'Republic of Karakalpakstan',
    'Samarkand Region',
    'Sirdarya Region',
    'Surkhandarya Region'
  ]
}

export function t(key: string, lang: 'uz' | 'en' = 'uz', params?: Record<string, string>): string {
  const keys = key.split('.')
  let value: any = botTranslations[lang]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  if (typeof value !== 'string') {
    return key // Return key if translation not found
  }
  
  // Replace parameters in the string
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => {
      return params[paramKey] || match
    })
  }
  
  return value
}

export function getRegions(lang: 'uz' | 'en' = 'uz'): string[] {
  return regions[lang]
}

export type Language = 'uz' | 'en'
