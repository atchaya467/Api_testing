import React, { useRef, useEffect } from 'react';

/**
 * Matrix Rain Digital Code Canvas
 * Renders vibrant, glowing falling green matrix code with phosphorescent trails
 */
export default function MatrixRainCanvas({ 
  className = '', 
  fontSize = 14, 
  speed = 1.1,
  opacity = 0.85,
  characters = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜXYZ'
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let w = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let h = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      w = canvas.width = canvas.parentElement?.clientWidth || 400;
      h = canvas.height = canvas.parentElement?.clientHeight || 400;
      initColumns();
    };
    window.addEventListener('resize', handleResize);

    let columns = Math.floor(w / fontSize);
    let drops = [];

    const initColumns = () => {
      columns = Math.floor(w / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -60);
      }
    };
    initColumns();

    let lastTime = 0;
    const interval = 30 / speed;

    const render = (time) => {
      animId = requestAnimationFrame(render);
      if (time - lastTime < interval) return;
      lastTime = time;

      // Clean trail effect with smooth fade
      ctx.fillStyle = 'rgba(2, 6, 3, 0.11)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // 1. Bright white-green glowing head
        ctx.save();
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(char, x, y);

        // 2. Bright neon green immediate trail
        ctx.fillStyle = '#39ff14';
        const trail1 = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(trail1, x, y - fontSize);

        // 3. Phosphor green body trail
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#00cc55';
        const trail2 = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(trail2, x, y - fontSize * 2);
        ctx.restore();

        // Loop drop back to top
        if (y > h && Math.random() > 0.965) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [fontSize, speed, characters]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`block pointer-events-none ${className}`} 
      style={{ opacity }}
    />
  );
}
