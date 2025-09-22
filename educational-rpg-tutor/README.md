# 🚀 LearnCraft - Educational RPG Adventure

<div align="center">

![LearnCraft Logo](https://img.shields.io/badge/LearnCraft-Educational%20RPG-blue?style=for-the-badge&logo=rocket)

**Transform learning into an epic adventure with gamified education**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11.0.0-0055FF?style=flat&logo=framer)](https://www.framer.com/motion/)

[🎮 Live Demo](https://learncraft-demo.vercel.app) • [📚 Documentation](./docs/) • [🐛 Report Bug](https://github.com/yourusername/educational-rpg-tutor/issues) • [✨ Request Feature](https://github.com/yourusername/educational-rpg-tutor/issues)

</div>

## 🌟 Overview

LearnCraft is a revolutionary educational platform that transforms traditional learning into an immersive RPG adventure. Students embark on personalized learning quests, unlock achievements, level up their knowledge, and explore educational content through gamification.

### ✨ Key Features

- 🎯 **Personalized Learning Quests** - Adaptive content tailored to each student's pace
- 🏆 **Achievement System** - Unlock badges and rewards for learning milestones  
- 📊 **Character Progression** - Level up stats like Intelligence, Creativity, and Focus
- 🎒 **Virtual Inventory** - Collect learning tools and magical educational items
- 👑 **Leaderboards** - Compete with fellow learners in a friendly environment
- 📱 **Mobile-First Design** - Fully responsive across all devices
- 🎨 **Modern UI/UX** - Beautiful glassmorphic design with smooth animations
- ♿ **Accessibility** - WCAG 2.1 compliant with screen reader support
- 🌙 **Dark/Light Themes** - Customizable appearance preferences

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
   Navigate to `http://localhost:5173` to see the application running.

### 🎮 Guest Mode

Try LearnCraft instantly without creating an account! Click "Continue as Guest" on the auth page to explore all features with sample data.

## 📱 Mobile Experience

LearnCraft is built with a mobile-first approach, ensuring excellent user experience across all devices:

- **Touch-optimized interactions** with proper tap targets (44px minimum)
- **Responsive typography** that scales beautifully on any screen
- **Mobile-friendly navigation** with collapsible sidebar
- **PWA capabilities** for app-like experience on mobile devices
- **Safe area handling** for notched devices (iPhone X+)

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development with excellent IDE support
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Framer Motion** - Production-ready motion library for React

### UI/UX
- **Glassmorphism Design** - Modern translucent UI elements
- **Custom Animations** - Smooth, performant animations throughout
- **Responsive Design** - Mobile-first approach with custom breakpoints
- **Accessibility** - WCAG 2.1 AA compliant with screen reader support

### Development Tools
- **ESLint** - Code linting and quality enforcement
- **Prettier** - Code formatting and style consistency
- **Vitest** - Fast unit testing framework
- **Playwright** - End-to-end testing for critical user flows

## 📁 Project Structure

```
educational-rpg-tutor/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── landing/        # Landing page components
│   │   ├── navigation/     # Navigation and routing
│   │   ├── modern-ui/      # Modern UI components
│   │   ├── character/      # Character system components
│   │   ├── audio/          # Audio and sound system
│   │   ├── accessibility/  # Accessibility components
│   │   └── mobile/         # Mobile-optimized components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── contexts/           # React context providers
│   ├── styles/             # CSS and styling files
│   └── test/               # Test files and utilities
├── docs/                   # Documentation
├── public/                 # Static assets
└── ...config files
```

## 🎨 Design System

LearnCraft features a comprehensive design system with:

- **Color Palette** - Carefully crafted colors for accessibility and aesthetics
- **Typography Scale** - Fluid typography that adapts to screen size
- **Component Library** - Reusable components with consistent styling
- **Animation Guidelines** - Smooth, purposeful animations
- **Responsive Breakpoints** - Mobile-first responsive design

See [Design System Documentation](./docs/MODERN_UI_STYLE_GUIDE.md) for details.

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# Visual regression tests
npm run test:visual

# Accessibility tests
npm run test:a11y

# Performance tests
npm run test:performance

# End-to-end tests
npm run test:e2e
```

### Test Coverage

- **Unit Tests** - Component logic and utility functions
- **Integration Tests** - Component interactions and data flow
- **Visual Regression** - UI consistency across changes
- **Accessibility Tests** - WCAG compliance and screen reader support
- **Performance Tests** - Bundle size and runtime performance

## 📚 Documentation

- [📖 Developer Guide](./docs/DEVELOPER_GUIDE.md) - Comprehensive development guide
- [🎨 Style Guide](./docs/MODERN_UI_STYLE_GUIDE.md) - Design system and UI guidelines
- [📱 Mobile Responsiveness](./docs/MOBILE_RESPONSIVENESS_SUMMARY.md) - Mobile optimization details
- [🎬 Animation Guidelines](./docs/ANIMATION_GUIDELINES.md) - Animation best practices
- [♿ Accessibility Report](./src/test/accessibility/ACCESSIBILITY_COMPLIANCE_REPORT.md) - Accessibility compliance

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

**Made with ❤️ for educators and learners worldwide**

[⭐ Star this repo](https://github.com/yourusername/educational-rpg-tutor) • [🐦 Follow us on Twitter](https://twitter.com/learncraft) • [🌐 Visit our website](https://learncraft.dev)

</div>