import React, { useState } from 'react';
import { ReadingModeProvider, ReadableText, ReadingModeControls } from './ReadingMode';
import { ResponsiveTypography, ResponsiveHeading, ResponsiveText } from './ResponsiveTypography';
import { 
  calculateReadingTime, 
  analyzeTextComplexity,
  calculateContrastRatio,
  meetsContrastRequirements 
} from '../../utils/readabilityOptimization';

const sampleTexts = {
  simple: "The cat sat on the mat. It was a sunny day. The cat was happy. Birds sang in the trees. The mat was soft and warm.",
  moderate: "Educational technology has transformed the way students learn and teachers instruct. Interactive platforms provide personalized learning experiences that adapt to individual student needs and learning styles.",
  complex: "The implementation of sophisticated algorithmic approaches in educational technology necessitates a comprehensive understanding of pedagogical frameworks, cognitive load theory, and adaptive learning methodologies to optimize knowledge acquisition and retention."
};

/**
 * Demo component showcasing readability optimization features
 */
export const ReadabilityDemo: React.FC = () => {
  const [selectedText, setSelectedText] = useState<keyof typeof sampleTexts>('moderate');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#333333');

  const currentText = sampleTexts[selectedText];
  const readingTime = calculateReadingTime(currentText);
  const textAnalysis = analyzeTextComplexity(currentText);
  const contrastRatio = calculateContrastRatio(textColor, backgroundColor);
  const meetsAA = meetsContrastRequirements(contrastRatio, 'AA');
  const meetsAAA = meetsContrastRequirements(contrastRatio, 'AAA');

  return (
    <ReadingModeProvider>
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <ResponsiveHeading level={1} className="mb-4">
            Typography Readability Optimization
          </ResponsiveHeading>
          <ResponsiveText className="text-gray-600">
            Explore advanced typography features designed for optimal readability and accessibility
          </ResponsiveText>
        </div>

        {/* Reading Mode Controls */}
        <ReadingModeControls />

        {/* Demo Controls */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Demo Controls</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Text Complexity</label>
              <select
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value as keyof typeof sampleTexts)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="simple">Simple</option>
                <option value="moderate">Moderate</option>
                <option value="complex">Complex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Text Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Text Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Text Analysis</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800">Reading Time</h3>
              <p className="text-2xl font-bold text-blue-600">
                {readingTime.minutes}m {readingTime.seconds}s
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800">Complexity</h3>
              <p className="text-2xl font-bold text-green-600 capitalize">
                {textAnalysis.complexityScore}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800">Avg Words/Sentence</h3>
              <p className="text-2xl font-bold text-purple-600">
                {textAnalysis.averageWordsPerSentence.toFixed(1)}
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-medium text-orange-800">Avg Syllables/Word</h3>
              <p className="text-2xl font-bold text-orange-600">
                {textAnalysis.averageSyllablesPerWord.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Contrast Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Contrast Analysis</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800">Contrast Ratio</h3>
              <p className="text-2xl font-bold text-gray-600">
                {contrastRatio.toFixed(2)}:1
              </p>
            </div>

            <div className={`p-4 rounded-lg ${meetsAA ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`font-medium ${meetsAA ? 'text-green-800' : 'text-red-800'}`}>
                WCAG AA
              </h3>
              <p className={`text-2xl font-bold ${meetsAA ? 'text-green-600' : 'text-red-600'}`}>
                {meetsAA ? '✓ Pass' : '✗ Fail'}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${meetsAAA ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`font-medium ${meetsAAA ? 'text-green-800' : 'text-red-800'}`}>
                WCAG AAA
              </h3>
              <p className={`text-2xl font-bold ${meetsAAA ? 'text-green-600' : 'text-red-600'}`}>
                {meetsAAA ? '✓ Pass' : '✗ Fail'}
              </p>
            </div>
          </div>
        </div>

        {/* Sample Text Display */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Sample Text with Readability Optimization</h2>
          
          {/* Standard Text */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium mb-4">Standard Typography</h3>
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor, color: textColor }}
            >
              <p className="text-base leading-relaxed">
                {currentText}
              </p>
            </div>
          </div>

          {/* Responsive Typography */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium mb-4">Responsive Typography</h3>
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor, color: textColor }}
            >
              <ResponsiveText 
                responsive 
                optimizeForDevice 
                adaptToDistance
              >
                {currentText}
              </ResponsiveText>
            </div>
          </div>

          {/* Readable Text with Auto-Optimization */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium mb-4">Auto-Optimized Readable Text</h3>
            <ReadableText 
              autoOptimize 
              contentType="body"
              style={{ backgroundColor, color: textColor }}
            >
              {currentText}
            </ReadableText>
          </div>
        </div>

        {/* Typography Variants Demo */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Responsive Typography Variants</h2>
          
          <div className="space-y-4">
            <ResponsiveHeading level={1} responsive>
              Heading Level 1 - Main Title
            </ResponsiveHeading>
            
            <ResponsiveHeading level={2} responsive>
              Heading Level 2 - Section Title
            </ResponsiveHeading>
            
            <ResponsiveHeading level={3} responsive>
              Heading Level 3 - Subsection
            </ResponsiveHeading>
            
            <ResponsiveText responsive optimizeForDevice>
              This is body text that adapts to your device and viewing conditions. 
              It automatically adjusts font size, line height, and spacing for optimal readability.
            </ResponsiveText>
            
            <ResponsiveTypography variant="caption" responsive>
              This is caption text - smaller and lighter for supplementary information.
            </ResponsiveTypography>
            
            <ResponsiveTypography variant="code" responsive>
              const code = "This is code text with monospace font";
            </ResponsiveTypography>
          </div>
        </div>

        {/* Educational Context Examples */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Educational Context Examples</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Quest Instructions</h3>
              <ReadableText autoOptimize contentType="body">
                Welcome, brave adventurer! Your quest is to master the ancient art of mathematics. 
                Solve three challenging problems to unlock the treasure chest and earn 500 XP points. 
                Remember: each correct answer brings you closer to becoming a Math Wizard!
              </ReadableText>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Learning Content</h3>
              <ReadableText autoOptimize contentType="body">
                Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water 
                into glucose and oxygen. This fundamental biological process occurs in the chloroplasts 
                of plant cells and is essential for life on Earth as it produces the oxygen we breathe.
              </ReadableText>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Achievement Description</h3>
              <ReadableText autoOptimize contentType="body">
                🏆 Congratulations! You've unlocked the "Speed Reader" achievement by completing 
                10 reading comprehension exercises in under 5 minutes each. Your reading skills 
                are improving rapidly!
              </ReadableText>
            </div>
          </div>
        </div>

        {/* Accessibility Features */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Accessibility Features</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Available Features</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Adjustable font size and line height</li>
                <li>✓ Dyslexia-friendly font options</li>
                <li>✓ High contrast mode support</li>
                <li>✓ Reduced motion preferences</li>
                <li>✓ Optimal line length calculation</li>
                <li>✓ Responsive typography scaling</li>
                <li>✓ Auto-optimization based on text complexity</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">WCAG Compliance</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ AA level contrast ratios</li>
                <li>✓ AAA level support available</li>
                <li>✓ Keyboard navigation support</li>
                <li>✓ Screen reader compatibility</li>
                <li>✓ Focus management</li>
                <li>✓ Alternative text for visual elements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ReadingModeProvider>
  );
};