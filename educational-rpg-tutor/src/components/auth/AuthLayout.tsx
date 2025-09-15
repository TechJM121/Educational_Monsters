import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-rpg-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rpg-card">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-rpg text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-slate-300 text-sm">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );
};