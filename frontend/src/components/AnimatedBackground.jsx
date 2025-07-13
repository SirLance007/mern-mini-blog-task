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
    }}
  >
    {/* Orb 1 */}
    <div
      className="absolute rounded-full blur-3xl opacity-40 animate-orb1"
      style={{
        width: 400,
        height: 400,
        background: 'radial-gradient(circle at 30% 30%, var(--primary), transparent 70%)',
        top: '-100px',
        left: '-100px',
      }}
    />
    {/* Orb 2 */}
    <div
      className="absolute rounded-full blur-3xl opacity-30 animate-orb2"
      style={{
        width: 350,
        height: 350,
        background: 'radial-gradient(circle at 70% 60%, var(--chart-2), transparent 70%)',
        bottom: '-120px',
        right: '-80px',
      }}
    />
    {/* Orb 3 */}
    <div
      className="absolute rounded-full blur-2xl opacity-25 animate-orb3"
      style={{
        width: 250,
        height: 250,
        background: 'radial-gradient(circle at 60% 40%, var(--chart-4), transparent 70%)',
        top: '60%',
        left: '60%',
      }}
    />
    {/* Orb 4 */}
    <div
      className="absolute rounded-full blur-2xl opacity-20 animate-orb4"
      style={{
        width: 200,
        height: 200,
        background: 'radial-gradient(circle at 50% 50%, var(--accent), transparent 70%)',
        bottom: '10%',
        left: '10%',
      }}
    />
    <style>{`
      @keyframes orb1 {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(40px) scale(1.08); }
      }
      @keyframes orb2 {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-30px) scale(1.05); }
      }
      @keyframes orb3 {
        0%, 100% { transform: translateX(0) scale(1); }
        50% { transform: translateX(-30px) scale(1.1); }
      }
      @keyframes orb4 {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(25px) scale(1.07); }
      }
      .animate-orb1 { animation: orb1 12s ease-in-out infinite; }
      .animate-orb2 { animation: orb2 14s ease-in-out infinite; }
      .animate-orb3 { animation: orb3 16s ease-in-out infinite; }
      .animate-orb4 { animation: orb4 18s ease-in-out infinite; }
    `}</style>
  </div>
);

export default AnimatedBackground; 