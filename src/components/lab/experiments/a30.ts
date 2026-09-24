import type { MountFn } from './index';
import { fitStage, watchSize, pointerRelative } from './shared';
import * as THREE from 'three';
import vertex from '@/components/lab/shaders/a30-vert.glsl?raw';
import fragment from '@/components/lab/shaders/a30-frag.glsl?raw';
import { Flowmap } from '@/components/lab/experiments/flowmap.js';

const a30: MountFn = (stage, opts) => {
  const canvas = document.createElement('canvas');
  canvas.className = 'lab-webgl';
  stage.appendChild(canvas);

  const { width, height } = fitStage(stage, canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
  camera.position.z = 2;
  const scene = new THREE.Scene();

  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      res: { value: new THREE.Vector4(width, height, 1, 1) },
      tFlow: { value: null },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const flow = new Flowmap(renderer, camera, { falloff: 0.3, dissipation: 0.99, width, height });
  material.uniforms.tFlow.value = flow.value;

  const mouse = new THREE.Vector2();
  const lastMouse = new THREE.Vector2();
  const velocity = new THREE.Vector2();
  let lastTime = 0;
  let needsUpdate = false;

  const onPointer = (e: PointerEvent) => {
    const { x, y } = pointerRelative(e, stage);
    const { width: w, height: h } = fitStage(stage);
    mouse.set(x / w, 1 - y / h);
    if (!lastTime) { lastTime = performance.now(); lastMouse.set(x, y); }
    const deltaX = x - lastMouse.x;
    const deltaY = y - lastMouse.y;
    lastMouse.set(x, y);
    const time = performance.now();
    // Avoid dividing by 0
    const delta = Math.max(10.4, time - lastTime);
    lastTime = time;
    velocity.set(deltaX / delta, deltaY / delta);
    needsUpdate = true;
  };

  stage.style.touchAction = 'none';
  stage.addEventListener('pointermove', onPointer);
  stage.addEventListener('pointerdown', onPointer);

  const clock = new THREE.Clock();
  let raf = 0;
  const loop = () => {
    if (!needsUpdate) { mouse.set(-1, -1); velocity.set(0, 0); }
    needsUpdate = false;
    flow.mouse.copy(mouse);
    flow.velocity.lerp(velocity, 0.1);
    flow.update();
    material.uniforms.uTime.value += clock.getDelta();
    renderer.render(scene, camera);
    if (!opts.reducedMotion) raf = requestAnimationFrame(loop);
  };
  const resize = () => {
    const { width: w, height: h } = fitStage(stage, canvas);
    renderer.setSize(w, h);
    camera.left = w / -2; camera.right = w / 2; camera.top = h / 2; camera.bottom = h / -2;
    camera.updateProjectionMatrix();
    mesh.scale.set(w, h, 1);
    const imageAspect = 1080 / 1920;
    let a1, a2;
    if (h / w < imageAspect) { a1 = 1; a2 = h / w / imageAspect; }
    else { a1 = (w / h) * imageAspect; a2 = 1; }
    material.uniforms.res.value = new THREE.Vector4(w, h, a1, a2);
    flow.aspect = w / h;
    flow.setSize(w, h);
  };

  const unwatch = watchSize(stage, resize);
  resize();
  loop();

  return () => {
    cancelAnimationFrame(raf);
    unwatch();
    stage.removeEventListener('pointermove', onPointer);
    stage.removeEventListener('pointerdown', onPointer);
    flow.dispose();
    renderer.dispose();
    geometry.dispose();
    material.dispose();
    canvas.remove();
  };
};

export default a30;
