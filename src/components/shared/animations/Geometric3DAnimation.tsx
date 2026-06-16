'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Box, RotateCw } from 'lucide-react';

interface Cube3D {
  x: number;
  y: number;
  z: number;
  size: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  rotationSpeedX: number;
  rotationSpeedY: number;
  rotationSpeedZ: number;
  color: string;
  alpha: number;
  vertices: { x: number; y: number; z: number }[];
}

interface FloatingShape {
  x: number;
  y: number;
  z: number;
  size: number;
  type: 'cube' | 'pyramid' | 'octahedron' | 'dodecahedron';
  rotation: { x: number; y: number; z: number };
  rotationSpeed: { x: number; y: number; z: number };
  color: string;
  alpha: number;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#FF69B4', '#00CED1', '#FFD700', '#FF4500', '#9370DB'
];

export default function Geometric3DAnimation({ customMessage }: { customMessage?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const cubesRef = useRef<Cube3D[]>([]);
  const shapesRef = useRef<FloatingShape[]>([]);
  const timeRef = useRef(0);
  
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');

  // Create 3D cube vertices
  const createCubeVertices = useCallback((size: number) => {
    const half = size / 2;
    return [
      { x: -half, y: -half, z: -half },
      { x: half, y: -half, z: -half },
      { x: half, y: half, z: -half },
      { x: -half, y: half, z: -half },
      { x: -half, y: -half, z: half },
      { x: half, y: -half, z: half },
      { x: half, y: half, z: half },
      { x: -half, y: half, z: half }
    ];
  }, []);

  // Create a new 3D cube
  const createCube = useCallback((x: number, y: number, z: number, size: number): Cube3D => {
    return {
      x, y, z, size,
      rotationX: Math.random() * Math.PI * 2,
      rotationY: Math.random() * Math.PI * 2,
      rotationZ: Math.random() * Math.PI * 2,
      rotationSpeedX: (Math.random() - 0.5) * 0.02,
      rotationSpeedY: (Math.random() - 0.5) * 0.02,
      rotationSpeedZ: (Math.random() - 0.5) * 0.02,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.8 + Math.random() * 0.2,
      vertices: createCubeVertices(size)
    };
  }, [createCubeVertices]);

  // Create floating 3D shape
  const createFloatingShape = useCallback((): FloatingShape => {
    const types: FloatingShape['type'][] = ['cube', 'pyramid', 'octahedron', 'dodecahedron'];
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random() * 500 - 250,
      size: 20 + Math.random() * 40,
      type: types[Math.floor(Math.random() * types.length)],
      rotation: { x: Math.random() * Math.PI * 2, y: Math.random() * Math.PI * 2, z: Math.random() * Math.PI * 2 },
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      },
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.5 + Math.random() * 0.5
    };
  }, []);

  // Project 3D point to 2D
  const project3D = useCallback((x: number, y: number, z: number, width: number, height: number) => {
    const fov = 500;
    const scale = fov / (fov + z);
    return {
      x: width / 2 + (x - width / 2) * scale,
      y: height / 2 + (y - height / 2) * scale,
      scale
    };
  }, []);

  // Rotate point in 3D
  const rotatePoint = useCallback((point: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }) => {
    let { x, y, z } = point;
    const { x: rx, y: ry, z: rz } = rotation;

    // Rotate around X
    let y1 = y * Math.cos(rx) - z * Math.sin(rx);
    let z1 = y * Math.sin(rx) + z * Math.cos(rx);
    y = y1; z = z1;

    // Rotate around Y
    let x1 = x * Math.cos(ry) + z * Math.sin(ry);
    z1 = -x * Math.sin(ry) + z * Math.cos(ry);
    x = x1; z = z1;

    // Rotate around Z
    let x2 = x * Math.cos(rz) - y * Math.sin(rz);
    let y2 = x * Math.sin(rz) + y * Math.cos(rz);
    x = x2; y = y2;

    return { x, y, z };
  }, []);

  // Draw 3D cube
  const drawCube = useCallback((ctx: CanvasRenderingContext2D, cube: Cube3D, width: number, height: number) => {
    const rotatedVertices = cube.vertices.map(v => {
      const rotated = rotatePoint(
        { x: v.x + cube.x, y: v.y + cube.y, z: v.z + cube.z },
        { x: cube.rotationX, y: cube.rotationY, z: cube.rotationZ }
      );
      return project3D(rotated.x, rotated.y, rotated.z, width, height);
    });

    // Draw edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Front face
      [4, 5], [5, 6], [6, 7], [7, 4], // Back face
      [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting edges
    ];

    ctx.strokeStyle = cube.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = cube.alpha;

    edges.forEach(([start, end]) => {
      ctx.beginPath();
      ctx.moveTo(rotatedVertices[start].x, rotatedVertices[start].y);
      ctx.lineTo(rotatedVertices[end].x, rotatedVertices[end].y);
      ctx.stroke();
    });

    // Draw vertices
    rotatedVertices.forEach(v => {
      ctx.beginPath();
      ctx.arc(v.x, v.y, 3 * v.scale, 0, Math.PI * 2);
      ctx.fillStyle = cube.color;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }, [project3D, rotatePoint]);

  // Draw floating shape
  const drawFloatingShape = useCallback((ctx: CanvasRenderingContext2D, shape: FloatingShape, width: number, height: number) => {
    const projected = project3D(shape.x, shape.y, shape.z, width, height);
    const size = shape.size * projected.scale;

    ctx.save();
    ctx.translate(projected.x, projected.y);
    ctx.rotate(shape.rotation.z);
    ctx.globalAlpha = shape.alpha;

    // Draw glow
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
    gradient.addColorStop(0, shape.color + '40');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw shape based on type
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = 2;
    ctx.fillStyle = shape.color + '20';

    switch (shape.type) {
      case 'cube':
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.fillRect(-size / 2, -size / 2, size, size);
        break;
      case 'pyramid':
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(size / 2, size / 2);
        ctx.lineTo(-size / 2, size / 2);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        break;
      case 'octahedron':
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(size / 2, 0);
        ctx.lineTo(0, size / 2);
        ctx.lineTo(-size / 2, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        break;
      case 'dodecahedron':
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * size / 2;
          const y = Math.sin(angle) * size / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        break;
    }

    ctx.restore();
  }, [project3D]);

  // Main animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += 0.016;

    // Clear with fade
    ctx.fillStyle = isMinimized ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background grid
    if (!isMinimized) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      const offset = (timeRef.current * 20) % gridSize;

      for (let x = offset; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = offset; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Update and draw cubes
    cubesRef.current.forEach(cube => {
      cube.rotationX += cube.rotationSpeedX;
      cube.rotationY += cube.rotationSpeedY;
      cube.rotationZ += cube.rotationSpeedZ;
      cube.z += Math.sin(timeRef.current + cube.x) * 0.5;
      drawCube(ctx, cube, canvas.width, canvas.height);
    });

    // Update and draw floating shapes
    shapesRef.current.forEach(shape => {
      shape.rotation.x += shape.rotationSpeed.x;
      shape.rotation.y += shape.rotationSpeed.y;
      shape.rotation.z += shape.rotationSpeed.z;
      shape.y += Math.sin(timeRef.current * 0.5 + shape.x) * 0.3;
      shape.x += Math.cos(timeRef.current * 0.3 + shape.y) * 0.2;

      // Wrap around screen
      if (shape.x < -50) shape.x = canvas.width + 50;
      if (shape.x > canvas.width + 50) shape.x = -50;
      if (shape.y < -50) shape.y = canvas.height + 50;
      if (shape.y > canvas.height + 50) shape.y = -50;

      drawFloatingShape(ctx, shape, canvas.width, canvas.height);
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [isMinimized, drawCube, drawFloatingShape]);

  // Initialize
  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Initialize cubes
      cubesRef.current = [];
      const cubeCount = intensity === 'high' ? 8 : intensity === 'medium' ? 5 : 3;
      for (let i = 0; i < cubeCount; i++) {
        cubesRef.current.push(createCube(
          canvas.width / 2 + (Math.random() - 0.5) * 400,
          canvas.height / 2 + (Math.random() - 0.5) * 300,
          Math.random() * 200 - 100,
          50 + Math.random() * 50
        ));
      }

      // Initialize floating shapes
      shapesRef.current = [];
      const shapeCount = intensity === 'high' ? 20 : intensity === 'medium' ? 12 : 6;
      for (let i = 0; i < shapeCount; i++) {
        shapesRef.current.push(createFloatingShape());
      }
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isVisible, intensity, createCube, createFloatingShape, animate]);

  // Click to add new shape
  useEffect(() => {
    if (!isVisible || isMinimized) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input')) return;

      // Add burst of shapes
      for (let i = 0; i < 5; i++) {
        const shape = createFloatingShape();
        shape.x = e.clientX + (Math.random() - 0.5) * 100;
        shape.y = e.clientY + (Math.random() - 0.5) * 100;
        shapesRef.current.push(shape);
      }

      // Limit total shapes
      if (shapesRef.current.length > 30) {
        shapesRef.current = shapesRef.current.slice(-30);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isVisible, isMinimized, createFloatingShape]);

  if (!isVisible) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${
          isMinimized ? 'opacity-30' : 'opacity-100'
        }`}
        style={{ zIndex: 40, background: 'transparent' }}
      />

      {/* Controls */}
      <div className={`fixed z-[70] transition-all duration-500 ${
        isMinimized ? 'bottom-4 right-4' : 'top-4 right-4'
      }`}>
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="pointer-events-auto group p-4 bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-500 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse"
            title="Expand 3D Animation"
          >
            <Box className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-300 rounded-full animate-ping" />
          </button>
        ) : (
          <div className="pointer-events-auto flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full p-2 shadow-xl border border-white/10">
            <button
              onClick={() => {
                const canvas = canvasRef.current;
                if (canvas) {
                  for (let i = 0; i < 3; i++) {
                    const cube = createCube(
                      canvas.width / 2 + (Math.random() - 0.5) * 300,
                      canvas.height / 2 + (Math.random() - 0.5) * 200,
                      Math.random() * 100 - 50,
                      40 + Math.random() * 40
                    );
                    cubesRef.current.push(cube);
                  }
                  if (cubesRef.current.length > 10) {
                    cubesRef.current = cubesRef.current.slice(-10);
                  }
                }
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Add cubes"
            >
              <Box className="w-5 h-5 text-cyan-400" />
            </button>

            <button
              onClick={() => {
                cubesRef.current.forEach(cube => {
                  cube.rotationSpeedX *= 3;
                  cube.rotationSpeedY *= 3;
                  cube.rotationSpeedZ *= 3;
                });
                setTimeout(() => {
                  cubesRef.current.forEach(cube => {
                    cube.rotationSpeedX /= 3;
                    cube.rotationSpeedY /= 3;
                    cube.rotationSpeedZ /= 3;
                  });
                }, 2000);
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Spin faster"
            >
              <RotateCw className="w-5 h-5 text-purple-400" />
            </button>

            <div className="flex items-center gap-1 px-2 border-l border-white/20">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setIntensity(level)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    intensity === level 
                      ? 'bg-cyan-400 scale-125 shadow-lg shadow-cyan-400/50' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  title={`${level} intensity`}
                />
              ))}
            </div>

            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
              title="Minimize"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <button
              onClick={() => setIsVisible(false)}
              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              title="Close"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        )}
      </div>

      {/* Title overlay */}
      {!isMinimized && (
        <div className="fixed inset-0 pointer-events-none z-45 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 
              className="text-6xl sm:text-7xl md:text-8xl font-black animate-in zoom-in duration-1000"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: 'gradient-shift 3s ease infinite',
                textShadow: '0 0 60px rgba(102, 126, 234, 0.5)'
              }}
            >
              3D Experience
            </h1>
            {customMessage && (
              <p 
                className="text-lg sm:text-xl md:text-2xl text-white/90 drop-shadow-lg animate-in fade-in duration-1000 max-w-2xl mx-auto mt-4"
                style={{ animationDelay: '0.3s' }}
              >
                {customMessage}
              </p>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </>
  );
}
