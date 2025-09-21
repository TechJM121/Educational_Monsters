/**
 * ARIA Utilities
 * Helper functions for managing ARIA attributes and screen reader compatibility
 */

export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-disabled'?: boolean;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-pressed'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  role?: string;
  tabIndex?: number;
}

// Generate unique IDs for ARIA relationships
let idCounter = 0;
export const generateAriaId = (prefix: string = 'aria'): string => {
  return `${prefix}-${++idCounter}-${Date.now()}`;
};

// Create ARIA attributes for animated elements
export const createAnimationAriaAttributes = (
  isAnimating: boolean,
  animationType: string,
  description?: string
): AriaAttributes => {
  const baseAttributes: AriaAttributes = {
    'aria-busy': isAnimating,
  };

  if (isAnimating) {
    baseAttributes['aria-live'] = 'polite';
    baseAttributes.role = 'status';
  }

  if (description) {
    baseAttributes['aria-label'] = `${animationType} animation: ${description}`;
  }

  return baseAttributes;
};

// Create ARIA attributes for loading states
export const createLoadingAriaAttributes = (
  isLoading: boolean,
  progress?: number,
  loadingText?: string
): AriaAttributes => {
  const attributes: AriaAttributes = {
    'aria-busy': isLoading,
    role: isLoading ? 'progressbar' : undefined,
  };

  if (isLoading) {
    attributes['aria-live'] = 'polite';
    
    if (progress !== undefined) {
      attributes['aria-valuenow'] = progress;
      attributes['aria-valuemin'] = 0;
      attributes['aria-valuemax'] = 100;
      attributes['aria-valuetext'] = `${Math.round(progress)}% complete`;
    }
    
    if (loadingText) {
      attributes['aria-label'] = loadingText;
    }
  }

  return attributes;
};

// Create ARIA attributes for interactive elements
export const createInteractiveAriaAttributes = (
  elementType: 'button' | 'link' | 'tab' | 'menuitem',
  state: {
    disabled?: boolean;
    pressed?: boolean;
    expanded?: boolean;
    selected?: boolean;
    current?: boolean;
  } = {}
): AriaAttributes => {
  const attributes: AriaAttributes = {};

  // Set appropriate role if needed
  if (elementType === 'tab') {
    attributes.role = 'tab';
  } else if (elementType === 'menuitem') {
    attributes.role = 'menuitem';
  }

  // Set state attributes
  if (state.disabled !== undefined) {
    attributes['aria-disabled'] = state.disabled;
    attributes.tabIndex = state.disabled ? -1 : 0;
  }

  if (state.pressed !== undefined) {
    attributes['aria-pressed'] = state.pressed;
  }

  if (state.expanded !== undefined) {
    attributes['aria-expanded'] = state.expanded;
  }

  if (state.selected !== undefined) {
    attributes['aria-selected'] = state.selected;
  }

  if (state.current !== undefined) {
    attributes['aria-current'] = state.current ? 'page' : false;
  }

  return attributes;
};

// Create ARIA attributes for form elements
export const createFormAriaAttributes = (
  fieldType: 'input' | 'select' | 'textarea' | 'checkbox' | 'radio',
  validation: {
    isValid?: boolean;
    errorMessage?: string;
    isRequired?: boolean;
  } = {}
): AriaAttributes => {
  const attributes: AriaAttributes = {};

  if (validation.isRequired) {
    attributes['aria-required'] = true;
  }

  if (validation.isValid === false) {
    attributes['aria-invalid'] = true;
    
    if (validation.errorMessage) {
      const errorId = generateAriaId('error');
      attributes['aria-describedby'] = errorId;
      // Note: The error element should be created with this ID
    }
  }

  return attributes;
};

// Create ARIA attributes for navigation elements
export const createNavigationAriaAttributes = (
  navType: 'main' | 'breadcrumb' | 'pagination' | 'tabs',
  currentItem?: string
): AriaAttributes => {
  const attributes: AriaAttributes = {
    role: 'navigation',
  };

  switch (navType) {
    case 'main':
      attributes['aria-label'] = 'Main navigation';
      break;
    case 'breadcrumb':
      attributes['aria-label'] = 'Breadcrumb navigation';
      break;
    case 'pagination':
      attributes['aria-label'] = 'Pagination navigation';
      break;
    case 'tabs':
      attributes.role = 'tablist';
      attributes['aria-label'] = 'Tab navigation';
      break;
  }

  return attributes;
};

// Create ARIA attributes for modal/dialog elements
export const createModalAriaAttributes = (
  isOpen: boolean,
  titleId?: string,
  descriptionId?: string
): AriaAttributes => {
  if (!isOpen) {
    return { 'aria-hidden': true };
  }

  const attributes: AriaAttributes = {
    role: 'dialog',
    'aria-modal': true,
    tabIndex: -1,
  };

  if (titleId) {
    attributes['aria-labelledby'] = titleId;
  }

  if (descriptionId) {
    attributes['aria-describedby'] = descriptionId;
  }

  return attributes;
};

// Create ARIA attributes for data visualization elements
export const createChartAriaAttributes = (
  chartType: 'bar' | 'line' | 'pie' | 'scatter',
  data: any[],
  title?: string,
  description?: string
): AriaAttributes => {
  const attributes: AriaAttributes = {
    role: 'img',
    'aria-label': title || `${chartType} chart`,
  };

  if (description) {
    const descId = generateAriaId('chart-desc');
    attributes['aria-describedby'] = descId;
    // Note: Description element should be created with this ID
  }

  // Add data summary for screen readers
  const dataCount = data.length;
  const dataSummary = `Chart contains ${dataCount} data points`;
  
  if (!description) {
    attributes['aria-label'] = `${attributes['aria-label']}. ${dataSummary}`;
  }

  return attributes;
};

// Utility to merge ARIA attributes safely
export const mergeAriaAttributes = (...attributeSets: (AriaAttributes | undefined)[]): AriaAttributes => {
  const merged: AriaAttributes = {};

  attributeSets.forEach(attrs => {
    if (attrs) {
      Object.entries(attrs).forEach(([key, value]) => {
        if (value !== undefined) {
          // Handle special cases for merging
          if (key === 'aria-describedby' || key === 'aria-labelledby') {
            // Merge space-separated ID lists
            const existing = merged[key as keyof AriaAttributes] as string;
            merged[key as keyof AriaAttributes] = existing 
              ? `${existing} ${value}` 
              : value as any;
          } else {
            // Override with latest value
            merged[key as keyof AriaAttributes] = value as any;
          }
        }
      });
    }
  });

  return merged;
};

// Utility to validate ARIA attributes
export const validateAriaAttributes = (attributes: AriaAttributes): string[] => {
  const warnings: string[] = [];

  // Check for common issues
  if (attributes['aria-labelledby'] && attributes['aria-label']) {
    warnings.push('Both aria-labelledby and aria-label are present. aria-labelledby takes precedence.');
  }

  if (attributes['aria-hidden'] === true && attributes.tabIndex !== undefined && attributes.tabIndex >= 0) {
    warnings.push('Element is aria-hidden but focusable. This may confuse screen readers.');
  }

  if (attributes.role === 'button' && attributes['aria-pressed'] === undefined && attributes['aria-expanded'] === undefined) {
    warnings.push('Button role without pressed or expanded state may need additional ARIA attributes.');
  }

  if (attributes['aria-describedby'] && !document.getElementById(attributes['aria-describedby'])) {
    warnings.push(`aria-describedby references non-existent element: ${attributes['aria-describedby']}`);
  }

  if (attributes['aria-labelledby'] && !document.getElementById(attributes['aria-labelledby'])) {
    warnings.push(`aria-labelledby references non-existent element: ${attributes['aria-labelledby']}`);
  }

  return warnings;
};

// Utility to create screen reader only text
export const createScreenReaderText = (text: string): React.ReactElement => {
  return React.createElement('span', {
    className: 'sr-only',
    'aria-hidden': false,
  }, text);
};

// Utility to hide decorative elements from screen readers
export const hideFromScreenReader = (): AriaAttributes => ({
  'aria-hidden': true,
  tabIndex: -1,
});

// Utility to make elements focusable for screen readers
export const makeFocusable = (label?: string): AriaAttributes => ({
  tabIndex: 0,
  'aria-label': label,
});

// Utility to create skip links
export const createSkipLinkAttributes = (targetId: string, label: string): AriaAttributes => ({
  href: `#${targetId}`,
  'aria-label': label,
  className: 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50',
});