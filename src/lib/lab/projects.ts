export type Project = {
  id: string;
  title: string;
  year: string;
  medium: string;
  description: string;
  hue: 'rose' | 'gold' | 'lime' | 'blue' | 'violet' | 'cyan';
};

export const projects: Project[] = [
  { id: 'a15', title: 'Pulse poem', year: '2023', medium: 'Type · p5', description: 'A short text that responds like a living pulse', hue: 'rose' },
  { id: 'a18', title: 'Type field', year: '2023', medium: 'Type · p5', description: 'A field of letters shaped by noise and motion', hue: 'gold' },
  { id: 'a25', title: 'Image drift', year: '2024', medium: 'WebGL · Three.js', description: 'An image disturbed by a tactile, fluid surface', hue: 'violet' },
  { id: 'a26', title: 'Liquid lens', year: '2024', medium: 'WebGL · GLSL', description: 'A cursor-controlled lens for bending an image', hue: 'cyan' },
  { id: 'a29', title: 'Noise bloom', year: '2024', medium: 'WebGL · GLSL', description: 'Layers of noise become a soft optical landscape', hue: 'rose' },
  { id: 'a30', title: 'Flowmap', year: '2024', medium: 'WebGL · GLSL', description: 'A flowmap experiment that leaves movement in the image', hue: 'gold' },
  { id: 'a31', title: 'Cursor field', year: '2024', medium: 'WebGL · OGL', description: 'A compact shader study for pointer-driven light', hue: 'lime' },
  { id: 'a32', title: 'Tidal surface', year: '2024', medium: 'WebGL · Three.js', description: 'A contained procedural water surface with adjustable waves', hue: 'blue' },
  { id: 'a33', title: 'Pointer pulse', year: '2024', medium: 'Pointer · p5', description: 'A pointer-driven field of mirrored marks', hue: 'violet' },
  { id: 'a35', title: 'Stretched memory', year: '2024', medium: 'WebGL · OGL', description: 'An image that stretches around the moving cursor', hue: 'rose' },
  { id: 'a41', title: 'Kinetic heart', year: '2024', medium: 'Type · p5', description: 'A parametric heart curve drawn repeatedly over time', hue: 'blue' },
  { id: 'a42', title: 'Kinetic type', year: '2024', medium: 'Type · p5', description: 'A final study in repeated, moving typographic forms', hue: 'violet' },
];

export const projectById = (id: string) => projects.find((project) => project.id === id);

export const hueClass = (hue: Project['hue']) => `work-card--${hue}`;
