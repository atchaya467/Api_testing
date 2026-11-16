import React, { useRef, useEffect } from 'react';

/**
 * Matrix-Style Aizawa Attractor 3D Canvas
 * Renders glowing green chaotic attractor particles with motion trails
 */
export default function MatrixAttractorCanvas({ 
  width, 
  height, 
  particleCount = 1800,
  scaleMultiplier = 1,
  speed = 1,
  showTrails = true,
  className = ''
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let w = (canvas.width = width || canvas.parentElement?.clientWidth || 400);
    let h = (canvas.height = height || canvas.parentElement?.clientHeight || 400);

    // Resize listener if width/height not fixed
    const handleResize = () => {
      if (!width || !height) {
        w = canvas.width = canvas.parentElement?.clientWidth || 400;
        h = canvas.height = canvas.parentElement?.clientHeight || 400;
      }
    };
    window.addEventListener('resize', handleResize);

    // Aizawa Attractor parameters
    const a = 0.95;
    const b = 0.7;
    const c = 0.6;
    const d = 3.5;
    const e = 0.25;
    const f = 0.1;
    const dt = 0.01 * speed;

    // Initialize particles along the attractor manifold
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      // Seed particles in sphere around origin
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const r = 0.1 + Math.random() * 0.8;
      particles.push({
        x: r * Math.cos(phi) * Math.cos(theta),
        y: r * Math.cos(phi) * Math.sin(theta),
        z: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.6 + 0.4,
        speedFactor: 0.8 + Math.random() * 0.4,
        char: Math.random() > 0.85 ? String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96)) : null
      });
    }

    let rotY = 0;
    let rotX = 0.3;
    let rotZ = 0;

    const render = () => {
      // Trail effect
      if (showTrails) {
        ctx.fillStyle = 'rgba(2, 8, 4, 0.16)';
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      rotY += 0.009 * speed;
      rotX += 0.003 * speed;
      rotZ += 0.001 * speed;

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      const centerX = w / 2;
      const centerY = h / 2;
      const baseZoom = (Math.min(w, h) * 0.28) * scaleMultiplier;

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Numerical integration (Aizawa Attractor equations)
        const dx = ((p.z - b) * p.x - d * p.y) * dt * p.speedFactor;
        const dy = (d * p.x + (p.z - b) * p.y) * dt * p.speedFactor;
        const dz = (c + a * p.z - (p.z * p.z * p.z) / 3 - (p.x * p.x + p.y * p.y) * (1 + e * p.z) + f * p.z * (p.x * p.x * p.x)) * dt * p.speedFactor;

        p.x += dx;
        p.y += dy;
        p.z += dz;

        // Reset particles that drift out of bounds
        if (isNaN(p.x) || Math.abs(p.x) > 3.5 || Math.abs(p.y) > 3.5 || Math.abs(p.z) > 3.5) {
          p.x = (Math.random() - 0.5) * 0.6;
          p.y = (Math.random() - 0.5) * 0.6;
          p.z = (Math.random() - 0.5) * 0.4;
        }

        // 3D Rotation
        // Y-axis rotation
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y1 = p.y;

        // X-axis rotation
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        // Perspective projection
        const fov = 350;
        const depth = fov + z2 * 45;
        if (depth <= 10) continue;
        const proj = fov / depth;

        const screenX = centerX + x1 * baseZoom * proj;
        const screenY = centerY + y2 * baseZoom * proj;

        // Depth-based brightness
        const brightness = Math.max(0.2, Math.min(1, (z2 + 1.8) / 3));
        const rad = Math.max(0.5, p.size * proj * scaleMultiplier);

        // Matrix Green Color Palette
        ctx.save();
        if (rad > 2.2) {
          ctx.shadowBlur = 6 * scaleMultiplier;
          ctx.shadowColor = '#00ff66';
        }

        if (p.char && rad > 1.8) {
          // Occasional matrix glyph
          ctx.font = `${Math.floor(rad * 4)}px monospace`;
          ctx.fillStyle = `rgba(180, 255, 200, ${p.alpha * brightness})`;
          ctx.fillText(p.char, screenX, screenY);
        } else {
          ctx.beginPath();
          ctx.arc(screenX, screenY, rad, 0, Math.PI * 2);
          ctx.fillStyle = brightness > 0.8 
            ? `rgba(200, 255, 220, ${p.alpha * brightness})`
            : `rgba(0, 255, 102, ${p.alpha * brightness * 0.85})`;
          ctx.fill();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [width, height, particleCount, scaleMultiplier, speed, showTrails]);

  return <canvas ref={canvasRef} className={`block ${className}`} />;
}
