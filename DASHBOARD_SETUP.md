# UzVoice Dashboard & Security Setup

## 🔐 Security Features Implemented

### Admin Authentication
- **Login Page**: `/admin/login`
- **Credentials**: Set in `.env` file
  - `ADMIN_USERNAME="admin"`
  - `ADMIN_PASSWORD="admin123"`
  - `JWT_SECRET="uzvoice-super-secret-jwt-key-change-in-production"`

### API Route Security
- All admin API routes (`/api/users`, `/api/topics`, `/api/questions`) now require authentication
- JWT token-based authentication with HTTP-only cookies
- 401 Unauthorized responses for unauthenticated requests

### Secure Headers
- Authorization: `Bearer <token>`
- HTTP-only cookies for session management
- CSRF protection through SameSite cookies

## 🌍 Public Dashboard

### Language Selection (Port 3001)
- **Home Page**: http://localhost:3001
- Choose between Uzbek (🇺🇿) and English (🇺🇸)
- Beautiful gradient design with hover effects

### Dashboard Features
- **Topics**: Display all survey topics with question counts
- **Questions**: Show questions for selected topic
- **Analytics**: Pie chart visualization using Chart.js
- **Real-time Data**: Fetches live survey responses
- **Responsive Design**: Works on all screen sizes

### Dashboard Flow
1. Select language on home page
2. Choose a topic from the sidebar
3. Select a question to view analytics
4. View pie chart with answer distribution
5. See percentages and total response counts

## 📊 Chart Features
- **Interactive Pie Charts**: Click to see detailed tooltips
- **Multilingual**: Labels in selected language
- **Color-coded**: Different colors for each option
- **Statistics**: Shows counts and percentages
- **No Data Handling**: Graceful display when no responses exist

## 🔗 Available URLs

### Public Access (No Authentication)
- `http://localhost:3001` - Language selection
- `http://localhost:3001/dashboard?lang=uz` - Uzbek dashboard
- `http://localhost:3001/dashboard?lang=en` - English dashboard

### Admin Access (Requires Authentication)
- `http://localhost:3001/admin/login` - Admin login
- `http://localhost:3001/admin` - Admin dashboard (after login)

### API Endpoints

#### Public APIs (No Auth)
- `GET /api/dashboard/topics` - Get topics for dashboard
- `GET /api/dashboard/question/[id]` - Get question analytics

#### Secure Admin APIs (Require Auth)
- `GET /api/users` - Get all users
- `POST /api/users?action=stats` - User statistics
- `GET /api/topics` - Get all topics
- `POST /api/topics` - Create topic
- `GET /api/questions` - Get questions
- `POST /api/questions` - Create question

## 🚨 Security Notes

### Hacker Protection
1. **JWT Authentication**: All admin routes protected
2. **HTTP-only Cookies**: Cannot be accessed via JavaScript
3. **Environment Variables**: Credentials stored securely
4. **Input Validation**: All API inputs validated
5. **Error Handling**: No sensitive information leaked
6. **Rate Limiting**: Prevent brute force (consider adding)

### Production Security Checklist
- [ ] Change default admin credentials
- [ ] Use strong JWT secret (64+ characters)
- [ ] Enable HTTPS in production
- [ ] Set up rate limiting
- [ ] Add request validation middleware
- [ ] Monitor failed login attempts
- [ ] Set secure cookie flags in production

## 🎨 UI/UX Features
- **Modern Design**: Gradient backgrounds and shadows
- **Smooth Animations**: Hover effects and transitions  
- **Loading States**: Spinner animations during data fetch
- **Error Handling**: User-friendly error messages
- **Responsive Layout**: Mobile and desktop friendly
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 📱 Mobile Support
- Responsive grid layout
- Touch-friendly buttons
- Optimized chart sizes
- Scrollable content areas
- Mobile-first design approach

## 🔧 Technical Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **Authentication**: JWT + HTTP-only cookies
- **Database**: SQLite + Prisma ORM
- **Security**: bcryptjs, jsonwebtoken

## 🚀 Getting Started
1. Start the development server: `npm run dev`
2. Visit: http://localhost:3001
3. For admin access: http://localhost:3001/admin/login
4. Default credentials: admin / admin123

The dashboard is now fully functional with secure authentication and beautiful analytics visualization!
