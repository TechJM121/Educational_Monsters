import React from 'react';
import { motion } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  titleIcon?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundGradient?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  title,
  subtitle,
  titleIcon,
  gradientFrom = 'from-blue-400',
  gradientTo = 'to-cyan-300',
  backgroundGradient = 'from-slate-950 via-blue-950 to-slate-950',
  maxWidth = 'xl',
  padding = 'md',
  animate = true,
  className = '',
}) => {
  const { isMobile } = useResponsive();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: isMobile ? 'p-2' : 'p-4',
    md: isMobile ? 'p-4' : 'p-6',
    lg: isMobile ? 'p-4' : 'p-8',
    xl: isMobile ? 'p-6' : 'p-12',
  };

  const containerClasses = [
    'w-full',
    maxWidthClasses[maxWidth],
    paddingClasses[padding],
    'mx-auto relative z-10',
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <div className={containerClasses}>
      {(title || subtitle) && (
        <div className="text-center mb-6 lg:mb-8">
          {title && (
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent mb-4`}>
              {titleIcon && <span className="mr-2">{titleIcon}</span>}
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-slate-300 text-base sm:text-lg lg:text-xl">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient}`}>
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: isMobile ? 8 : 15 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 lg:w-3 lg:h-3 bg-blue-400/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {animate ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {content}
        </motion.div>
      ) : (
        content
      )}
    </div>
  );
};

// Specialized layout for different page types
interface PageLayoutProps extends Omit<ResponsiveLayoutProps, 'backgroundGradient' | 'gradientFrom' | 'gradientTo'> {
  pageType?: 'home' | 'learning' | 'character' | 'quests' | 'achievements' | 'auth';
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  pageType = 'home',
  ...props
}) => {
  const pageConfigs = {
    home: {
      backgroundGradient: 'from-slate-950 via-blue-950 to-slate-950',
      gradientFrom: 'from-blue-400',
      gradientTo: 'to-cyan-300',
    },
    learning: {
      backgroundGradient: 'from-slate-950 via-green-950 to-slate-950',
      gradientFrom: 'from-green-400',
      gradientTo: 'to-emerald-300',
    },
    character: {
      backgroundGradient: 'from-slate-950 via-purple-950 to-slate-950',
      gradientFrom: 'from-purple-400',
      gradientTo: 'to-pink-300',
    },
    quests: {
      backgroundGradient: 'from-slate-950 via-orange-950 to-slate-950',
      gradientFrom: 'from-orange-400',
      gradientTo: 'to-red-300',
    },
    achievements: {
      backgroundGradient: 'from-slate-950 via-yellow-950 to-slate-950',
      gradientFrom: 'from-yellow-400',
      gradientTo: 'to-orange-300',
    },
    auth: {
      backgroundGradient: 'from-slate-950 via-blue-950 to-slate-950',
      gradientFrom: 'from-blue-400',
      gradientTo: 'to-cyan-300',
    },
  };

  const config = pageConfigs[pageType];

  return (
    <ResponsiveLayout
      {...props}
      backgroundGradient={config.backgroundGradient}
      gradientFrom={config.gradientFrom}
      gradientTo={config.gradientTo}
    />
  );
};

// Responsive section component
interface ResponsiveSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({
  children,
  title,
  subtitle,
  className = '',
  spacing = 'md',
}) => {
  const spacingClasses = {
    sm: 'mb-4 lg:mb-6',
    md: 'mb-6 lg:mb-8',
    lg: 'mb-8 lg:mb-12',
  };

  return (
    <section className={`${spacingClasses[spacing]} ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4 lg:mb-6">
          {title && (
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};