// Animation types and constants shared across the application

export const ANIMATION_TYPES = [
  'NEW_YEAR',
  'DIWALI',
  'CHRISTMAS',
  'HOLI',
  'EID',
  'INDEPENDENCE_DAY',
  'GEOMETRIC_3D',
  'PARTICLE_VORTEX',
  'NEON_WAVES',
  'STARFIELD_3D',
  'NONE'
] as const;

export type AnimationType = typeof ANIMATION_TYPES[number];

export interface AnimationSetting {
  animationType: AnimationType;
  isEnabled: boolean;
  startDate?: string | null;
  endDate?: string | null;
  customMessage?: string | null;
}

// Animation metadata for UI
export const ANIMATION_INFO: Record<AnimationType, { name: string; icon: string; description: string; color: string }> = {
  NEW_YEAR: {
    name: 'New Year',
    icon: '🎉',
    description: 'Celebrate the New Year with fireworks and confetti',
    color: 'from-purple-500 to-pink-500'
  },
  DIWALI: {
    name: 'Diwali',
    icon: '🪔',
    description: 'Festival of Lights with diyas and fireworks',
    color: 'from-yellow-500 to-orange-500'
  },
  CHRISTMAS: {
    name: 'Christmas',
    icon: '🎄',
    description: 'Merry Christmas with snowflakes and decorations',
    color: 'from-red-500 to-green-500'
  },
  HOLI: {
    name: 'Holi',
    icon: '🎨',
    description: 'Festival of Colors celebration',
    color: 'from-pink-500 to-purple-500'
  },
  EID: {
    name: 'Eid',
    icon: '🌙',
    description: 'Eid celebration with crescents and lanterns',
    color: 'from-green-500 to-teal-500'
  },
  INDEPENDENCE_DAY: {
    name: 'Independence Day',
    icon: '🇮🇳',
    description: 'Celebrate Indian Independence Day',
    color: 'from-orange-500 via-white to-green-500'
  },
  GEOMETRIC_3D: {
    name: 'Geometric 3D',
    icon: '🧊',
    description: '3D geometric shapes with rotation and depth',
    color: 'from-purple-600 via-blue-500 to-cyan-500'
  },
  PARTICLE_VORTEX: {
    name: 'Particle Vortex',
    icon: '🌀',
    description: 'Mesmerizing particle vortex with energy rings',
    color: 'from-cyan-500 via-purple-500 to-pink-500'
  },
  NEON_WAVES: {
    name: 'Neon Waves',
    icon: '🌊',
    description: 'Glowing neon waves with particle effects',
    color: 'from-pink-500 via-purple-500 to-cyan-500'
  },
  STARFIELD_3D: {
    name: 'Starfield 3D',
    icon: '✨',
    description: '3D starfield with shooting stars and nebulae',
    color: 'from-indigo-600 via-purple-500 to-pink-500'
  },
  NONE: {
    name: 'None',
    icon: '❌',
    description: 'Disable all animations',
    color: 'from-gray-400 to-gray-500'
  }
};
