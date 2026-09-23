import type { MountFn } from './index';
import { fitStage, watchSize } from './shared';
import * as THREE from 'three';
import vertex from '@/components/lab/shaders/a26-vert.glsl?raw';
import fragment from '@/components/lab/shaders/a26-frag.glsl?raw';

const a26: MountFn = (stage, opts) => {
  const canvas = document.createElement('canvas');
  canvas.className = 'lab-webgl';
  stage.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 1, 0.00001, 1000);
  camera.position.set(0, 0, 1);

  const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uAspectRatio: { value: new THREE.Vector2(1, 1) },
      uProgress: { value: 0 },
      uTime: { value: 0 },
    },
    side: THREE.DoubleSide,
    vertexShader: vertex,
    fragmentShader: fragment,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  let raf = 0;
  const data = { progress: 0, speed: 0.01 };

  const resize = () => {
    const { width: w, height: h } = fitStage(stage, canvas);
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = 2 * (180 / Math.PI) * Math.atan(1 / (2 * camera.position.z));
    camera.updateProjectionMatrix();
    if (w / h > 1) mesh.scale.set(w / h, w / h, 1);
    else mesh.scale.set(1, 1, 1);
    material.uniforms.uAspectRatio.value = new THREE.Vector2(1, 1);
  };

  const unwatch = watchSize(stage, resize);
  resize();

  const loop = () => {
    material.uniforms.uTime.value += data.speed;
    material.uniforms.uProgress.value = data.progress;
    renderer.render(scene, camera);
    if (!opts.reducedMotion) raf = requestAnimationFrame(loop);
  };
  loop();

  return () => {
    cancelAnimationFrame(raf);
    unwatch();
    renderer.dispose();
    geometry.dispose();
    material.dispose();
    canvas.remove();
  };
};

export default a26;
