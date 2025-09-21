import React, { useState } from 'react';
import { VariableText } from './VariableText';
import { FluidTypography, Heading1, Heading2, BodyText } from './FluidTypography';
import { GlassCard } from '../modern-ui/GlassCard';

/**
 * Demo component showcasing variable fonts and fluid typography
 */
export const VariableFontDemo: React.FC = () => {
  const [weightValue, setWeightValue] = useState(400);
  const [slantValue, setSlantValue] = useState(0);

  const interFontConfig = {
    fontFamily: 'Inter',
    variations: { weight: weightValue, slant: slantValue },
    transitionDuration: 300,
  };

  const monoFontConfig = {
    fontFamily: 'JetBrains Mono',
    variations: { weight: 400 },
    transitionDuration: 200,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <Heading1 className="text-white mb-4">
            Variable Fonts & Fluid Typography
          </Heading1>
          <BodyText className="text-gray-300 max-w-2xl mx-auto">
            Experience dynamic typography with variable fonts, fluid scaling, and interactive effects
          </BodyText>
        </div>

        {/* Interactive Variable Font Controls */}
        <GlassCard className="p-8">
          <Heading2 className="text-white mb-6">Interactive Variable Font Controls</Heading2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-white mb-2">Font Weight: {weightValue}</label>
              <input
                type="range"
                min="100"
                max="900"
                step="50"
                value={weightValue}
                onChange={(e) => setWeightValue(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-white mb-2">Slant: {slantValue}°</label>
              <input
                type="range"
                min="-15"
                max="0"
                step="1"
                value={slantValue}
                onChange={(e) => setSlantValue(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-8">
            <VariableText
              as="h3"
              fontConfig={interFontConfig}
              className="text-4xl text-white text-center"
            >
              Dynamic Typography in Action
            </VariableText>
          </div>
        </GlassCard>

        {/* Hover Effects Demo */}
        <GlassCard className="p-8">
          <Heading2 className="text-white mb-6">Interactive Hover Effects</Heading2>
          
          <div className="space-y-6">
            <VariableText
              as="h3"
              fontConfig={{ fontFamily: 'Inter', variations: { weight: 400 } }}
              hoverVariations={{ weight: 700 }}
              interactive
              className="text-2xl text-white cursor-pointer transition-all duration-300 hover:text-blue-300"
            >
              Hover me to see weight change
            </VariableText>

            <VariableText
              as="p"
              fontConfig={{ fontFamily: 'Inter', variations: { weight: 300, slant: 0 } }}
              hoverVariations={{ weight: 500, slant: -5 }}
              activeVariations={{ weight: 600, slant: -10 }}
              interactive
              className="text-lg text-gray-300 cursor-pointer transition-all duration-300 hover:text-white"
            >
              Click and hold to see active state with slant effect
            </VariableText>

            <VariableText
              as="code"
              fontConfig={monoFontConfig}
              hoverVariations={{ weight: 600 }}
              interactive
              className="text-green-400 bg-gray-800 px-4 py-2 rounded-lg inline-block cursor-pointer"
            >
              const variableFont = "awesome";
            </VariableText>
          </div>
        </GlassCard>

        {/* Fluid Typography Scale Demo */}
        <GlassCard className="p-8">
          <Heading2 className="text-white mb-6">Fluid Typography Scale</Heading2>
          
          <div className="space-y-4">
            <FluidTypography as="h1" variant="5xl" weight="bold" className="text-white">
              5XL Heading - Scales with viewport
            </FluidTypography>
            
            <FluidTypography as="h2" variant="4xl" weight="semibold" className="text-gray-200">
              4XL Heading - Responsive sizing
            </FluidTypography>
            
            <FluidTypography as="h3" variant="3xl" weight="medium" className="text-gray-300">
              3XL Heading - Fluid scaling
            </FluidTypography>
            
            <FluidTypography as="h4" variant="2xl" className="text-gray-400">
              2XL Heading - Clamp function
            </FluidTypography>
            
            <FluidTypography as="h5" variant="xl" className="text-gray-500">
              XL Heading - Viewport units
            </FluidTypography>
            
            <FluidTypography as="p" variant="base" className="text-gray-300 max-w-3xl">
              This is base text that demonstrates fluid typography scaling. The font size adjusts 
              smoothly based on the viewport width using CSS clamp() functions. Resize your browser 
              window to see the effect in action.
            </FluidTypography>
            
            <FluidTypography as="small" variant="sm" className="text-gray-400">
              Small text that maintains readability across all screen sizes
            </FluidTypography>
          </div>
        </GlassCard>

        {/* Interactive Typography Examples */}
        <GlassCard className="p-8">
          <Heading2 className="text-white mb-6">Interactive Typography Examples</Heading2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <FluidTypography 
                as="h3" 
                variant="xl" 
                weight="semibold" 
                interactive 
                className="text-blue-400 mb-2 hover:text-blue-300 transition-colors"
              >
                Interactive Heading
              </FluidTypography>
              <BodyText className="text-gray-400 text-sm">
                Hover for weight change
              </BodyText>
            </div>

            <div className="text-center">
              <FluidTypography 
                as="p" 
                variant="lg" 
                interactive 
                className="text-green-400 mb-2 hover:text-green-300 transition-all duration-300 hover:tracking-wider"
              >
                Letter Spacing Effect
              </FluidTypography>
              <BodyText className="text-gray-400 text-sm">
                Hover for spacing change
              </BodyText>
            </div>

            <div className="text-center">
              <FluidTypography 
                as="span" 
                variant="lg" 
                weight="bold" 
                interactive 
                className="text-purple-400 mb-2 hover:text-purple-300 transition-all duration-300 hover:scale-105 inline-block"
              >
                Scale Transform
              </FluidTypography>
              <BodyText className="text-gray-400 text-sm">
                Hover for scale effect
              </BodyText>
            </div>
          </div>
        </GlassCard>

        {/* Performance Info */}
        <GlassCard className="p-6">
          <div className="text-center">
            <BodyText className="text-gray-300">
              All typography effects use GPU-accelerated transforms and variable font properties 
              for optimal performance across devices.
            </BodyText>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};