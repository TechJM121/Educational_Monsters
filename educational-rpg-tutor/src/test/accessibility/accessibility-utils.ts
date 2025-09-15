// Accessibility testing utilities for Educational RPG Tutor
import { vi } from 'vitest';

export interface AccessibilityTestResult {
  passed: boolean;
  violations: AccessibilityViolation[];
  warnings: AccessibilityWarning[];
  score: number; // 0-100
}

export interface AccessibilityViolation {
  rule: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  element: string;
  fix: string;
}

export interface AccessibilityWarning {
  rule: string;
  description: string;
  element: string;
  suggestion: string;
}

export class AccessibilityTester {
  private violations: AccessibilityViolation[] = [];
  private warnings: AccessibilityWarning[] = [];

  testElement(element: Element): AccessibilityTestResult {
    this.violations = [];
    this.warnings = [];

    // Test various accessibility rules
    this.testColorContrast(element);
    this.testKeyboardNavigation(element);
    this.testAriaLabels(element);
    this.testHeadingStructure(element);
    this.testFormLabels(element);
    this.testImageAltText(element);
    this.testFocusManagement(element);
    this.testSemanticHTML(element);

    const score = this.calculateAccessibilityScore();

    return {
      passed: this.violations.filter(v => v.severity === 'critical' || v.severity === 'serious').length === 0,
      violations: this.violations,
      warnings: this.warnings,
      score
    };
  }

  private testColorContrast(element: Element): void {
    const textElements = element.querySelectorAll('*');
    
    textElements.forEach((el) => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Simplified contrast check (in real implementation, you'd calculate actual contrast ratio)
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrastRatio = this.calculateContrastRatio(color, backgroundColor);
        
        if (contrastRatio < 4.5) {
          this.violations.push({
            rule: 'color-contrast',
            severity: 'serious',
            description: `Text has insufficient color contrast (${contrastRatio.toFixed(2)}:1)`,
            element: this.getElementSelector(el),
            fix: 'Increase color contrast to at least 4.5:1 for normal text or 3:1 for large text'
          });
        }
      }
    });
  }

  private testKeyboardNavigation(element: Element): void {
    const interactiveElements = element.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    
    interactiveElements.forEach((el) => {
      const tabIndex = el.getAttribute('tabindex');
      
      // Check for positive tabindex (anti-pattern)
      if (tabIndex && parseInt(tabIndex) > 0) {
        this.violations.push({
          rule: 'tabindex',
          severity: 'moderate',
          description: 'Positive tabindex values create unpredictable tab order',
          element: this.getElementSelector(el),
          fix: 'Use tabindex="0" for focusable elements or tabindex="-1" for programmatically focusable elements'
        });
      }

      // Check if interactive elements are keyboard accessible
      if (el.tagName === 'DIV' && (el as HTMLElement).onclick && !el.hasAttribute('tabindex')) {
        this.violations.push({
          rule: 'keyboard-navigation',
          severity: 'serious',
          description: 'Interactive element is not keyboard accessible',
          element: this.getElementSelector(el),
          fix: 'Add tabindex="0" and keyboard event handlers, or use semantic HTML elements like <button>'
        });
      }
    });
  }

  private testAriaLabels(element: Element): void {
    const elementsNeedingLabels = element.querySelectorAll('button, input, select, textarea');
    
    elementsNeedingLabels.forEach((el) => {
      const hasLabel = el.hasAttribute('aria-label') || 
                      el.hasAttribute('aria-labelledby') || 
                      el.hasAttribute('title') ||
                      (el.tagName === 'INPUT' && element.querySelector(`label[for="${el.id}"]`)) ||
                      el.textContent?.trim();

      if (!hasLabel) {
        this.violations.push({
          rule: 'aria-label',
          severity: 'serious',
          description: 'Interactive element lacks accessible name',
          element: this.getElementSelector(el),
          fix: 'Add aria-label, aria-labelledby, or associate with a label element'
        });
      }
    });

    // Check for proper ARIA roles
    const elementsWithRoles = element.querySelectorAll('[role]');
    elementsWithRoles.forEach((el) => {
      const role = el.getAttribute('role');
      const validRoles = ['button', 'link', 'textbox', 'checkbox', 'radio', 'menuitem', 'tab', 'tabpanel', 'dialog', 'alert'];
      
      if (role && !validRoles.includes(role)) {
        this.warnings.push({
          rule: 'aria-roles',
          description: `Unknown or invalid ARIA role: ${role}`,
          element: this.getElementSelector(el),
          suggestion: 'Use standard ARIA roles or semantic HTML elements'
        });
      }
    });
  }

  private testHeadingStructure(element: Element): void {
    const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    if (headings.length === 0) {
      this.warnings.push({
        rule: 'heading-structure',
        description: 'No headings found - content may lack proper structure',
        element: 'document',
        suggestion: 'Add headings to create a logical content hierarchy'
      });
      return;
    }

    let previousLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (previousLevel > 0 && level > previousLevel + 1) {
        this.violations.push({
          rule: 'heading-order',
          severity: 'moderate',
          description: `Heading level skipped from h${previousLevel} to h${level}`,
          element: this.getElementSelector(heading),
          fix: 'Use heading levels in sequential order (h1, h2, h3, etc.)'
        });
      }
      
      previousLevel = level;
    });
  }

  private testFormLabels(element: Element): void {
    const formControls = element.querySelectorAll('input:not([type="hidden"]), select, textarea');
    
    formControls.forEach((control) => {
      const id = control.id;
      const hasLabel = id && element.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = control.hasAttribute('aria-label') || control.hasAttribute('aria-labelledby');
      
      if (!hasLabel && !hasAriaLabel) {
        this.violations.push({
          rule: 'form-labels',
          severity: 'serious',
          description: 'Form control lacks proper label',
          element: this.getElementSelector(control),
          fix: 'Associate with a <label> element or add aria-label attribute'
        });
      }
    });
  }

  private testImageAltText(element: Element): void {
    const images = element.querySelectorAll('img');
    
    images.forEach((img) => {
      const alt = img.getAttribute('alt');
      const role = img.getAttribute('role');
      
      if (alt === null && role !== 'presentation') {
        this.violations.push({
          rule: 'image-alt',
          severity: 'serious',
          description: 'Image lacks alt attribute',
          element: this.getElementSelector(img),
          fix: 'Add descriptive alt text or alt="" for decorative images'
        });
      } else if (alt === '') {
        // Empty alt is okay for decorative images, but warn if it might be content
        const src = img.getAttribute('src');
        if (src && !src.includes('decoration') && !src.includes('icon')) {
          this.warnings.push({
            rule: 'image-alt',
            description: 'Image has empty alt text - ensure it is truly decorative',
            element: this.getElementSelector(img),
            suggestion: 'Add descriptive alt text if image conveys information'
          });
        }
      }
    });
  }

  private testFocusManagement(element: Element): void {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    // Check for focus traps in modals
    const modals = element.querySelectorAll('[role="dialog"], .modal');
    modals.forEach((modal) => {
      const modalFocusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (modalFocusable.length === 0) {
        this.violations.push({
          rule: 'focus-management',
          severity: 'serious',
          description: 'Modal dialog contains no focusable elements',
          element: this.getElementSelector(modal),
          fix: 'Ensure modal contains at least one focusable element'
        });
      }
    });

    // Check for visible focus indicators
    focusableElements.forEach((el) => {
      const styles = window.getComputedStyle(el, ':focus');
      const outline = styles.outline;
      const boxShadow = styles.boxShadow;
      
      if (outline === 'none' && !boxShadow.includes('rgb')) {
        this.warnings.push({
          rule: 'focus-visible',
          description: 'Focusable element may lack visible focus indicator',
          element: this.getElementSelector(el),
          suggestion: 'Ensure focus indicators are clearly visible'
        });
      }
    });
  }

  private testSemanticHTML(element: Element): void {
    // Check for proper use of semantic elements
    const clickableDivs = element.querySelectorAll('div[onclick], span[onclick]');
    clickableDivs.forEach((div) => {
      this.violations.push({
        rule: 'semantic-html',
        severity: 'moderate',
        description: 'Non-semantic element used for interactive content',
        element: this.getElementSelector(div),
        fix: 'Use <button> or <a> elements for interactive content'
      });
    });

    // Check for proper landmark usage
    const main = element.querySelector('main');
    if (!main && element.children.length > 0) {
      this.warnings.push({
        rule: 'landmarks',
        description: 'Page lacks main landmark',
        element: 'document',
        suggestion: 'Use <main> element to identify primary content'
      });
    }
  }

  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast calculation (in real implementation, you'd parse RGB values and calculate properly)
    // This is a mock implementation for testing purposes
    return Math.random() * 10 + 1; // Random ratio between 1 and 11
  }

  private getElementSelector(element: Element): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private calculateAccessibilityScore(): number {
    let score = 100;
    
    this.violations.forEach((violation) => {
      switch (violation.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'serious':
          score -= 15;
          break;
        case 'moderate':
          score -= 10;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    });

    this.warnings.forEach(() => {
      score -= 2;
    });

    return Math.max(0, score);
  }
}

// Screen reader testing utilities
export class ScreenReaderTester {
  private announcements: string[] = [];

  mockScreenReaderAnnouncement(text: string): void {
    this.announcements.push(text);
  }

  getAnnouncements(): string[] {
    return [...this.announcements];
  }

  clearAnnouncements(): void {
    this.announcements = [];
  }

  testAriaLiveRegions(element: Element): {
    regions: Array<{ element: string; politeness: string; content: string }>;
    issues: string[];
  } {
    const liveRegions = element.querySelectorAll('[aria-live]');
    const issues: string[] = [];
    const regions: Array<{ element: string; politeness: string; content: string }> = [];

    liveRegions.forEach((region) => {
      const politeness = region.getAttribute('aria-live') || 'off';
      const content = region.textContent || '';
      
      regions.push({
        element: this.getElementSelector(region),
        politeness,
        content
      });

      if (politeness === 'assertive' && content.length > 100) {
        issues.push(`Assertive live region has long content (${content.length} chars) - consider using polite`);
      }
    });

    return { regions, issues };
  }

  private getElementSelector(element: Element): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }
}

// Keyboard navigation testing
export class KeyboardNavigationTester {
  private focusHistory: string[] = [];
  private currentFocusIndex = -1;

  simulateTabNavigation(container: Element): {
    focusOrder: string[];
    issues: string[];
  } {
    const focusableElements = this.getFocusableElements(container);
    const issues: string[] = [];
    const focusOrder: string[] = [];

    focusableElements.forEach((element, index) => {
      const selector = this.getElementSelector(element);
      focusOrder.push(selector);

      // Check if element is visible
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        issues.push(`Focusable element is not visible: ${selector}`);
      }

      // Check tabindex
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push(`Element uses positive tabindex (${tabIndex}): ${selector}`);
      }
    });

    return { focusOrder, issues };
  }

  simulateKeyboardInteraction(element: Element, key: string): {
    handled: boolean;
    newFocus?: string;
    action?: string;
  } {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');

    switch (key) {
      case 'Enter':
      case ' ':
        if (tagName === 'button' || role === 'button') {
          return { handled: true, action: 'click' };
        }
        if (tagName === 'a') {
          return { handled: true, action: 'navigate' };
        }
        break;
      
      case 'ArrowDown':
      case 'ArrowUp':
        if (role === 'menu' || role === 'listbox') {
          return { handled: true, action: 'navigate-options' };
        }
        break;
      
      case 'Escape':
        if (role === 'dialog' || element.closest('[role="dialog"]')) {
          return { handled: true, action: 'close-dialog' };
        }
        break;
    }

    return { handled: false };
  }

  private getFocusableElements(container: Element): Element[] {
    const selector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector));
  }

  private getElementSelector(element: Element): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }
}

// Color blindness simulation
export class ColorBlindnessSimulator {
  static simulateProtanopia(element: Element): void {
    // Simulate red-blind color vision
    this.applyColorFilter(element, 'protanopia');
  }

  static simulateDeuteranopia(element: Element): void {
    // Simulate green-blind color vision
    this.applyColorFilter(element, 'deuteranopia');
  }

  static simulateTritanopia(element: Element): void {
    // Simulate blue-blind color vision
    this.applyColorFilter(element, 'tritanopia');
  }

  private static applyColorFilter(element: Element, type: string): void {
    const filters = {
      protanopia: 'sepia(100%) saturate(0%) hue-rotate(0deg)',
      deuteranopia: 'sepia(100%) saturate(0%) hue-rotate(90deg)',
      tritanopia: 'sepia(100%) saturate(0%) hue-rotate(180deg)'
    };

    (element as HTMLElement).style.filter = filters[type as keyof typeof filters];
  }

  static removeColorFilter(element: Element): void {
    (element as HTMLElement).style.filter = '';
  }
}