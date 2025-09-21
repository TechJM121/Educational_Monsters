/**
 * Interactive Component Playground
 * Live demonstration and testing environment for all modern UI components
 */

import React, { useState, useEffect } from 'react';
import { GlassCard } from '../modern-ui/GlassCard';
import { GlassButton } from '../modern-ui/GlassButton';
import { GlassModal } from '../modern-ui/GlassModal';
import { FloatingLabelInput } from '../modern-ui/FloatingLabelInput';
import { FloatingLabelSelect } from '../modern-ui/FloatingLabelSelect';
import { FloatingLabelTextarea } from '../modern-ui/FloatingLabelTextarea';
import { ResponsiveGrid } from '../modern-ui/ResponsiveGrid';
import { MasonryGrid } from '../modern-ui/MasonryGrid';
import { Skeleton } from '../modern-ui/Skeleton';
import { ProgressiveImage } from '../modern-ui/ProgressiveImage';
import { TypewriterText } from '../typography/TypewriterText';
import { GradientText } from '../typography/GradientText';
import { TextReveal } from '../typography/TextReveal';
import { AnimatedProgressBar } from '../data-visualization/AnimatedProgressBar';
import { AnimatedProgressRing } from '../data-visualization/AnimatedProgressRing';
import { StatCard } from '../data-visualization/StatCard';

interface PlaygroundSection {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  props: Record<string, any>;
  variants?: Array<{
    name: string;
    props: Record<string, any>;
  }>;
}

const PLAYGROUND_SECTIONS: PlaygroundSection[] = [
  {
    id: 'glass-card',
    title: 'Glass Card',
    description: 'Glassmorphic card component with customizable blur and opacity',
    component: GlassCard,
    props: {
      blur: 'md',
      opacity: 0.15,
      interactive: true,
      children: (
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Glass Card Example</h3>
          <p className="text-gray-600">This is a glassmorphic card with backdrop blur and transparency effects.</p>
        </div>
      )
    },
    variants: [
      {
        name: 'Subtle',
        props: { blur: 'sm', opacity: 0.05, interactive: false }
      },
      {
        name: 'Medium',
        props: { blur: 'md', opacity: 0.15, interactive: true }
      },
      {
        name: 'Strong',
        props: { blur: 'lg', opacity: 0.25, interactive: true }
      }
    ]
  },
  {
    id: 'glass-button',
    title: 'Glass Button',
    description: 'Modern button with glassmorphic styling and micro-interactions',
    component: GlassButton,
    props: {
      variant: 'primary',
      size: 'md',
      children: 'Click Me'
    },
    variants: [
      {
        name: 'Primary',
        props: { variant: 'primary', children: 'Primary Button' }
      },
      {
        name: 'Secondary',
        props: { variant: 'secondary', children: 'Secondary Button' }
      },
      {
        name: 'Accent',
        props: { variant: 'accent', children: 'Accent Button' }
      },
      {
        name: 'Ghost',
        props: { variant: 'ghost', children: 'Ghost Button' }
      }
    ]
  },
  {
    id: 'floating-input',
    title: 'Floating Label Input',
    description: 'Form input with animated floating labels',
    component: FloatingLabelInput,
    props: {
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email'
    },
    variants: [
      {
        name: 'Text Input',
        props: { label: 'Full Name', type: 'text' }
      },
      {
        name: 'Email Input',
        props: { label: 'Email Address', type: 'email' }
      },
      {
        name: 'Password Input',
        props: { label: 'Password', type: 'password' }
      },
      {
        name: 'With Error',
        props: { label: 'Username', error: 'Username is required' }
      }
    ]
  },
  {
    id: 'progress-bar',
    title: 'Animated Progress Bar',
    description: 'Smooth progress indication with customizable animations',
    component: AnimatedProgressBar,
    props: {
      progress: 75,
      label: 'Loading Progress',
      color: 'primary'
    },
    variants: [
      {
        name: '25% Progress',
        props: { progress: 25, label: '25% Complete', color: 'primary' }
      },
      {
        name: '50% Progress',
        props: { progress: 50, label: '50% Complete', color: 'secondary' }
      },
      {
        name: '75% Progress',
        props: { progress: 75, label: '75% Complete', color: 'accent' }
      },
      {
        name: '100% Complete',
        props: { progress: 100, label: 'Complete!', color: 'primary' }
      }
    ]
  },
  {
    id: 'progress-ring',
    title: 'Animated Progress Ring',
    description: 'Circular progress indicator with smooth animations',
    component: AnimatedProgressRing,
    props: {
      progress: 60,
      size: 'md',
      color: 'primary'
    },
    variants: [
      {
        name: 'Small Ring',
        props: { progress: 40, size: 'sm', color: 'primary' }
      },
      {
        name: 'Medium Ring',
        props: { progress: 60, size: 'md', color: 'secondary' }
      },
      {
        name: 'Large Ring',
        props: { progress: 80, size: 'lg', color: 'accent' }
      }
    ]
  },
  {
    id: 'typewriter-text',
    title: 'Typewriter Text',
    description: 'Animated text that types out character by character',
    component: TypewriterText,
    props: {
      text: 'Welcome to the Modern UI Design System!',
      speed: 100
    },
    variants: [
      {
        name: 'Fast Typing',
        props: { text: 'Fast typing animation', speed: 50 }
      },
      {
        name: 'Normal Speed',
        props: { text: 'Normal typing speed', speed: 100 }
      },
      {
        name: 'Slow Typing',
        props: { text: 'Slow and deliberate typing', speed: 200 }
      }
    ]
  },
  {
    id: 'gradient-text',
    title: 'Gradient Text',
    description: 'Text with beautiful gradient effects',
    component: GradientText,
    props: {
      gradient: 'primary',
      children: 'Beautiful Gradient Text'
    },
    variants: [
      {
        name: 'Primary Gradient',
        props: { gradient: 'primary', children: 'Primary Gradient' }
      },
      {
        name: 'Secondary Gradient',
        props: { gradient: 'secondary', children: 'Secondary Gradient' }
      },
      {
        name: 'Accent Gradient',
        props: { gradient: 'accent', children: 'Accent Gradient' }
      },
      {
        name: 'Rainbow Gradient',
        props: { gradient: 'rainbow', children: 'Rainbow Gradient' }
      }
    ]
  },
  {
    id: 'skeleton',
    title: 'Skeleton Loading',
    description: 'Loading placeholders with various animations',
    component: Skeleton,
    props: {
      variant: 'text',
      animation: 'pulse',
      lines: 3
    },
    variants: [
      {
        name: 'Text Skeleton',
        props: { variant: 'text', animation: 'pulse', lines: 3 }
      },
      {
        name: 'Card Skeleton',
        props: { variant: 'card', animation: 'wave' }
      },
      {
        name: 'Avatar Skeleton',
        props: { variant: 'avatar', animation: 'shimmer' }
      },
      {
        name: 'Chart Skeleton',
        props: { variant: 'chart', animation: 'pulse' }
      }
    ]
  }
];

export const ComponentPlayground: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState(PLAYGROUND_SECTIONS[0]);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const currentProps = selectedSection.variants 
    ? { ...selectedSection.props, ...selectedSection.variants[selectedVariant].props }
    : selectedSection.props;

  const generateCodeExample = () => {
    const componentName = selectedSection.component.name;
    const propsString = Object.entries(currentProps)
      .filter(([key]) => key !== 'children')
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? key : '';
        } else if (typeof value === 'number') {
          return `${key}={${value}}`;
        } else {
          return `${key}={${JSON.stringify(value)}}`;
        }
      })
      .filter(Boolean)
      .join('\n  ');

    const children = currentProps.children;
    
    if (children && typeof children === 'string') {
      return `<${componentName}${propsString ? `\n  ${propsString}` : ''}>
  ${children}
</${componentName}>`;
    } else if (children) {
      return `<${componentName}${propsString ? `\n  ${propsString}` : ''}>
  {/* Complex children content */}
</${componentName}>`;
    } else {
      return `<${componentName}${propsString ? `\n  ${propsString}` : ''} />`;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">Component Playground</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Interactive demonstration of Modern UI components
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCode(!showCode)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showCode ? 'Hide Code' : 'Show Code'}
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Components</h2>
              <nav className="space-y-2">
                {PLAYGROUND_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setSelectedSection(section);
                      setSelectedVariant(0);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedSection.id === section.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Component Info */}
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedSection.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">{selectedSection.description}</p>
              </div>

              {/* Variants */}
              {selectedSection.variants && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Variants</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSection.variants.map((variant, index) => (
                      <button
                        key={variant.name}
                        onClick={() => setSelectedVariant(index)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedVariant === index
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Component Demo */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Preview</h3>
                <div className={`p-8 rounded-lg border-2 border-dashed transition-colors ${
                  darkMode 
                    ? 'border-gray-600 bg-gray-800' 
                    : 'border-gray-300 bg-white'
                }`}>
                  <div className="flex items-center justify-center min-h-[200px]">
                    <selectedSection.component {...currentProps} />
                  </div>
                </div>
              </div>

              {/* Code Example */}
              {showCode && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Code Example</h3>
                  <div className="relative">
                    <pre className={`p-4 rounded-lg overflow-x-auto text-sm ${
                      darkMode 
                        ? 'bg-gray-800 text-gray-100' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <code>{generateCodeExample()}</code>
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateCodeExample());
                      }}
                      className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Props Documentation */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Props</h3>
                <div className={`rounded-lg border ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${
                        darkMode ? 'bg-gray-800' : 'bg-gray-50'
                      }`}>
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Prop</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Default</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Object.entries(currentProps).map(([prop, value]) => (
                          <tr key={prop}>
                            <td className="px-4 py-3 text-sm font-mono">{prop}</td>
                            <td className="px-4 py-3 text-sm">{typeof value}</td>
                            <td className="px-4 py-3 text-sm font-mono">
                              {typeof value === 'string' ? `"${value}"` : String(value)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              Component property
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Usage Guidelines */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Usage Guidelines</h3>
                <div className={`p-4 rounded-lg ${
                  darkMode ? 'bg-gray-800' : 'bg-blue-50'
                }`}>
                  <div className="space-y-2 text-sm">
                    <p><strong>When to use:</strong> Use this component for interactive elements that need modern glassmorphic styling.</p>
                    <p><strong>Accessibility:</strong> Ensure proper ARIA labels and keyboard navigation support.</p>
                    <p><strong>Performance:</strong> Component is optimized for 60fps animations and lazy loading.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentPlayground;