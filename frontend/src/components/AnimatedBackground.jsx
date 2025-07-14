import React from 'react';

const AnimatedBackground = () => (
  <div
    className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
    aria-hidden="true"
    style={{
      width: '100vw',
      height: '100vh',
      top: 0,
      left: 0,
      willChange: 'transform, opacity', // GPU acceleration
    }}
  >
    {/* Orb 1 */}
    <div
      className="absolute rounded-full blur-xl opacity-25 animate-orb1"
      style={{
        width: 320,
        height: 320,
        background: 'radial-gradient(circle at 30% 30%, var(--primary), transparent 70%)',
        top: '-80px',
        left: '-80px',
        willChange: 'transform, opacity',
      }}
    />
    {/* Orb 2 */}
    <div
      className="absolute rounded-full blur-lg opacity-18 animate-orb2"
      style={{
        width: 260,
        height: 260,
        background: 'radial-gradient(circle at 70% 60%, var(--chart-2), transparent 70%)',
        bottom: '-90px',
        right: '-60px',
        willChange: 'transform, opacity',
      }}
    />
    {/* Orb 3 */}
    <div
      className="absolute rounded-full blur-md opacity-12 animate-orb3"
      style={{
        width: 180,
        height: 180,
        background: 'radial-gradient(circle at 60% 40%, var(--chart-4), transparent 70%)',
        top: '60%',
        left: '60%',
        willChange: 'transform, opacity',
      }}
    />
    {/* Orb 4 */}
    <div
      className="absolute rounded-full blur-md opacity-10 animate-orb4"
      style={{
        width: 120,
        height: 120,
        background: 'radial-gradient(circle at 50% 50%, var(--accent), transparent 70%)',
        bottom: '10%',
        left: '10%',
        willChange: 'transform, opacity',
      }}
    />
    <style>{`
      @keyframes orb1 {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(20px) scale(1.04); }
      }
      @keyframes orb2 {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-15px) scale(1.025); }
      }
      @keyframes orb3 {
        0%, 100% { transform: translateX(0) scale(1); }
        50% { transform: translateX(-15px) scale(1.05); }
      }
      @keyframes orb4 {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(12px) scale(1.035); }
      }
      .animate-orb1 { animation: orb1 10s cubic-bezier(0.4,0,0.2,1) infinite; }
      .animate-orb2 { animation: orb2 12s cubic-bezier(0.4,0,0.2,1) infinite; }
      .animate-orb3 { animation: orb3 14s cubic-bezier(0.4,0,0.2,1) infinite; }
      .animate-orb4 { animation: orb4 16s cubic-bezier(0.4,0,0.2,1) infinite; }
    `}</style>
  </div>
);

export default AnimatedBackground; 