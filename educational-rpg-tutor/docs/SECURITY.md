# Security Policy

## Supported Versions

We actively support the following versions of LearnCraft with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of LearnCraft seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@learncraft.dev**

Include the following information in your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.
- **Initial Assessment**: We will provide an initial assessment of the report within 5 business days.
- **Regular Updates**: We will keep you informed of our progress throughout the process.
- **Resolution Timeline**: We aim to resolve critical vulnerabilities within 30 days.

### Disclosure Policy

- We will coordinate with you on the timing of disclosure
- We prefer coordinated disclosure after a fix is available
- We will credit you in our security advisory (unless you prefer to remain anonymous)

## Security Best Practices

### For Users

- Keep your browser updated to the latest version
- Use strong, unique passwords if creating an account
- Be cautious when clicking links or downloading files
- Report suspicious activity immediately

### For Developers

- Follow secure coding practices
- Keep dependencies updated
- Use TypeScript for type safety
- Implement proper input validation
- Use Content Security Policy (CSP)
- Sanitize user inputs
- Implement proper authentication and authorization
- Use HTTPS in production
- Regular security audits and dependency scanning

## Security Features

LearnCraft implements several security measures:

### Frontend Security
- **Content Security Policy (CSP)** - Prevents XSS attacks
- **Input Sanitization** - All user inputs are properly sanitized
- **HTTPS Only** - All production traffic uses HTTPS
- **Secure Headers** - Proper security headers are set
- **Dependency Scanning** - Regular automated dependency vulnerability scanning

### Data Protection
- **No Sensitive Data Storage** - No sensitive personal data is stored locally
- **Guest Mode** - Users can explore without providing personal information
- **Privacy by Design** - Minimal data collection principles

### Development Security
- **Automated Security Scanning** - GitHub Actions security workflows
- **Dependency Updates** - Automated dependency updates with Dependabot
- **Code Review** - All changes require code review
- **Static Analysis** - ESLint security rules and static analysis

## Vulnerability Response Process

1. **Report Received** - Security team acknowledges the report
2. **Triage** - Assess severity and impact
3. **Investigation** - Reproduce and analyze the vulnerability
4. **Fix Development** - Develop and test the fix
5. **Testing** - Comprehensive testing of the fix
6. **Release** - Deploy the fix to production
7. **Disclosure** - Coordinate public disclosure
8. **Post-mortem** - Review and improve security processes

## Security Contact

For security-related questions or concerns:

- **Email**: security@learncraft.dev
- **PGP Key**: Available upon request
- **Response Time**: Within 48 hours

## Bug Bounty Program

We currently do not have a formal bug bounty program, but we greatly appreciate security researchers who help us keep LearnCraft secure. We will:

- Acknowledge your contribution publicly (if desired)
- Provide a detailed response to your report
- Work with you on responsible disclosure
- Consider implementing a formal bug bounty program in the future

## Security Updates

Security updates will be:

- Released as soon as possible after a fix is available
- Documented in our changelog with appropriate severity levels
- Announced through our official channels
- Backported to supported versions when necessary

## Compliance

LearnCraft follows industry best practices and standards:

- **OWASP Top 10** - Protection against common web vulnerabilities
- **WCAG 2.1** - Accessibility compliance
- **Privacy by Design** - Minimal data collection and processing
- **Secure Development Lifecycle** - Security integrated into development process

---

Thank you for helping keep LearnCraft and our users safe!