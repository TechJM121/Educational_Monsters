# 🎓 Educational RPG Tutor

<div align="center">

![Educational RPG Tutor](https://img.shields.io/badge/Educational%20RPG%20Tutor-Learning%20Adventure-blue?style=for-the-badge&logo=rocket)

**A fully functional educational game with subject selection and interactive learning**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11.0.0-0055FF?style=flat&logo=framer)](https://www.framer.com/motion/)

[🎮 Live Demo](https://learncraft-demo.vercel.app) • [📚 Documentation](./docs/) • [🐛 Report Bug](https://github.com/yourusername/educational-rpg-tutor/issues) • [✨ Request Feature](https://github.com/yourusername/educational-rpg-tutor/issues)

</div>

## 🌟 Overview

Educational RPG Tutor is a **complete, working educational game** that transforms learning into an interactive adventure. Students can choose from multiple subjects, answer questions, earn XP, and track their progress through a beautiful, gamified interface.

### ✨ **Current Features (Fully Working)**

- 🎯 **Subject Selection** - Choose from 6 subjects: Math, Science, Language Arts, History, Art, Mixed
- 📚 **Interactive Learning** - 12+ sample questions with immediate feedback
- 🏆 **XP & Leveling** - Earn 10-20 XP per correct answer, level up to unlock subjects
- 📊 **Progress Tracking** - Local storage saves your progress and stats
- 🎮 **Complete Dashboard** - Character, quests, achievements, inventory, leaderboard
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🎨 **Beautiful UI** - Modern design with smooth animations
- 🚀 **No Database Required** - Simple authentication with localStorage
- ⚡ **Instant Setup** - Ready to use in under 2 minutes

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/educational-rpg-tutor.git
   cd educational-rpg-tutor
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5174` to see the application running.

### 🎮 **Ready to Play!**

The app is **fully functional** right out of the box:
1. **Create a guest account** (just enter name and age)
2. **Choose your subject** from 6 available options
3. **Answer questions** and earn XP
4. **Level up** and unlock new subjects
5. **Explore** the complete dashboard

## 🎮 **Learning Experience**

### **3-Step Learning Flow:**
1. **Welcome Screen** → Click "Choose Your Subject"
2. **Subject Selection** → Pick from 6 subjects (unlock more as you level up)
3. **Learning Session** → Answer questions, get feedback, earn XP

### **Available Subjects:**
- 🔢 **Mathematics** - Numbers, calculations, problem-solving
- 🧪 **Science** - Natural world exploration  
- 📚 **Language Arts** - Reading, writing, communication
- 🏛️ **History** - Journey through time
- 🎨 **Art & Creativity** - Colors, shapes, imagination
- 🌈 **Mixed Adventure** - Questions from all subjects

### **Age-Appropriate Content:**
- **Ages 6-8**: Simple counting, basic concepts
- **Ages 9-12**: Elementary math, science basics
- **Ages 13-18**: Advanced topics and critical thinking

## 🏗️ Tech Stack

### **Core Technologies**
- **React 18** - Modern React with hooks and TypeScript
- **Vite** - Lightning-fast development and build tool
- **Tailwind CSS** - Utility-first CSS for beautiful styling
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing and navigation

### **Key Features**
- **Simple Authentication** - Guest accounts using localStorage
- **Progress Tracking** - Local storage for user progress and stats
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Interactive Questions** - Immediate feedback with explanations
- **Gamification** - XP system, leveling, and achievements

## 📁 Project Structure

```
educational-rpg-tutor/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── learning/       # Learning system (SubjectSelection, SimpleLearningSession)
│   │   ├── navigation/     # App layout and navigation
│   │   ├── landing/        # Landing page components
│   │   └── shared/         # Shared UI components
│   ├── pages/              # Page components (Home, Learning, Character, etc.)
│   ├── hooks/              # Custom React hooks (useSimpleAuth)
│   ├── router/             # App routing configuration
│   ├── services/           # Question service and data management
│   └── styles/             # CSS and styling files
├── public/                 # Static assets
├── .env                    # Environment variables
└── README.md              # This file
```

## 🎯 **How It Works**

### **Simple Authentication**
- No complex database setup required
- Guest accounts stored in localStorage
- Just enter your name and age to start learning

### **Subject-Based Learning**
- Choose from 6 different subjects
- Questions filtered by selected subject
- Age-appropriate difficulty scaling
- Immediate feedback with explanations

### **Progress System**
- Earn 10-20 XP per correct answer
- Level up every 100 XP
- Higher levels unlock more subjects
- Progress saved locally in your browser

## 🚀 **Getting Started**

### **Option 1: Quick Start (Recommended)**
```bash
git clone https://github.com/yourusername/educational-rpg-tutor.git
cd educational-rpg-tutor
npm install
npm run dev
```
Visit `http://localhost:5174` and start learning!

### **Option 2: Database Setup (Optional)**
If you want persistent storage:
1. Set up a Supabase project
2. Run the SQL scripts in `complete_database_setup.sql`
3. Add your Supabase credentials to `.env`
4. The app will automatically use the database

### **Testing the App**
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📚 **Documentation**

- [🎯 Final Setup Guide](./FINAL_SETUP_GUIDE.md) - Complete setup instructions
- [📖 Complete App Guide](./COMPLETE_APP_GUIDE.md) - Full feature overview
- [🔧 Setup Instructions](./SETUP_INSTRUCTIONS_FIXED.md) - Database setup (optional)

## 🎮 **What You Get**

✅ **Fully functional educational game**  
✅ **6 subjects with interactive questions**  
✅ **XP system and character progression**  
✅ **Beautiful, responsive interface**  
✅ **Complete dashboard with all features**  
✅ **No database setup required**  
✅ **Ready to use in 2 minutes**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth animations
- **Vite Team** - For the lightning-fast build tool
- **Open Source Community** - For inspiration and contributions

## 📞 Support

- 📧 **Email**: support@learncraft.dev
- 💬 **Discord**: [Join our community](https://discord.gg/learncraft)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/educational-rpg-tutor/issues)
- 📖 **Documentation**: [Full Documentation](./docs/)

---

<div align="center">

**🎓 Ready to transform learning into an adventure? 🚀**

**Made with ❤️ for educators and learners worldwide**

</div>