# Contributing to LearnCraft

Thank you for your interest in contributing to LearnCraft! We welcome contributions from developers of all skill levels.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm
- Git
- A GitHub account

### Setting Up Your Development Environment

1. **Fork the repository**
   - Click the "Fork" button on the GitHub repository page
   - Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/educational-rpg-tutor.git
   cd educational-rpg-tutor
   ```

2. **Add the upstream remote**
   ```bash
   git remote add upstream https://github.com/originalowner/educational-rpg-tutor.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🎯 How to Contribute

### Types of Contributions

We welcome several types of contributions:

- 🐛 **Bug fixes** - Fix issues and improve stability
- ✨ **New features** - Add new functionality
- 📚 **Documentation** - Improve or add documentation
- 🎨 **UI/UX improvements** - Enhance user experience
- ♿ **Accessibility** - Improve accessibility compliance
- 🧪 **Tests** - Add or improve test coverage
- 🔧 **Refactoring** - Improve code quality and structure

### Before You Start

1. **Check existing issues** - Look for existing issues or discussions
2. **Create an issue** - For new features or major changes, create an issue first
3. **Discuss your approach** - Get feedback before starting work

## 📝 Development Workflow

### 1. Create a Branch

Create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
# or
git checkout -b docs/documentation-update
```

### 2. Make Your Changes

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

Run the full test suite:

```bash
# Unit tests
npm run test

# Visual regression tests
npm run test:visual

# Accessibility tests
npm run test:a11y

# Linting
npm run lint

# Type checking
npm run type-check
```

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add character customization modal

- Add modal component for character customization
- Implement stat allocation system
- Add responsive design for mobile devices
- Include accessibility features and keyboard navigation"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## 📋 Code Style Guidelines

### TypeScript/React

- Use TypeScript for all new code
- Follow React hooks best practices
- Use functional components with hooks
- Implement proper error boundaries
- Use proper TypeScript types (avoid `any`)

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use CSS custom properties for theming
- Ensure accessibility (contrast ratios, focus states)

### File Organization

```
src/
├── components/
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.test.tsx
│   │   └── index.ts
├── hooks/
├── utils/
├── types/
└── pages/
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase starting with "use" (`useUserData.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`UserProfile.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)

## 🧪 Testing Guidelines

### Writing Tests

- Write tests for all new functionality
- Use descriptive test names
- Test both happy path and edge cases
- Mock external dependencies
- Aim for high test coverage

### Test Types

1. **Unit Tests** - Test individual functions and components
2. **Integration Tests** - Test component interactions
3. **Visual Regression Tests** - Ensure UI consistency
4. **Accessibility Tests** - Verify WCAG compliance

### Example Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileButton } from './MobileButton';

describe('MobileButton', () => {
  it('renders with correct text', () => {
    render(<MobileButton>Click me</MobileButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<MobileButton onClick={handleClick}>Click me</MobileButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document component props with TypeScript interfaces
- Include usage examples in component documentation

### README Updates

- Update README.md for new features
- Add screenshots for UI changes
- Update installation or setup instructions if needed

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the bug
3. **Expected behavior** vs actual behavior
4. **Screenshots** or videos if applicable
5. **Environment details** (browser, OS, device)
6. **Console errors** if any

### Bug Report Template

```markdown
## Bug Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- OS: [e.g. iOS, Windows, macOS]
- Browser: [e.g. Chrome, Safari, Firefox]
- Version: [e.g. 22]
- Device: [e.g. iPhone 12, Desktop]
```

## ✨ Feature Requests

For feature requests, please include:

1. **Problem description** - What problem does this solve?
2. **Proposed solution** - How should it work?
3. **Alternatives considered** - Other approaches you've thought of
4. **Additional context** - Screenshots, mockups, examples

## 🔍 Code Review Process

### What We Look For

- **Functionality** - Does the code work as intended?
- **Code Quality** - Is the code clean, readable, and maintainable?
- **Performance** - Are there any performance implications?
- **Accessibility** - Does it maintain accessibility standards?
- **Mobile Responsiveness** - Does it work well on mobile devices?
- **Tests** - Are there adequate tests?
- **Documentation** - Is it properly documented?

### Review Timeline

- Initial review within 2-3 business days
- Follow-up reviews within 1-2 business days
- Merge after approval and passing CI checks

## 🏷️ Issue Labels

We use labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `accessibility` - Accessibility improvements
- `mobile` - Mobile-specific issues
- `performance` - Performance improvements

## 🎉 Recognition

Contributors will be:

- Added to the contributors list in README.md
- Mentioned in release notes for significant contributions
- Invited to join our Discord community
- Eligible for contributor swag (for significant contributions)

## 📞 Getting Help

If you need help:

- 💬 **Discord**: Join our [Discord community](https://discord.gg/learncraft)
- 📧 **Email**: developers@learncraft.dev
- 🐛 **Issues**: Create a GitHub issue with the `help wanted` label

## 📄 License

By contributing to LearnCraft, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to LearnCraft! Together, we're making learning more engaging and accessible for everyone. 🚀