# Educational RPG Tutor

A gamified learning platform that transforms educational content into an engaging RPG-style experience for students ages 3-18.

## 🎮 Features

- **Character Progression**: Students create customizable characters that level up through learning
- **RPG Stats System**: Six core attributes (Intelligence, Vitality, Wisdom, Charisma, Dexterity, Creativity) that improve based on subjects studied
- **Achievement System**: Badges and rewards for learning milestones
- **Social Features**: Leaderboards, challenges, and item trading with classmates
- **Themed Learning Worlds**: Subject-specific environments with unique quests and challenges
- **Parent/Teacher Dashboard**: Progress monitoring and reporting tools

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
4. Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # React components organized by feature
│   ├── character/      # Character-related components
│   ├── learning/       # Learning activity components
│   ├── gamification/   # Achievement and reward components
│   ├── home/          # Home page components
│   └── shared/        # Reusable UI components
├── hooks/             # Custom React hooks
├── services/          # API and external service integrations
└── types/            # TypeScript type definitions
```

## 🎨 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Tailwind CSS with custom RPG theme
- **State Management**: React Context + useReducer
- **Animations**: Framer Motion

## 🎯 Development Status

This project is currently in the foundation setup phase. The following infrastructure has been established:

- ✅ React TypeScript project with Vite
- ✅ Supabase client configuration
- ✅ Tailwind CSS with RPG-themed styling
- ✅ Project structure and type definitions
- ✅ Basic authentication hook

## 📝 License

This project is part of the Educational RPG Tutor specification and is intended for educational purposes.