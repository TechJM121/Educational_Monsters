import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  gradient: string;
  index: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  gradient,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: 'easeOut'
      }}
      viewport={{ once: true }}
      whileHover={{ 
        scale: 1.05,
        rotateY: 5,
        z: 50
      }}
      className="group relative"
    >
      {/* Glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
      
      {/* Card content */}
      <div className="relative backdrop-blur-md bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: 360, scale: 1.2 }}
          transition={{ duration: 0.6 }}
          className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg`}
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-rpg text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-slate-300 leading-relaxed">
          {description}
        </p>

        {/* Hover indicator */}
        <motion.div
          initial={{ width: 0 }}
          whileHover={{ width: '100%' }}
          transition={{ duration: 0.3 }}
          className={`h-1 bg-gradient-to-r ${gradient} rounded-full mt-6`}
        />
      </div>
    </motion.div>
  );
};