import React from 'react';

interface ShapeHeroProps {
  className?: string;
}

export const ShapeHero = ({ className = '' }: ShapeHeroProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {/* Animated gradient shapes */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Additional smaller shapes */}
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-pink-500/15 to-purple-500/15 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30" />
    </div>
  );
};
