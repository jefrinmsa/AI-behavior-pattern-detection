import React, { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set initial size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#4F9CF9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
    const numParticles = 60;

    // Initialize particles
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8
      });
    }

    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0" 
      style={{ opacity: 0.4 }}
    />
  );
}
