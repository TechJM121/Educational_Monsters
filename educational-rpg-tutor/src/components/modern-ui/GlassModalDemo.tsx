/**
 * Glass Modal Demo Component
 * Demonstrates the GlassModal component with various configurations
 */

import React, { useState } from 'react';
import { GlassModal } from './GlassModal';
import { GlassButton } from './GlassButton';

export const GlassModalDemo: React.FC = () => {
  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [largeModalOpen, setLargeModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [noBackdropModalOpen, setNoBackdropModalOpen] = useState(false);

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Glass Modal Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Basic Modal */}
        <GlassButton onClick={() => setBasicModalOpen(true)}>
          Basic Modal
        </GlassButton>

        {/* Modal with Title */}
        <GlassButton onClick={() => setTitleModalOpen(true)}>
          Modal with Title
        </GlassButton>

        {/* Large Modal */}
        <GlassButton onClick={() => setLargeModalOpen(true)}>
          Large Modal
        </GlassButton>

        {/* Form Modal */}
        <GlassButton onClick={() => setFormModalOpen(true)}>
          Form Modal
        </GlassButton>

        {/* No Backdrop Close */}
        <GlassButton onClick={() => setNoBackdropModalOpen(true)}>
          No Backdrop Close
        </GlassButton>
      </div>

      {/* Basic Modal */}
      <GlassModal
        isOpen={basicModalOpen}
        onClose={() => setBasicModalOpen(false)}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Basic Modal</h3>
          <p className="text-white/80 mb-6">
            This is a basic glass modal with default settings. It features glassmorphic design
            with backdrop blur effects and smooth animations.
          </p>
          <GlassButton onClick={() => setBasicModalOpen(false)}>
            Close Modal
          </GlassButton>
        </div>
      </GlassModal>

      {/* Modal with Title */}
      <GlassModal
        isOpen={titleModalOpen}
        onClose={() => setTitleModalOpen(false)}
        title="Modal with Title"
      >
        <div>
          <p className="text-white/80 mb-4">
            This modal includes a title in the header area. The title is properly
            associated with the modal for accessibility.
          </p>
          <p className="text-white/80 mb-6">
            Notice how the glassmorphic effect creates depth and visual hierarchy
            while maintaining readability.
          </p>
          <div className="flex justify-end">
            <GlassButton onClick={() => setTitleModalOpen(false)}>
              Got it!
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Large Modal */}
      <GlassModal
        isOpen={largeModalOpen}
        onClose={() => setLargeModalOpen(false)}
        title="Large Modal Example"
        size="lg"
        blur="xl"
      >
        <div>
          <p className="text-white/80 mb-4">
            This is a large modal with extra blur effects. It demonstrates how the
            modal can adapt to different content sizes while maintaining the
            glassmorphic aesthetic.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Feature 1</h4>
              <p className="text-white/70 text-sm">
                Responsive design that adapts to different screen sizes.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Feature 2</h4>
              <p className="text-white/70 text-sm">
                Smooth animations with performance optimization.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Feature 3</h4>
              <p className="text-white/70 text-sm">
                Accessibility-first design with proper focus management.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Feature 4</h4>
              <p className="text-white/70 text-sm">
                Customizable blur effects and sizing options.
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <GlassButton variant="secondary" onClick={() => setLargeModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton onClick={() => setLargeModalOpen(false)}>
              Confirm
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Form Modal */}
      <GlassModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title="Contact Form"
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); setFormModalOpen(false); }}>
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="name" className="block text-white/80 text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-white/80 text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none"
                placeholder="Enter your message"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <GlassButton 
              type="button" 
              variant="secondary" 
              onClick={() => setFormModalOpen(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton type="submit">
              Send Message
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* No Backdrop Close Modal */}
      <GlassModal
        isOpen={noBackdropModalOpen}
        onClose={() => setNoBackdropModalOpen(false)}
        title="Important Notice"
        closeOnBackdropClick={false}
        closeOnEscape={false}
        size="sm"
      >
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-4">Confirm Action</h3>
          <p className="text-white/80 mb-6">
            This modal cannot be closed by clicking the backdrop or pressing Escape.
            You must use the buttons below to proceed.
          </p>
          
          <div className="flex justify-center space-x-3">
            <GlassButton 
              variant="secondary" 
              onClick={() => setNoBackdropModalOpen(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton onClick={() => setNoBackdropModalOpen(false)}>
              Confirm
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};