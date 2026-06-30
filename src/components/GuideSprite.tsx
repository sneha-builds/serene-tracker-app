import React from 'react';
import { motion } from 'framer-motion';

interface GuideSpriteProps {
  state: 'hovering' | 'heavy_breathing' | 'spinning' | 'focused';
}

export function GuideSprite({ state }: GuideSpriteProps) {
  const variants: any = {
    hovering: {
      y: [0, -10, 0],
      rotate: [0, 0, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    heavy_breathing: {
      scale: [1, 1.05, 1],
      y: [0, 0, 0],
      transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
    },
    spinning: {
      rotate: [0, 360],
      transition: { duration: 1, ease: "linear" }
    },
    focused: {
      y: [0, -5, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <motion.div
      variants={variants}
      animate={state}
      className="relative w-24 h-24 flex items-center justify-center"
    >
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        <circle cx="60" cy="60" r="45" fill="rgba(255,255,255,0.1)" stroke="#22D3EE" strokeWidth="2"/>
        
        {/* Animated Dashed Ring */}
        <motion.path 
          d="M60 15c24.853 0 45 20.147 45 45S84.853 105 60 105 15 84.853 15 60 35.147 15 60 15" 
          stroke="#22D3EE" 
          strokeWidth="1" 
          strokeDasharray="4 4"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '60px 60px' }}
        />
        
        {/* Eyes (Change based on state) */}
        {state === 'focused' ? (
          <g>
             {/* Glasses / Focus Visor */}
            <rect x="42" y="48" width="14" height="10" rx="2" stroke="#06B6D4" strokeWidth="2" fill="none"/>
            <rect x="64" y="48" width="14" height="10" rx="2" stroke="#06B6D4" strokeWidth="2" fill="none"/>
            <line x1="56" y1="53" x2="64" y2="53" stroke="#06B6D4" strokeWidth="2"/>
          </g>
        ) : state === 'heavy_breathing' ? (
          <g>
            <path d="M 45 56 Q 49 48 53 56" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M 67 56 Q 71 48 75 56" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </g>
        ) : (
          <g>
            <rect x="47" y="50" width="6" height="10" rx="3" fill="#06B6D4" />
            <rect x="67" y="50" width="6" height="10" rx="3" fill="#06B6D4" />
          </g>
        )}
        
        {/* Mouth */}
        {state === 'heavy_breathing' ? (
           <circle cx="60" cy="72" r="4" fill="#06B6D4" />
        ) : state === 'focused' ? (
           <line x1="56" y1="75" x2="64" y2="75" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
        ) : (
           <path d="M55 72 Q60 78 65 72" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" fill="none"/>
        )}

        <circle cx="60" cy="60" r="50" fill="url(#glow)" opacity="0.3" />
        <defs>
          <radialGradient id="glow"><stop offset="0%" stopColor="#22D3EE"/><stop offset="100%" stopColor="transparent"/></radialGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
