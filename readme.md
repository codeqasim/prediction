# PredictIt - Prediction Platform Project Documentation

## 🎯 Project Overview
**PredictIt** is a next-generation prediction platform that allows users to predict future events, compete with others, and climb leaderboards. Built with AngularJS frontend and Supabase backend.

**Core Purpose**: Create an engaging prediction market platform where users can test their forecasting skills and compete globally.

---

## 🏗️ Infrastructure & Architecture

### Frontend Framework
- **Framework**: AngularJS 1.8.3
- **Routing**: ngRoute with lazy loading via ocLazyLoad
- **CSS Framework**: Tailwind CSS (CDN)
- **Icons**: Material Icons & Material Icons Outlined

### Backend & Database
- **Backend Service**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for avatars and files)
- **Real-time**: Supabase Realtime subscriptions

---

## 🔐 Authentication Module

### How Auth Works
1. **SupabaseService.js**: Core connection to Supabase backend
   - Handles all Supabase client operations
   - Provides auth methods (login, register, logout, password reset)
   - Database operations and file storage

2. **AuthService.js**: Frontend authentication logic
   - Manages user session state
   - Broadcasts auth events across the app
   - Handles authentication checks and user data

3. **AuthController.js**: UI authentication controller
   - Manages login/register forms
   - Form validation and error handling
   - User interaction logic

### Authentication Flow
```
User Input → AuthController → AuthService → SupabaseService → Supabase Backend
                ↓
           UI Updates ← $rootScope.broadcast ← Session Management
```

### Database Credentials (Supabase)
- **URL**: `https://owoyahkmgzhnruoxghdf.supabase.co`
- **Anon Key**: `sb_publishable_GXGzt6hCiacsgr_udR77_g_nER3M4hH`
- **Demo Mode**: Available for development/testing
- **Tables**: Users, Predictions, Leaderboards, User_Profiles

---

## 🎨 Theme & Design System

### Color Palette
- **Primary Purple**: `#8b45ff` (var(--primary-purple))
- **Secondary Purple**: `#a855f7` (var(--secondary-purple))
- **Light Purple**: `#c4b5fd` (var(--light-purple))
- **Dark Purple**: `#6b21a8` (var(--dark-purple))
- **Accent Violet**: `#8b5cf6` (var(--accent-violet))

### Design Elements
- **Background**: Dark theme with gradient (`#020617` to `#1e293b`)
- **Glassmorphism**: Backdrop blur effects with transparency
- **Animation**: Floating particles, smooth transitions, hover effects
- **Typography**: Inter font family with gradient text effects
- **Borders**: Rounded corners (3xl = 1.5rem), purple borders

### UI Components
- **Cards**: Black/20 opacity with backdrop blur and purple borders
- **Buttons**: Gradient purple backgrounds with hover scaling
- **Forms**: Transparent inputs with purple focus rings
- **Navigation**: Sticky header with glassmorphism effect

---

## 📁 Project Structure

```
prediction/
├── app/
│   ├── app.js                 # Main Angular module with ocLazyLoad
│   ├── routes.js              # Route configuration with lazy loading
│   ├── controllers/           # Lazy-loaded controllers
│   │   ├── AuthController.js  # Authentication logic
│   │   ├── DashboardController.js
│   │   ├── HomeController.js
│   │   └── ...
│   ├── services/              # Core services
│   │   ├── SupabaseService.js # Database connection
│   │   ├── AuthService.js     # Authentication management
│   │   └── UserService.js     # User operations
│   └── views/                 # HTML templates
│       ├── auth/
│       │   ├── login.html     # Themed login page
│       │   ├── register.html
│       │   └── dashboard.html
│       ├── home/
│       └── partials/
├── assets/
│   ├── app.css               # Theme styles and animations
│   ├── bg.mp4               # Background video
│   └── favicon.ico
└── index.html               # Main entry point
```

---

## 🚀 Lazy Loading Implementation

### Controller Lazy Loading
- **Library**: ocLazyLoad (CDN: `https://cdn.jsdelivr.net/npm/oclazyload@1.1.0/dist/ocLazyLoad.min.js`)
- **Implementation**: Routes use `resolve` blocks to load controllers on demand
- **Benefits**: Faster initial load, better performance

### Route Configuration Example
```javascript
.when('/login', {
    templateUrl: 'app/views/auth/login.html',
    controller: 'AuthController',
    controllerAs: 'auth',
    resolve: {
        loadController: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load('app/controllers/AuthController.js');
        }]
    }
})
```

---

## 🗄️ Database Schema (Supabase)

### Core Tables
1. **users** (Supabase Auth table)
   - id, email, created_at, user_metadata

2. **user_profiles**
   - user_id (FK), first_name, last_name, username, avatar_url, points, created_at

3. **predictions**
   - id, title, description, category, end_date, status, created_by, created_at

4. **user_predictions**
   - user_id (FK), prediction_id (FK), choice, confidence, points_earned

5. **leaderboard**
   - user_id (FK), total_points, rank, total_predictions, accuracy_rate

---

## 🔧 Development Setup

### Prerequisites
- Modern web browser
- Local web server (Apache/Nginx/Node.js)
- Supabase account

### Installation
1. Clone repository
2. Configure Supabase credentials in `SupabaseService.js`
3. Serve files via web server
4. Access via browser

### Key Files to Monitor
- `app/services/SupabaseService.js` - Database connection
- `app/routes.js` - Routing and lazy loading
- `assets/app.css` - Theme styles
- `index.html` - Dependencies and CDN links

---

## 🔄 Recent Updates

### Authentication & Lazy Loading (Latest)
- ✅ Added ocLazyLoad for controller lazy loading
- ✅ Updated routes with resolve blocks for performance
- ✅ Created themed login page matching design system
- ✅ Implemented proper auth flow with Supabase integration

### Theme Implementation
- ✅ Consistent purple/violet color scheme
- ✅ Glassmorphism effects throughout UI
- ✅ Animated background with floating particles
- ✅ Responsive design with proper hover states

---

## 🔮 Future Enhancements

### Planned Features
- Real-time prediction updates
- Social sharing integration
- Advanced analytics dashboard
- Mobile app development
- Payment integration for premium features

### Technical Improvements
- PWA implementation
- Service worker for offline support
- Advanced caching strategies
- Performance monitoring
- SEO optimization

---

## 📝 Important Notes

### For Developers
- Always maintain the purple theme consistency
- Use lazy loading for new controllers
- Follow glassmorphism design patterns
- Test authentication flow thoroughly
- Keep Supabase credentials secure

### For Deployment
- Update Supabase URLs for production
- Optimize assets and images
- Configure proper CORS settings
- Set up SSL certificates
- Monitor performance metrics

---

**Last Updated**: August 11, 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
